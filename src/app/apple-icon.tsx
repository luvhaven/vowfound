import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS wants a PNG, and it sits on a home screen at real size. Same mark as
 * public/brand/vowfound-favicon.svg, drawn with geometry rather than type so
 * no font has to load.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#7A2544",
        }}
      >
        {/* The band. */}
        <div
          style={{
            position: "absolute",
            left: 49,
            top: 58,
            width: 82,
            height: 82,
            borderRadius: 82,
            border: "25px solid #F6F2F4",
          }}
        />
        {/* The stone, cut rather than round — a circle above a ring reads as
            a generic user glyph. */}
        <div
          style={{
            position: "absolute",
            left: 68,
            top: 16,
            width: 44,
            height: 44,
            background: "#7A2544",
            transform: "rotate(45deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 75,
            top: 23,
            width: 30,
            height: 30,
            background: "#EFA9BE",
            transform: "rotate(45deg)",
          }}
        />
      </div>
    ),
    size,
  );
}
