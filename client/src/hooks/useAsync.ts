import { useState, useEffect } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface UseAsyncResult<T> {
  data: T | null;
  status: Status;
  error: string | null;
  refetch: () => void;
}

export function useAsync<T>(fetcher: () => Promise<T>): UseAsyncResult<T> {
  const [data, setData]     = useState<T | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError]   = useState<string | null>(null);
  const [tick, setTick]     = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);
    fetcher()
      .then(r => { if (!cancelled) { setData(r); setStatus('success'); } })
      .catch((e: unknown) => { if (!cancelled) { setError(e instanceof Error ? e.message : String(e)); setStatus('error'); } });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return { data, status, error, refetch: () => setTick(t => t + 1) };
}
