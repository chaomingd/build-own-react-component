import { useLatest } from '@/hooks/useLatest';
import { useUnMount } from '@/hooks/useUnMount';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  getPopupContainer?: () => HTMLElement;
  children?: ReactNode;
  onMount?: (container: HTMLElement) => void;
  onUnMount?: (container: HTMLElement | null) => void;
}

const Portal = ({ getPopupContainer, children, onMount, onUnMount }: PortalProps) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const containerRef = useLatest(container);
  const onMountRef = useLatest(onMount)

  useEffect(() => {
    if (getPopupContainer) {
      const containerFromProps = getPopupContainer();
      if (containerFromProps && containerFromProps !== containerRef.current) {
        setContainer(containerFromProps);
      }
    } else {
      if (containerRef.current !== document.body) {
        setContainer(document.body);
      }
    }
  });


  useEffect(() => {
    if (container) {
      onMountRef.current?.(container);
    }
  }, [container])


  useUnMount(() => {
    onUnMount?.(container);
  })

  if (!container) return null;

  return createPortal(children, container);
};

export default Portal;
