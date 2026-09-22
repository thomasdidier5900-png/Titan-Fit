import React, { useState } from 'react';
import { TrendingUp, Dumbbell, Flame, Layers, Eye, Calendar } from 'lucide-react';
import { WorkoutSessionLog } from '../types/fitness';

interface ProgressChartProps {
  history: WorkoutSessionLog[];
}

type ChartMode = 'combined' | 'tonnage' | 'reps';

export const ProgressChart: React.FC<ProgressChartProps> = ({ history }) => {
  const [chartMode, setChartMode] = useState<ChartMode>('combined');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [useDemoData, setUseDemoData] = useState(false);

  // Demo data for preview if history is empty or has only 1 entry
  const demoData: WorkoutSessionLog[] = [
    {
      id: 'demo_1',
      day: 'Jour 1',
      sessionName: 'PULL 1',
      startedAt: Date.now() - 14 * 86400000,
      finishedAt: Date.now() - 14 * 86400000 + 3200000,
      durationSeconds: 3200,
      totalTonnage: 2650,
      totalReps: 142,
      totalSets: 14,
      exercises: [],
    },
    {
      id: 'demo_2',
      day: 'Jour 2',
      sessionName: 'PUSH 1',
      startedAt: Date.now() - 12 * 86400000,
      finishedAt: Date.now() - 12 * 86400000 + 3400000,
      durationSeconds: 3400,
      totalTonnage: 2980,
      totalReps: 156,
      totalSets: 15,
      exercises: [],
    },
    {
      id: 'demo_3',
      day: 'Jour 4',
      sessionName: 'PULL 2',
      startedAt: Date.now() - 9 * 86400000,
      finishedAt: Date.now() - 9 * 86400000 + 3600000,
      durationSeconds: 3600,
      totalTonnage: 3240,
      totalReps: 168,
      totalSets: 16,
      exercises: [],
    },
    {
      id: 'demo_4',
      day: 'Jour 5',
      sessionName: 'PUSH 2',
      startedAt: Date.now() - 6 * 86400000,
      finishedAt: Date.now() - 6 * 86400000 + 3700000,
      durationSeconds: 3700,
      totalTonnage: 3510,
      totalReps: 172,
      totalSets: 16,
      exercises: [],
    },
    {
      id: 'demo_5',
      day: 'Jour 1',
      sessionName: 'PULL 1',
      startedAt: Date.now() - 3 * 86400000,
      finishedAt: Date.now() - 3 * 86400000 + 3800000,
      durationSeconds: 3800,
      totalTonnage: 3840,
      totalReps: 180,
      totalSets: 17,
      exercises: [],
    },
    {
      id: 'demo_6',
      day: 'Jour 2',
      sessionName: 'PUSH 1',
      startedAt: Date.now() - 1 * 86400000,
      finishedAt: Date.now() - 1 * 86400000 + 3900000,
      durationSeconds: 3900,
      totalTonnage: 4120,
      totalReps: 194,
      totalSets: 18,
      exercises: [],
    },
  ];

  const effectiveHistory =
    history.length >= 2
      ? [...history].sort((a, b) => a.finishedAt - b.finishedAt)
      : useDemoData
      ? demoData
      : [...history].sort((a, b) => a.finishedAt - b.finishedAt);

  const isShowingDemo = history.length < 2 && useDemoData;

  // Key stats calculation
  const totalSessions = effectiveHistory.length;
  const tonnages = effectiveHistory.map(s => s.totalTonnage || 0);
  const repsList = effectiveHistory.map(s => s.totalReps || 0);

  const maxTonnage = tonnages.length > 0 ? Math.max(...tonnages) : 0;
  const minTonnage = tonnages.length > 0 ? Math.min(...tonnages) : 0;
  const avgTonnage =
    totalSessions > 0 ? Math.round(tonnages.reduce((a, b) => a + b, 0) / totalSessions) : 0;

  const maxReps = repsList.length > 0 ? Math.max(...repsList) : 0;
  const minReps = repsList.length > 0 ? Math.min(...repsList) : 0;
  const avgReps =
    totalSessions > 0 ? Math.round(repsList.reduce((a, b) => a + b, 0) / totalSessions) : 0;

  // Progression percentage from first to last
  const tonnageProgression =
    totalSessions >= 2 && tonnages[0] > 0
      ? Math.round(((tonnages[totalSessions - 1] - tonnages[0]) / tonnages[0]) * 100)
      : null;

  // SVG dimensions
  const svgWidth = 360;
  const svgHeight = 180;
  const paddingLeft = 36;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 32;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Normalization helpers
  const getTonnageY = (val: number) => {
    const range = maxTonnage - minTonnage || 100;
    const effectiveMin = Math.max(0, minTonnage - range * 0.15);
    const effectiveMax = maxTonnage + range * 0.15;
    const percent = (val - effectiveMin) / (effectiveMax - effectiveMin || 1);
    return paddingTop + chartHeight - percent * chartHeight;
  };

  const getRepsY = (val: number) => {
    const range = maxReps - minReps || 20;
    const effectiveMin = Math.max(0, minReps - range * 0.15);
    const effectiveMax = maxReps + range * 0.15;
    const percent = (val - effectiveMin) / (effectiveMax - effectiveMin || 1);
    return paddingTop + chartHeight - percent * chartHeight;
  };

  const getX = (index: number) => {
    if (totalSessions <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (totalSessions - 1)) * chartWidth;
  };

  // Build SVG Path
  const buildLinePath = (getY: (val: number) => number, values: number[]) => {
    if (values.length === 0) return '';
    if (values.length === 1) {
      const x = getX(0);
      const y = getY(values[0]);
      return `M ${x - 20} ${y} L ${x + 20} ${y}`;
    }
    return values.reduce((path, val, idx) => {
      const x = getX(idx);
      const y = getY(val);
      return idx === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, '');
  };

  const buildAreaPath = (getY: (val: number) => number, values: number[]) => {
    if (values.length < 2) return '';
    const linePath = buildLinePath(getY, values);
    const firstX = getX(0);
    const lastX = getX(values.length - 1);
    const bottomY = paddingTop + chartHeight;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const tonnagePath = buildLinePath(getTonnageY, tonnages);
  const tonnageArea = buildAreaPath(getTonnageY, tonnages);

  const repsPath = buildLinePath(getRepsY, repsList);
  const repsArea = buildAreaPath(getRepsY, repsList);

  const activeHoveredSession =
    hoveredIndex !== null && effectiveHistory[hoveredIndex]
      ? effectiveHistory[hoveredIndex]
      : effectiveHistory[effectiveHistory.length - 1];

  return (
    <div className="bg-[#151515] border border-zinc-800 rounded-2xl p-4 space-y-3.5 shadow-lg">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#BCE029]/15 border border-[#BCE029]/40 flex items-center justify-center text-[#BCE029]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>Évolution de la Charge</span>
              {tonnageProgression !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    tonnageProgression >= 0
                      ? 'bg-[#BCE029]/20 text-[#BCE029]'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {tonnageProgression >= 0 ? `+${tonnageProgression}%` : `${tonnageProgression}%`}
                </span>
              )}
            </h3>
            <p className="text-[10px] text-zinc-400">Progression par séance</p>
          </div>
        </div>

        {/* Tab Mode Buttons */}
        <div className="flex items-center bg-black/60 p-0.5 rounded-xl border border-zinc-800 text-[10px] font-bold">
          <button
            onClick={() => setChartMode('combined')}
            className={`px-2 py-1 rounded-lg transition ${
              chartMode === 'combined'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setChartMode('tonnage')}
            className={`px-2 py-1 rounded-lg transition ${
              chartMode === 'tonnage'
                ? 'bg-[#BCE029] text-black shadow-sm'
                : 'text-zinc-400 hover:text-[#BCE029]'
            }`}
          >
            Tonnage
          </button>
          <button
            onClick={() => setChartMode('reps')}
            className={`px-2 py-1 rounded-lg transition ${
              chartMode === 'reps'
                ? 'bg-[#FF6D00] text-black shadow-sm'
                : 'text-zinc-400 hover:text-[#FF6D00]'
            }`}
          >
            Répétitions
          </button>
        </div>
      </div>

      {/* Legend & Demo Toggle if single session */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800/70">
        <div className="flex items-center gap-3">
          {(chartMode === 'combined' || chartMode === 'tonnage') && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BCE029]" />
              <span className="text-zinc-300 font-semibold">Tonnage (kg)</span>
            </div>
          )}
          {(chartMode === 'combined' || chartMode === 'reps') && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6D00]" />
              <span className="text-zinc-300 font-semibold">Répétitions</span>
            </div>
          )}
        </div>

        {history.length < 2 && (
          <button
            onClick={() => setUseDemoData(p => !p)}
            className="text-[10px] text-zinc-400 hover:text-[#BCE029] flex items-center gap-1 transition"
          >
            <Eye className="w-3 h-3 text-[#FF6D00]" />
            <span>{useDemoData ? 'Masquer exemple' : 'Voir exemple'}</span>
          </button>
        )}
      </div>

      {isShowingDemo && (
        <div className="bg-[#FF6D00]/10 border border-[#FF6D00]/30 px-3 py-1.5 rounded-xl text-[10px] text-[#FF8A00] flex items-center justify-between">
          <span>Aperçu avec données simulées (validez vos séances pour afficher vos propres données)</span>
          <button
            onClick={() => setUseDemoData(false)}
            className="text-white underline font-bold ml-2"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Main Interactive SVG Chart */}
      {totalSessions === 0 ? (
        <div className="py-10 text-center space-y-2 bg-black/40 rounded-xl border border-zinc-800">
          <Dumbbell className="w-6 h-6 text-zinc-600 mx-auto" />
          <p className="text-xs text-zinc-400">Aucune donnée de séance pour le moment.</p>
          <button
            onClick={() => setUseDemoData(true)}
            className="text-xs text-[#BCE029] font-bold hover:underline"
          >
            Afficher un exemple de courbe
          </button>
        </div>
      ) : (
        <div className="relative bg-black/70 rounded-xl p-2 border border-zinc-800/90 overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              {/* Tonnage Anis Gradient */}
              <linearGradient id="tonnageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#BCE029" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#BCE029" stopOpacity="0.0" />
              </linearGradient>

              {/* Reps Orange Gradient */}
              <linearGradient id="repsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6D00" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FF6D00" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.33, 0.66, 1].map((ratio, i) => {
              const y = paddingTop + chartHeight * ratio;
              return (
                <line
                  key={i}
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#27272a"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              );
            })}

            {/* Tonnage Area & Line */}
            {(chartMode === 'combined' || chartMode === 'tonnage') && (
              <>
                {tonnageArea && (
                  <path d={tonnageArea} fill="url(#tonnageGradient)" />
                )}
                <path
                  d={tonnagePath}
                  fill="none"
                  stroke="#BCE029"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Reps Area & Line */}
            {(chartMode === 'combined' || chartMode === 'reps') && (
              <>
                {repsArea && (
                  <path d={repsArea} fill="url(#repsGradient)" />
                )}
                <path
                  d={repsPath}
                  fill="none"
                  stroke="#FF6D00"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Points & Interactive Hitboxes */}
            {effectiveHistory.map((session, idx) => {
              const x = getX(idx);
              const tonnageY = getTonnageY(session.totalTonnage || 0);
              const repsY = getRepsY(session.totalReps || 0);
              const isHovered = hoveredIndex === idx;

              return (
                <g key={session.id || idx}>
                  {/* Vertical guide line on hover */}
                  {isHovered && (
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={paddingTop + chartHeight}
                      stroke="#52525b"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Tonnage Marker */}
                  {(chartMode === 'combined' || chartMode === 'tonnage') && (
                    <circle
                      cx={x}
                      cy={tonnageY}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#BCE029"
                      stroke="#0D0D0D"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="transition-all duration-150"
                    />
                  )}

                  {/* Reps Marker */}
                  {(chartMode === 'combined' || chartMode === 'reps') && (
                    <circle
                      cx={x}
                      cy={repsY}
                      r={isHovered ? 5.5 : 3.5}
                      fill="#FF6D00"
                      stroke="#0D0D0D"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="transition-all duration-150"
                    />
                  )}

                  {/* X Axis Label */}
                  <text
                    x={x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    fill={isHovered ? '#FFFFFF' : '#71717a'}
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                  >
                    S{idx + 1}
                  </text>

                  {/* Hitbox for touch/hover */}
                  <rect
                    x={x - 18}
                    y={paddingTop}
                    width={36}
                    height={chartHeight + 15}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setHoveredIndex(idx)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Selected / Hovered Session Detail Card */}
      {activeHoveredSession && (
        <div className="bg-black/60 border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
          <div>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-[#BCE029]" />
              <span className="font-bold text-white">
                {activeHoveredSession.day} · {activeHoveredSession.sessionName}
              </span>
              <span className="text-[10px] text-zinc-400">
                ({new Date(activeHoveredSession.finishedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })})
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {activeHoveredSession.totalSets} séries validées ·{' '}
              {Math.round((activeHoveredSession.durationSeconds || 0) / 60)} min
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <span className="text-[9px] text-zinc-400 uppercase font-medium block">Tonnage</span>
              <span className="text-sm font-mono-numbers font-extrabold text-[#BCE029]">
                {Math.round(activeHoveredSession.totalTonnage || 0).toLocaleString('fr-FR')} kg
              </span>
            </div>
            <div>
              <span className="text-[9px] text-zinc-400 uppercase font-medium block">Répétitions</span>
              <span className="text-sm font-mono-numbers font-extrabold text-[#FF6D00]">
                {activeHoveredSession.totalReps || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-zinc-800/80 font-mono-numbers">
        <div className="bg-black/40 p-2 rounded-xl">
          <span className="text-[9px] text-zinc-400 font-sans block uppercase">Record Tonnage</span>
          <span className="text-xs font-bold text-[#BCE029]">
            {Math.round(maxTonnage).toLocaleString('fr-FR')} kg
          </span>
        </div>
        <div className="bg-black/40 p-2 rounded-xl">
          <span className="text-[9px] text-zinc-400 font-sans block uppercase">Moy. / Séance</span>
          <span className="text-xs font-bold text-zinc-200">
            {Math.round(avgTonnage).toLocaleString('fr-FR')} kg
          </span>
        </div>
        <div className="bg-black/40 p-2 rounded-xl">
          <span className="text-[9px] text-zinc-400 font-sans block uppercase">Total Réps</span>
          <span className="text-xs font-bold text-[#FF6D00]">
            {repsList.reduce((a, b) => a + b, 0)} réps
          </span>
        </div>
      </div>
    </div>
  );
};
