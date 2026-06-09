/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#FFC107',
          dark: '#121414',
          surface: '#1A1C1C',
          'surface-bright': '#38393a',
          'surface-lowest': '#0c0f0f'
        },
        "surface-container-highest": "#333535",
        "surface-variant": "#333535",
        "secondary-container": "#474747",
        "surface-container-high": "#282a2b",
        "primary-container": "#ffc107",
        "on-primary-fixed-variant": "#5b4300",
        "surface-container-lowest": "#0c0f0f",
        "on-tertiary": "#313030",
        "on-secondary-fixed-variant": "#474747",
        "surface-container-low": "#1a1c1c",
        "on-surface-variant": "#d4c5ab",
        "on-tertiary-fixed-variant": "#474746",
        "secondary-fixed": "#e2e2e2",
        "on-surface": "#e2e2e2",
        "inverse-primary": "#785900",
        "surface-bright": "#38393a",
        "on-primary": "#3f2e00",
        "primary": "#ffe4af",
        "surface-tint": "#fabd00",
        "on-secondary-fixed": "#1b1b1b",
        "on-background": "#e2e2e2",
        "surface-container": "#1e2020",
        "secondary-fixed-dim": "#c6c6c6",
        "tertiary-container": "#cdcaca",
        "error": "#ffb4ab",
        "tertiary-fixed": "#e5e2e1",
        "outline": "#9c8f78",
        "inverse-surface": "#e2e2e2",
        "inverse-on-surface": "#2f3131",
        "on-error": "#690005",
        "tertiary-fixed-dim": "#c8c6c5",
        "surface": "#121414",
        "on-primary-fixed": "#261a00",
        "on-primary-container": "#6d5100",
        "on-error-container": "#ffdad6",
        "on-secondary": "#303030",
        "outline-variant": "#4f4632",
        "error-container": "#93000a",
        "on-tertiary-fixed": "#1c1b1b",
        "on-secondary-container": "#b5b5b5",
        "primary-fixed": "#ffdf9e",
        "on-tertiary-container": "#565555",
        "secondary": "#c6c6c6",
        "surface-dim": "#121414",
        "tertiary": "#e9e6e6",
        "background": "#121414",
        "primary-fixed-dim": "#fabd00"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem",
        "custom": "16px"
      },
      spacing: {
        "margin": "32px",
        "gutter": "24px",
        "container-max": "1440px",
        "unit": "4px"
      },
      fontFamily: {
        "headline-lg": ["Plus Jakarta Sans"],
        "label-sm": ["Plus Jakarta Sans"],
        "headline-md": ["Plus Jakarta Sans"],
        "body-lg": ["Plus Jakarta Sans"],
        "body-md": ["Plus Jakarta Sans"]
      },
      fontSize: {
        "headline-lg": ["32px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "label-sm": ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "1.6", letterSpacing: "0", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
