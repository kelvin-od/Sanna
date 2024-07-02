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
      'lg': '2.25rem',
      'xl': '1.875rem',
      "2xl": "1.5rem",
      // You can add more custom sizes as needed
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addUtilities }) {
      const newUtilities = {
        '.custom-scrollbar::-webkit-scrollbar': {
          width: '12px',
        },
        '.custom-scrollbar::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          'border-radius': '10px',
        },
        '.custom-scrollbar::-webkit-scrollbar-thumb': {
          'background-color': '#888',
          'border-radius': '10px',
          'border': '3px solid #f1f1f1',
        },
        '.custom-scrollbar::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      };

      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
});
