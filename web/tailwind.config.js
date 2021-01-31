const defaultTheme = require('tailwindcss/defaultTheme')
const forms = require('@tailwindcss/forms')
const typography = require('@tailwindcss/typography')

module.exports = {
  purge: [
    "./pages/**/*.tsx",
    "./components/**/*.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {},
  plugins: [
    forms,
    typography
  ],
}
