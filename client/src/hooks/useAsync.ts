import { useState, useEffect } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface UseAsyncResult<T> {
  data: T | null;
  status: Status;
  error: string | null;
  refetch: () => void;
}

/**
 * Generic async data fetching hook.
 * Handles loading, error and refetch states cleanly.
 */
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
      .then(result => {
        if (!cancelled) {
          setData(result);
          setStatus('success');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setStatus('error');
        }
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return {
    data,
    status,
    error,
    refetch: () => setTick(t => t + 1),
  };
}
