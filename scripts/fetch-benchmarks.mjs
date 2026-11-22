/**
 * Récupère l'historique des cours des ETF de référence (Yahoo Finance) et l'écrit dans
 * public/data/benchmarks.json, servi avec l'application.
 *
 * Lancé avant chaque build (npm run build) et à la main avec `npm run data`.
 * En cas d'échec réseau, la version précédente du fichier est conservée : le build ne casse jamais.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../public/data/benchmarks.json', import.meta.url));

const SERIES = {
  MSCI_WORLD: { symbol: 'CW8.PA', isin: 'LU1681043599', name: 'Amundi MSCI World (CW8)', label: 'MSCI World' },
  SP500: { symbol: 'ESE.PA', isin: 'FR0011550185', name: 'BNP Paribas Easy S&P 500 (ESE)', label: 'S&P 500' }
};

async function fetchSeries(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=10y`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  const timestamps = result?.timestamp;
  const closes = result?.indicators?.quote?.[0]?.close;
  if (!Array.isArray(timestamps) || !Array.isArray(closes)) throw new Error('réponse inattendue');
  if (result.meta?.currency !== 'EUR') throw new Error(`devise inattendue : ${result.meta?.currency}`);

  const points = [];
  timestamps.forEach((t, i) => {
    const close = closes[i];
    if (typeof close === 'number' && close > 0) {
      points.push([new Date(t * 1000).toISOString().slice(0, 10), Math.round(close * 10000) / 10000]);
    }
  });
  if (points.length < 20) throw new Error('historique trop court');
  return { currency: 'EUR', points };
}

async function main() {
  let previous = null;
  try {
    previous = JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    // pas encore de fichier
  }

  const series = {};
  let refreshed = 0;
  for (const [key, meta] of Object.entries(SERIES)) {
    try {
      const data = await fetchSeries(meta.symbol);
      series[key] = { ...meta, ...data };
      refreshed++;
      console.log(`[benchmarks] ${meta.symbol} : ${data.points.length} cours, dernier le ${data.points.at(-1)[0]}`);
    } catch (err) {
      const kept = previous?.series?.[key];
      if (kept) series[key] = kept;
      console.warn(`[benchmarks] ${meta.symbol} indisponible (${err.message})${kept ? ' : version précédente conservée' : ''}`);
    }
  }

  if (Object.keys(series).length === 0) {
    console.warn('[benchmarks] aucun cours disponible : fichier non écrit');
    return;
  }

  const output = {
    source: 'Yahoo Finance',
    updatedAt: refreshed > 0 ? new Date().toISOString().slice(0, 10) : previous?.updatedAt ?? null,
    series
  };
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(output));
}

main().catch(err => {
  console.warn(`[benchmarks] erreur inattendue : ${err.message}`);
});
