import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { Position } from '../types/portfolio';
import { PieChart as PieIcon, X, TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface AllocationChartProps {
  positions: Position[];
}

const COLORS = [
  '#3b82f6', // Bleu S&P 500
  '#10b981', // Vert TotalEnergies
  '#06b6d4', // Cyan Airbus
  '#f59e0b', // Ambre Orange
  '#8b5cf6', // Violet Marchés Émergents
  '#ec4899', // Rose Crédit Agricole
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#a855f7'  // Violet clair
];

// Forme active mise en valeur lors du clic ou du survol
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g style={{ outline: 'none' }}>
      {/* Anneau principal élargi et lumineux */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: `drop-shadow(0px 0px 8px ${fill}90)`,
          outline: 'none',
          cursor: 'pointer'
        }}
      />
      {/* Halo externe subtil */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 11}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.4}
        style={{ outline: 'none' }}
      />
    </g>
  );
};

// Tooltip sur-mesure à contraste élevé (fond sombre lisible, texte blanc et badges colorés)
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  const isPositive = item.gain >= 0;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-xl p-3 shadow-2xl text-xs max-w-xs z-50 pointer-events-none select-none">
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-bold text-white text-sm truncate">{item.name}</span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
            item.assetType === 'ETF'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {item.assetType}
        </span>
      </div>

      <p className="text-slate-300 text-[11px] leading-snug mb-2 font-medium line-clamp-2">
        {item.fullName}
      </p>

      <div className="space-y-1.5 pt-1.5 border-t border-slate-800 font-mono">
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400 font-sans">Valorisation :</span>
          <span className="font-bold text-white text-xs">
            {item.value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400 font-sans">Pondération :</span>
          <span className="font-semibold text-sky-400">
            {item.percent.toFixed(1)} %
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span className="text-slate-400 font-sans">Plus/Moins-value :</span>
          <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{item.gain.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € ({isPositive ? '+' : ''}{item.gainPercent.toFixed(2)}%)
          </span>
        </div>
        {item.category && (
          <div className="flex justify-between items-center text-slate-400 text-[10px] pt-0.5">
            <span className="font-sans">Secteur :</span>
            <span className="text-slate-300 font-sans">{item.category}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const AllocationChart: React.FC<AllocationChartProps> = ({ positions }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalValuation = positions.reduce((acc, p) => acc + p.valuation, 0);

  const data = positions.map((p, idx) => ({
    id: p.id,
    name: p.ticker || p.label,
    fullName: p.label,
    value: p.valuation,
    percent: totalValuation > 0 ? (p.valuation / totalValuation) * 100 : 0,
    gain: p.unrealizedGain,
    gainPercent: p.unrealizedGainPercent * 100,
    assetType: p.assetType,
    category: p.category,
    quantity: p.quantity,
    pru: p.pru,
    currentPrice: p.currentPrice,
    color: COLORS[idx % COLORS.length]
  }));

  const etfValue = positions.filter(p => p.assetType === 'ETF').reduce((acc, p) => acc + p.valuation, 0);
  const stockValue = positions.filter(p => p.assetType === 'Action').reduce((acc, p) => acc + p.valuation, 0);

  const etfPct = totalValuation > 0 ? (etfValue / totalValuation) * 100 : 0;
  const stockPct = totalValuation > 0 ? (stockValue / totalValuation) * 100 : 0;

  // L'élément actif est celui sélectionné au clic, ou à défaut celui survolé
  const activeIndex = selectedIndex !== null ? selectedIndex : hoveredIndex;
  const activeItem = activeIndex !== null && data[activeIndex] ? data[activeIndex] : null;

  const handleSliceClick = (index: number) => {
    setSelectedIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      
      {/* En-tête avec bouton de réinitialisation si un élément est sélectionné */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <PieIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Répartition & Diversification
            </h2>
          </div>

          {selectedIndex !== null && (
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1"
            >
              <span>Réinitialiser</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {selectedIndex !== null
            ? `Vue détaillée sur ${activeItem?.name} (cliquez à nouveau pour fermer)`
            : `Pondération des ${positions.length} lignes de votre PEA (cliquez sur une part pour inspecter)`}
        </p>
      </div>

      {/* Donut Chart */}
      <div className="h-56 w-full relative my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={<CustomTooltip />}
              itemStyle={{ color: '#ffffff' }}
              labelStyle={{ color: '#ffffff' }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              activeIndex={activeIndex !== null ? activeIndex : undefined}
              activeShape={renderActiveShape}
              onClick={(_, index) => handleSliceClick(index)}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              {data.map((item, index) => {
                const isSelected = selectedIndex === index;
                const isDimmed = activeIndex !== null && activeIndex !== index;
                return (
                  <Cell
                    key={`cell-${item.id || index}`}
                    fill={item.color}
                    opacity={isDimmed ? 0.35 : 1}
                    stroke={isSelected ? '#ffffff' : '#0f172a'}
                    strokeWidth={isSelected ? 2 : 1}
                    style={{ outline: 'none', cursor: 'pointer', transition: 'opacity 0.2s ease' }}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centre interactif du Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeItem ? (
            <div className="flex flex-col items-center transition-all duration-200">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-0.5"
                style={{
                  backgroundColor: `${activeItem.color}25`,
                  color: activeItem.color,
                  border: `1px solid ${activeItem.color}60`
                }}
              >
                {activeItem.name}
              </span>
              <span className="text-base font-extrabold text-white">
                {activeItem.value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
              </span>
              <span className="text-[11px] font-mono font-semibold text-slate-300">
                {activeItem.percent.toFixed(1)}% du PEA
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  activeItem.gain >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {activeItem.gain >= 0 ? '+' : ''}{activeItem.gainPercent.toFixed(1)}%
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-xs text-slate-400 font-medium">Total PEA</span>
              <span className="text-base font-bold text-white">
                {totalValuation.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                {positions.length} lignes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Carte de détails dédiée si une position est sélectionnée au clic */}
      {activeItem && selectedIndex !== null && (
        <div
          className="rounded-xl p-3 my-1 text-xs border transition-all duration-200"
          style={{
            borderColor: `${activeItem.color}60`,
            backgroundColor: `${activeItem.color}10`
          }}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activeItem.color }}
              />
              <span className="font-bold text-white text-xs truncate">
                {activeItem.fullName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition shrink-0 ml-1"
              title="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Valorisation</span>
              <span className="font-bold text-white font-mono text-xs block">
                {activeItem.value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>
              <span className="text-[10px] text-sky-400 font-mono">
                {activeItem.percent.toFixed(1)}%
              </span>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Plus/Moins-value</span>
              <span
                className={`font-bold font-mono text-xs block ${
                  activeItem.gain >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {activeItem.gain >= 0 ? '+' : ''}{activeItem.gain.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>
              <span
                className={`text-[10px] font-mono ${
                  activeItem.gain >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {activeItem.gain >= 0 ? '+' : ''}{activeItem.gainPercent.toFixed(2)}%
              </span>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Détails d'achat</span>
              <span className="font-bold text-slate-200 font-mono text-xs block">
                {activeItem.quantity} parts
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                PRU: {activeItem.pru.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Synthèse ETF vs Actions & Légende interactive */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        
        {/* Barre de répartition visuelle ETF vs Actions */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">Répartition par type d'actif :</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                {etfPct.toFixed(1)}% ETF
              </span>
              <span className="text-slate-600">/</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {stockPct.toFixed(1)}% Actions
              </span>
            </div>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${etfPct}%` }}
              className="bg-indigo-500 h-full transition-all duration-300"
              title={`ETF: ${etfPct.toFixed(1)}%`}
            />
            <div
              style={{ width: `${stockPct}%` }}
              className="bg-emerald-500 h-full transition-all duration-300"
              title={`Actions: ${stockPct.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* Légende interactive des positions */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span>Positions ({positions.length}) :</span>
            {selectedIndex !== null ? (
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition"
              >
                <span>Tout afficher</span>
                <X className="w-3 h-3" />
              </button>
            ) : (
              <span className="text-[10px] text-slate-500">Cliquer pour filtrer</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {data.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              const isDimmed = activeIndex !== null && activeIndex !== idx;

              return (
                <button
                  key={item.id || item.name}
                  type="button"
                  onClick={() => handleSliceClick(idx)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition border text-left cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 text-white border-slate-600 shadow-sm ring-1 ring-slate-500/40'
                      : isDimmed
                        ? 'opacity-40 text-slate-400 border-transparent hover:opacity-100 hover:text-slate-200 hover:bg-slate-800/40'
                        : 'text-slate-300 border-transparent hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-150"
                      style={{
                        backgroundColor: item.color,
                        transform: isSelected ? 'scale(1.25)' : 'scale(1)'
                      }}
                    />
                    <span className={`truncate font-medium ${isSelected ? 'font-bold text-white' : ''}`}>
                      {item.name}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[11px] ml-1 shrink-0 ${
                      isSelected ? 'text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    {item.percent.toFixed(1)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
