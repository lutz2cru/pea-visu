import React from 'react';
import { Globe2 } from 'lucide-react';
import { Exposure, ExposureItem } from '../../utils/analysis';
import { formatEuro, formatPercent } from '../../utils/format';
import { Card } from '../ui/Card';

const BarList: React.FC<{ title: string; items: ExposureItem[]; color: string }> = ({ title, items, color }) => (
  <div>
    <h3 className="text-sm font-semibold text-slate-200 mb-3">{title}</h3>
    <ul className="space-y-3">
      {items.map(item => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="text-slate-100 font-medium">{item.label}</span>
            <span className="text-slate-300 tabular-nums shrink-0">
              {formatPercent(item.weight)} <span className="text-slate-500">· {formatEuro(item.value, { decimals: 0 })}</span>
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full mt-1 overflow-hidden" aria-hidden="true">
            <div style={{ width: `${item.weight * 100}%` }} className={`h-full rounded-full ${color}`} />
          </div>
          <div className="text-xs text-slate-400 mt-0.5">{item.members.join(', ')}</div>
        </li>
      ))}
    </ul>
  </div>
);

export const ExposureCard: React.FC<{ exposure: Exposure }> = ({ exposure }) => (
  <Card
    title="Où est investi mon argent ?"
    subtitle="Répartition de la valeur de ton PEA par zone géographique et par secteur"
    icon={Globe2}
    iconClassName="bg-sky-500/10 text-sky-300"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BarList title="Par zone" items={exposure.zones} color="bg-sky-500" />
      <BarList title="Par secteur" items={exposure.sectors} color="bg-violet-500" />
    </div>
    <p className="text-xs text-slate-400 mt-4">
      Les ETF sont classés selon l'indice qu'ils suivent (un ETF S&P 500 = États-Unis, un ETF MSCI World = pays développés, surtout les États-Unis).
      Une action est classée selon le pays de la société : Airbus, société néerlandaise, compte en Europe hors France.
    </p>
  </Card>
);
