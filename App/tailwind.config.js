/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{vue,js,ts,jsx,tsx}",
    "./layouts/**/*.{vue,js,ts,jsx,tsx}",
    "./pages/**/*.{vue,js,ts,jsx,tsx}",
    "./plugins/**/*.{js,ts,jsx,tsx}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
      mytheme: {
        "primary": "#2563eb",
                
        "primary-content": "#d2e2ff",
                
        "secondary": "#2dd4bf",
                
        "secondary-content": "#01100d",
                
        "accent": "#f43f5e",
                
        "accent-content": "#160f10",
                
        "neutral": "#d1d5db",
                
        "neutral-content": "#101011",
                
        "base-100": "#1f2937",
                
        "base-200": "#19222e",
                
        "base-300": "#141c26",
                
        "base-content": "#cdd0d3",
                
        "info": "#f3f4f6",
                
        "info-content": "#141415",
                
        "success": "#6ee7b7",
                
        "success-content": "#04130c",
                
        "warning": "#fde047",
                
        "warning-content": "#161202",
                
        "error": "#f87171",
                
        "error-content": "#150404",
        },
      },
    ],
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
}

