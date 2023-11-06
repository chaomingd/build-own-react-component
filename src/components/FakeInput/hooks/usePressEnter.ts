import { ShortCutKeyManager } from '../../../utils/ShortCutKeyManager';
import { MutableRefObject, useEffect } from 'react';

interface Config {
  domRef: MutableRefObject<HTMLElement | null>;
}
export function usePressEnter({ domRef }: Config) {
  useEffect(() => {
    if (!domRef.current) return;
    const shortCutKeyManager = new ShortCutKeyManager(domRef.current!);
    shortCutKeyManager.on('enter', (e) => {
      e.preventDefault();
    })
    return () => {
      shortCutKeyManager.dispose();
    }
  }, [])
}
