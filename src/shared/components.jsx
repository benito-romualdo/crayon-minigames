import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import BackButton from "../components/BackButton";
import { DIR } from "./theme";

/* ── Garabatos de esquina: decoración sutil por juego ── */
const doodleStroke = { fill: "none", strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round" };

const DOODLES = {
  menu: {
    tr: (
      <svg width="86" height="72" viewBox="0 0 60 52">
        <path d="M6 30 C 18 6, 34 6, 40 22 C 46 38, 30 46, 22 36 C 14 26, 30 14, 44 20" stroke="#e63946" {...doodleStroke} />
      </svg>
    ),
    bl: (
      <svg width="110" height="60" viewBox="0 0 110 60">
        <path d="M30 6 L35.9 21.9 L52.8 22.6 L39.5 33.1 L44.1 49.4 L30 40 L15.9 49.4 L20.5 33.1 L7.2 22.6 L24.1 21.9 Z" stroke="#ff9800" {...doodleStroke} />
        <path d="M85 48 C 67 34, 71 16, 85 26 C 99 16, 103 34, 85 48 Z" stroke="#e91e8c" {...doodleStroke} />
      </svg>
    ),
  },
  snake: {
    tr: (
      <svg width="76" height="76" viewBox="0 0 60 60">
        <circle cx="30" cy="36" r="16" stroke="#e63946" {...doodleStroke} />
        <path d="M30 20 Q 29 12 33 8" stroke="#a4161a" {...doodleStroke} />
        <path d="M33 12 Q 42 8 46 14 Q 38 18 33 12 Z" stroke="#4caf50" {...doodleStroke} />
      </svg>
    ),
    bl: (
      <svg width="90" height="34" viewBox="0 0 80 30">
        <path d="M4 22 Q 14 6, 26 18 T 50 16 T 76 20" stroke="#ff9800" {...doodleStroke} />
      </svg>
    ),
  },
  circuit: {
    tr: (
      <svg width="80" height="60" viewBox="0 0 70 52">
        <path d="M10 42 C 30 8, 44 42, 60 14" stroke="#2196F3" {...doodleStroke} />
        <circle cx="10" cy="42" r="6" fill="#2196F3" stroke="none" />
        <circle cx="60" cy="14" r="6" fill="#2196F3" stroke="none" />
      </svg>
    ),
    bl: (
      <svg width="70" height="46" viewBox="0 0 60 40">
        <path d="M8 30 Q 24 6 52 12" stroke="#4caf50" {...doodleStroke} />
        <circle cx="8" cy="30" r="5" fill="#4caf50" stroke="none" />
        <circle cx="52" cy="12" r="5" fill="#4caf50" stroke="none" />
      </svg>
    ),
  },
  blankpage: {
    tr: (
      <svg width="70" height="82" viewBox="0 0 54 64">
        <text x="10" y="50" fontSize="56" fontFamily="'Patrick Hand',cursive" fill="#9c27b0" stroke="none">?</text>
      </svg>
    ),
    bl: (
      <svg width="52" height="62" viewBox="0 0 40 48">
        <path d="M20 4 C 27 16, 33 22, 33 30 A 13 13 0 1 1 7 30 C 7 22, 13 16, 20 4 Z" stroke="#2196F3" {...doodleStroke} />
      </svg>
    ),
  },
  flappy: {
    tr: (
      <svg width="90" height="80" viewBox="0 0 70 62">
        <path d="M4 52 Q 16 40 26 46" stroke="#4caf50" strokeDasharray="4 6" {...doodleStroke} />
        <polygon points="22,40 64,10 50,52 42,38" stroke="#4caf50" {...doodleStroke} />
        <line x1="64" y1="10" x2="42" y2="38" stroke="#2e7d32" strokeWidth="2" opacity=".6" />
      </svg>
    ),
    bl: (
      <svg width="66" height="62" viewBox="0 0 60 56">
        <path d="M30 6 L35.9 21.9 L52.8 22.6 L39.5 33.1 L44.1 49.4 L30 40 L15.9 49.4 L20.5 33.1 L7.2 22.6 L24.1 21.9 Z" stroke="#ff9800" {...doodleStroke} />
      </svg>
    ),
  },
};

export function CornerDoodles({ variant }) {
  const d = DOODLES[variant];
  if (!d) return null;
  return (
    <>
      <div className="cg-doodle" style={{ top: 16, right: 16 }} aria-hidden="true">{d.tr}</div>
      <div className="cg-doodle" style={{ bottom: 16, left: 76 }} aria-hidden="true">{d.bl}</div>
    </>
  );
}

/* ── Página de cuaderno: fondo cuadriculado, líneas de margen, garabatos y botón volver ── */
export function NotebookPage({ onBack, doodles, style, children, ...rest }) {
  return (
    <div className="cg-page" style={style} {...rest}>
      {onBack && <BackButton onBack={onBack} />}
      <div className="cg-margin-line" style={{ left: 60, width: 2, background: "rgba(220,80,80,.3)" }} />
      <div className="cg-margin-line" style={{ left: 63, width: 1, background: "rgba(220,80,80,.15)" }} />
      {doodles && <CornerDoodles variant={doodles} />}
      {children}
    </div>
  );
}

/* ── Título con subrayado ondulado de crayón (firma visual de la casa) ── */
export function PageTitle({ style, underline = true, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
      <h1 className="cg-title" style={{ fontSize: "clamp(22px,5vw,36px)", ...style }}>
        {children}
      </h1>
      {underline && (
        <svg viewBox="0 0 120 8" aria-hidden="true"
          style={{ width: "min(50vw, 180px)", height: 9, marginTop: -2, marginBottom: 4, opacity: .55 }}>
          <defs>
            <linearGradient id="cg-underline-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e63946" />
              <stop offset="25%" stopColor="#ff9800" />
              <stop offset="50%" stopColor="#4caf50" />
              <stop offset="75%" stopColor="#2196F3" />
              <stop offset="100%" stopColor="#9c27b0" />
            </linearGradient>
          </defs>
          <path d="M2 5 Q 10 1 20 4 T 40 4 T 60 4 T 80 4 T 100 4 T 118 3"
            fill="none" stroke="url(#cg-underline-grad)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

/* ── Cabecera de juego: título + subtítulo con estilos unificados ── */
export function GameHeader({ title, subtitle, titleStyle }) {
  return (
    <>
      <PageTitle style={titleStyle}>{title}</PageTitle>
      {subtitle && (
        <p style={{ fontSize: "clamp(13px,2.5vw,16px)", color: "#888", margin: "4px 0 20px", zIndex: 1, textAlign: "center" }}>
          {subtitle}
        </p>
      )}
    </>
  );
}

/* ── Overlay de estado (idle / victoria / derrota) con layout común ── */
export function GameOverlay({ emoji, emojiAnimation = "wobble 2s ease-in-out infinite", title, titleColor = "#4caf50", actions, hint, borderRadius, children }) {
  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "rgba(254,249,239,.92)", animation: "fadeIn .4s ease",
      padding: 20, zIndex: 10, borderRadius,
    }}>
      {emoji && (
        <div style={{ fontSize: "clamp(44px,10vw,72px)", marginBottom: 8, animation: emojiAnimation, lineHeight: 1.2 }}>
          {emoji}
        </div>
      )}
      {title && (
        <div style={{
          fontFamily: "'Fredoka One',cursive", fontSize: "clamp(20px,4.5vw,30px)",
          color: titleColor, marginBottom: 8, textShadow: "2px 2px 0 rgba(0,0,0,.06)",
          textAlign: "center", lineHeight: 1.3,
        }}>
          {title}
        </div>
      )}
      {children}
      {actions && (
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {actions}
        </div>
      )}
      {hint && (
        <div style={{ fontSize: "clamp(11px,2vw,14px)", marginTop: 16, color: "#999", textAlign: "center", lineHeight: 1.8 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

/* ── Botón "píldora": primario con color de crayón, o fantasma blanco ── */
export function PillButton({ color = "#4caf50", ghost = false, style, children, ...rest }) {
  return (
    <button
      className="cg-btn"
      style={{
        fontFamily: "'Fredoka One',cursive",
        fontSize: "clamp(13px,2.5vw,16px)",
        color: ghost ? "#666" : "#fff",
        background: ghost ? "rgba(255,255,255,.85)" : color,
        border: ghost ? "2px solid rgba(0,0,0,.12)" : "none",
        padding: "10px 24px",
        borderRadius: 25,
        cursor: "pointer",
        boxShadow: ghost ? "0 2px 8px rgba(0,0,0,.06)" : `0 4px 14px ${color}44`,
        letterSpacing: 1,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ── Selector de color de crayón ── */
export function ColorPicker({ colors, selected, onSelect, label = "Color:", style }) {
  return (
    <div
      style={{
        display: "flex", gap: 6, animation: "fadeIn .5s ease",
        background: "rgba(255,255,255,.7)", padding: "6px 14px", borderRadius: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,.06)", zIndex: 1, ...style,
      }}
    >
      {label && <span style={{ fontSize: 13, color: "#666", alignSelf: "center", marginRight: 4 }}>{label}</span>}
      {colors.map((c, i) => {
        const active = selected === i;
        return (
          <button
            key={c.name}
            onClick={() => onSelect(i)}
            title={c.name}
            aria-label={c.name}
            style={{
              width: 28, height: 28, borderRadius: "50%", background: c.body,
              border: active ? "3px solid #333" : "2px solid rgba(0,0,0,.15)",
              cursor: "pointer", transition: "all .2s",
              transform: active ? "scale(1.2)" : "scale(1)",
              boxShadow: active ? `0 0 10px ${c.body}55` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Crayón SVG apuntando a la derecha, centrado en el origen (~40px de largo).
      Los contenedores lo colocan con translate/rotate/scale. ── */
export function CrayonSprite({ color, idPrefix = "cs" }) {
  const gid = `${idPrefix}-grad-${color.name}`;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity=".25" />
          <stop offset="40%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity=".12" />
        </linearGradient>
      </defs>

      {/* Extremo trasero plano */}
      <rect x={-22} y={-6} width={3} height={12} rx={1} fill={color.shade} />

      {/* Cuerpo principal con brillo */}
      <rect x={-19} y={-6} width={22} height={12} rx={1.5} fill={color.body} />
      <rect x={-19} y={-6} width={22} height={12} rx={1.5} fill={`url(#${gid})`} />

      {/* Envoltorio de papel */}
      <rect x={-16} y={-6.5} width={16} height={13} rx={1} fill="white" opacity=".88" />
      <rect x={-16} y={-6.5} width={16} height={13} rx={1} fill={color.body} opacity=".12" />
      <line x1={-16} y1={-6} x2={-16} y2={6} stroke={color.shade} strokeWidth={.4} opacity={.3} />
      <line x1={0} y1={-6} x2={0} y2={6} stroke={color.shade} strokeWidth={.4} opacity={.3} />
      <line x1={-14} y1={-2} x2={-2} y2={-2} stroke={color.body} strokeWidth={.6} opacity={.35} />
      <line x1={-14} y1={0.5} x2={-2} y2={0.5} stroke={color.body} strokeWidth={.6} opacity={.25} />
      <line x1={-14} y1={3} x2={-2} y2={3} stroke={color.body} strokeWidth={.6} opacity={.2} />
      <text x={-11} y={-3} fontSize={4} fill={color.body} fontFamily="'Fredoka One',sans-serif" opacity={.7} fontWeight="bold">CRAYON</text>

      {/* Crayón expuesto entre envoltorio y punta */}
      <rect x={3} y={-5.5} width={5} height={11} rx={.5} fill={color.body} />
      <rect x={3} y={-5.5} width={5} height={11} rx={.5} fill={`url(#${gid})`} />

      {/* Punta cónica */}
      <polygon points="8,-5 16,0 8,5" fill={color.tip} />
      <polygon points="8,-5 16,0 8,0" fill="white" opacity=".12" />
      <polygon points="13,-2 16,0 13,2" fill={color.shade} opacity=".7" />
      <polygon points="8,-5 16,0 8,5" fill="none" stroke={color.shade} strokeWidth={.4} opacity={.5} />
    </g>
  );
}

/* ── Hook: ¿hay algún puntero táctil? (D-pad solo en táctil) ── */
export function useTouchDevice() {
  const [touch, setTouch] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(any-pointer: coarse)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(any-pointer: coarse)");
    const onChange = (e) => setTouch(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return touch;
}

/* ── Hint de teclado para escritorio (sustituye al D-pad) ── */
export function KeyHints({ color, label = "o WASD para moverte", style }) {
  const key = (k) => (
    <span
      key={k}
      className="cg-key"
      style={{ color: color.body, borderColor: `${color.body}55`, background: `${color.body}0d` }}
    >
      {k}
    </span>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, zIndex: 1, ...style }}>
      {["↑", "↓", "←", "→"].map(key)}
      <span style={{ color: "#999", fontSize: 13, marginLeft: 4 }}>{label}</span>
    </div>
  );
}

/* ── Botón de D-pad. Usa pointerdown: un solo disparo por toque,
      sin eventos de ratón "de compatibilidad" duplicados en móvil. ── */
export function DpadBtn({ label, aria, id, dir, color, pressed, onPress }) {
  const fired = useRef(false);
  const handle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (fired.current) return;
    fired.current = true;
    setTimeout(() => { fired.current = false; }, 80);
    onPress(dir, id);
  }, [dir, id, onPress]);

  return (
    <button
      aria-label={aria}
      onPointerDown={handle}
      style={{
        width: 48, height: 48, fontSize: 20, fontFamily: "sans-serif",
        background: pressed ? `${color.body}35` : `${color.body}15`,
        border: `2px solid ${pressed ? color.body : color.body + "44"}`,
        color: color.body, borderRadius: 12, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        WebkitTapHighlightColor: "transparent", transition: "all .1s",
        transform: pressed ? "scale(.9)" : "scale(1)",
        touchAction: "manipulation",
      }}
    >{label}</button>
  );
}

/* ── D-pad en cruz ── */
export const Dpad = forwardRef(function Dpad({ color, pressed, onPress, style, ...rest }, ref) {
  const btn = (id, label, aria, dir) => (
    <DpadBtn label={label} aria={aria} id={id} dir={dir} color={color} pressed={pressed === id} onPress={onPress} />
  );
  return (
    <div
      ref={ref}
      style={{
        display: "grid", gridTemplateColumns: "48px 48px 48px",
        gridTemplateRows: "48px 48px 48px", gap: 4, zIndex: 1,
        justifyContent: "center", ...style,
      }}
      {...rest}
    >
      <div />{btn("up", "▲", "Arriba", DIR.UP)}<div />
      {btn("left", "◀", "Izquierda", DIR.LEFT)}<div />{btn("right", "▶", "Derecha", DIR.RIGHT)}
      <div />{btn("down", "▼", "Abajo", DIR.DOWN)}<div />
    </div>
  );
});
