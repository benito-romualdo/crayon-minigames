import { COLORS, loadJSON } from "../shared/theme";
import { NotebookPage, GameHeader, CrayonSprite } from "../shared/components";

/* Totales para las insignias de progreso (LEVELS de cada juego) */
const TOTAL_CIRCUIT_LEVELS = 8;
const TOTAL_BLANKPAGE_STARS = 30; // 10 niveles × 3 estrellas

/* ── Iconos SVG estilo crayón (consistentes en todas las plataformas) ── */
function SnakeIcon() {
  return (
    <svg width="54" height="54" viewBox="-27 -27 54 54">
      <g transform="rotate(-40)">
        <CrayonSprite color={COLORS[0]} idPrefix="mi-snake" />
      </g>
    </svg>
  );
}

function CircuitIcon() {
  const c = COLORS[1];
  return (
    <svg width="54" height="54" viewBox="0 0 54 54">
      <path d="M13 14 C 40 8, 14 44, 41 40" fill="none" stroke={c.body} strokeWidth="6" strokeLinecap="round" opacity=".5" />
      <circle cx="13" cy="14" r="7.5" fill={c.body} stroke={c.tip} strokeWidth="1.5" />
      <circle cx="41" cy="40" r="7.5" fill={c.body} stroke={c.tip} strokeWidth="1.5" />
      <circle cx="13" cy="14" r="2.5" fill="white" opacity=".35" />
      <circle cx="41" cy="40" r="2.5" fill="white" opacity=".35" />
    </svg>
  );
}

function BlankPageIcon() {
  const c = COLORS[4];
  return (
    <svg width="54" height="54" viewBox="0 0 54 54">
      <rect x="11" y="6" width="32" height="42" rx="3" fill="#fffef7" stroke="#bbb" strokeWidth="2" />
      <line x1="17" y1="15" x2="37" y2="15" stroke="rgba(150,190,230,.7)" strokeWidth="1.5" />
      <line x1="17" y1="21" x2="37" y2="21" stroke="rgba(150,190,230,.7)" strokeWidth="1.5" />
      <line x1="17" y1="27" x2="30" y2="27" stroke="rgba(150,190,230,.7)" strokeWidth="1.5" />
      <path d="M15 39 Q 21 31, 27 37 T 39 35" fill="none" stroke={c.body} strokeWidth="5" strokeLinecap="round" opacity=".75" />
    </svg>
  );
}

function FlappyIcon() {
  const c = COLORS[2];
  return (
    <svg width="54" height="54" viewBox="0 0 54 54">
      <path d="M4 40 Q 12 34 18 38" fill="none" stroke={c.body} strokeWidth="2.5" strokeDasharray="4 5" strokeLinecap="round" opacity=".6" />
      <polygon points="14,34 50,10 38,46 30,34" fill="#fffef7" stroke={c.body} strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="50" y1="10" x2="30" y2="34" stroke={c.tip} strokeWidth="1.5" opacity=".5" />
    </svg>
  );
}

/* Config visual por juego: acento, icono y lector de progreso guardado */
const CARD_META = {
  snake: {
    accent: COLORS[0],
    icon: <SnakeIcon />,
    progress: () => {
      const best = loadJSON("snake-best", 0);
      return best > 0 ? `Récord: ${best}` : null;
    },
  },
  circuit: {
    accent: COLORS[1],
    icon: <CircuitIcon />,
    progress: () => {
      const done = loadJSON("circuit-completed", []).length;
      return done > 0 ? `${done}/${TOTAL_CIRCUIT_LEVELS} niveles ✓` : null;
    },
  },
  blankpage: {
    accent: COLORS[4],
    icon: <BlankPageIcon />,
    progress: () => {
      const stars = Object.values(loadJSON("blankpage-completed", {})).reduce((a, b) => a + (b || 0), 0);
      return stars > 0 ? `★ ${stars}/${TOTAL_BLANKPAGE_STARS}` : null;
    },
  },
  flappy: {
    accent: COLORS[2],
    icon: <FlappyIcon />,
    progress: () => {
      const best = loadJSON("flappy-best", 0);
      return best > 0 ? `Récord: ${best}` : null;
    },
  },
};

export default function GameMenu({ games, onSelect }) {
  return (
    <NotebookPage doodles="menu">
      <GameHeader
        title="Crayon Games"
        subtitle="Elige un minijuego para empezar"
        titleStyle={{ fontSize: "clamp(28px,6vw,48px)" }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 18,
          maxWidth: 600,
          width: "100%",
          zIndex: 1,
          animation: "fadeIn .5s ease",
          paddingTop: 10,
        }}
      >
        {games.map((game, i) => {
          const meta = CARD_META[game.id] || CARD_META.snake;
          const progress = meta.progress();
          return (
            <button
              key={game.id}
              className="cg-sticker"
              onClick={() => onSelect(game.id)}
              style={{
                "--tilt": i % 2 === 0 ? "-0.8deg" : "0.9deg",
                "--tape-tilt": i % 2 === 0 ? "-4deg" : "3deg",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "26px 20px 18px",
                background: "rgba(255,255,255,.9)",
                border: "2.5px solid rgba(0,0,0,.1)",
                borderRadius: 18,
                cursor: "pointer",
                fontFamily: "'Patrick Hand',cursive",
              }}
            >
              <span className="cg-tape" style={{ background: meta.accent.body }} />
              <span style={{ display: "inline-flex", animation: "wobble 2.4s ease-in-out infinite" }}>
                {meta.icon}
              </span>
              <span
                style={{
                  fontFamily: "'Fredoka One',cursive",
                  fontSize: "clamp(16px,3vw,20px)",
                  color: "#444",
                }}
              >
                {game.name}
              </span>
              <span
                style={{
                  fontSize: "clamp(12px,2.5vw,15px)",
                  color: "#888",
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                {game.description}
              </span>
              {progress && (
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "'Fredoka One',cursive",
                    color: meta.accent.body,
                    background: `${meta.accent.body}14`,
                    borderRadius: 10,
                    padding: "2px 10px",
                    marginTop: 2,
                  }}
                >
                  {progress}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </NotebookPage>
  );
}
