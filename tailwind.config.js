module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        spices: "url('/spices.png')",
      },
      gridTemplateColumns: {
        dashRecipe: "repeat(auto-fill, minmax(12rem, 1fr))",
      },
    },
  },
  plugins: [],
};
