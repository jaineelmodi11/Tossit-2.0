import { ImageResponse } from "next/og";

export const alt = "TossIt - Smart Waste Classification";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #68ac53 0%, #4a8a3a 50%, #2d5c22 100%)",
        }}
      >
        <div style={{ fontSize: 140 }}>♻️</div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "white",
            marginTop: 12,
          }}
        >
          TossIt
        </div>
        <div style={{ fontSize: 36, color: "rgba(255,255,255,0.85)", marginTop: 8 }}>
          Snap a photo. Know the bin. Track your recycling rate.
        </div>
      </div>
    ),
    { ...size }
  );
}
