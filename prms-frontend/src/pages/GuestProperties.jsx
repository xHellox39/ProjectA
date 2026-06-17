import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2,
  CalendarDays,
  ChevronDown,
  Globe2,
  Heart,
  Home,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserCircle,
  Users,
} from 'lucide-react'
import './GuestProperties.css'

function GuestProperties() {
  const navigate = useNavigate()

  const areas = [
    'Kuala Lumpur',
    'Bukit Bintang',
    'Mont Kiara',
    'Bangsar',
    'Petaling Jaya',
    'Malacca',
  ]

  const homes = [
    {
      title: 'Luxury Condo near KLCC',
      area: 'Kuala Lumpur',
      price: 'RM 2,800 / month',
      rating: '4.96',
      type: 'Entire apartment',
      image:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Modern Loft in Bukit Bintang',
      area: 'Bukit Bintang',
      price: 'RM 2,100 / month',
      rating: '4.91',
      type: 'Loft apartment',
      image:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Premium Residence in Mont Kiara',
      area: 'Mont Kiara',
      price: 'RM 3,200 / month',
      rating: '4.98',
      type: 'Serviced residence',
      image:
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Family Home with Private Pool',
      area: 'Petaling Jaya',
      price: 'RM 4,500 / month',
      rating: '4.88',
      type: 'Landed house',
      image:
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Cozy Studio for City Living',
      area: 'Bangsar',
      price: 'RM 1,650 / month',
      rating: '4.84',
      type: 'Studio unit',
      image:
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Weekend Apartment in Malacca',
      area: 'Malacca',
      price: 'RM 950 / month',
      rating: '4.79',
      type: 'Apartment',
      image:
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Minimalist Condo with Balcony',
      area: 'Kuala Lumpur',
      price: 'RM 2,350 / month',
      rating: '4.93',
      type: 'Condominium',
      image:
        'https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Peaceful High-Rise Residence',
      area: 'Mont Kiara',
      price: 'RM 2,950 / month',
      rating: '4.89',
      type: 'High-rise unit',
      image:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    },
  ]

  return (
    <main className="guest-properties-page">
      <header className="guest-properties-navbar">
        <Link to="/" className="guest-properties-logo">
          PRMS
        </Link>

        <nav className="guest-properties-tabs">
          <button type="button" className="active">
            <Home size={22} />
            Homes
          </button>

          <button type="button">
            <Sparkles size={22} />
            Experiences
          </button>

          <button type="button">
            <Building2 size={22} />
            Services
          </button>
        </nav>

        <div className="guest-properties-actions">
          <Link to="/register">Become a host</Link>

          <button type="button" className="circle-btn">
            <Globe2 size={21} />
          </button>

          <div className="guest-user-menu">
            <button type="button" className="menu-btn">
              <Menu size={22} />
              <UserCircle size={28} />
            </button>

            <div className="guest-menu-dropdown">
              <Link to="/register">Join now</Link>
              <Link to="/login">Log in</Link>
              <span></span>
              <a href="#">Help Center</a>
              <a href="#">Gift cards</a>
              <a href="#">Safety guide</a>
            </div>
          </div>
        </div>
      </header>

      <section className="guest-search-panel">
        <div className="guest-search-pill">
          <div>
            <span>Where</span>
            <input type="text" placeholder="Search destinations" />
          </div>

          <div>
            <span>When</span>
            <p>Add dates</p>
          </div>

          <div>
            <span>Who</span>
            <p>Add guests</p>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
          >
            <Search size={22} />
          </motion.button>
        </div>
      </section>

      <section className="guest-filter-bar">
        <div className="guest-area-tabs">
          {areas.map((area, index) => (
            <button type="button" className={index === 0 ? 'active' : ''} key={area}>
              {area}
            </button>
          ))}
        </div>

        <button type="button" className="filter-btn">
          <SlidersHorizontal size={19} />
          Filters
        </button>
      </section>

      <section className="guest-listing-section">
        <div className="guest-listing-title">
          <div>
            <h1>Popular homes in Kuala Lumpur</h1>
            <p>Verified rental homes managed under PRMS Malaysia.</p>
          </div>

          <div className="guest-safe-badge">
            <ShieldCheck size={19} />
            Verified listings
          </div>
        </div>

        <div className="guest-property-grid">
          {homes.map((home, index) => (
            <motion.article
              className="guest-property-card"
              key={home.title}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              whileHover={{ y: -7 }}
            >
              <div className="guest-property-image">
                <img src={home.image} alt={home.title} />

                <button type="button" className="heart-btn">
                  <Heart size={21} />
                </button>

                <span>Guest favorite</span>
              </div>

              <div className="guest-property-body">
                <div className="guest-property-main">
                  <h3>{home.title}</h3>

                  <div>
                    <Star size={15} />
                    {home.rating}
                  </div>
                </div>

                <p>
                  <MapPin size={15} />
                  {home.area}
                </p>

                <p>
                  <CalendarDays size={15} />
                  Available now
                </p>

                <p>
                  <Users size={15} />
                  {home.type}
                </p>

                <strong>{home.price}</strong>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="guest-listing-section weekend">
        <div className="guest-listing-title">
          <div>
            <h2>Available in Malacca this weekend</h2>
            <p>Short-stay style property preview for guest browsing.</p>
          </div>

          <button type="button" onClick={() => navigate('/register')}>
            Join PRMS <ChevronDown size={18} />
          </button>
        </div>

        <div className="guest-mini-row">
          {homes.slice(2, 6).map((home, index) => (
            <motion.article
              className="guest-mini-card"
              key={`mini-${home.title}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              whileHover={{ y: -6 }}
            >
              <img src={home.image} alt={home.title} />

              <div>
                <h3>{home.title}</h3>
                <p>{home.price}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default GuestProperties