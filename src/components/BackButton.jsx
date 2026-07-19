import { useEffect } from "react";

export default function BackButton({ onBack }) {
  // Escape vuelve al menú desde cualquier juego
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onBack?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  return (
    <button
      className="cg-btn"
      onClick={onBack}
      title="Volver al menú (Esc)"
      style={{
        position: "fixed",
        top: 12,
        left: 12,
        zIndex: 100,
        fontFamily: "'Patrick Hand',cursive",
        fontSize: 16,
        color: "#666",
        background: "rgba(255,255,255,.85)",
        border: "2px solid rgba(0,0,0,.12)",
        borderRadius: 14,
        padding: "6px 14px",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,.06)",
        userSelect: "none",
      }}
    >
      ← Volver
    </button>
  );
}
