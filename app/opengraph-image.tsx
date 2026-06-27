import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#F6F1E7",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#7A2E2E",
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Jin1abad
        </div>
        <div
          style={{
            fontSize: 66,
            color: "#232323",
            marginTop: 24,
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          Alumni Matholi&apos;ul Falah
        </div>
        <div style={{ fontSize: 38, color: "#46566B", marginTop: 12 }}>
          Angkatan 2012
        </div>
        <div
          style={{
            marginTop: 40,
            width: 90,
            height: 90,
            borderRadius: 9999,
            border: "4px solid #7A2E2E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            color: "#7A2E2E",
            fontWeight: 600,
          }}
        >
          2012
        </div>
      </div>
    ),
    { ...size }
  );
}
