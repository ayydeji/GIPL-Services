import { ImageResponse } from "next/og";

export const alt = "GIPL Services";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#FAF8F5";
const INK = "#3D3126";

export default function OpenGraphImage() {
  const circleSize = size.height;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: INK,
        }}
      >
        <div
          style={{
            width: circleSize,
            height: circleSize,
            borderRadius: "50%",
            background: PAPER,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
