import { FakeInputProps } from './type';
import { CLS_PREFIX } from './const';
import { useInputModel } from './hooks/useInputModel';
import { useSignal } from './hooks/useSignal';
import { forwardRef, useRef } from 'react';
import { useBlinkingCursorLayout } from './hooks/useBlinkingCursorLayout';
import './index.less';
import classNames from 'classnames';
import { usePressEnter } from './hooks/usePressEnter';
import { useOnChange } from '~/components/FakeInput/hooks/useOnChange';
import { getScrollBarSize } from '@/utils/scrollBar';
import { useSetValue } from './hooks/useSetValue';

const scrollbarSize = getScrollBarSize();

const FakeInput = forwardRef<HTMLInputElement | null, FakeInputProps>(
  (props, ref) => {
    const { prefix, round, style, htmlProps } = props;
    const cursorRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const fakeInputDivRef = useRef<HTMLDivElement | null>(null);
    // const realInputRef = useRef<HTMLInputElement | null>(null);
    const model = useInputModel(props);
    const { value, showBlinkingCursor } = model.useGetState();

    useSetValue(fakeInputDivRef, value);

    useSignal({
      props,
      model,
      fakeInputDivRef,
    });

    useBlinkingCursorLayout({
      model,
      cursorRef,
      fakeInputDivRef,
    });

    usePressEnter({
      domRef: fakeInputDivRef,
    });

    const inputProps = useOnChange({
      model,
    });

    return (
      <div
        ref={containerRef}
        className={classNames(
          CLS_PREFIX,
          showBlinkingCursor && `${CLS_PREFIX}--focus`,
          round && `${CLS_PREFIX}--round`
        )}
        style={style}
        {...(htmlProps || {})}
      >
        {prefix && <div className={`${CLS_PREFIX}-prefix`}>{prefix}</div>}
        <div className={`${CLS_PREFIX}-wrapper`}>
          <pre
            className={`${CLS_PREFIX}-el-container`}
            style={{
              height: `calc(100% + ${scrollbarSize.height || 20}px)`,
            }}
          >
            <div
              contentEditable
              suppressContentEditableWarning
              className={classNames(`${CLS_PREFIX}-el`)}
              {...inputProps}
              ref={(el) => {
                fakeInputDivRef.current = el;
                if (ref) {
                  if (typeof ref === 'function') {
                    ref(el as HTMLInputElement);
                  } else {
                    ref.current = el as HTMLInputElement;
                  }
                }
              }}
            />
            {showBlinkingCursor && (
              <div
                ref={cursorRef}
                draggable={false}
                className={`${CLS_PREFIX}-blinking-cursor`}
              />
            )}
          </pre>
        </div>
      </div>
    );
  }
);

export default FakeInput;
