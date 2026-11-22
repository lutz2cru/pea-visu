import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { DcaPlan, StrategyType, strategyTitle } from '../../utils/dca';
import { formatEuro } from '../../utils/format';
import { Card } from '../ui/Card';
import { PurchaseList } from '../savings/DcaRebalancer';

interface MonthlyPlanCardProps {
  plan: DcaPlan;
  budget: number;
  strategy: StrategyType;
  onAdjust: () => void;
}

export const MonthlyPlanCard: React.FC<MonthlyPlanCardProps> = ({ plan, budget, strategy, onAdjust }) => (
  <Card
    title="Que faire ce mois-ci ?"
    icon={ShoppingCart}
    iconClassName="bg-indigo-500/10 text-indigo-300"
    subtitle={
      <>
        Pour un versement de <strong className="text-slate-200">{formatEuro(budget, { decimals: 0 })}</strong> et la répartition
        visée <strong className="text-slate-200">« {strategyTitle(strategy)} »</strong>, voici les parts à acheter :
      </>
    }
  >
    <PurchaseList plan={plan} budget={budget} />
    <button
      type="button"
      onClick={onAdjust}
      className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-400 text-white transition"
    >
      Changer le montant ou la répartition →
    </button>
  </Card>
);
