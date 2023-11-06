import { listen } from '@/utils/dom';
import { useEffect, useRef } from 'react';
import { InputState } from '~/components/FakeInput/createFakeInputStdIn';
import { InputModel } from '~/components/FakeInput/hooks/useInputModel';

interface Config {
  model: InputModel;
}
export function useOnChange({ model }: Config) {
  const inputStateRef = useRef<InputState>({} as InputState);
  const handleChange = (val: string, composition = false, compositionEndChange = false) => {
    const selection = window.getSelection()!;
    const range = selection!.getRangeAt(0);

    model.setState(
      {
        selectionRange: {
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          collapsed: range.collapsed,
        },
      },
      {
        silent: true,
      }
    );
    model.getEffect('handleChange')(val, composition, compositionEndChange);
  };
  const onCompositionStart = (e: any) => {
    inputStateRef.current.compositionstart = true;
  };

  const onCompositionUpdate = (e) => {
    handleChange(e.target.innerText, true);
  };

  const onCompositionEnd = (e: any) => {
    inputStateRef.current.compositionstart = false;
    handleChange(e.target.innerText, false, true);
  };
  const onInput = (e: any) => {
    if (inputStateRef.current.compositionstart) return;
    handleChange(e.target.innerText);
  };


  return {
    onInput,
    onCompositionEnd,
    onCompositionStart,
    onCompositionUpdate,
  };
}
