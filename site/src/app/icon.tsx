import { ImageResponse } from "next/og";

// Favicon — the lime "pulse" waveform on the near-black ground, matching the wordmark.
export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#08090c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2.5,
        }}
      >
        {[9, 17, 12, 20, 11].map((h, i) => (
          <div key={i} style={{ width: 3, height: h, background: "#20d5f9", borderRadius: 2 }} />
        ))}
      </div>
    ),
    { ...size }
  );
}
