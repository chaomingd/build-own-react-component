import { MutableRefObject, useLayoutEffect, useRef } from 'react';
import { InputModel } from './useInputModel';
import { setRange } from '../utils/setRange';

interface Config {
  model: InputModel;
  cursorRef: MutableRefObject<HTMLDivElement | null>;
  fakeInputDivRef: MutableRefObject<HTMLDivElement | null>;
}

export function useBlinkingCursorLayout({
  model,
  cursorRef,
  fakeInputDivRef,
}: Config) {
  const { showBlinkingCursor, selectionRange } = model.getState();
  const cursorLeftRef = useRef(0);
  useLayoutEffect(() => {
    if (selectionRange && fakeInputDivRef.current) {
      if (showBlinkingCursor) {
        const fakeInputRect = fakeInputDivRef.current!.getBoundingClientRect();
        const range = setRange(fakeInputDivRef.current!, selectionRange);
        const rangeRect = range.getBoundingClientRect();
        const scrollLeft = fakeInputDivRef.current.scrollLeft;
        const fakeInputDivRect =
          fakeInputDivRef.current!.getBoundingClientRect();
        const relativeLeft = rangeRect.left - fakeInputDivRect.left;
        // const left = rangeRect.left - fakeInputRect.left;

        if (!range.collapsed) {
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        let nextScrollLeft: number | undefined;
        if (relativeLeft > fakeInputRect.width) {
          const maxLeft =
            fakeInputDivRef.current.scrollWidth - fakeInputRect.width;
          nextScrollLeft = Math.min(
            maxLeft,
            scrollLeft + fakeInputRect.width / 2
          );
        } else if (relativeLeft < 0) {
          const minLeft = 0;
          nextScrollLeft = Math.max(
            minLeft,
            scrollLeft - fakeInputRect.width / 2
          );
        }
        if (nextScrollLeft !== undefined) {
          // console.log(nextScrollLeft, relativeLeft, relativeLeft - (nextScrollLeft - inputDivLeftRef.current), fakeInputDivRect.width)
          fakeInputDivRef.current.scrollLeft = nextScrollLeft;
          cursorLeftRef.current = Math.max(
            0,
            relativeLeft - (nextScrollLeft - scrollLeft)
          );
        } else {
          cursorLeftRef.current = Math.max(0, relativeLeft);
        }
        cursorRef.current!.style.left = cursorLeftRef.current + 'px';
      } else {
        const range = setRange(fakeInputDivRef.current, selectionRange);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        fakeInputDivRef.current.scrollLeft = 0;
      }
    }
  }, [showBlinkingCursor, selectionRange]);
}
