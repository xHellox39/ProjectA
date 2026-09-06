import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    ChevronRight,
    Edit3,
    ExternalLink,
    FileText,
    Loader2,
    MapPin,
    ShieldCheck,
    UserCircle,
    Video,
} from 'lucide-react';
import { propertyApi } from '../api';
import { getFullUrl } from '../config/apiBaseUrl';
import { useAuth } from '../contexts/AuthContext';
import TenantBookingModal from '../components/TenantBookingModal';
import ImageGallery from '../components/ImageGallery';
import './PropertyDetail.css';

const STATUS_CONFIG = {
    AVAILABLE: { label: 'Available', tone: 'success' },
    OCCUPIED: { label: 'Occupied', tone: 'warning' },
    MAINTENANCE: { label: 'Maintenance', tone: 'danger' },
    INACTIVE: { label: 'Inactive', tone: 'muted' },
};

function formatDate(value) {
    if (!value) return 'Not set';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not set';
    return new Intl.DateTimeFormat('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function formatRent(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return 'RM 0';
    return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function getStatus(status) {
    return STATUS_CONFIG[status] || {
        label: status || 'Unknown',
        tone: 'muted',
    };
}

function normalizeMediaList(value) {
    if (!Array.isArray(value)) return [];

    return value
        .map((item, index) => {
            if (typeof item === 'string') {
                return { id: `${item}-${index}`, url: item, name: item };
            }

            if (item && typeof item === 'object') {
                const url = item.url || item.path || item.href;
                if (!url) return null;
                return {
                    id: item.id || item._id || `${url}-${index}`,
                    url,
                    name: item.documentName || item.name || url,
                };
            }

            return null;
        })
        .filter(Boolean);
}

function getImageItems(images) {
    return (Array.isArray(images) ? images : []).filter(
        (image) => !image?.type || image.type === 'image'
    );
}

function PropertyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    const isInRoleLayout = ['/admin/', '/landlord/', '/tenant/', '/agent/'].some(
        (prefix) => location.pathname.startsWith(prefix)
    );

    const canEdit = useMemo(() => {
        if (!user || !property) return false;
        const role = String(user.role || '').toLowerCase();
        if (role.includes('admin')) return true;
        return property.ownerId === user.id || property.owner?.id === user.id;
    }, [property, user]);

    const status = getStatus(property?.status);
    const images = useMemo(() => getImageItems(property?.images), [property?.images]);
    const videos = useMemo(() => normalizeMediaList(property?.videoUrls), [property?.videoUrls]);
    const documents = useMemo(() => normalizeMediaList(property?.documentUrls), [property?.documentUrls]);
    const amenities = Array.isArray(property?.amenities) ? property.amenities : [];

    useEffect(() => {
        let cancelled = false;

        async function loadProperty() {
            setLoading(true);
            setError(null);

            try {
                const response = await propertyApi.getById(id);
                const data = response?.data?.data ?? response?.data;

                if (!cancelled) {
                    if (!data) {
                        setError('Property not found');
                        setProperty(null);
                    } else {
                        setProperty(data);
                    }
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.error?.message ||
                        err.message ||
                        'Failed to load property'
                    );
                    setLoading(false);
                }
            }
        }

        if (id) loadProperty();

        return () => {
            cancelled = true;
        };
    }, [id]);

    function getEditPath() {
        const role = String(user?.role || '').toLowerCase();
        if (role.includes('admin')) return `/admin/properties/edit/${id}`;
        if (role.includes('landlord')) return `/landlord/properties/edit/${id}`;
        return `/properties/edit/${id}`;
    }

    if (loading) {
        return (
            <main className="property-detail-page">
                <div className="pd-loading">
                    <Loader2 size={32} className="pd-spinner" />
                    <p>Loading property...</p>
                </div>
            </main>
        );
    }

    if (error || !property) {
        return (
            <main className="property-detail-page">
                <div className="pd-error">
                    <Building2 size={40} />
                    <p>{error || 'Property not found'}</p>
                    <button type="button" onClick={() => navigate(-1)}>
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="property-detail-page" data-customize-id="global.page">
            {!isInRoleLayout && (
                <header className="pd-topbar" data-customize-id="global.header">
                    <Link to="/" className="pd-logo" data-customize-id="global.brand">
                        PRMS
                    </Link>
                    <nav className="pd-topnav" data-customize-id="global.tabs">
                        <Link to="/properties" className="active">Properties</Link>
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/bookings">Bookings</Link>
                    </nav>
                    <div className="pd-topactions" data-customize-id="global.top-actions">
                        <Link to="/properties" className="pd-top-action-link">Properties</Link>
                    </div>
                </header>
            )}

            <motion.div
                className="pd-content"
                data-customize-id="global.body"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <section className="pd-title-row" data-customize-id="detail.title">
                    <div className="pd-title-copy">
                        <h1 className="pd-title">{property.title}</h1>
                        <div className="pd-title-meta">
                            <span className={`pd-status-badge pd-status-${status.tone}`}>
                                <span className="pd-status-dot" />
                                {status.label}
                            </span>
                            <span className="pd-type-label">{property.property_type || 'Property'}</span>
                            {(property.city || property.state) && (
                                <span className="pd-location-inline">
                                    <MapPin size={15} />
                                    {property.city || property.state}
                                    {property.city && property.state ? `, ${property.state}` : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="pd-title-actions">
                        <button type="button" className="pd-back-btn" onClick={() => navigate(-1)}>
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        {canEdit && (
                            <button type="button" className="pd-edit-btn" onClick={() => navigate(getEditPath())}>
                                <Edit3 size={16} />
                                Edit Property
                            </button>
                        )}
                    </div>
                </section>

                <section data-customize-id="detail.gallery" className="pd-gallery-section">
                    <ImageGallery
                        images={images}
                        propertyId={id}
                        /* Detail is read-only; editing belongs on PropertyEdit. */
                        userRole={null}
                        wrapperProps={{ 'data-customize-id': 'detail.gallery-inner' }}
                    />
                </section>

                <div className="pd-body" data-customize-id="detail.body">
                    <div className="pd-left" data-customize-id="detail.left">
                        <section className="pd-section pd-overview-section">
                            <div className="pd-section-heading-row">
                                <div>
                                    <div className="pd-section-kicker">OVERVIEW</div>
                                    <h2 className="pd-section-title">Property information</h2>
                                </div>
                                <span className={`pd-status-badge pd-status-${status.tone}`}>
                                    <span className="pd-status-dot" />
                                    {status.label}
                                </span>
                            </div>

                            <div className="pd-info-grid">
                                <div className="pd-info-item">
                                    <span className="pd-info-label">Monthly rent</span>
                                    <strong className="pd-info-value pd-rent-value">{formatRent(property.rent)}</strong>
                                </div>
                                <div className="pd-info-item">
                                    <span className="pd-info-label">Property type</span>
                                    <strong className="pd-info-value">{property.property_type || 'Not set'}</strong>
                                </div>
                                <div className="pd-info-item">
                                    <span className="pd-info-label">Category</span>
                                    <strong className="pd-info-value">{property.category?.name || 'Not assigned'}</strong>
                                </div>
                            </div>
                        </section>

                        <div className="pd-divider" />

                        <section className="pd-section">
                            <div className="pd-section-kicker">LOCATION</div>
                            <h2 className="pd-section-title">Property address</h2>
                            <div className="pd-address-card">
                                <div className="pd-address-icon"><MapPin size={20} /></div>
                                <div className="pd-address-content">
                                    <strong>{property.address || 'Address not set'}</strong>
                                    <span>
                                        {[property.city, property.state].filter(Boolean).join(', ') || 'Location not set'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <div className="pd-divider" />

                        <section className="pd-section">
                            <div className="pd-section-kicker">AVAILABILITY</div>
                            <h2 className="pd-section-title">Rental availability</h2>
                            <div className="pd-availability-grid">
                                <div className="pd-availability-item">
                                    <CalendarDays size={19} />
                                    <div>
                                        <span>Available from</span>
                                        <strong>{formatDate(property.availableFrom)}</strong>
                                    </div>
                                </div>
                                <div className="pd-availability-item">
                                    <CalendarDays size={19} />
                                    <div>
                                        <span>Available to</span>
                                        <strong>{formatDate(property.availableTo)}</strong>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {property.description && (
                            <>
                                <div className="pd-divider" />
                                <section className="pd-section">
                                    <div className="pd-section-kicker">DESCRIPTION</div>
                                    <h2 className="pd-section-title">About this property</h2>
                                    <p className="pd-description-text">{property.description}</p>
                                </section>
                            </>
                        )}

                        {amenities.length > 0 && (
                            <>
                                <div className="pd-divider" />
                                <section className="pd-section">
                                    <div className="pd-section-kicker">AMENITIES</div>
                                    <h2 className="pd-section-title">What this property offers</h2>
                                    <div className="pd-amenities-grid">
                                        {amenities.map((amenity) => (
                                            <div className="pd-amenity" key={amenity.id || amenity.name}>
                                                <span className="pd-amenity-icon"><ShieldCheck size={18} /></span>
                                                <span>{amenity.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}

                        {videos.length > 0 && (
                            <>
                                <div className="pd-divider" />
                                <section className="pd-section">
                                    <div className="pd-section-kicker">MEDIA</div>
                                    <h2 className="pd-section-title">Videos</h2>
                                    <div className="pd-media-list">
                                        {videos.map((video) => (
                                            <a
                                                key={video.id}
                                                className="pd-media-item"
                                                href={getFullUrl(video.url)}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <span className="pd-media-icon"><Video size={18} /></span>
                                                <span className="pd-media-name">{video.name}</span>
                                                <ExternalLink size={15} />
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}

                        {documents.length > 0 && (
                            <>
                                <div className="pd-divider" />
                                <section className="pd-section">
                                    <div className="pd-section-kicker">DOCUMENTS</div>
                                    <h2 className="pd-section-title">Property documents</h2>
                                    <div className="pd-media-list">
                                        {documents.map((document) => (
                                            <a
                                                key={document.id}
                                                className="pd-media-item"
                                                href={getFullUrl(document.url)}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <span className="pd-media-icon"><FileText size={18} /></span>
                                                <span className="pd-media-name">{document.name}</span>
                                                <ExternalLink size={15} />
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}
                    </div>

                    <aside className="pd-right">
                        <section className="pd-summary-card">
                            <div className="pd-summary-kicker">RENTAL SUMMARY</div>
                            <div className="pd-summary-price">{formatRent(property.rent)}</div>
                            <div className="pd-summary-period">per month</div>

                            <div className="pd-summary-status">
                                <span className={`pd-status-badge pd-status-${status.tone}`}>
                                    <span className="pd-status-dot" />
                                    {status.label}
                                </span>
                            </div>

                            <div className="pd-summary-divider" />

                            <div className="pd-summary-row">
                                <CalendarDays size={17} />
                                <div>
                                    <span>Available from</span>
                                    <strong>{formatDate(property.availableFrom)}</strong>
                                </div>
                            </div>

                            <div className="pd-summary-row">
                                <CalendarDays size={17} />
                                <div>
                                    <span>Available to</span>
                                    <strong>{formatDate(property.availableTo)}</strong>
                                </div>
                            </div>

                            {String(user?.role || '').toLowerCase() === 'tenant' && status.tone === 'success' && (
                                <button
                                    type="button"
                                    className="pd-book-btn"
                                    onClick={() => setShowBookingModal(true)}
                                >
                                    <CalendarDays size={17} />
                                    Book Property
                                </button>
                            )}
                        </section>

                        <section className="pd-owner-card">
                            <div className="pd-section-kicker">OWNER</div>
                            <div className="pd-owner-main">
                                <div className="pd-owner-avatar">
                                    <UserCircle size={42} />
                                </div>
                                <div>
                                    <strong>{property.owner?.full_name || 'Property Owner'}</strong>
                                    <span>{property.owner?.email || 'Email not available'}</span>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </motion.div>

            {String(user?.role || '').toLowerCase() === 'tenant' && (
                <TenantBookingModal
                    property={property}
                    isOpen={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                />
            )}
        </main>
    );
}

export default PropertyDetail;
