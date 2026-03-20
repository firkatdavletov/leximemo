import { ImageResponse } from "next/og";

import { APP_NAME, APP_THEME_COLOR } from "@/shared/config/app";

export function createPwaIconResponse(size: number) {
  const padding = Math.round(size * 0.12);
  const cornerRadius = Math.round(size * 0.22);
  const badgeSize = Math.round(size * 0.28);
  const cardRadius = Math.round(size * 0.08);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding,
          background:
            "linear-gradient(160deg, #0f766e 0%, #115e59 55%, #164e63 100%)",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: "100%",
            borderRadius: cornerRadius,
            background:
              "radial-gradient(circle at top left, rgba(255,255,255,0.18), rgba(255,255,255,0.02) 62%)",
            boxShadow: "0 24px 48px rgba(15, 23, 42, 0.22)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "16%",
              left: "18%",
              width: "42%",
              height: "50%",
              borderRadius: cardRadius,
              background: "rgba(255,255,255,0.92)",
              transform: "rotate(-10deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "26%",
              left: "35%",
              width: "42%",
              height: "50%",
              borderRadius: cardRadius,
              background: "#ffffff",
              transform: "rotate(8deg)",
              boxShadow: "0 12px 24px rgba(15, 23, 42, 0.16)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "54%",
              right: "14%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize,
              background: "#fef08a",
              color: APP_THEME_COLOR,
              fontSize: Math.round(size * 0.18),
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div
            style={{
              position: "absolute",
              left: "12%",
              bottom: "12%",
              display: "flex",
              flexDirection: "column",
              color: "#ffffff",
              letterSpacing: "-0.04em",
            }}
          >
            <span
              style={{
                fontSize: Math.round(size * 0.17),
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              {APP_NAME}
            </span>
            <span
              style={{
                marginTop: Math.round(size * 0.02),
                fontSize: Math.round(size * 0.07),
                opacity: 0.82,
              }}
            >
              Learn. Review. Repeat.
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    },
  );
}
