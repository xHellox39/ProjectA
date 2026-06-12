import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building2,
  Eye,
  LockKeyhole,
  Mail,
  User,
  UserPlus,
} from 'lucide-react'

function Empty() {
    return null;
}

function Register() {
  const navigate = useNavigate()

  function handleCreateAccount() {
    navigate('/role')
  }

  return (
    <main className="login-page">
      <motion.section
        className="login-left"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        <motion.div
          className="brand-small"
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          <Building2 size={28} />
          <span>PRMS</span>
        </motion.div>

        <div className="login-hero-content">
          <motion.div
            className="purple-line"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 150, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.55, ease: 'easeOut' }}
          ></motion.div>

          <motion.h1
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.55 }}
          >
            Start managing property smarter.
          </motion.h1>

          <motion.p
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.55 }}
          >
            Create your PRMS account first, then choose whether you are joining as
            a tenant, landlord, or admin user.
          </motion.p>

          <motion.div
            className="trusted-card"
            initial={{ y: 32, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="avatar-group">
              <motion.div className="avatar" whileHover={{ y: -4 }}>
                PR
              </motion.div>
              <motion.div className="avatar" whileHover={{ y: -4 }}>
                MS
              </motion.div>
              <motion.div className="avatar" whileHover={{ y: -4 }}>
                AI
              </motion.div>
            </div>

            <span>Secure property management workflow</span>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="login-right"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        <motion.div
          className="login-form-box"
          initial={{ y: 34, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.55, ease: 'easeOut' }}
        >
          <motion.h2
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.35 }}
          >
            Create Account
          </motion.h2>

          <motion.p
            className="form-subtitle"
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.38, duration: 0.35 }}
          >
            Register first, then select your PRMS role.
          </motion.p>

          <form>
            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.46, duration: 0.35 }}
            >
              <label>Full Name</label>
              <div className="input-box">
                <User size={22} />
                <input type="text" placeholder="Enter your full name" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.54, duration: 0.35 }}
            >
              <label>Email Address</label>
              <div className="input-box">
                <Mail size={22} />
                <input type="email" placeholder="name@example.com" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.62, duration: 0.35 }}
            >
              <label>Password</label>
              <div className="input-box">
                <LockKeyhole size={22} />
                <input type="password" placeholder="Create password" />
                <Eye size={22} className="input-right-icon" />
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.35 }}
            >
              <label>Confirm Password</label>
              <div className="input-box">
                <LockKeyhole size={22} />
                <input type="password" placeholder="Confirm password" />
                <Eye size={22} className="input-right-icon" />
              </div>
            </motion.div>

            <motion.button
              type="button"
              className="primary-btn"
              onClick={handleCreateAccount}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.35 }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              Create Account <UserPlus size={20} />
            </motion.button>

            <motion.p
              className="signup-text"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.35 }}
            >
              Already have an account? <Link to="/login">Sign in</Link>
            </motion.p>
          </form>
        </motion.div>
      </motion.section>
    </main>
  )
}

export default Register