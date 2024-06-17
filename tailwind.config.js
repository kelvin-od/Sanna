const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    fontFamily: {
      roboto: ["Roboto", "sans-serif"],
    },
    fontSize: {
      'xs': '0.75rem', // 12px (default)
      'sm': '0.875rem', // 14px (default)
      'tiny': '0.625rem', // 10px (custom smaller size)
      // You can add more custom sizes as needed
    },
  },
  plugins: [],
});