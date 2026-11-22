import React from 'react';
import { Position, positionKey } from '../../types/portfolio';
import { ShoppingCart, Calendar, AlertTriangle, Wallet, Target, ListChecks } from 'lucide-react';
import { downloadDcaCalendarReminder } from '../../utils/calendar';
import { DcaLine, DcaPlan, STRATEGIES, StrategyType } from '../../utils/dca';
import { formatEuro, formatPoints } from '../../utils/format';
import { Card } from '../ui/Card';
import { InfoTip } from '../ui/InfoTip';

const QUICK_AMOUNTS = [50, 100, 200, 300, 500];

/** Liste des achats proposés (partagée entre l'accueil et l'onglet « Prochain versement »). */
export const PurchaseList: React.FC<{ plan: DcaPlan; budget: number; compact?: boolean }> = ({ plan, budget, compact = false }) => {
  if (plan.purchases.length === 0) {
    return (
      <p className="text-sm text-slate-300 bg-slate-950/60 border border-slate-800 rounded-xl p-3">
        {plan.cheapestUnderTarget
          ? <>Avec {formatEuro(budget, { decimals: 0 })}, aucune part entière d'une ligne sous sa cible n'est abordable. La moins chère est <strong className="text-white">{plan.cheapestUnderTarget.pos.ticker || plan.cheapestUnderTarget.pos.label}</strong> à {formatEuro(plan.cheapestUnderTarget.pos.currentPrice)}.</>
          : <>Toutes tes lignes sont déjà à leur cible ou au-dessus : rien à acheter en priorité.</>}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <ul className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {plan.purchases.map((item: DcaLine) => (
          <li key={item.pos.id} className="bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{item.pos.ticker || item.pos.label}</span>
                <span className="text-xs px-1.5 rounded bg-slate-800 text-slate-300">{item.pos.assetType}</span>
              </div>
              <div className="text-xs text-slate-400 truncate">{item.pos.label}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-emerald-400">
                {item.sharesToBuy} part{item.sharesToBuy > 1 ? 's' : ''}
              </div>
              <div className="text-xs text-slate-300">
                {item.sharesToBuy} × {formatEuro(item.pos.currentPrice)} = {formatEuro(item.cost)}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-300">
        Total : <strong className="text-white">{formatEuro(plan.totalSpent)}</strong>
        {plan.remainingBudget > 0.004 && <> · {formatEuro(plan.remainingBudget)} restent en espèces sur le PEA</>}
      </p>
    </div>
  );
};

interface DcaRebalancerProps {
  positions: Position[];
  plan: DcaPlan;
  budget: number;
  onBudgetChange: (amount: number) => void;
  strategy: StrategyType;
  onStrategyChange: (strategy: StrategyType) => void;
  onCustomTargetsChange: (targets: Record<string, number>) => void;
}

const StepTitle: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <span className="flex items-center gap-2">
    <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center shrink-0">{n}</span>
    <span>{children}</span>
  </span>
);

export const DcaRebalancer: React.FC<DcaRebalancerProps> = ({
  positions,
  plan,
  budget,
  onBudgetChange,
  strategy,
  onStrategyChange,
  onCustomTargetsChange
}) => {
  const handleCustomTargetChange = (p: Position, value: number) => {
    const next: Record<string, number> = {};
    positions.forEach(pos => {
      next[positionKey(pos)] = plan.targets[positionKey(pos)] ?? 0;
    });
    next[positionKey(p)] = Math.max(0, Math.min(100, value));
    onCustomTargetsChange(next);
  };

  return (
    <div className="space-y-5">

      {/* Étape 1 : montant */}
      <Card
        title={<StepTitle n={1}>Combien veux-tu investir ?</StepTitle>}
        subtitle={<>Le montant de ton prochain versement <InfoTip term="versementMensuel" /></>}
      >
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_AMOUNTS.map(amt => (
            <button
              key={amt}
              type="button"
              onClick={() => onBudgetChange(amt)}
              aria-pressed={budget === amt}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                budget === amt ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {amt} €
            </button>
          ))}
          <label className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-300">
            <span>Autre :</span>
            <input
              type="number"
              min={0}
              step={10}
              inputMode="decimal"
              value={budget}
              onChange={(e) => onBudgetChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-24 bg-transparent text-white font-semibold focus:outline-none"
              aria-label="Montant du versement en euros"
            />
            <span>€</span>
          </label>
          <button
            type="button"
            onClick={() => downloadDcaCalendarReminder(budget)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition sm:ml-auto"
          >
            <Calendar className="w-4 h-4 text-indigo-300" aria-hidden="true" />
            Rappel mensuel dans mon agenda
          </button>
        </div>
      </Card>

      {/* Étape 2 : répartition visée */}
      <Card
        title={<StepTitle n={2}>Quelle répartition vises-tu ?</StepTitle>}
        subtitle={<>L'outil oriente le versement vers les lignes en dessous de leur cible, sans rien vendre <InfoTip term="reequilibrage" /></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5" role="radiogroup" aria-label="Répartition visée">
          {STRATEGIES.map(s => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={strategy === s.id}
              onClick={() => onStrategyChange(s.id)}
              className={`p-3.5 rounded-xl border text-left transition ${
                strategy === s.id
                  ? 'bg-indigo-500/15 border-indigo-400 ring-1 ring-indigo-400/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-600'
              }`}
            >
              <span className="text-sm font-bold text-white block">{s.title}</span>
              <span className="text-sm text-slate-400 mt-1 block leading-snug">{s.description}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Ces répartitions sont des règles de calcul pour t'aider à visualiser, pas des recommandations d'investissement.
        </p>
      </Card>

      {/* Étape 3 : achats */}
      <Card
        title={<StepTitle n={3}>Ce que tu peux acheter</StepTitle>}
        subtitle={`Parts entières à acheter avec ${formatEuro(budget, { decimals: 0 })} pour te rapprocher de ta cible`}
        action={<ShoppingCart className="w-5 h-5 text-emerald-400" aria-hidden="true" />}
      >
        <PurchaseList plan={plan} budget={budget} />
        <p className="text-xs text-slate-400 mt-3">
          Les frais de courtage ne sont pas encore pris en compte : sur de petits ordres, ils peuvent peser.
        </p>
      </Card>

      {/* Détail par ligne */}
      <Card
        title="Détail par ligne"
        icon={ListChecks}
        iconClassName="bg-indigo-500/10 text-indigo-300"
        subtitle={strategy === 'CUSTOM' ? 'Saisis le pourcentage visé pour chaque ligne dans la colonne « Cible ».' : 'Poids actuel, cible et poids après les achats proposés.'}
      >
        {strategy === 'CUSTOM' && Math.abs(plan.targetsSum - 100) > 0.5 && (
          <div className="flex items-center gap-2 text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Tes cibles totalisent {formatPoints(plan.targetsSum)} : elles sont ramenées à 100 % pour le calcul.</span>
          </div>
        )}
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-left">
                <th className="py-2 px-1 font-medium">Ligne</th>
                <th className="py-2 px-1 font-medium text-right"><span className="inline-flex items-center gap-1">Poids actuel <InfoTip term="poids" /></span></th>
                <th className="py-2 px-1 font-medium text-right"><span className="inline-flex items-center gap-1"><Target className="w-3.5 h-3.5" aria-hidden="true" />Cible</span></th>
                <th className="py-2 px-1 font-medium text-right">Achat</th>
                <th className="py-2 px-1 font-medium text-right">Poids après</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {/* Ordre stable (par valeur) pour que la ligne en cours de saisie ne bouge pas */}
              {[...plan.lines].sort((a, b) => b.pos.valuation - a.pos.valuation).map(item => (
                <tr key={item.pos.id}>
                  <td className="py-2.5 px-1">
                    <span className="font-semibold text-white">{item.pos.ticker || item.pos.label}</span>
                    <span className="ml-2 text-xs text-slate-400">{item.pos.assetType}</span>
                  </td>
                  <td className="py-2.5 px-1 text-right text-slate-200 tabular-nums">{formatPoints(item.currentPct)}</td>
                  <td className="py-2.5 px-1 text-right tabular-nums">
                    {strategy === 'CUSTOM' ? (
                      <span className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          inputMode="decimal"
                          value={plan.targets[positionKey(item.pos)] ?? 0}
                          onChange={(e) => handleCustomTargetChange(item.pos, parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-800 border border-slate-600 rounded-md px-1.5 py-1 text-right text-white focus:outline-none focus:border-indigo-400"
                          aria-label={`Cible pour ${item.pos.label}, en %`}
                        />
                        <span className="text-slate-400">%</span>
                      </span>
                    ) : (
                      <span className="font-semibold text-indigo-300">{formatPoints(item.targetPct)}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-1 text-right tabular-nums">
                    {item.sharesToBuy > 0
                      ? <span className="font-semibold text-emerald-400">+{item.sharesToBuy} ({formatEuro(item.cost, { decimals: 0 })})</span>
                      : <span className="text-slate-500">—</span>}
                  </td>
                  <td className="py-2.5 px-1 text-right text-sky-300 tabular-nums">{formatPoints(item.projectedPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-slate-400 flex items-center gap-1.5">
        <Wallet className="w-3.5 h-3.5" aria-hidden="true" />
        Les cours utilisés sont ceux de ton dernier export : vérifie-les dans ton appli bancaire avant de passer l'ordre.
      </p>
    </div>
  );
};
