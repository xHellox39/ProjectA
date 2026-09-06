import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import {
    Building2,
    MapPin,
    DollarSign,
    Search,
    Filter,
    Home,
    Store,
    Briefcase,
    Plus,
    Grid3x3,
    List,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
} from 'lucide-react'
import { getImageUrl } from '../config/imageHelper'
import { propertyApi, getApiError } from '../api'
import { getAddPropertyRoute, getPropertyDetailPath } from '../config/routes'
import './Properties.css'

const PROPERTY_TYPES = [
    { key: 'all', label: 'All Types', icon: Building2 },
    { key: 'Residential', label: 'Residential', icon: Home },
    { key: 'Commercial', label: 'Commercial', icon: Briefcase },
    { key: 'Retail', label: 'Retail', icon: Store },
]

const STATUS_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available' },
    { key: 'occupied', label: 'Occupied' },
    { key: 'maintenance', label: 'Maintenance' },
    { key: 'inactive', label: 'Inactive' },
]

function Properties() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [viewMode, setViewMode] = useState('grid')
    const [filtersOpen, setFiltersOpen] = useState(false)

    const [activeType, setActiveType] = useState('all')
    const [activeStatus, setActiveStatus] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)

    const perPage = 12

    async function fetchProperties() {
        setLoading(true)
        setError(null)

        try {
            const { data } = await propertyApi.list({
                page: currentPage,
                limit: perPage,
                type: activeType === 'all' ? undefined : activeType,
                search: searchTerm.trim() || undefined,
            })

            const list = data?.data || data?.properties || data
            const safeList = Array.isArray(list) ? list : []

            setProperties(safeList)

            setTotalCount(
                data?.pagination?.total ??
                data?.totalCount ??
                data?.total ??
                safeList.length
            )
        } catch (err) {
            setError(getApiError(err))
            setProperties([])
        } finally {
            setLoading(false)
        }
    }

    // Fetch on mount, page change, or property type change.
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1)
        }, 400)

        return () => clearTimeout(timer)
    }, [searchTerm])

    useEffect(() => {
        fetchProperties()
    }, [currentPage, activeType, searchTerm])

    function handleSearch(e) {
        e.preventDefault()
        setCurrentPage(1)
    }

    function clearFilters() {
        setActiveType('all')
        setActiveStatus('all')
        setCurrentPage(1)
    }

    const totalPages = Math.max(Math.ceil(totalCount / perPage), 1)

    function statusColor(status) {
        const s = (status || '').toLowerCase()

        if (s === 'available') return 'green'
        if (s === 'pending') return 'yellow'
        if (s === 'rented' || s === 'approved' || s === 'active') return 'blue'
        if (s === 'rejected' || s === 'inactive') return 'red'

        return 'gray'
    }

    // Status is currently filtered client-side, while property type/search
    // are passed to the API.
    const filteredProperties = properties.filter((p) => {
        if (activeStatus === 'all') return true

        const pStatus = (p.status || '').toLowerCase()
        return pStatus === activeStatus.toLowerCase()
    })

    const activeFilterCount =
        (activeType !== 'all' ? 1 : 0) +
        (activeStatus !== 'all' ? 1 : 0)

    const activeFilterLabels = [
        activeType !== 'all'
            ? PROPERTY_TYPES.find((t) => t.key === activeType)?.label
            : null,
        activeStatus !== 'all'
            ? STATUS_FILTERS.find((s) => s.key === activeStatus)?.label
            : null,
    ].filter(Boolean)

    return (
        <div className="properties-page">
            {/* ── Title bar ── */}
            <div className="properties-titlebar">
                <div>
                    <h1 className="page-title">Properties</h1>
                    <p className="page-subtitle">
                        Browse and manage all property listings in your portfolio.
                    </p>
                </div>

                {getAddPropertyRoute(user?.role) && (
                    <motion.button
                        type="button"
                        className="btn-primary-solid"
                        onClick={() => {
                            const addRoute = getAddPropertyRoute(user?.role)
                            if (addRoute) navigate(addRoute)
                        }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Plus size={16} />
                        Add Property
                    </motion.button>
                )}
            </div>

            {/* ── Property toolbar ── */}
            <div className="panel-card properties-toolbar">
                <div className="properties-toolbar-row">

                    {/* Search — fills all available space */}
                    <form className="properties-search" onSubmit={handleSearch}>
                        <Search size={18} className="search-icon" />

                        <input
                            type="text"
                            placeholder="Search by property, location or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search properties"
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                className="search-clear"
                                onClick={() => {
                                    setSearchTerm('')
                                    setCurrentPage(1)
                                }}
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </form>

                    {/* Right-side controls */}
                    <div className="properties-toolbar-actions">

                        {/* Filter */}
                        <button
                            type="button"
                            className={`filter-toggle ${filtersOpen ? 'active' : ''}`}
                            onClick={() => setFiltersOpen((open) => !open)}
                            aria-expanded={filtersOpen}
                            aria-controls="properties-filter-panel"
                        >
                            <Filter size={16} />
                            <span>Filters</span>

                            {activeFilterCount > 0 && (
                                <span className="filter-count-badge">
                                    {activeFilterCount}
                                </span>
                            )}

                            <ChevronDown
                                size={14}
                                className={`filter-chevron ${filtersOpen ? 'open' : ''}`}
                            />
                        </button>

                        {/* Single Grid / List toggle */}
                        <button
                            type="button"
                            className="view-toggle-single"
                            onClick={() =>
                                setViewMode((mode) => (mode === 'grid' ? 'list' : 'grid'))
                            }
                            title={
                                viewMode === 'grid'
                                    ? 'Switch to list view'
                                    : 'Switch to grid view'
                            }
                            aria-label={
                                viewMode === 'grid'
                                    ? 'Switch to list view'
                                    : 'Switch to grid view'
                            }
                        >
                            {viewMode === 'grid' ? (
                                <>
                                    <Grid3x3 size={17} />
                                </>
                            ) : (
                                <>
                                    <List size={17} />
                                </>
                            )}
                        </button>

                    </div>
                </div>

                {/* ── Expandable filters ── */}
                {filtersOpen && (
                    <div
                        id="properties-filter-panel"
                        className="properties-filter-panel"
                    >
                        <div className="filter-panel-header">
                            <div>
                                <strong>Filter properties</strong>
                                <span>
                                    Narrow the property list using the available options.
                                </span>
                            </div>

                            {activeFilterCount > 0 && (
                                <button
                                    type="button"
                                    className="filter-clear-btn"
                                    onClick={clearFilters}
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="filter-group">
                            <span className="filter-group-label">Property Type</span>

                            <div className="properties-type-filters">
                                {PROPERTY_TYPES.map((type) => {
                                    const Icon = type.icon

                                    return (
                                        <button
                                            type="button"
                                            key={type.key}
                                            className={`chip-btn ${activeType === type.key ? 'active' : ''
                                                }`}
                                            onClick={() => {
                                                setActiveType(type.key)
                                                setCurrentPage(1)
                                            }}
                                        >
                                            <Icon size={15} />
                                            {type.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="filter-group">
                            <span className="filter-group-label">Status</span>

                            <div className="properties-status-filters">
                                {STATUS_FILTERS.map((status) => (
                                    <button
                                        type="button"
                                        key={status.key}
                                        className={`status-btn ${activeStatus === status.key ? 'active' : ''
                                            }`}
                                        onClick={() => {
                                            setActiveStatus(status.key)
                                            setCurrentPage(1)
                                        }}
                                    >
                                        <span
                                            className={`status-dot status-${statusColor(
                                                status.key
                                            )}`}
                                        />
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Collapsed active-filter summary ── */}
            {!filtersOpen && activeFilterCount > 0 && (
                <div className="active-filter-summary">
                    <div className="active-filter-summary-content">
                        <Filter size={14} />
                        <span>{activeFilterLabels.join(' · ')}</span>
                    </div>

                    <button
                        type="button"
                        className="active-filter-clear"
                        onClick={clearFilters}
                    >
                        Clear
                    </button>
                </div>
            )}

            {/* ── Error state ── */}
            {error && (
                <motion.div
                    className="panel-error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <span className="error-text">{error}</span>
                </motion.div>
            )}

            {/* ── Loading state ── */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading properties...</p>
                </div>
            )}

            {/* ── Properties grid / list ── */}
            {!loading && !error && (
                <>
                    {filteredProperties.length === 0 ? (
                        <div className="panel-card empty-state">
                            <div className="empty-icon">
                                <Building2 size={56} />
                            </div>

                            <h2>No properties found</h2>
                            <p>Try adjusting your filters or add a new property.</p>

                            {getAddPropertyRoute(user?.role) && (
                                <motion.button
                                    type="button"
                                    className="btn-outline"
                                    onClick={() => navigate(getAddPropertyRoute(user?.role))}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Plus size={16} />
                                    Add Property
                                </motion.button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Filtered count */}
                            {(activeStatus !== 'all' ||
                                activeType !== 'all' ||
                                searchTerm) && (
                                    <div className="filter-count">
                                        Showing {filteredProperties.length} of {properties.length}{' '}
                                        properties
                                    </div>
                                )}

                            {/* ── Grid / List ── */}
                            <div className={`properties-${viewMode}`} role="list">
                                {filteredProperties.map((p, i) => {
                                    const pid = p._id || p.id || i
                                    const stype = statusColor(p.status || 'available')

                                    return (
                                        <motion.div
                                            key={pid}
                                            className="property-item"
                                            initial={{ opacity: 0, y: 18 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.025 }}
                                            whileHover={{ y: -4, scale: 1.01 }}
                                            onClick={() =>
                                                navigate(getPropertyDetailPath(user?.role, pid))
                                            }
                                            onKeyPress={(e) =>
                                                e.key === 'Enter' &&
                                                navigate(getPropertyDetailPath(user?.role, pid))
                                            }
                                            role="listitem"
                                            tabIndex={0}
                                        >
                                            <div className="property-card">
                                                {/* Image */}
                                                <div className="property-card-image">
                                                    {(() => {
                                                        const imageUrl =
                                                            p.images?.[0]?.url || p.image || p.thumbnail

                                                        if (imageUrl) {
                                                            return (
                                                                <img
                                                                    src={getImageUrl(imageUrl)}
                                                                    alt={p.name || p.title}
                                                                />
                                                            )
                                                        }

                                                        return (
                                                            <div className="image-placeholder">
                                                                <Building2 size={40} />
                                                            </div>
                                                        )
                                                    })()}

                                                    <span
                                                        className={`status-badge status-${stype}`}
                                                    >
                                                        {p.status || 'Available'}
                                                    </span>
                                                </div>

                                                {/* Body */}
                                                <div className="property-card-body">
                                                    <h3 className="property-name">
                                                        {p.name || p.title || 'Property'}
                                                    </h3>

                                                    <div className="property-location">
                                                        <MapPin size={14} />
                                                        <span>
                                                            {p.location ||
                                                                p.address ||
                                                                'Location not set'}
                                                        </span>
                                                    </div>

                                                    <span
                                                        className={`type-badge type-${(
                                                            p.type || 'General'
                                                        ).toLowerCase()}`}
                                                    >
                                                        {p.type || 'General'}
                                                    </span>

                                                    <div className="property-footer">
                                                        <div className="property-price">
                                                            <DollarSign size={14} />

                                                            <span>
                                                                {Number(
                                                                    p.price || p.rent || 0
                                                                ).toLocaleString()}{' '}
                                                                /Month
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>

                            {/* ── Pagination ── */}
                            {totalPages > 1 && (
                                <div className="pagination-bar">
                                    <button
                                        type="button"
                                        className="btn-outline"
                                        disabled={currentPage <= 1}
                                        onClick={() =>
                                            setCurrentPage((c) => Math.max(c - 1, 1))
                                        }
                                    >
                                        <ChevronLeft size={16} />
                                        Prev
                                    </button>

                                    <span className="page-info">
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <button
                                        type="button"
                                        className="btn-outline"
                                        disabled={currentPage >= totalPages}
                                        onClick={() =>
                                            setCurrentPage((c) =>
                                                Math.min(c + 1, totalPages)
                                            )
                                        }
                                    >
                                        Next
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default Properties
