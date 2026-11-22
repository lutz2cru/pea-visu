import React from 'react';
import { AlertTriangle, Info, CheckCircle2, Lightbulb } from 'lucide-react';
import { Insight } from '../../utils/analysis';
import { Card } from '../ui/Card';

export const InsightsCard: React.FC<{ insights: Insight[] }> = ({ insights }) => (
  <Card title="Points d'attention" icon={Lightbulb} iconClassName="bg-amber-500/10 text-amber-300" className="h-full flex flex-col">
    {insights.length === 0 ? (
      <p className="text-sm text-slate-300 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        Rien de particulier à signaler.
      </p>
    ) : (
      <ul className="space-y-3 flex-1">
        {insights.map(i => (
          <li
            key={i.title}
            className={`rounded-xl border p-3 ${i.level === 'attention' ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-950/60 border-slate-800'}`}
          >
            <div className="flex items-start gap-2">
              {i.level === 'attention'
                ? <AlertTriangle className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" aria-label="À surveiller" />
                : <Info className="w-4 h-4 text-sky-300 mt-0.5 shrink-0" aria-label="Information" />}
              <div>
                <div className="text-sm font-semibold text-white">{i.title}</div>
                <p className="text-sm text-slate-300 mt-0.5">{i.text}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
    <p className="text-xs text-slate-400 mt-3">Des constats chiffrés pour t'aider à réfléchir, pas des recommandations.</p>
  </Card>
);
