import { useEffect, useState } from 'react';
import { BenchmarkData } from '../utils/benchmark';

export type BenchmarkStatus = 'loading' | 'ready' | 'unavailable';

/** Charge l'historique des ETF de référence généré au moment du build (public/data/benchmarks.json). */
export function useBenchmarks() {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [status, setStatus] = useState<BenchmarkStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}data/benchmarks.json`)
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json: BenchmarkData) => {
        if (cancelled) return;
        setData(json);
        setStatus(json?.series && Object.keys(json.series).length > 0 ? 'ready' : 'unavailable');
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, status };
}
