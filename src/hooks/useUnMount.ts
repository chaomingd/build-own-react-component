import { useEffect } from 'react';
import { useLatest } from './useLatest';

export function useUnMount(fn: Function) {
  const fnRef = useLatest(fn);
  useEffect(() => {
    return () => {
      fnRef.current();
    }
  }, [])
}
