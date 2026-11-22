import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Coins, CalendarDays, List, BookOpen } from 'lucide-react';
import { DividendOverview } from '../../utils/analysis';
import { formatEuro, formatPoints } from '../../utils/format';
import { PEA_SOCIAL_TAX_RATE, PEA_TAX_FREE_YEARS } from '../../config/fiscal';
import { Card } from '../ui/Card';
import { InfoTip } from '../ui/InfoTip';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

interface DividendsViewProps {
  dividends: DividendOverview;
  onGoToInvest: () => void;
}

const MonthTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as { label: string; amount: number; payers: string[] };
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm shadow-2xl">
      <div className="font-semibold text-white capitalize">{d.label}</div>
      <div className="text-amber-300">≈ {formatEuro(d.amount)}</div>
      {d.payers.length > 0 && <div className="text-slate-300 text-xs mt-0.5">{d.payers.join(', ')}</div>}
    </div>
  );
};

export const DividendsView: React.FC<DividendsViewProps> = ({ dividends, onGoToInvest }) => {
  const { lines, totalGross, totalNet, next12Months, withoutCalendar, accumulatingEtfs } = dividends;
  const withheld = totalGross - totalNet;
  const chartData = next12Months.map(m => ({
    label: `${MONTHS[m.date.getMonth()]} ${String(m.date.getFullYear()).slice(2)}`,
    amount: Math.round(m.amount * 100) / 100,
    payers: m.payers
  }));
  const hasCalendar = chartData.some(m => m.amount > 0);

  return (
    <div className="space-y-5">

      {/* Combien ? */}
      <Card title="Combien je touche ?" icon={Coins} iconClassName="bg-amber-500/10 text-amber-300">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="text-sm text-slate-400 flex items-center gap-1.5">Dividendes estimés par an <InfoTip term="dividende" /></div>
            <div className="text-4xl font-bold text-amber-300 tabular-nums mt-1">≈ {formatEuro(totalNet, { decimals: 0 })}</div>
            <div className="text-sm text-slate-400 mt-1">soit ≈ {formatEuro(totalNet / 12)} par mois en moyenne</div>
          </div>
          <dl className="grid grid-cols-3 gap-3 text-sm sm:min-w-[360px]">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <dt className="text-slate-400">Brut</dt>
              <dd className="text-white font-semibold tabular-nums">{formatEuro(totalGross, { decimals: 0 })}</dd>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <dt className="text-slate-400">Retenue étrangère</dt>
              <dd className="text-rose-300 font-semibold tabular-nums">{withheld > 0.5 ? `−${formatEuro(withheld, { decimals: 0 })}` : '0 €'}</dd>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <dt className="text-slate-400">Net dans le PEA</dt>
              <dd className="text-amber-300 font-semibold tabular-nums">{formatEuro(totalNet, { decimals: 0 })}</dd>
            </div>
          </dl>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Estimation à partir du rendement indiqué pour chaque ligne (modifiable dans « Mes lignes »). Un dividende n'est jamais garanti : l'entreprise peut le réduire ou le supprimer.
        </p>
      </Card>

      {/* Quand ? */}
      <Card
        title="Quand ?"
        subtitle="Montants attendus sur les 12 prochains mois, d'après les mois de versement habituels"
        icon={CalendarDays}
        iconClassName="bg-sky-500/10 text-sky-300"
      >
        {hasCalendar ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                <CartesianGrid vertical={false} stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickLine={false} interval={0} angle={-45} textAnchor="end" height={48} />
                <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v} €`} />
                <Tooltip content={<MonthTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-300">Aucun calendrier connu pour tes lignes qui versent un dividende.</p>
        )}
        <p className="text-xs text-slate-400 mt-3">
          Mois habituels, à vérifier sur le site de chaque entreprise (ils peuvent changer). Le montant annuel est réparti à parts égales entre les versements.
          {withoutCalendar.length > 0 && <> Calendrier inconnu pour : {withoutCalendar.join(', ')}.</>}
        </p>
      </Card>

      {/* Par ligne */}
      <Card title="Ligne par ligne" icon={List} iconClassName="bg-indigo-500/10 text-indigo-300">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 text-left">
                <th className="py-2 px-1 font-medium">Ligne</th>
                <th className="py-2 px-1 font-medium text-right">Rendement</th>
                <th className="py-2 px-1 font-medium text-right">Brut / an</th>
                <th className="py-2 px-1 font-medium text-right">Retenue étrangère</th>
                <th className="py-2 px-1 font-medium text-right">Net / an</th>
                <th className="py-2 px-1 font-medium">Mois habituels</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {lines.map(l => (
                <tr key={l.position.id}>
                  <td className="py-2.5 px-1">
                    <div className="font-semibold text-white">{l.position.ticker || l.position.label}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[200px]">{l.position.label}</div>
                  </td>
                  <td className="py-2.5 px-1 text-right text-slate-200 tabular-nums">{formatPoints(l.position.dividendYieldEstimate)}</td>
                  <td className="py-2.5 px-1 text-right text-slate-200 tabular-nums">{formatEuro(l.gross)}</td>
                  <td className="py-2.5 px-1 text-right tabular-nums">
                    {l.withholding === null
                      ? <span className="text-slate-400" title="Taux selon le pays de la société, non récupérable dans le PEA">variable</span>
                      : l.withholding > 0
                        ? <span className="text-rose-300">{formatPoints(l.withholding, { decimals: l.withholding % 1 ? 3 : 0 })}</span>
                        : <span className="text-slate-500">—</span>}
                  </td>
                  <td className="py-2.5 px-1 text-right text-amber-300 font-semibold tabular-nums">{formatEuro(l.net)}</td>
                  <td className="py-2.5 px-1 text-slate-300">
                    {l.months.length > 0 ? l.months.map(m => MONTHS[m - 1]).join(', ') : <span className="text-slate-500">inconnus</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {accumulatingEtfs.length > 0 && (
          <p className="text-sm text-slate-300 mt-3 flex items-center gap-1.5 flex-wrap">
            <strong className="text-white">{accumulatingEtfs.join(', ')}</strong> : ETF capitalisant{accumulatingEtfs.length > 1 ? 's' : ''}, les dividendes sont réinvestis automatiquement dans le cours <InfoTip term="etfCapitalisant" />
          </p>
        )}
      </Card>

      {/* Comment ça marche */}
      <Card title="Comment ça marche dans un PEA ?" icon={BookOpen} iconClassName="bg-emerald-500/10 text-emerald-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-1">Où arrive l'argent ?</h3>
            <p className="text-slate-300 leading-relaxed">
              Sur le <strong>compte espèces de ton PEA</strong>, pas sur ton compte courant. Tant qu'il reste dans le PEA, il n'est pas imposé.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-1">Comment en profiter ?</h3>
            <p className="text-slate-300 leading-relaxed">
              Le plus simple est de le <strong>réinvestir</strong> en l'ajoutant à ton prochain versement.{' '}
              Avant {PEA_TAX_FREE_YEARS} ans, un retrait clôture le PEA. Après, tu peux retirer librement : seuls {PEA_SOCIAL_TAX_RATE.toLocaleString('fr-FR')} % de prélèvements sociaux s'appliquent à la part de gains.
            </p>
            <button type="button" onClick={onGoToInvest} className="mt-2 text-sm font-medium text-sky-300 hover:text-sky-200">
              Préparer mon prochain versement →
            </button>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-1">Qui y a droit ?</h3>
            <p className="text-slate-300 leading-relaxed">
              Il faut détenir l'action à la clôture de la veille de la <strong>date de détachement</strong>. Ce jour-là, le cours baisse d'environ le montant du dividende : acheter juste avant ne fait donc rien gagner.
            </p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-1">Et les sociétés étrangères ?</h3>
            <p className="text-slate-300 leading-relaxed">
              Leur pays prélève une <strong>retenue à la source</strong> qui n'est pas récupérable dans un PEA (par exemple 15 % pour une société néerlandaise comme Airbus). Les sociétés françaises n'en ont pas.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
