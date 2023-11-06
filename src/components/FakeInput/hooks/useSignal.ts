import { MutableRefObject, useEffect } from 'react';
import { FAKE_INPUT_SIGNAL } from '../const';
import { FakeInputProps } from '../type';
import { getSignalName } from '../utils/getSignalName';
import { InputModel } from './useInputModel';

interface Config {
  props: FakeInputProps;
  model: InputModel;
  fakeInputDivRef: MutableRefObject<HTMLDivElement | null>;
}

export function useSignal({ props, model }: Config) {
  useEffect(() => {
    const offFocus = FAKE_INPUT_SIGNAL.on(
      getSignalName(props.namespace, 'onfocus'),
      (_, rangeData) => {
        model.setState({
          initialRangeData: rangeData,
        }, {
          silent: true,
        });
        model.getEffect('handleSetBlinkingCursor')(true);
      }
    );

    const offBlur = FAKE_INPUT_SIGNAL.on(getSignalName(props.namespace, 'onblur'), () => {
      model.setState({
        selectionRange: null,
      }, {
        silent: true,
      });
      model.getEffect('handleSetBlinkingCursor')(false);
    });

    const offChange = FAKE_INPUT_SIGNAL.on(
      getSignalName(props.namespace, 'onchange'),
      (value, composition) => {
        model.getEffect('handleChange')(value, composition);
      }
    );

    const offSelectionChange = FAKE_INPUT_SIGNAL.on(
      getSignalName(props.namespace, 'onselectionchange'),
      (rangeJson) => {
        model.setState({
          selectionRange: rangeJson,
        });
      }
    );

    return () => {
      offFocus();
      offBlur();
      offChange();
      offSelectionChange();
    };
  }, []);
}
