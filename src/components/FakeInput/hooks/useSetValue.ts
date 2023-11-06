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
      } else if (
        fakeInputDivRef.current.firstChild.nodeType !== Node.TEXT_NODE
      ) {
        fakeInputDivRef.current.insertBefore(
          document.createTextNode(value || ''),
          fakeInputDivRef.current.firstChild
        );
      } else if (
        fakeInputDivRef.current.firstChild.nodeType === Node.TEXT_NODE
      ) {
        fakeInputDivRef.current.firstChild.textContent = value || '';
      }
    }
  }, [value]);
}
