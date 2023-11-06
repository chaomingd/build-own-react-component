import { MutableRefObject, useLayoutEffect } from 'react';

export function useSetValue(
  fakeInputDivRef: MutableRefObject<HTMLDivElement | null>,
  value
) {
  useLayoutEffect(() => {
    if (fakeInputDivRef.current) {
      if (fakeInputDivRef.current.firstChild === null) {
        fakeInputDivRef.current.appendChild(
          document.createTextNode(value || '')
        );
      } else {
        fakeInputDivRef.current.firstChild.textContent = value || '';
      }
    }
  }, [value]);
}
