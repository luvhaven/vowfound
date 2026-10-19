import { ImageResponse } from "next/og";

export const alt = "VowFound — Less swiping. More forever.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share card: the brand's own field, mark and promise. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#fff6e9", padding: 72, position: "relative", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700 }}>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -2, color: "#1a1410" }}>vowfound</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 110, fontWeight: 800, lineHeight: 0.92, letterSpacing: -5, color: "#1a1410" }}>
            <span>Less swiping.</span>
            <span style={{ color: "#ff4f2b" }}>More forever.</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#1a1410", background: "#ffd84d", border: "4px solid #1a1410", borderRadius: 999, padding: "12px 28px", alignSelf: "flex-start" }}>
            Free 10-minute Readiness Check
          </div>
        </div>
        <div style={{ position: "absolute", right: 60, top: 150, width: 300, height: 300, borderRadius: 999, background: "#ff4f2b", border: "6px solid #1a1410" }} />
        <div style={{ position: "absolute", right: 0, top: 230, width: 300, height: 300, borderRadius: 999, background: "#2b3bff", border: "6px solid #1a1410", opacity: 0.92 }} />
      </div>
    ),
    size,
  );
}
