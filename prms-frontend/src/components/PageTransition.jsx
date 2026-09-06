import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './PageTransition.css'

function PageTransition({ children }) {
  const location = useLocation()
  const [ready, setReady] = useState(false)

  // Wait one rAF after mount so CSS variables / stylesheets are fully
  // applied before framer-motion starts measuring layout. This prevents
  // the "Layout was forced before the page was fully loaded" warning.
  useEffect(() => {
    requestAnimationFrame(() => setReady(true))
  }, [])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className="page-transition"
        // If styles aren't ready yet, render fully visible so framer-motion
        // doesn't need to measure the element and force a reflow.
        initial={{ opacity: ready ? 0 : 1, y: ready ? 8 : 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition
