import { FakeInputProps } from './type';
import { CLS_PREFIX } from './const';
import { InputRef } from 'antd';
import { useInputModel } from './hooks/useInputModel';
import { useSignal } from './hooks/useSignal';
import { forwardRef, useRef } from 'react';
import { useBlinkingCursorLayout } from './hooks/useBlinkingCursorLayout';
import './index.less';
import classNames from 'classnames';
import { usePressEnter } from './hooks/usePressEnter';
import {useOnChange} from "~/components/FakeInput/hooks/useOnChange";
import {useRealInputFocus} from "~/components/FakeInput/hooks/useRealInputFocus";
import { getScrollBarSize } from '@/utils/scrollBar';


const scrollbarSize = getScrollBarSize();

const FakeInput = forwardRef<HTMLInputElement | null, FakeInputProps>(
  (props, ref) => {
    const { prefix, round, style, htmlProps } = props;
    const cursorRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const fakeInputDivRef = useRef<HTMLDivElement | null>(null);
    const realInputRef = useRef<HTMLInputElement | null>(null);
    const model = useInputModel(props);
    const { value, showBlinkingCursor } = model.useGetState();

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

    const { realInputFocus } = useRealInputFocus({
      realInputRef,
    })


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
          <pre className={`${CLS_PREFIX}-el-container`}>
            <div
              contentEditable={true}
              suppressContentEditableWarning
              className={classNames(`${CLS_PREFIX}-el`)}
              {...inputProps}
              style={{
                height: `calc(100% + ${scrollbarSize.height || 20}px)`
              }}
              ref={(el) => {
                fakeInputDivRef.current = el;
                if (ref) {
                  if (typeof ref === 'function') {
                    ref(el as HTMLInputElement)
                  } else {
                    ref.current = el as HTMLInputElement;
                  }
                }
              }}
              onClick={() => {
                realInputFocus();
              }}
            >
              {value}
            </div>
          </pre>
          {/* <input
            {...inputProps}
            ref={(el) => {
              realInputRef.current = el;
              if (ref) {
                if (typeof ref === 'function') {
                  ref(el)
                } else {
                  ref.current = el;
                }
              }
            }}
            value={value}
            spellCheck={false}
            className={classNames(
              `${CLS_PREFIX}-el`,
              `${CLS_PREFIX}-el-input`,
              showBlinkingCursor && `${CLS_PREFIX}--hide`
            )}
          /> */}
          {showBlinkingCursor && (
            <div
              ref={cursorRef}
              draggable={false}
              className={`${CLS_PREFIX}-blinking-cursor`}
            />
          )}
        </div>
      </div>
    );
  }
);

export default FakeInput;
