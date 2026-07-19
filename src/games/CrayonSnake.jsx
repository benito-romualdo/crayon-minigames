import { useState, useEffect, useCallback, useRef } from "react";
import { COLORS, DIR, KEY_TO_DIR, loadJSON, saveJSON } from "../shared/theme";
import { NotebookPage, PageTitle, PillButton, ColorPicker, CrayonSprite, Dpad, GameOverlay, KeyHints, useTouchDevice } from "../shared/components";

/* ── Constants ── */
const CELL = 20;
const COLS = 22;
const ROWS = 22;
const W = COLS * CELL;
const H = ROWS * CELL;
const INIT_SPEED = 140;
const SPEED_INC = 3;
const MIN_SPEED = 50;
const CENTER_X = Math.floor(COLS / 2);
const CENTER_Y = Math.floor(ROWS / 2);
const INIT_LEN = 4;
const GRACE_TICKS = 3; // ticks de invulnerabilidad al empezar
const BEST_KEY = "snake-best";

/* ── Utilities ── */
function isOpposite(a, b) { return a.x + b.x === 0 && a.y + b.y === 0; }
function sameDir(a, b) { return a.x === b.x && a.y === b.y; }

function makeInitSnake() {
  // Cabeza en el centro, cuerpo hacia la izquierda
  return Array.from({ length: INIT_LEN }, (_, i) => ({ x: CENTER_X - i, y: CENTER_Y }));
}

function randomPos(exclude) {
  for (let tries = 0; tries < 300; tries++) {
    const p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    if (!exclude.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
  // Tablero casi lleno: primera celda libre
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (!exclude.some((s) => s.x === x && s.y === y)) return { x, y };
    }
  }
  return { x: -1, y: -1 }; // sin celdas libres: fuera del tablero
}

/* Rejilla estática: se construye una sola vez, no en cada tick */
const GRID_LINES = [
  ...Array.from({ length: COLS + 1 }, (_, i) => (
    <line key={`v${i}`} x1={i * CELL} y1={0} x2={i * CELL} y2={H} stroke="rgba(150,190,230,.12)" strokeWidth={.5} />
  )),
  ...Array.from({ length: ROWS + 1 }, (_, i) => (
    <line key={`h${i}`} x1={0} y1={i * CELL} x2={W} y2={i * CELL} stroke="rgba(150,190,230,.12)" strokeWidth={.5} />
  )),
];

/* ── Cabeza: crayón alargado rotado según la dirección ── */
function CrayonHead({ x, y, dir, color }) {
  const cx = x * CELL + CELL / 2;
  const cy = y * CELL + CELL / 2;
  const angle = dir.x === 1 ? 0 : dir.x === -1 ? 180 : dir.y === -1 ? 270 : 90;
  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`} style={{ animation: "scribble .3s infinite" }}>
      <CrayonSprite color={color} idPrefix="snake" />
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function CrayonSnake({ onBack }) {
  const [snake, setSnake] = useState(makeInitSnake);
  const [food, setFood] = useState(() => randomPos(makeInitSnake()));
  const [bonus, setBonus] = useState(null);
  const [dir, setDir] = useState(DIR.RIGHT);
  const [gs, setGs] = useState("idle"); // idle | playing | over
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => loadJSON(BEST_KEY, 0));
  const [speed, setSpeed] = useState(INIT_SPEED);
  const [colorIdx, setColorIdx] = useState(0);
  const [particles, setParticles] = useState([]);
  const [pressedBtn, setPressedBtn] = useState(null);
  const [graceTick, setGraceTick] = useState(0);

  const color = COLORS[colorIdx];

  // Refs para leer los valores actuales dentro del interval
  const r = useRef({});
  useEffect(() => { Object.assign(r.current, { dir, snake, food, bonus, score, speed, gs, graceTick }); });
  const lastDir = useRef(DIR.RIGHT);
  const queue = useRef([]);

  /* ── particles ── */
  const boom = useCallback((x, y, c, n = 6) => {
    const ps = Array.from({ length: n }, (_, i) => {
      const angle = (Math.PI * 2 * i) / n + Math.random() * .5;
      const dist = 12 + Math.random() * 14;
      return {
        id: `${Date.now()}-${i}-${Math.random()}`,
        x: x * CELL + CELL / 2, y: y * CELL + CELL / 2,
        dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist,
        r: 3 + Math.random() * 2, color: c,
      };
    });
    setParticles((p) => [...p, ...ps]);
    setTimeout(() => setParticles((p) => p.filter((pp) => !ps.includes(pp))), 500);
  }, []);

  /* ── start game ── */
  const startGame = useCallback(() => {
    const s = makeInitSnake();
    setSnake(s);
    setFood(randomPos(s));
    setBonus(null);
    setDir(DIR.RIGHT);
    lastDir.current = DIR.RIGHT;
    queue.current = [];
    setScore(0);
    setSpeed(INIT_SPEED);
    setGraceTick(GRACE_TICKS);
    setGs("playing");
    setParticles([]);
  }, []);

  /* ── fin de partida: guarda el récord ── */
  const endGame = useCallback(() => {
    setGs("over");
    setBest((p) => {
      const nb = Math.max(p, r.current.score);
      saveJSON(BEST_KEY, nb);
      return nb;
    });
  }, []);

  /* ── push a direction (desde cualquier entrada) ── */
  const pushDir = useCallback((nd) => {
    if (r.current.gs !== "playing") {
      startGame();
      // Solo se encola si es compatible con la dirección inicial (derecha)
      if (!isOpposite(nd, DIR.RIGHT) && !sameDir(nd, DIR.RIGHT)) {
        queue.current = [nd];
      }
      return;
    }
    const q = queue.current;
    const eff = q.length > 0 ? q[q.length - 1] : lastDir.current;
    if (isOpposite(nd, eff) || sameDir(nd, eff)) return;
    if (q.length < 2) queue.current = [...q, nd];
  }, [startGame]);

  /* ── tick ── */
  const tick = useCallback(() => {
    const st = r.current;
    if (st.gs !== "playing") return;

    // Consume la dirección encolada
    if (queue.current.length > 0) {
      const next = queue.current.shift();
      if (!isOpposite(next, lastDir.current)) {
        r.current.dir = next;
        setDir(next);
      }
    }

    const d = r.current.dir;
    lastDir.current = d;
    const cur = r.current.snake;
    const head = cur[0];
    const nh = { x: head.x + d.x, y: head.y + d.y };

    // Periodo de gracia: cuenta atrás sin comprobar colisiones
    const grace = r.current.graceTick;
    if (grace > 0) {
      setGraceTick(grace - 1);
      const oob = nh.x < 0 || nh.x >= COLS || nh.y < 0 || nh.y >= ROWS;
      const selfHit = cur.some((s) => s.x === nh.x && s.y === nh.y);
      if (oob || selfHit) return; // este tick no avanza
    } else {
      if (nh.x < 0 || nh.x >= COLS || nh.y < 0 || nh.y >= ROWS) { endGame(); return; }
      if (cur.some((s) => s.x === nh.x && s.y === nh.y)) { endGame(); return; }
    }

    let ns = [nh, ...cur];
    let ate = false;

    // Food
    const cf = r.current.food;
    if (nh.x === cf.x && nh.y === cf.y) {
      ate = true;
      setScore((s) => s + 10);
      boom(cf.x, cf.y, "#e63946");
      // La comida nueva no puede caer sobre el bonus activo
      const nf = randomPos(r.current.bonus ? [...ns, r.current.bonus] : ns);
      setFood(nf);
      setSpeed((s) => Math.max(MIN_SPEED, s - SPEED_INC));
      if (!r.current.bonus && Math.random() < .2) {
        const b = randomPos([...ns, nf]);
        setBonus(b);
        setTimeout(() => setBonus((prev) => prev && prev.x === b.x && prev.y === b.y ? null : prev), 5000);
      }
    }

    // Bonus
    const cb = r.current.bonus;
    if (cb && nh.x === cb.x && nh.y === cb.y) {
      ate = true;
      setScore((s) => s + 50);
      boom(cb.x, cb.y, "#ff9800", 10);
      setBonus(null);
    }

    if (!ate) ns.pop();
    setSnake(ns);
  }, [boom, endGame]);

  /* ── game loop ── */
  useEffect(() => {
    if (gs !== "playing") return;
    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [gs, speed, tick]);

  /* ── keyboard ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (r.current.gs !== "playing") startGame();
        return;
      }
      const nd = KEY_TO_DIR[e.key];
      if (!nd) return;
      e.preventDefault();
      pushDir(nd);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [startGame, pushDir]);

  /* ── swipe ── */
  const tRef = useRef(null);
  const onTS = useCallback((e) => {
    tRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const onTE = useCallback((e) => {
    if (!tRef.current) return;
    const dx = e.changedTouches[0].clientX - tRef.current.x;
    const dy = e.changedTouches[0].clientY - tRef.current.y;
    tRef.current = null;
    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) {
      if (r.current.gs !== "playing") startGame();
      return;
    }
    const nd = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? DIR.RIGHT : DIR.LEFT)
      : (dy > 0 ? DIR.DOWN : DIR.UP);
    pushDir(nd);
  }, [startGame, pushDir]);

  /* ── D-pad ── */
  const onDpad = useCallback((nd, id) => {
    setPressedBtn(id);
    setTimeout(() => setPressedBtn(null), 120);
    pushDir(nd);
  }, [pushDir]);

  const boardWidth = `min(100%, ${W}px)`;
  const isTouch = useTouchDevice();

  /* ══ RENDER ══ */
  return (
    <NotebookPage
      onBack={onBack}
      doodles="snake"
      style={{ touchAction: gs === "playing" ? "none" : "auto" }}
      onTouchStart={onTS}
      onTouchEnd={onTE}
    >
      <PageTitle>Crayon Snake</PageTitle>

      {/* Color picker */}
      {gs !== "playing" && (
        <ColorPicker colors={COLORS} selected={colorIdx} onSelect={setColorIdx} style={{ marginBottom: 8 }} />
      )}

      {/* Score */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        width: boardWidth, marginBottom: 6, fontSize: "clamp(14px,3vw,18px)", zIndex: 1,
      }}>
        <span style={{ color: "#555" }}>
          Puntos: <span style={{ color: color.body, fontWeight: "bold", fontFamily: "'Fredoka One',cursive" }}>{score}</span>
        </span>
        <span style={{ color: "#555" }}>
          Récord: <span style={{ color: "#ff9800", fontWeight: "bold", fontFamily: "'Fredoka One',cursive" }}>{best}</span>
        </span>
      </div>

      {/* ═══ Board ═══ */}
      <div style={{
        position: "relative", width: boardWidth, aspectRatio: "1 / 1",
        border: `3px solid ${color.body}`, borderRadius: 12, background: "#fffef7",
        boxShadow: `0 4px 24px rgba(0,0,0,.08),inset 0 0 30px rgba(0,0,0,.02),0 0 0 1px ${color.body}22`,
        overflow: "hidden", zIndex: 1,
      }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", top: 0, left: 0, display: "block" }}>
          <defs>
            {/* Textura rugosa de crayón */}
            <filter id="crayon-rough" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="turbulence" baseFrequency=".45" numOctaves="3" seed="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          {/* Grid */}
          {GRID_LINES}

          {/* Trazo — un solo filtro para todo el trail (mucho más barato que uno por segmento) */}
          {snake.length > 1 && (
            <g filter="url(#crayon-rough)">
              {snake.slice(1).map((seg, i) => {
                const prev = snake[i];
                const op = .4 + .5 * (1 - i / Math.max(snake.length - 1, 1));
                const sx = seg.x * CELL + CELL / 2, sy = seg.y * CELL + CELL / 2;
                const px = prev.x * CELL + CELL / 2, py = prev.y * CELL + CELL / 2;
                // Pequeña ondulación para el aire de dibujo a mano
                const ox1 = Math.sin(i * 2.1) * 1.2;
                const oy1 = Math.cos(i * 1.7) * 1.2;
                const ox2 = Math.sin(i * 1.3 + 1) * 1.2;
                const oy2 = Math.cos(i * 2.3 + 1) * 1.2;
                return (
                  <g key={`t${i}`}>
                    <line x1={sx + ox1} y1={sy + oy1} x2={px + ox2} y2={py + oy2}
                      stroke={color.body} strokeWidth={CELL - 5}
                      strokeLinecap="round" opacity={op} />
                    <line x1={sx + ox1 - 1} y1={sy + oy1 - 2} x2={px + ox2 - 1} y2={py + oy2 - 2}
                      stroke="white" strokeWidth={2}
                      strokeLinecap="round" opacity={op * .15} />
                    <line x1={sx + ox1 + 1} y1={sy + oy1 + 2} x2={px + ox2 + 1} y2={py + oy2 + 2}
                      stroke={color.shade} strokeWidth={2.5}
                      strokeLinecap="round" opacity={op * .18} />
                  </g>
                );
              })}
            </g>
          )}

          {/* Cabeza (parpadea durante la gracia) */}
          {snake.length > 0 && (
            <g style={graceTick > 0 ? { animation: "blink .3s infinite" } : undefined}>
              <circle
                cx={snake[0].x * CELL + CELL / 2}
                cy={snake[0].y * CELL + CELL / 2}
                r={4}
                fill={color.tip}
                opacity={.35}
              />
              <CrayonHead x={snake[0].x} y={snake[0].y} dir={dir} color={color} />
            </g>
          )}

          {/* Food */}
          <g style={{ animation: "wobble 1s ease-in-out infinite" }}>
            <text x={food.x * CELL + CELL / 2} y={food.y * CELL + CELL / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={14}>🍎</text>
          </g>

          {/* Bonus */}
          {bonus && (
            <g style={{ animation: "starSpin 1.5s ease-in-out infinite" }}>
              <text x={bonus.x * CELL + CELL / 2} y={bonus.y * CELL + CELL / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={16}>⭐</text>
            </g>
          )}

          {/* Particles: vuelan desde el centro con boomFly */}
          {particles.map((p) => (
            <circle
              key={p.id} cx={p.x} cy={p.y} r={p.r} fill={p.color}
              style={{ "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, animation: "boomFly .45s ease-out forwards" }}
            />
          ))}
        </svg>

        {/* Paper texture */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: .4, backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='%23000' opacity='0.02'/%3E%3C/svg%3E")` }} />

        {/* IDLE */}
        {gs === "idle" && (
          <GameOverlay
            emoji="🖍️"
            hint={isTouch ? "Desliza el dedo o usa el D-Pad" : "WASD / Flechas · Espacio para empezar"}
            actions={
              <PillButton color={color.body} onClick={startGame} style={{ fontSize: "clamp(14px,3vw,18px)", padding: "12px 32px" }}>
                ▶ ¡A Pintar!
              </PillButton>
            }
          >
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "clamp(14px,3vw,20px)", color: "#555", textAlign: "center", lineHeight: 1.6 }}>
              ¡Pinta tu camino<br />sin salirte del cuaderno!
            </div>
          </GameOverlay>
        )}

        {/* GAME OVER */}
        {gs === "over" && (
          <GameOverlay
            emoji="✏️💥"
            emojiAnimation="shake .5s ease"
            title="¡Se rompió!"
            titleColor="#e63946"
            actions={
              <PillButton color={color.body} onClick={startGame} style={{ fontSize: "clamp(14px,3vw,18px)", padding: "12px 32px" }}>
                ↻ Otra vez
              </PillButton>
            }
          >
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "clamp(16px,3vw,22px)", color: color.body, marginBottom: 4 }}>
              Puntos: {score}
            </div>
            {score >= best && score > 0 && (
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: "clamp(12px,2.5vw,16px)", color: "#ff9800", animation: "wobble 1s ease-in-out infinite" }}>
                ⭐ ¡Nuevo récord! ⭐
              </div>
            )}
          </GameOverlay>
        )}
      </div>

      {/* ═══ Controles: D-pad en táctil, teclas en escritorio ═══ */}
      {isTouch ? (
        <Dpad
          color={color}
          pressed={pressedBtn}
          onPress={onDpad}
          style={{ marginTop: 14 }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        />
      ) : (
        <KeyHints color={color} />
      )}

      <div style={{ marginTop: 10, fontSize: "clamp(11px,2vw,14px)", color: "#999", zIndex: 1 }}>
        🍎 = 10 pts &nbsp;&nbsp; ⭐ = 50 pts
      </div>
    </NotebookPage>
  );
}
