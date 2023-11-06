import { MutableRefObject, useLayoutEffect } from 'react';
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
  useLayoutEffect(() => {
    if (selectionRange && fakeInputDivRef.current) {
      // 调整自定义光标位置
      const fakeInputParent = fakeInputDivRef.current!
        .parentElement! as HTMLElement;
      const fakeInputRect = fakeInputParent.getBoundingClientRect();
      if (showBlinkingCursor) {
        const range = setRange(fakeInputDivRef.current!, selectionRange);

        const rangeRect = range.getBoundingClientRect();
        const scrollLeft = fakeInputParent.scrollLeft;
        const scrollWidth = fakeInputParent.scrollWidth;
        const maxScrollLeft = scrollWidth - fakeInputRect.width;
        const relativeLeft = rangeRect.left - fakeInputRect.left;
        // const left = rangeRect.left - fakeInputRect.left;

        if (!range.collapsed) {
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        let nextScrollLeft: number | undefined;
        if (relativeLeft > fakeInputRect.width) {
          nextScrollLeft = Math.min(
            maxScrollLeft,
            scrollLeft + fakeInputRect.width / 2
          );
        } else if (relativeLeft < 0) {
          nextScrollLeft = Math.max(0, scrollLeft - fakeInputRect.width / 2);
        }
        if (nextScrollLeft !== undefined) {
          fakeInputParent.scrollLeft = nextScrollLeft;
        }
        cursorRef.current!.style.left =
          Math.min(Math.max(0, (relativeLeft + scrollLeft) | 0), scrollWidth - 2) +
          'px';
      } else {
        // contenteditable输入后光标会恢复到初始位置，需要修正
        const range = setRange(fakeInputDivRef.current!, selectionRange);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        if (model.getState().compositionEndChange) {
          const rangeRect = range.getBoundingClientRect();
          const relativeLeft = rangeRect.left - fakeInputRect.left;
          if (relativeLeft > fakeInputRect.width) {
            fakeInputParent.scrollLeft = fakeInputParent.scrollLeft + relativeLeft - fakeInputRect.width + 2;
          }
        }
      }
    }
  }, [showBlinkingCursor, selectionRange]);
}
