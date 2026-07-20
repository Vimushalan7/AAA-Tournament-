/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-main)",
        panel: "var(--bg-panel)",
        "ff-panel": "var(--bg-panel)",
        "ff-card": "var(--bg-card)",
        "ff-text": "var(--text-main)",
        "ff-orange": "#FF6B00",
        "ff-red": "#CC1100",
        "ff-gold": "#FFD700",
        "ff-amber": "#FF9500",
        "ff-dark": "var(--bg-main)",
        "ff-border": "var(--border-main)",
        "ff-gray": "var(--text-muted)",
        // Keep legacy names for backward compat references
        "neon-blue": "#FF6B00",
        "neon-purple": "#CC1100",
        "esports-gray": "var(--text-muted)",
        "neon-pink": "#CC1100",
        "ff-success-bg": "var(--success-bg)",
        "ff-success-border": "var(--success-border)",
        "ff-success-text": "var(--success-text)",
        "ff-error-bg": "var(--error-bg)",
        "ff-error-border": "var(--error-border)",
        "ff-error-text": "var(--error-text)",
      },
      boxShadow: {
        "fire": "0 0 20px rgba(255, 107, 0, 0.5), 0 0 40px rgba(255, 107, 0, 0.2)",
        "fire-sm": "0 0 10px rgba(255, 107, 0, 0.4)",
        "fire-red": "0 0 20px rgba(204, 17, 0, 0.5)",
        "gold": "0 0 20px rgba(255, 215, 0, 0.4)",
        "neon-blue": "0 0 15px rgba(255, 107, 0, 0.4)",
        "neon-purple": "0 0 15px rgba(204, 17, 0, 0.4)",
        "neon-pink": "0 0 15px rgba(204, 17, 0, 0.4)",
      },
      fontFamily: {
        sans: ["Rajdhani", "sans-serif"],
        heading: ["Oswald", "sans-serif"],
        mono: ["Share Tech Mono", "monospace"],
      },
      backgroundImage: {
        'ff-gradient': 'linear-gradient(135deg, #FF6B00, #CC1100)',
        'ff-gradient-gold': 'linear-gradient(135deg, #FFD700, #FF9500)',
        'ff-dark-gradient': 'linear-gradient(180deg, #1A1209, #0D0D0B)',
      },
      clipPath: {
        'diagonal': 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
      },
    },
  },
  plugins: [],
};
