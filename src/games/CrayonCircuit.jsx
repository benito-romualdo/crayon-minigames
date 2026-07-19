import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { COLORS } from "../shared/theme";
import { NotebookPage, GameHeader, PillButton, GameOverlay } from "../shared/components";

const BOARD_PX = 320;

/* ── Levels ── */
const LEVELS = [
  {
    id: 1, size: 5, name: "Nivel 1",
    flows: [
      { colorIdx: 0, endpoints: [[0,0],[1,1]] },
      { colorIdx: 1, endpoints: [[0,1],[3,3]] },
      { colorIdx: 2, endpoints: [[2,3],[4,4]] },
    ],
    solution: [
      [[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[3,1],[2,1],[1,1]],
      [[0,1],[0,2],[1,2],[2,2],[3,2],[4,2],[4,3],[3,3]],
      [[2,3],[1,3],[0,3],[0,4],[1,4],[2,4],[3,4],[4,4]],
    ],
  },
  {
    id: 2, size: 5, name: "Nivel 2",
    flows: [
      { colorIdx: 0, endpoints: [[0,0],[2,0]] },
      { colorIdx: 1, endpoints: [[3,0],[0,2]] },
      { colorIdx: 2, endpoints: [[0,3],[2,4]] },
      { colorIdx: 3, endpoints: [[3,2],[4,4]] },
    ],
    solution: [
      [[0,0],[0,1],[1,1],[1,0],[2,0]],
      [[3,0],[4,0],[4,1],[3,1],[2,1],[2,2],[1,2],[0,2]],
      [[0,3],[0,4],[1,4],[1,3],[2,3],[2,4]],
      [[3,2],[4,2],[4,3],[3,3],[3,4],[4,4]],
    ],
  },
  {
    id: 3, size: 6, name: "Nivel 3",
    flows: [
      { colorIdx: 0, endpoints: [[0,0],[3,1]] },
      { colorIdx: 1, endpoints: [[2,1],[5,2]] },
      { colorIdx: 2, endpoints: [[5,3],[2,4]] },
      { colorIdx: 3, endpoints: [[3,4],[0,5]] },
    ],
    solution: [
      [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[5,1],[4,1],[3,1]],
      [[2,1],[1,1],[0,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]],
      [[5,3],[4,3],[3,3],[2,3],[1,3],[0,3],[0,4],[1,4],[2,4]],
      [[3,4],[4,4],[5,4],[5,5],[4,5],[3,5],[2,5],[1,5],[0,5]],
    ],
  },
  {
    id: 4, size: 6, name: "Nivel 4",
    flows: [
      { colorIdx: 0, endpoints: [[0,0],[4,1]] },
      { colorIdx: 1, endpoints: [[3,1],[0,2]] },
      { colorIdx: 2, endpoints: [[1,2],[5,3]] },
      { colorIdx: 3, endpoints: [[4,3],[0,4]] },
      { colorIdx: 4, endpoints: [[1,4],[0,5]] },
    ],
    solution: [
      [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[5,1],[4,1]],
      [[3,1],[2,1],[1,1],[0,1],[0,2]],
      [[1,2],[2,2],[3,2],[4,2],[5,2],[5,3]],
      [[4,3],[3,3],[2,3],[1,3],[0,3],[0,4]],
      [[1,4],[2,4],[3,4],[4,4],[5,4],[5,5],[4,5],[3,5],[2,5],[1,5],[0,5]],
    ],
  },
  {
    id: 5, size: 7, name: "Nivel 5",
    flows: [
      { colorIdx: 0, endpoints: [[0,0],[3,1]] },
      { colorIdx: 1, endpoints: [[2,1],[6,2]] },
      { colorIdx: 2, endpoints: [[6,3],[0,4]] },
      { colorIdx: 3, endpoints: [[1,4],[0,5]] },
      { colorIdx: 4, endpoints: [[0,6],[6,6]] },
    ],
    solution: [
      [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[6,1],[5,1],[4,1],[3,1]],
      [[2,1],[1,1],[0,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2]],
      [[6,3],[5,3],[4,3],[3,3],[2,3],[1,3],[0,3],[0,4]],
      [[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[6,5],[5,5],[4,5],[3,5],[2,5],[1,5],[0,5]],
      [[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6]],
    ],
  },
  {
    id: 6, size: 7, name: "Nivel 6",
    flows: [
      { colorIdx: 0, endpoints: [[0,0],[6,6]] },
      { colorIdx: 1, endpoints: [[1,0],[6,5]] },
      { colorIdx: 2, endpoints: [[1,1],[5,5]] },
      { colorIdx: 3, endpoints: [[2,1],[5,4]] },
      { colorIdx: 4, endpoints: [[2,2],[3,3]] },
    ],
    solution: [
      [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6]],
      [[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[6,1],[6,2],[6,3],[6,4],[6,5]],
      [[1,1],[1,2],[1,3],[1,4],[1,5],[2,5],[3,5],[4,5],[5,5]],
      [[2,1],[3,1],[4,1],[5,1],[5,2],[5,3],[5,4]],
      [[2,2],[2,3],[2,4],[3,4],[4,4],[4,3],[4,2],[3,2],[3,3]],
    ],
  },
  {
    id: 7, size: 8, name: "Nivel 7",
    flows: [
      { colorIdx: 0, endpoints: [[0,0],[5,1]] },
      { colorIdx: 1, endpoints: [[4,1],[7,2]] },
      { colorIdx: 2, endpoints: [[7,3],[0,4]] },
      { colorIdx: 3, endpoints: [[1,4],[0,5]] },
      { colorIdx: 4, endpoints: [[0,6],[7,6]] },
    ],
    solution: [
      [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[7,1],[6,1],[5,1]],
      [[4,1],[3,1],[2,1],[1,1],[0,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2]],
      [[7,3],[6,3],[5,3],[4,3],[3,3],[2,3],[1,3],[0,3],[0,4]],
      [[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[7,5],[6,5],[5,5],[4,5],[3,5],[2,5],[1,5],[0,5]],
      [[0,6],[0,7],[1,7],[1,6],[2,6],[2,7],[3,7],[3,6],[4,6],[4,7],[5,7],[5,6],[6,6],[6,7],[7,7],[7,6]],
    ],
  },
  {
    id: 8, size: 8, name: "Nivel 8",
    flows: [
      { colorIdx: 0, endpoints: [[0,0],[5,1]] },
      { colorIdx: 1, endpoints: [[4,1],[0,2]] },
      { colorIdx: 2, endpoints: [[1,2],[7,3]] },
      { colorIdx: 3, endpoints: [[6,3],[1,4]] },
      { colorIdx: 4, endpoints: [[2,4],[0,7]] },
      { colorIdx: 5, endpoints: [[1,6],[7,7]] },
    ],
    solution: [
      [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[7,1],[6,1],[5,1]],
      [[4,1],[3,1],[2,1],[1,1],[0,1],[0,2]],
      [[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[7,3]],
      [[6,3],[5,3],[4,3],[3,3],[2,3],[1,3],[0,3],[0,4],[1,4]],
      [[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[7,5],[6,5],[5,5],[4,5],[3,5],[2,5],[1,5],[0,5],[0,6],[0,7]],
      [[1,6],[1,7],[2,7],[2,6],[3,6],[3,7],[4,7],[4,6],[5,6],[5,7],[6,7],[6,6],[7,6],[7,7]],
    ],
  },
];

/* ── Utilities ── */
function cellKey(x, y) { return `${x},${y}`; }

function isEndpoint(x, y, level) {
  for (const f of level.flows) {
    for (const ep of f.endpoints) {
      if (ep[0] === x && ep[1] === y) return f;
    }
  }
  return null;
}

/* ── Sub-components ── */
function CrayonDot({ x, y, cell, color, active }) {
  const cx = x * cell + cell / 2;
  const cy = y * cell + cell / 2;
  const r = cell * 0.26;
  return (
    <g style={active ? { animation: "pulse 1.2s ease-in-out infinite", transformOrigin: `${cx}px ${cy}px` } : undefined}>
      <circle cx={cx} cy={cy} r={r + 1.5} fill={color.shade} opacity={0.25} />
      <circle cx={cx} cy={cy} r={r} fill={color.body} stroke={color.tip} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={r * 0.3} fill="white" opacity={0.35} />
    </g>
  );
}

function CrayonStroke({ cells, cell, color, filter }) {
  if (cells.length < 2) return null;
  const w = Math.max(cell * 0.45, 6);
  return (
    <g filter={filter ? "url(#crayon-rough-circuit)" : undefined}>
      {cells.slice(1).map((seg, i) => {
        const prev = cells[i];
        const sx = seg[0] * cell + cell / 2, sy = seg[1] * cell + cell / 2;
        const px = prev[0] * cell + cell / 2, py = prev[1] * cell + cell / 2;
        const ox1 = Math.sin(i * 2.1) * 0.8, oy1 = Math.cos(i * 1.7) * 0.8;
        const ox2 = Math.sin(i * 1.3 + 1) * 0.8, oy2 = Math.cos(i * 2.3 + 1) * 0.8;
        return (
          <g key={i}>
            <line x1={sx + ox1} y1={sy + oy1} x2={px + ox2} y2={py + oy2}
              stroke={color.body} strokeWidth={w} strokeLinecap="round" opacity={0.55} />
            <line x1={sx + ox1 - 0.5} y1={sy + oy1 - 1} x2={px + ox2 - 0.5} y2={py + oy2 - 1}
              stroke="white" strokeWidth={1.5} strokeLinecap="round" opacity={0.1} />
            <line x1={sx + ox1 + 0.5} y1={sy + oy1 + 1} x2={px + ox2 + 0.5} y2={py + oy2 + 1}
              stroke={color.shade} strokeWidth={1.5} strokeLinecap="round" opacity={0.12} />
          </g>
        );
      })}
    </g>
  );
}

function ActiveStroke({ cells, cell, color }) {
  if (cells.length < 2) return null;
  const w = Math.max(cell * 0.4, 5);
  return (
    <g>
      {cells.slice(1).map((seg, i) => {
        const prev = cells[i];
        const sx = seg[0] * cell + cell / 2, sy = seg[1] * cell + cell / 2;
        const px = prev[0] * cell + cell / 2, py = prev[1] * cell + cell / 2;
        return (
          <line key={i} x1={sx} y1={sy} x2={px} y2={py}
            stroke={color.body} strokeWidth={w} strokeLinecap="round" opacity={0.4} />
        );
      })}
    </g>
  );
}

/* ── Main component ── */
export default function CrayonCircuit({ onBack }) {
  const [screen, setScreen] = useState("levels");
  const [currentLevel, setCurrentLevel] = useState(null);
  const [completedLevels, setCompletedLevels] = useState(() => {
    try { return JSON.parse(localStorage.getItem("circuit-completed") || "[]"); } catch { return []; }
  });
  const [paths, setPaths] = useState({});
  const [drawing, setDrawing] = useState(null);
  const [history, setHistory] = useState([]);
  const [showComplete, setShowComplete] = useState(false);
  const [showFail, setShowFail] = useState(false);

  const drawingRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => { drawingRef.current = drawing; }, [drawing]);
  useEffect(() => {
    try { localStorage.setItem("circuit-completed", JSON.stringify(completedLevels)); } catch {}
  }, [completedLevels]);

  const level = currentLevel ? LEVELS.find(l => l.id === currentLevel) : null;
  const CELL = level ? Math.floor(BOARD_PX / level.size) : 40;
  const W = level ? level.size * CELL : 0;
  const H = W;

  /* ── Coordinate conversion ── */
  const pointerToCell = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg || !level) return null;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const cx = Math.floor(px / CELL);
    const cy = Math.floor(py / CELL);
    if (cx < 0 || cy < 0 || cx >= level.size || cy >= level.size) return null;
    return [cx, cy];
  }, [level, CELL, W, H]);

  /* ── Check win (all flows connected) ── */
  const checkWin = useCallback((newPaths) => {
    if (!level) return false;
    for (const flow of level.flows) {
      const name = COLORS[flow.colorIdx].name;
      const path = newPaths[name];
      if (!path || path.length < 2) return false;
      const ep0 = flow.endpoints[0], ep1 = flow.endpoints[1];
      const first = path[0], last = path[path.length - 1];
      const connects = (
        (first[0] === ep0[0] && first[1] === ep0[1] && last[0] === ep1[0] && last[1] === ep1[1]) ||
        (first[0] === ep1[0] && first[1] === ep1[1] && last[0] === ep0[0] && last[1] === ep0[1])
      );
      if (!connects) return false;
    }
    return true;
  }, [level]);

  /* ── Check crossing (any cell overlap between different colors) ── */
  const checkCrossing = useCallback((newPaths) => {
    const seen = new Set();
    for (const [, cells] of Object.entries(newPaths)) {
      for (const c of cells) {
        const k = cellKey(c[0], c[1]);
        if (seen.has(k)) return true;
        seen.add(k);
      }
    }
    return false;
  }, []);

  /* ── Drawing logic ── */
  const startDrawing = useCallback((cell) => {
    if (!level || !cell) return;
    const [cx, cy] = cell;
    const flow = isEndpoint(cx, cy, level);
    if (flow) {
      const colorName = COLORS[flow.colorIdx].name;
      setHistory(h => [...h, { ...paths }]);
      const newPaths = { ...paths };
      delete newPaths[colorName];
      setPaths(newPaths);
      setDrawing({ color: COLORS[flow.colorIdx], colorName, path: [[cx, cy]] });
      return;
    }
    // Si la celda pertenece a un trazo existente: recorta y continúa desde ahí
    for (const [colorName, pathCells] of Object.entries(paths)) {
      const idx = pathCells.findIndex(c => c[0] === cx && c[1] === cy);
      if (idx >= 0) {
        const color = COLORS.find(c => c.name === colorName);
        setHistory(h => [...h, { ...paths }]);
        const truncated = pathCells.slice(0, idx + 1);
        const newPaths = { ...paths, [colorName]: truncated };
        setPaths(newPaths);
        setDrawing({ color, colorName, path: truncated });
        return;
      }
    }
  }, [level, paths]);

  const extendPath = useCallback((cell) => {
    const d = drawingRef.current;
    if (!d || !cell || !level) return;
    const [cx, cy] = cell;
    const last = d.path[d.path.length - 1];
    if (last[0] === cx && last[1] === cy) return;

    // Retroceso: recorta hasta la celda ya pintada
    const existingIdx = d.path.findIndex(c => c[0] === cx && c[1] === cy);
    if (existingIdx >= 0) {
      const truncated = d.path.slice(0, existingIdx + 1);
      const newD = { ...d, path: truncated };
      setDrawing(newD);
      drawingRef.current = newD;
      return;
    }

    // Si el trazo ya llegó al otro extremo de su color, no se extiende más
    const lastFlow = isEndpoint(last[0], last[1], level);
    if (lastFlow && COLORS[lastFlow.colorIdx].name === d.colorName && d.path.length > 1) return;

    // Adyacencia — interpola si hace falta
    const dx = cx - last[0], dy = cy - last[1];
    const dist = Math.abs(dx) + Math.abs(dy);
    if (dist === 0) return;

    let cellsToAdd = [];
    if (dist === 1) {
      cellsToAdd = [[cx, cy]];
    } else {
      if (dx !== 0 && dy !== 0) return; // diagonal: se ignora
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      const sx = dx === 0 ? 0 : dx / Math.abs(dx);
      const sy = dy === 0 ? 0 : dy / Math.abs(dy);
      for (let s = 1; s <= steps; s++) {
        cellsToAdd.push([last[0] + sx * s, last[1] + sy * s]);
      }
    }

    let newPath = [...d.path];
    let changed = false;
    for (const c of cellsToAdd) {
      if (c[0] < 0 || c[1] < 0 || c[0] >= level.size || c[1] >= level.size) break;
      const btIdx = newPath.findIndex(p => p[0] === c[0] && p[1] === c[1]);
      if (btIdx >= 0) {
        newPath = newPath.slice(0, btIdx + 1);
        changed = true;
        continue;
      }
      const epFlow = isEndpoint(c[0], c[1], level);
      // No se puede pasar por encima de un punto de otro color
      if (epFlow && COLORS[epFlow.colorIdx].name !== d.colorName) break;
      newPath.push(c);
      changed = true;
      // Al alcanzar el otro extremo propio, el trazo se detiene
      if (epFlow && !(c[0] === newPath[0][0] && c[1] === newPath[0][1])) break;
    }
    if (!changed) return;

    const newD = { ...d, path: newPath };
    setDrawing(newD);
    drawingRef.current = newD;
  }, [level]);

  const commitDrawing = useCallback(() => {
    const d = drawingRef.current;
    if (!d) return;
    const newPaths = { ...paths, [d.colorName]: d.path };
    setPaths(newPaths);
    setDrawing(null);
    drawingRef.current = null;

    // Primero, comprobar cruces
    if (checkCrossing(newPaths)) {
      setShowFail(true);
      return;
    }

    if (checkWin(newPaths)) {
      setShowComplete(true);
      if (!completedLevels.includes(currentLevel)) {
        setCompletedLevels(prev => [...prev, currentLevel]);
      }
    }
  }, [paths, checkWin, checkCrossing, completedLevels, currentLevel]);

  /* ── Pointer events ── */
  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    const cell = pointerToCell(e);
    if (cell) {
      e.target.setPointerCapture?.(e.pointerId);
      startDrawing(cell);
    }
  }, [pointerToCell, startDrawing]);

  const onPointerMove = useCallback((e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const cell = pointerToCell(e);
    if (cell) extendPath(cell);
  }, [pointerToCell, extendPath]);

  const onPointerUp = useCallback((e) => {
    if (drawingRef.current) {
      e.preventDefault();
      commitDrawing();
    }
  }, [commitDrawing]);

  /* ── Actions ── */
  const selectLevel = useCallback((id) => {
    setCurrentLevel(id);
    setPaths({});
    setDrawing(null);
    setHistory([]);
    setShowComplete(false);
    setShowFail(false);
    setScreen("game");
  }, []);

  const resetLevel = useCallback(() => {
    setPaths({});
    setDrawing(null);
    setHistory([]);
    setShowComplete(false);
    setShowFail(false);
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setPaths(prev);
    setHistory(h => h.slice(0, -1));
    setDrawing(null);
    drawingRef.current = null;
  }, [history]);

  const undoFail = useCallback(() => {
    undo();
    setShowFail(false);
  }, [undo]);

  const goToLevels = useCallback(() => {
    setScreen("levels");
    setCurrentLevel(null);
    setDrawing(null);
    drawingRef.current = null;
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

  /* ── Flujos conectados (por nombre de color) ── */
  const connectedNames = useMemo(() => {
    const s = new Set();
    if (!level) return s;
    for (const flow of level.flows) {
      const name = COLORS[flow.colorIdx].name;
      const path = paths[name];
      if (!path || path.length < 2) continue;
      const ep0 = flow.endpoints[0], ep1 = flow.endpoints[1];
      const first = path[0], last = path[path.length - 1];
      if (
        (first[0] === ep0[0] && first[1] === ep0[1] && last[0] === ep1[0] && last[1] === ep1[1]) ||
        (first[0] === ep1[0] && first[1] === ep1[1] && last[0] === ep0[0] && last[1] === ep0[1])
      ) s.add(name);
    }
    return s;
  }, [level, paths]);
  const connectedCount = connectedNames.size;

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

  /* ── Render: Level Select ── */
  if (screen === "levels") {
    return (
      <NotebookPage onBack={onBack} doodles="circuit">
        <GameHeader
          title="Crayon Circuit"
          subtitle="Conecta los puntos de colores sin cruzar"
          titleStyle={{ fontSize: "clamp(24px,5vw,40px)" }}
        />

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
          maxWidth: 400, width: "100%", zIndex: 1, animation: "fadeIn .5s ease",
        }}>
          {LEVELS.map((lvl) => {
            const done = completedLevels.includes(lvl.id);
            return (
              <button key={lvl.id} className="cg-card" onClick={() => selectLevel(lvl.id)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: "16px 12px", background: done ? "rgba(76,175,80,.12)" : "rgba(255,255,255,.85)",
                border: `2.5px solid ${done ? "rgba(76,175,80,.4)" : "rgba(0,0,0,.1)"}`,
                borderRadius: 16, cursor: "pointer", boxShadow: "0 3px 12px rgba(0,0,0,.06)",
                fontFamily: "'Patrick Hand',cursive", position: "relative",
              }}>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: "clamp(18px,4vw,26px)", color: "#444" }}>
                  {lvl.id}
                </span>
                <span style={{ fontSize: "clamp(11px,2vw,13px)", color: "#888" }}>
                  {lvl.size}x{lvl.size}
                </span>
                {done && (
                  <span style={{ position: "absolute", top: 6, right: 8, fontSize: 16, color: "#4caf50" }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </NotebookPage>
    );
  }

  /* ── Render: Game ── */
  if (!level) return null;

  const drawingColorName = drawing ? drawing.colorName : null;

  return (
    <NotebookPage onBack={onBack} doodles="circuit">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10, zIndex: 1, flexWrap: "wrap", justifyContent: "center" }}>
        <PillButton ghost onClick={goToLevels} style={{ fontFamily: "'Patrick Hand',cursive", fontSize: 14, padding: "5px 12px", borderRadius: 14, letterSpacing: 0 }}>
          ← Niveles
        </PillButton>
        <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: "clamp(14px,3vw,18px)", color: "#444" }}>
          {level.name}
        </span>
        <span style={{ fontSize: "clamp(12px,2.5vw,15px)", color: "#888" }}>
          {connectedCount}/{level.flows.length} conectados
        </span>
      </div>

      {/* Board */}
      <div style={{
        position: "relative", width: `min(100%, ${W}px)`, aspectRatio: "1 / 1",
        border: "3px solid #999", borderRadius: 12, background: "#fffef7",
        boxShadow: "0 4px 24px rgba(0,0,0,.08),inset 0 0 30px rgba(0,0,0,.02)",
        overflow: "hidden", zIndex: 1, touchAction: "none",
      }}>
        <svg
          ref={svgRef}
          width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}
          style={{ position: "absolute", top: 0, left: 0, display: "block", touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <defs>
            <filter id="crayon-rough-circuit" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="turbulence" baseFrequency=".45" numOctaves="3" seed="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          {/* Grid */}
          {gridLines}

          {/* Committed paths (con "pop" al quedar conectados) */}
          {Object.entries(paths).map(([colorName, cells]) => {
            if (drawingColorName === colorName) return null; // se está redibujando
            const color = COLORS.find(c => c.name === colorName);
            if (!color) return null;
            const connected = connectedNames.has(colorName);
            return (
              <g key={colorName + (connected ? "-on" : "")} className={connected ? "cg-stroke-pop" : undefined}>
                <CrayonStroke cells={cells} cell={CELL} color={color} filter={true} />
              </g>
            );
          })}

          {/* Active drawing */}
          {drawing && (
            <ActiveStroke cells={drawing.path} cell={CELL} color={drawing.color} />
          )}

          {/* Endpoint dots */}
          {level.flows.map((flow) => {
            const color = COLORS[flow.colorIdx];
            const name = color.name;
            const isConnected = connectedNames.has(name);
            const isActive = drawing && drawing.colorName === name;
            return flow.endpoints.map((ep, i) => (
              <CrayonDot
                key={`${name}-${i}`}
                x={ep[0]} y={ep[1]}
                cell={CELL} color={color}
                active={isActive && !isConnected}
              />
            ));
          })}
        </svg>

        {/* Paper texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: .4,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1' height='1' fill='%23000' opacity='0.02'/%3E%3C/svg%3E")`,
        }} />

        {/* Complete overlay */}
        {showComplete && (
          <GameOverlay
            emoji="🎉"
            title="¡Completado!"
            titleColor="#4caf50"
            actions={
              <>
                {LEVELS.findIndex(l => l.id === level.id) < LEVELS.length - 1 && (
                  <PillButton color="#4caf50" onClick={nextLevel}>Siguiente Nivel →</PillButton>
                )}
                <PillButton ghost onClick={goToLevels}>Volver a Niveles</PillButton>
              </>
            }
          />
        )}

        {/* Fail overlay (lines crossed) */}
        {showFail && (
          <GameOverlay
            emoji="✏️💥"
            emojiAnimation="shake .5s ease"
            title="¡Las líneas se cruzan!"
            titleColor="#e63946"
            actions={
              <>
                <PillButton color="#e63946" onClick={undoFail}>↩ Deshacer trazo</PillButton>
                <PillButton ghost onClick={resetLevel}>↻ Reiniciar</PillButton>
              </>
            }
          />
        )}
      </div>

      {/* Bottom buttons */}
      <div style={{ display: "flex", gap: 12, marginTop: 14, zIndex: 1 }}>
        <PillButton
          ghost
          onClick={resetLevel}
          style={{ fontFamily: "'Patrick Hand',cursive", color: "#e63946", border: "2px solid rgba(230,57,70,.2)", padding: "8px 18px", borderRadius: 14, letterSpacing: 0 }}
        >
          ↻ Reiniciar
        </PillButton>
        <PillButton
          ghost
          onClick={undo}
          disabled={history.length === 0}
          style={{ fontFamily: "'Patrick Hand',cursive", padding: "8px 18px", borderRadius: 14, letterSpacing: 0 }}
        >
          ↩ Deshacer
        </PillButton>
      </div>
    </NotebookPage>
  );
}
