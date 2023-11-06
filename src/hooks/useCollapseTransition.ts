import { TransitionProps } from '@/components/Transition/type';
import { MutableRefObject, useRef } from 'react';

export function useCollapseTransition(
  ref: MutableRefObject<HTMLElement | null>,
  options?: Partial<TransitionProps>
) {
  const stylesRef = useRef<any>({});
  const transitionProps: Partial<TransitionProps> = {
    onEntering: () => {
      if (ref.current) {
        stylesRef.current = {
          height: ref.current.scrollHeight,
          overflow: 'hidden',
        };
      }
      options?.onEntering?.()
    },
    onEntered: () => {
      if (ref.current) {
        stylesRef.current = {};
      }
      options?.onEntered?.()
    },
    onExit: () => {
      if (ref.current) {
        stylesRef.current = {
          height: ref.current.scrollHeight,
          overflow: 'hidden',
        };
      }
      options?.onExit?.()
    },
    onExiting: () => {
      if (ref.current) {
        stylesRef.current = { ...stylesRef.current, height: 0 };
      }
      options?.onEntering?.()
    },
    onExited() {
      if (ref.current) {
        stylesRef.current = {};
      }
      options?.onExited?.()
    },
  };

  return { transitionProps, stylesRef: stylesRef };
}
