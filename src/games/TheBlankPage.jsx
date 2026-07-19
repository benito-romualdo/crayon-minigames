import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { COLORS, DIR, KEY_TO_DIR } from "../shared/theme";
import { NotebookPage, GameHeader, PillButton, ColorPicker, CrayonSprite, Dpad, GameOverlay, KeyHints, useTouchDevice } from "../shared/components";

/* ── Constants ── */
const BOARD_PX = 320;
const PAD = 16; // franja del viewBox para los números de fila/columna

const FLOOR = 0, WALL = 1, EXIT = 2, INK = 3, ERASER = 4, SPILL = 5;

const MAX_UNDOS = 3;

/* ── Levels (Capítulo 1: "Primeros Trazos") ── */
// 0=suelo, 1=muro, 2=salida, 3=tinta(+10), 4=borrador(-5), 5=derrame
const LEVELS = [
  {
    id: 1, name: "Página 1", size: 8, ink: 50,
    start: [1, 6],
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1],
      [1,0,1,1,0,1,0,1],
      [1,0,0,0,0,1,0,1],
      [1,1,1,0,1,1,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,1,1,1,1,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    stars: { one: 0, two: 15, three: 30 },
  },
  {
    id: 2, name: "Página 2", size: 8, ink: 48,
    start: [1, 1],
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,1],
      [1,0,1,0,0,0,1,1],
      [1,0,1,1,1,0,0,1],
      [1,0,0,0,0,0,1,1],
      [1,1,1,0,1,0,0,1],
      [1,0,0,0,1,0,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    stars: { one: 0, two: 12, three: 25 },
  },
  {
    id: 3, name: "Página 3", size: 8, ink: 42,
    start: [1, 1],
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,1],
      [1,0,1,0,0,0,1,1],
      [1,3,1,1,0,0,0,1],
      [1,0,0,0,1,1,0,1],
      [1,1,0,1,0,0,0,1],
      [1,0,0,0,0,1,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    stars: { one: 0, two: 10, three: 20 },
  },
  {
    id: 4, name: "Página 4", size: 8, ink: 40,
    start: [6, 1],
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1],
      [1,1,1,0,1,1,0,1],
      [1,0,0,0,0,1,0,1],
      [1,0,1,1,0,0,0,1],
      [1,0,0,3,0,1,1,1],
      [1,2,1,1,0,0,0,1],
      [1,1,1,1,1,1,1,1],
    ],
    stars: { one: 0, two: 8, three: 18 },
  },
  {
    id: 5, name: "Página 5", size: 8, ink: 38,
    start: [1, 1],
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,0,0,1,0,0,0,1],
      [1,0,1,0,0,1,0,1],
      [1,0,0,0,1,0,0,1],
      [1,1,0,1,0,0,1,1],
      [1,0,0,0,0,1,0,1],
      [1,0,1,0,3,0,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    stars: { one: 0, two: 8, three: 16 },
  },
  {
    id: 6, name: "Página 6", size: 8, ink: 36,
    start: [1, 6],
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,1],
      [1,1,0,1,0,0,1,1],
      [1,0,0,0,0,1,0,1],
      [1,0,1,0,1,0,0,1],
      [1,0,0,0,0,0,1,1],
      [1,0,1,1,3,0,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    stars: { one: 0, two: 6, three: 14 },
  },
  {
    id: 7, name: "Página 7", size: 8, ink: 35,
    start: [1, 1],
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,0,0,0,0,1,0,1],
      [1,0,1,1,0,0,0,1],
      [1,0,0,4,0,1,0,1],
      [1,1,0,1,0,0,0,1],
      [1,0,0,0,1,0,1,1],
      [1,0,1,0,0,0,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    stars: { one: 0, two: 5, three: 12 },
  },
  {
    id: 8, name: "Página 8", size: 8, ink: 34,
    start: [6, 6],
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,2,0,0,1,0,0,1],
      [1,0,1,0,0,0,1,1],
      [1,0,0,0,1,4,0,1],
      [1,1,0,1,0,0,0,1],
      [1,0,0,0,0,1,0,1],
      [1,0,1,3,0,0,0,1],
      [1,1,1,1,1,1,1,1],
    ],
    stars: { one: 0, two: 4, three: 10 },
  },
  {
    id: 9, name: "Página 9", size: 8, ink: 32,
    start: [1, 1],
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,1],
      [1,0,1,0,5,0,1,1],
      [1,0,0,1,0,0,0,1],
      [1,1,0,0,0,1,0,1],
      [1,0,0,1,0,0,0,1],
      [1,0,1,0,0,3,2,1],
      [1,1,1,1,1,1,1,1],
    ],
    stars: { one: 0, two: 4, three: 10 },
  },
  {
    id: 10, name: "Página 10", size: 8, ink: 30,
    start: [1, 6],
    grid: [
      [1,1,1,1,1,1,1,1],
      [1,2,0,1,0,0,0,1],
      [1,0,1,0,0,1,0,1],
      [1,0,0,0,1,5,0,1],
      [1,1,0,1,0,0,0,1],
      [1,0,0,0,0,1,4,1],
      [1,0,1,3,0,0,0,1],
      [1,1,1,1,1,1,1,1],
    ],
    stars: { one: 0, two: 3, three: 8 },
  },
];

/* ── Utilities ── */
function cellKey(x, y) { return `${x},${y}`; }
function isWalkable(t) { return t !== WALL; }

function getAdjacentShadows(x, y, grid, revealed, size) {
  const shadows = [];
  for (const d of [DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT]) {
    const nx = x + d.x, ny = y + d.y;
    if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
    if (revealed.has(cellKey(nx, ny))) continue;
    if (grid[ny][nx] !== FLOOR && grid[ny][nx] !== WALL) shadows.push([nx, ny]);
  }
  return shadows;
}

function countWalkable(grid, size, axis, idx) {
  let c = 0;
  for (let i = 0; i < size; i++) {
    const t = axis === "row" ? grid[idx][i] : grid[i][idx];
    if (isWalkable(t)) c++;
  }
  return c;
}

/* ── Sub-components ── */
function CrayonPlayer({ x, y, cell, dir, color }) {
  const cx = x * cell + cell / 2;
  const cy = y * cell + cell / 2;
  const angle = dir.x === 1 ? 0 : dir.x === -1 ? 180 : dir.y === -1 ? 270 : 90;
  const s = cell / 20; // factor de escala respecto a la celda base de 20px
  return (
    <g transform={`translate(${cx},${cy}) scale(${s}) rotate(${angle})`}>
      <CrayonSprite color={color} idPrefix="bp" />
    </g>
  );
}

/* ── Main Component ── */
export default function TheBlankPage({ onBack }) {
  const [screen, setScreen] = useState("levels");
  const [currentLevel, setCurrentLevel] = useState(null);
  const [completedLevels, setCompletedLevels] = useState(() => {
    try { return JSON.parse(localStorage.getItem("blankpage-completed") || "{}"); } catch { return {}; }
  });
  const [playerPos, setPlayerPos] = useState(null);
  const [playerDir, setPlayerDir] = useState(DIR.RIGHT);
  const [revealed, setRevealed] = useState(new Set());
  const [ink, setInk] = useState(0);
  const [steps, setSteps] = useState(0);
  const [undosLeft, setUndosLeft] = useState(MAX_UNDOS);
  const [history, setHistory] = useState([]);
  const [gridState, setGridState] = useState(null);
  const [gameStatus, setGameStatus] = useState("playing");
  const [selectedColor, setSelectedColor] = useState(0);
  const [pressedBtn, setPressedBtn] = useState(null);

  const touchRef = useRef(null);
  const moveRef = useRef(null); // ref con la última versión de move

  useEffect(() => {
    try { localStorage.setItem("blankpage-completed", JSON.stringify(completedLevels)); } catch {}
  }, [completedLevels]);

  const level = currentLevel != null ? LEVELS.find(l => l.id === currentLevel) : null;
  const CELL = level ? Math.floor(BOARD_PX / level.size) : 40;
  const W = level ? level.size * CELL : 0;
  const H = W;
  const color = COLORS[selectedColor];
  const isTouch = useTouchDevice();

  /* ── Shadows (memoized) ── */
  const shadowCells = useMemo(() => {
    if (!level || !gridState) return new Set();
    const s = new Set();
    for (const key of revealed) {
      const [x, y] = key.split(",").map(Number);
      const adj = getAdjacentShadows(x, y, gridState, revealed, level.size);
      for (const [sx, sy] of adj) s.add(cellKey(sx, sy));
    }
    return s;
  }, [revealed, gridState, level]);

  /* ── Border numbers (memoized) ── */
  const borderNumbers = useMemo(() => {
    if (!level) return { rows: [], cols: [] };
    const rows = [], cols = [];
    for (let i = 0; i < level.size; i++) {
      rows.push(countWalkable(level.grid, level.size, "row", i));
      cols.push(countWalkable(level.grid, level.size, "col", i));
    }
    return { rows, cols };
  }, [level]);

  /* ── Grid lines (memoized) ── */
  const gridLines = useMemo(() => {
    if (!level) return null;
    const lines = [];
    for (let i = 0; i <= level.size; i++) {
      lines.push(<line key={`v${i}`} x1={i * CELL} y1={0} x2={i * CELL} y2={H} stroke="rgba(150,190,230,.12)" strokeWidth={0.5} />);
      lines.push(<line key={`h${i}`} x1={0} y1={i * CELL} x2={W} y2={i * CELL} stroke="rgba(150,190,230,.12)" strokeWidth={0.5} />);
    }
    return lines;
  }, [level, CELL, W, H]);

  /* ── Start level ── */
  const selectLevel = useCallback((id) => {
    const lvl = LEVELS.find(l => l.id === id);
    if (!lvl) return;
    setCurrentLevel(id);
    setPlayerPos([...lvl.start]);
    setPlayerDir(DIR.RIGHT);
    const initRevealed = new Set();
    initRevealed.add(cellKey(lvl.start[0], lvl.start[1]));
    setRevealed(initRevealed);
    setInk(lvl.ink);
    setSteps(0);
    setUndosLeft(MAX_UNDOS);
    setHistory([]);
    setGridState(lvl.grid.map(row => [...row]));
    setGameStatus("playing");
    setScreen("game");
  }, []);

  /* ── Move logic ── */
  const move = useCallback((direction) => {
    if (!level || !playerPos || !gridState) return;
    if (gameStatus === "won") return;

    const nx = playerPos[0] + direction.x;
    const ny = playerPos[1] + direction.y;

    if (nx < 0 || ny < 0 || nx >= level.size || ny >= level.size) return;

    const cellType = gridState[ny][nx];
    const key = cellKey(nx, ny);
    const wasRevealed = revealed.has(key);

    // Muro: se revela pero no se avanza
    if (cellType === WALL) {
      if (!wasRevealed) {
        setRevealed(prev => { const n = new Set(prev); n.add(key); return n; });
      }
      return;
    }

    // Snapshot para deshacer
    setHistory(prev => [...prev, {
      playerPos: [...playerPos],
      revealed: new Set(revealed),
      ink,
      gridState: gridState.map(r => [...r]),
      steps,
    }]);

    setPlayerPos([nx, ny]);
    setPlayerDir(direction);

    let newInk = ink;
    let newGrid = gridState;
    let newRevealed = revealed;

    if (!wasRevealed) {
      // Revelar y gastar tinta
      newRevealed = new Set(revealed);
      newRevealed.add(key);
      newInk = ink - 1;

      // Objetos
      if (cellType === INK) {
        newInk += 10;
        newGrid = gridState.map(r => [...r]);
        newGrid[ny][nx] = FLOOR;
      } else if (cellType === ERASER) {
        newInk -= 5;
        newGrid = gridState.map(r => [...r]);
        newGrid[ny][nx] = FLOOR;
      } else if (cellType === SPILL) {
        newGrid = gridState.map(r => [...r]);
        newGrid[ny][nx] = FLOOR;
        // Revela la fila O la columna entera (la que descubra más)
        let rowCount = 0, colCount = 0;
        for (let i = 0; i < level.size; i++) {
          if (!newRevealed.has(cellKey(i, ny)) && newGrid[ny][i] !== WALL) rowCount++;
          if (!newRevealed.has(cellKey(nx, i)) && newGrid[i][nx] !== WALL) colCount++;
        }
        if (rowCount >= colCount) {
          for (let i = 0; i < level.size; i++) newRevealed.add(cellKey(i, ny));
        } else {
          for (let i = 0; i < level.size; i++) newRevealed.add(cellKey(nx, i));
        }
      }

      setRevealed(newRevealed);
      setInk(newInk);
      setGridState(newGrid);

      if (newInk <= 0 && gameStatus !== "blind") {
        setGameStatus("blind");
      }
      if (newInk > 0 && gameStatus === "blind") {
        setGameStatus("playing");
      }
    }

    // Salida
    if (cellType === EXIT) {
      setGameStatus("won");
    }

    setSteps(s => s + 1);
  }, [level, playerPos, gridState, revealed, ink, steps, gameStatus]);

  useEffect(() => { moveRef.current = move; }, [move]);

  /* ── Undo ── */
  const undo = useCallback(() => {
    if (gameStatus === "won") return;
    if (undosLeft <= 0 || history.length === 0) return;
    const snap = history[history.length - 1];
    setPlayerPos(snap.playerPos);
    setRevealed(snap.revealed);
    setInk(snap.ink);
    setGridState(snap.gridState);
    setSteps(snap.steps);
    setHistory(prev => prev.slice(0, -1));
    setUndosLeft(prev => prev - 1);
    if (snap.ink > 0) setGameStatus("playing");
  }, [undosLeft, history, gameStatus]);

  /* ── Keyboard input ── */
  useEffect(() => {
    if (screen !== "game") return;
    const onKey = (e) => {
      const d = KEY_TO_DIR[e.key];
      if (d) { e.preventDefault(); moveRef.current?.(d); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen]);

  /* ── Touch swipe ── */
  useEffect(() => {
    if (screen !== "game") return;
    const onStart = (e) => { const t = e.touches[0]; touchRef.current = { x: t.clientX, y: t.clientY }; };
    const onEnd = (e) => {
      if (!touchRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchRef.current.x;
      const dy = t.clientY - touchRef.current.y;
      touchRef.current = null;
      if (Math.abs(dx) < 25 && Math.abs(dy) < 25) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        moveRef.current?.(dx > 0 ? DIR.RIGHT : DIR.LEFT);
      } else {
        moveRef.current?.(dy > 0 ? DIR.DOWN : DIR.UP);
      }
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, [screen]);

  /* ── D-pad callback ── */
  const onDpad = useCallback((dir, id) => {
    setPressedBtn(id);
    setTimeout(() => setPressedBtn(null), 120);
    moveRef.current?.(dir);
  }, []);

  /* ── Star calculation ── */
  const calcStars = useCallback((remainingInk) => {
    if (!level) return 0;
    if (remainingInk >= level.stars.three) return 3;
    if (remainingInk >= level.stars.two) return 2;
    return 1;
  }, [level]);

  const earnedStars = gameStatus === "won" ? calcStars(ink) : 0;

  // Guardar la mejor puntuación del nivel
  useEffect(() => {
    if (gameStatus === "won" && level) {
      setCompletedLevels(prev => {
        const existing = prev[level.id] || 0;
        if (earnedStars > existing) return { ...prev, [level.id]: earnedStars };
        return prev;
      });
    }
  }, [gameStatus, level, earnedStars]);

  /* ── Navigation ── */
  const goToLevels = useCallback(() => {
    setScreen("levels");
    setCurrentLevel(null);
  }, []);

  const nextLevel = useCallback(() => {
    if (!level) return;
    const idx = LEVELS.findIndex(l => l.id === level.id);
    if (idx < LEVELS.length - 1) {
      selectLevel(LEVELS[idx + 1].id);
    } else {
      goToLevels();
    }
  }, [level, selectLevel, goToLevels]);

  const retryLevel = useCallback(() => {
    if (level) selectLevel(level.id);
  }, [level, selectLevel]);

  /* ── Revealed percentage ── */
  const revealedPct = useMemo(() => {
    if (!level || !gridState) return 0;
    let walkable = 0;
    for (let y = 0; y < level.size; y++)
      for (let x = 0; x < level.size; x++)
        if (isWalkable(level.grid[y][x])) walkable++;
    if (walkable === 0) return 100;
    let revWalkable = 0;
    for (const key of revealed) {
      const [rx, ry] = key.split(",").map(Number);
      if (ry >= 0 && ry < level.size && rx >= 0 && rx < level.size && isWalkable(level.grid[ry][rx])) revWalkable++;
    }
    return Math.round((revWalkable / walkable) * 100);
  }, [level, gridState, revealed]);

  /* ══════ Render: Level Select ══════ */
  if (screen === "levels") {
    return (
      <NotebookPage onBack={onBack} doodles="blankpage">
        <GameHeader
          title="The Blank Page"
          subtitle="Lo que no pintas, no existe"
          titleStyle={{ fontSize: "clamp(24px,5vw,40px)" }}
        />

        <ColorPicker
          colors={COLORS}
          selected={selectedColor}
          onSelect={setSelectedColor}
          label={null}
          style={{ marginBottom: 20, background: "none", boxShadow: "none", padding: 0, gap: 8 }}
        />

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12,
          maxWidth: 320, width: "100%", zIndex: 1, animation: "fadeIn .5s ease",
        }}>
          {LEVELS.map((lvl) => {
            const stars = completedLevels[lvl.id] || 0;
            const unlocked = lvl.id === 1 || (completedLevels[lvl.id - 1] || 0) >= 1;
            return (
              <button key={lvl.id} className="cg-card" onClick={() => unlocked && selectLevel(lvl.id)} disabled={!unlocked} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "14px 12px", background: stars > 0 ? "rgba(76,175,80,.08)" : unlocked ? "rgba(255,255,255,.85)" : "rgba(0,0,0,.04)",
                border: `2.5px solid ${stars > 0 ? "rgba(76,175,80,.3)" : unlocked ? "rgba(0,0,0,.1)" : "rgba(0,0,0,.05)"}`,
                borderRadius: 16, cursor: unlocked ? "pointer" : "default",
                boxShadow: unlocked ? "0 3px 12px rgba(0,0,0,.06)" : "none",
                fontFamily: "'Patrick Hand',cursive", position: "relative",
                opacity: unlocked ? 1 : 0.5,
              }}>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: "clamp(18px,4vw,24px)", color: unlocked ? "#444" : "#aaa" }}>
                  {lvl.id}
                </span>
                <span style={{ fontSize: "clamp(11px,2vw,12px)", color: "#888" }}>
                  {lvl.name}
                </span>
                <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                  {[1, 2, 3].map(s => (
                    <span key={s} style={{ fontSize: 14, opacity: s <= stars ? 1 : 0.2 }}>
                      ★
                    </span>
                  ))}
                </div>
                {!unlocked && (
                  <span style={{ position: "absolute", top: 6, right: 8, fontSize: 14 }}>🔒</span>
                )}
              </button>
            );
          })}
        </div>
      </NotebookPage>
    );
  }

  /* ══════ Render: Game ══════ */
  if (!level || !gridState || !playerPos) return null;

  const inkPct = Math.max(0, ink / level.ink);
  const inkColor = inkPct > 0.5 ? "#4caf50" : inkPct > 0.25 ? "#ff9800" : "#e63946";
  const boardWidth = `min(100%, ${W + PAD}px)`;

  return (
    <NotebookPage onBack={onBack} doodles="blankpage" style={{ padding: "20px 10px", touchAction: "none" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, zIndex: 1, flexWrap: "wrap", justifyContent: "center" }}>
        <PillButton ghost onClick={goToLevels} style={{ fontFamily: "'Patrick Hand',cursive", fontSize: 14, padding: "5px 12px", borderRadius: 14, letterSpacing: 0 }}>
          ← Niveles
        </PillButton>
        <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: "clamp(14px,3vw,18px)", color: "#444" }}>
          {level.name}
        </span>
        <PillButton
          ghost
          onClick={undo}
          disabled={undosLeft === 0 || history.length === 0 || gameStatus === "won"}
          title="Deshacer último paso"
          style={{ fontFamily: "'Patrick Hand',cursive", fontSize: 14, padding: "5px 12px", borderRadius: 14, letterSpacing: 0 }}
        >
          🧹 ×{undosLeft}
        </PillButton>
      </div>

      {/* Board (los números de fila/columna viven dentro del SVG y escalan con él) */}
      <div style={{
        position: "relative", width: boardWidth, aspectRatio: "1 / 1",
        border: "3px solid #999", borderRadius: 12, background: "#fffef7",
        boxShadow: "0 4px 24px rgba(0,0,0,.08),inset 0 0 30px rgba(0,0,0,.02)",
        overflow: "hidden", touchAction: "none", zIndex: 1,
      }}>
        <svg width="100%" height="100%" viewBox={`${-PAD} ${-PAD} ${W + PAD} ${H + PAD}`}
          style={{ position: "absolute", top: 0, left: 0, display: "block" }}>
          <defs>
            <filter id="crayon-rough-bp" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="turbulence" baseFrequency=".45" numOctaves="3" seed="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          {/* Números de columna (arriba) y fila (izquierda): celdas transitables */}
          {borderNumbers.cols.map((n, i) => (
            <text key={`cn${i}`} x={i * CELL + CELL / 2} y={-PAD / 2}
              textAnchor="middle" dominantBaseline="central" fontSize={10}
              fill="rgba(120,100,80,.45)" fontFamily="'Patrick Hand',cursive">{n}</text>
          ))}
          {borderNumbers.rows.map((n, i) => (
            <text key={`rn${i}`} x={-PAD / 2} y={i * CELL + CELL / 2}
              textAnchor="middle" dominantBaseline="central" fontSize={10}
              fill="rgba(120,100,80,.45)" fontFamily="'Patrick Hand',cursive">{n}</text>
          ))}

          {gridLines}

          {/* Celdas */}
          {Array.from({ length: level.size }).map((_, y) =>
            Array.from({ length: level.size }).map((_, x) => {
              const key = cellKey(x, y);
              const isRevealed = revealed.has(key);
              const isShadow = shadowCells.has(key);
              const cx = x * CELL, cy = y * CELL;
              const ct = gridState[y][x];

              if (!isRevealed) {
                return (
                  <g key={key}>
                    <rect x={cx} y={cy} width={CELL} height={CELL}
                      fill="#e8e4dc" stroke="rgba(180,170,155,.15)" strokeWidth={0.5} />
                    {isShadow && (
                      <rect x={cx} y={cy} width={CELL} height={CELL}
                        fill="rgba(200,180,120,.08)" />
                    )}
                  </g>
                );
              }

              if (ct === WALL) {
                return (
                  <rect key={key} x={cx} y={cy} width={CELL} height={CELL}
                    fill="#555" filter="url(#crayon-rough-bp)" opacity={0.7} />
                );
              }

              // Suelo / salida / objetos
              const ox = Math.sin(x * 3.7 + y * 2.1) * 0.6;
              const oy = Math.cos(x * 2.3 + y * 3.9) * 0.6;
              return (
                <g key={key}>
                  <rect x={cx + ox} y={cy + oy} width={CELL - 1} height={CELL - 1}
                    fill={color.body} opacity={0.18} filter="url(#crayon-rough-bp)" rx={1} />
                  {ct === EXIT && (
                    <text x={cx + CELL / 2} y={cy + CELL / 2 + 1} textAnchor="middle" dominantBaseline="central"
                      fontSize={CELL * 0.7} style={{ animation: "pulseBig 1.5s ease-in-out infinite", transformOrigin: `${cx + CELL/2}px ${cy + CELL/2}px` }}>
                      🚪
                    </text>
                  )}
                  {ct === INK && (
                    <text x={cx + CELL / 2} y={cy + CELL / 2 + 1} textAnchor="middle" dominantBaseline="central"
                      fontSize={CELL * 0.6} style={{ animation: "wobble 2s ease-in-out infinite" }}>
                      🖊️
                    </text>
                  )}
                  {ct === ERASER && (
                    <text x={cx + CELL / 2} y={cy + CELL / 2 + 1} textAnchor="middle" dominantBaseline="central"
                      fontSize={CELL * 0.6}>
                      🧽
                    </text>
                  )}
                  {ct === SPILL && (
                    <text x={cx + CELL / 2} y={cy + CELL / 2 + 1} textAnchor="middle" dominantBaseline="central"
                      fontSize={CELL * 0.6} style={{ animation: "pulseBig 1.5s ease-in-out infinite", transformOrigin: `${cx + CELL/2}px ${cy + CELL/2}px` }}>
                      💧
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* Player */}
          <CrayonPlayer x={playerPos[0]} y={playerPos[1]} cell={CELL} dir={playerDir} color={color} />
        </svg>

        {/* Blind overlay */}
        {gameStatus === "blind" && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(30,20,10,.2)",
            animation: "blindPulse 2s ease-in-out infinite", pointerEvents: "none",
          }} />
        )}

        {/* Paper texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: .4,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='%23000' opacity='0.02'/%3E%3C/svg%3E")`,
        }} />

        {/* Win overlay */}
        {gameStatus === "won" && (
          <GameOverlay
            title="¡Página completa!"
            titleColor="#4caf50"
            actions={
              <>
                {LEVELS.findIndex(l => l.id === level.id) < LEVELS.length - 1 && (
                  <PillButton color="#4caf50" onClick={nextLevel} style={{ fontSize: "clamp(12px,2.5vw,15px)", padding: "8px 20px" }}>
                    Siguiente →
                  </PillButton>
                )}
                {earnedStars < 3 && (
                  <PillButton ghost onClick={retryLevel} style={{ color: "#ff9800", border: "2px solid rgba(255,152,0,.3)", fontSize: "clamp(12px,2.5vw,15px)", padding: "8px 20px" }}>
                    ↻ Reintentar
                  </PillButton>
                )}
                <PillButton ghost onClick={goToLevels} style={{ fontSize: "clamp(12px,2.5vw,15px)", padding: "8px 20px" }}>
                  Niveles
                </PillButton>
              </>
            }
          >
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              {[1, 2, 3].map(s => (
                <span key={s} style={{
                  fontSize: 28, transition: "all .3s",
                  opacity: s <= earnedStars ? 1 : 0.2,
                  animation: s <= earnedStars ? `fadeIn ${0.3 + s * 0.15}s ease` : "none",
                }}>★</span>
              ))}
            </div>
            <div style={{ fontSize: "clamp(12px,2.5vw,15px)", color: "#888" }}>
              Tinta restante: {ink}/{level.ink}
            </div>
          </GameOverlay>
        )}
      </div>

      {/* Ink bar */}
      <div style={{ width: boardWidth, marginTop: 10, zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{
            flex: 1, height: 14, background: "rgba(0,0,0,.06)", borderRadius: 7,
            overflow: "hidden", position: "relative",
          }}>
            <div style={{
              width: `${inkPct * 100}%`, height: "100%", background: inkColor,
              borderRadius: 7, transition: "width .3s ease, background .3s ease",
              animation: "inkDrip 2s ease-in-out infinite",
            }} />
          </div>
          <span style={{ fontSize: "clamp(11px,2.5vw,14px)", color: "#666", fontFamily: "'Patrick Hand',cursive", minWidth: 60, textAlign: "right" }}>
            Tinta: {Math.max(0, ink)}/{level.ink}
          </span>
        </div>
        {gameStatus === "blind" && (
          <div style={{ fontSize: "clamp(11px,2.5vw,13px)", color: "#e63946", textAlign: "center", animation: "blink 1.5s ease-in-out infinite" }}>
            Sin tinta... sigue buscando la salida
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ fontSize: "clamp(11px,2.5vw,13px)", color: "#999", marginTop: 4, zIndex: 1 }}>
        Pasos: {steps} | Revelado: {revealedPct}%
      </div>

      {/* Controles: D-pad en táctil, teclas en escritorio */}
      {isTouch ? (
        <Dpad
          color={color}
          pressed={pressedBtn}
          onPress={onDpad}
          style={{ marginTop: 12 }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        />
      ) : (
        <KeyHints color={color} style={{ marginTop: 12 }} />
      )}
    </NotebookPage>
  );
}
