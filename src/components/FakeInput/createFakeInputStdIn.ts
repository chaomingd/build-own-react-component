import { listen } from '~/utils/dom';
import { FAKE_INPUT_SIGNAL } from './const';
import { getSignalName } from './utils/getSignalName';

export interface InputState {
  focus: boolean;
  compositionstart: boolean;
  value: string;
  namespace: string;
}

interface InputOptions {
  onChange?: (val: string, composition: boolean, compositionEndChange: boolean) => void;
  onSelectionChange?: () => void;
  namespace?: string;
}

function getSelectionRange(input: HTMLInputElement) {
  return {
    startOffset: input.selectionStart,
    endOffset: input.selectionEnd,
    collapsed: input.selectionStart === input.selectionEnd,
  };
}

export function createFakeInputStdIn(options?: InputOptions) {
  const { onChange, onSelectionChange } = options || {};
  const input = document.createElement('input');
  let inputState: InputState = {
    focus: false,
    compositionstart: false,
    value: '',
    namespace: options?.namespace || '',
  };
  function updateInputState(state: Partial<InputState>) {
    Object.assign(inputState, state)
  }

  input.style.cssText = `
    position: fixed;
    top: -1000px;
    left: -1000px;
    width: 100%;
    opacity: 0;
    pointer-events: none;
  `;

  const offFocus = listen(input, 'focus', () => {
    updateInputState({
      focus: true,
    });
    FAKE_INPUT_SIGNAL.emit(
      getSignalName(inputState.namespace, 'onfocus'),
      input.value,
      getSelectionRange(input)
    );
  });

  const offCompositionstart = listen(input, 'compositionstart', () => {
    updateInputState({
      compositionstart: true,
    });
  });

  const handleSelectionChange = () => {
    if (inputState.compositionstart || !inputState.focus) return;
    onSelectionChange?.();
    FAKE_INPUT_SIGNAL.emit(
      getSignalName(inputState.namespace, 'onselectionchange'),
      getSelectionRange(input)
    );
  };

  const handleOnChange = (composition = false, compositionEndChange = false) => {
    const oldValue = inputState.value;
    updateInputState({
      compositionstart: false,
      value: input.value,
    });
    onChange?.(input.value, composition, compositionEndChange);
    FAKE_INPUT_SIGNAL.emit(
      getSignalName(inputState.namespace, 'onchange'),
      input.value,
      composition,
      compositionEndChange,
    );

    if (input.value.length < oldValue.length) {
      handleSelectionChange();
    }
  };

  const offCompositionend = listen(input, 'compositionend', () => {
    handleOnChange(false, true);
  });

  const offInput = listen(input, 'input', (e) => {
    if (inputState.compositionstart) return;
    handleOnChange();
  });

  const offSelectionChange = listen(document, 'selectionchange', () => {
    handleSelectionChange();
  });

  const offCompositionupdate = listen(input, 'compositionupdate', () => {
    handleOnChange(true);
  })

  const offBlur = listen(input, 'blur', () => {
    updateInputState({
      focus: false,
    });
    console.log('blur')
    FAKE_INPUT_SIGNAL.emit(getSignalName(inputState.namespace, 'onblur'), input.value);
  });

  const destroy = () => {
    offFocus();
    offBlur();
    offCompositionstart();
    offCompositionend();
    offInput();
    offSelectionChange();
    offCompositionupdate();
    input.blur();
    document.documentElement.removeChild(input);
  };

  document.documentElement.appendChild(input);
  return {
    destroy,
    focus: () => {
      input.focus();
    },
    blur: () => {
      input.blur();
    },
    setNamespace: (namespace: string) => {
      updateInputState({
        namespace,
      });
    },
    input,
  };
}
