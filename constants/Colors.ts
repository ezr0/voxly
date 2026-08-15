// Palette derived from the Voxly logo (pink -> purple gradient wordmark).
const tintColorLight = "#6C4CF0";
const tintColorDark = "#A78BFA";

export const brand = {
  pink: "#FF6FA3",
  purple: "#6C4CF0",
};

export default {
  light: {
    text: "#20243A",
    subtext: "#5A6280",
    background: "#F5F3FF",
    card: "#FFFFFF",
    border: "#E4E8F3",
    tint: tintColorLight,
    accent: "#FF6FA3",
    danger: "#B11839",
    tabIconDefault: "#96A0B5",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#F1EEFF",
    subtext: "#B7B2D6",
    background: "#120F1E",
    card: "#1E1A2E",
    border: "#332C4E",
    tint: tintColorDark,
    accent: "#FF8FC0",
    danger: "#FF6B81",
    tabIconDefault: "#6E6B8A",
    tabIconSelected: tintColorDark,
  },
};
