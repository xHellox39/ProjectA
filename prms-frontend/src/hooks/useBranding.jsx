import { useEffect, useState } from 'react'
import { customizerApi } from '../api/customizer'

/**
 * Maps customizer DB fields to the CSS custom properties the layouts consume.
 *
 * customizer field         -> CSS variable(s)
 * ---------------------    -> --------------------------------
 * light_header_bg         -> --header-background-color  (sidebar bg)
 *                         -> --card-bg                  (topbar bg)
 * light_body_bg           -> --background-color         (shell bg)
 * light_accent_color      -> --primary-color            (active-gradient, avatar border)
 *                         -> --accent-color             (active-gradient)
 * light_footer_bg         -> --footer-background-color
 *
 * Dark variants applied the same way.
 *
 * When the customizer saves, these variables are painted on :root
 * so every layout that references them picks them up on next load.
 */
const PAINT_MAP = [
  ['light_header_bg',  ['--header-background-color', '--card-bg']],
  ['light_body_bg',    ['--background-color']],
  ['light_accent_color',['--primary-color', '--accent-color']],
  ['light_footer_bg',  ['--footer-background-color']],
  ['dark_header_bg',   ['--header-background-color', '--card-bg']],
  ['dark_body_bg',     ['--background-color']],
  ['dark_accent_color', ['--primary-color', '--accent-color']],
  ['dark_footer_bg',   ['--footer-background-color']],
]

function useBranding() {
  const [name, setName] = useState('PRMS')
  const [logoUrl, setLogoUrl] = useState(null)
  const [colors, setColors] = useState({})

  useEffect(() => {
    async function load() {
      try {
        const r = await customizerApi.getConfig()
        const data = r?.data ?? r
        if (!data) return

        const API = import.meta.env.VITE_API_BASE_URL || window.location.origin || 'http://localhost:3500'

        if (data.company_name) setName(data.company_name)
        if (data.logo_url) {
          setLogoUrl(
            data.logo_url.startsWith('http') ? data.logo_url : `${API}${data.logo_url}`
          )
        }

        const root = document.documentElement.style
        for (const [field, cssVars] of PAINT_MAP) {
          if (data[field]) {
            for (const cv of cssVars) {
              root.setProperty(cv, data[field])
            }
          }
        }

        setColors(Object.fromEntries(PAINT_MAP.filter(([f]) => data[f]).map(([f]) => [f, data[f]])))
      } catch {
        // branding optional
      }
    }
    load()
  }, [])

  return { name, logoUrl, colors }
}

export default useBranding
