/** @type {import('tailwindcss').Config} */

module.exports = {

  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  theme: {

    extend: {

      screens:{

        xs: "320px",

        sm: "375px",

        sml: "500px",

        md: "667px",

        mdl: "768px",

        lg: "960px",

        lgl: "1024px",

        xl: "1280px",

      },

      fontFamily: {
        'custom': ['ubuntu-mono', 'Ubuntu', 'sans-serif', 'Maven Pro'],

        maven:['Maven Pro'],

        maven2:['Maven'],

        bodyFont: ["Poppins", "sans-serif"],

        titleFont: ["Montserrat", "sans-serif"],

      },

      colors: {

        bodyColor: '#f3f1f0',

        // lightText: "#c4cfde",

        // boxBg: "linear-gradient(145deg, #1e2024, #23272b)",

        designColor: "#f03c02",

      },

      backgroundImage: {
        'pack-train': "url('./src/assets/img/background.jpg')",
      },
      

      boxShadow: {

        shadowOne: '10px 10px 30px #000000',

      },

    },

  },

  plugins: [
    
  ],

};