import { Model, useModel } from '@/hooks/react-store/useModel';
import { ReactElement, ReactNode } from 'react';

export interface TransitionProps {
  visible?: boolean;
  exitUnMount?: boolean;
  children: ReactElement | ((status: ETransitionStatus, transitionName: string, transitionNames: string[]) => ReactElement);
  duration?: number | {
    enter: number;
    exit: number;
  }
  transitionName?: string | string[];
  onEnter?: () => any;
  onEntering?: () => any;
  onEntered?: () => any;
  onExit?: () => any;
  onExiting?: () => any;
  onExited?: () => any;
  model?: Model<ITransitionState>
}
export enum ETransitionStatus {
  none = 'none',
  enter = 'enter',
  entering = 'entering',
  entered = 'entered',
  exit = 'exit',
  exiting = 'exiting',
  exited = 'exited',
}
export interface ITransitionState {
  status: ETransitionStatus
}
export const ENTER_STATUS_SQUENCE = [
  ETransitionStatus.entering,
  ETransitionStatus.entered,
]
export const EXIT_STATUS_SQUENCE = [
  ETransitionStatus.exiting,
  ETransitionStatus.exited,
]

export type TransitionClassNames = Record<ETransitionStatus, string>
