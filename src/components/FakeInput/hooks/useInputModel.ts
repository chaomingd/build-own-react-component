import { useModel } from '~/hooks/react-store/useModel';
import { FakeInputProps, InputModelState, InputModelEffects } from '../type';
import { useMemo, useRef } from 'react';

export type InputModel = ReturnType<
  typeof useModel<InputModelState, InputModelEffects>
>;

export function useInputModel(props: FakeInputProps) {
  const setBlinkingCursorTimerRef = useRef<any>();
  const hasValue = 'value' in props;
  const model = useModel<InputModelState, InputModelEffects>({
    state: {
      value: '',
      showBlinkingCursor: false,
      selectionRange: null,
      composition: false,
      initialRangeData: null,
    },
    effects: {
      handleChange: (val, composition = false) => {
        model.setState(
          {
            composition,
          },
          {
            silent: true,
          }
        );
        if (composition) {
          model.setState({
            value: val,
          });
        } else {
          if (!hasValue) {
            model.setState({
              value: val,
            });
          }
          props.onChange?.(val);
        }
      },
      handleSetBlinkingCursor: (showBlinkingCursor, silent = false) => {
        model.setState(
          {
            showBlinkingCursor,
          },
          {
            silent,
          }
        );
      },
    },
  });

  useMemo(() => {
    if (hasValue && !model.getState().composition) {
      model.setState(
        {
          value: props.value,
        },
        {
          silent: true,
        }
      );
    }
  }, [props.value]);

  return model;
}
