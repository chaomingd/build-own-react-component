import { DEFAULT_INDENT } from '../const';
import { TreeProps } from '../type';
import { useMemo } from 'react';

export function useTreePropsContextValue(props: TreeProps): TreeProps {
  const { indent = DEFAULT_INDENT, draggable = true } = props;
  return useMemo(() => {
    return {
      indent,
      draggable,
      ...props,
    }
  }, [props])
}
