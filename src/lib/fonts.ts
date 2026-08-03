import localFont from "next/font/local";

export const switzer = localFont({
  src: [
    { path: "../fonts/switzer-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/switzer-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/switzer-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/switzer-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-ui-family",
  preload: true,
});
