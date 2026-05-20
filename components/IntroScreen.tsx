"use client";

import { useEffect, useState } from "react";

export default function IntroScreen() {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("intro_seen")) return;
    setVisible(true);

    const t1 = setTimeout(() => {
      sessionStorage.setItem("intro_seen", "1");
      setFadeOut(true);
    }, 1600);

    const t2 = setTimeout(() => {
      setVisible(false);
    }, 2400);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#080808",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        animation: fadeOut
          ? "intro-fadeout 0.8s ease forwards"
          : "intro-fadein 0.6s ease forwards",
      }}
    >
      <p
        style={{
          color: "#e8392a",
          fontSize: "0.65rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          marginBottom: "1rem",
        }}
      >
        {"// initializing"}
      </p>
      <div
        style={{
          fontSize: "clamp(2.5rem, 8vw, 5rem)",
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: "#ffffff",
          display: "flex",
          alignItems: "baseline",
          gap: "0.4em",
        }}
      >
        <span>FEEDBACK</span>
        <span style={{ color: "#e8392a" }}>AI</span>
        <span
          style={{
            color: "#e8392a",
            animation: "intro-blink 1s step-end infinite",
            fontSize: "0.8em",
          }}
        >
          _
        </span>
      </div>
    </div>
  );
}
