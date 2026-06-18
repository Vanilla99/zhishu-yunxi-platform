/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#0a1020",
        mist: "#eef6ff",
        aurora: "#5eead4",
        royal: "#4865ff",
        violet: "#8b5cf6",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(48, 103, 255, 0.18)",
        panel: "0 18px 60px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
