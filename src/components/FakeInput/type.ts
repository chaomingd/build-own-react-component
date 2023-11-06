import {HTMLAttributes, ReactNode} from 'react';

export interface FakeInputProps {
  value?: string;
  onChange?: (val: string) => void;
  namespace?: string;
  onSearch?: (val: string) => void;
  prefix?: ReactNode;
  round?: boolean;
  style?: React.CSSProperties;
  htmlProps?: HTMLAttributes<HTMLDivElement>
}

export interface RangeData {
  startOffset: number;
  endOffset: number;
  collapsed: boolean;
}

export interface InputModelState {
  value: string;
  showBlinkingCursor: boolean;
  selectionRange: RangeData | null;
  initialRangeData: RangeData | null;
  composition: boolean;
  compositionEndChange: boolean;
}

export interface InputModelEffects {
  handleChange: (val: string, composition?: boolean, compositionEndChange?: boolean) => void;
  handleSetBlinkingCursor: (showBlinkingCursor: boolean, silent?: boolean) => void;
}



