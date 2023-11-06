import {MutableRefObject} from "react";

interface Config {
  realInputRef: MutableRefObject<HTMLInputElement | null>;
}
export function useRealInputFocus({ realInputRef }: Config) {
  const realInputFocus = () => {
    const selection = window.getSelection()!;
    const range = selection.getRangeAt(0)!;
    realInputRef.current?.setSelectionRange(range.startOffset, range.endOffset)
    realInputRef.current?.focus()
  }

  return {
    realInputFocus
  }
}
