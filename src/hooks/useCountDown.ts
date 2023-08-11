import { useRef } from 'react';
import { useModel } from './react-store/useModel';

interface IProps {
  duration: number;
}
interface IState {
  canSubmit: boolean;
  remain: number;
}
export function useCountDown({ duration }: IProps) {
  const stateModel = useModel<IState>({
    state: {
      canSubmit: true,
      remain: 0,
    },
  });
  const { canSubmit, remain } = stateModel.useGetState();
  const timer = useRef<any>();
  const startCountDown = () => {
    stateModel.setState({
      canSubmit: false,
      remain: duration,
    });
    timer.current = setInterval(() => {
      const { remain } = stateModel.getState();
      if (remain === 0) {
        clearInterval(timer.current);
        stateModel.setState({
          remain: 0,
          canSubmit: true,
        });
        return;
      }
      stateModel.setState({
        remain: remain - 1,
      });
    }, 1000);
  };
  return {
    remain,
    canSubmit,
    startCountDown,
  }
}
