import { useLatest } from '@/hooks/useLatest';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  getPopupContainer?: () => HTMLElement;
  children?: ReactNode;
}

const Portal = ({ getPopupContainer, children }: PortalProps) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const containerRef = useLatest(container);

  useEffect(() => {
    if (getPopupContainer) {
      const containerFromProps = getPopupContainer();
      if (containerFromProps && containerFromProps !== containerRef.current) {
        setContainer(containerFromProps);
      }
    } else {
      if (containerRef.current !== document.body) {
        containerRef.current = document.body;
        setContainer(document.body);
      }
    }
  }, [getPopupContainer]);

  if (!container) return null;

  return createPortal(children, container);
};

export default Portal;
