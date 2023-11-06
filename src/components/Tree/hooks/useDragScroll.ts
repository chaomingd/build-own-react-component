import {MutableRefObject, useRef} from "react";
import {useMemoizedFn, useUnmount} from "ahooks";
import {ticker} from "@/utils/ticker";
import {getScrollContainer, getScrollTop, scrollTo} from "@/utils/dom";

interface Config {
  treeContainerRef: MutableRefObject<HTMLElement | null>;
  top?: number;
  bottom?: number;
}

const DRAG_SCROLL_THRESHOLD = 30

const START_SCROLL_TIME = 800;

export function useDragScroll({ treeContainerRef, top, bottom }: Config) {
  const startScrollTimerRef = useRef<any>();
  const startDirectionRef = useRef<'up' | 'down' | ''>('')
  const tickerRef = useRef<ReturnType<typeof ticker> | null>(null);
  const clearScrollEffect = () => {
    if (startScrollTimerRef.current) {
      clearTimeout(startScrollTimerRef.current);
      tickerRef.current?.stop();
      startScrollTimerRef.current = undefined
    }
  }


  const handleScrollSmooth = (dir: 'down' | 'up') => {
    const scrollContainer = getScrollContainer(treeContainerRef.current!);
    const startScrollY = getScrollTop(scrollContainer!)
    const speed = 200;
    const dirNumber = dir === 'down' ? 1 : -1;
    tickerRef.current = ticker((elapsed) => {
      scrollTo(scrollContainer!, {
        top: (startScrollY + elapsed / 1000 * speed * dirNumber) | 0
      })
    });
    tickerRef.current.start();
  }

  const handleScroll = (dir: 'down' | 'up') => {
    if (startDirectionRef.current === dir) return;
    startDirectionRef.current = dir
    clearScrollEffect();
    startScrollTimerRef.current = setTimeout(() => {
      if (dir === 'down') {
        if (treeContainerRef.current!.getBoundingClientRect().bottom < window.innerHeight) return;
        handleScrollSmooth(dir)
      } else if (dir === 'up') {
        if (treeContainerRef.current!.getBoundingClientRect().top >= 0) return;
        handleScrollSmooth(dir)
      }
    }, START_SCROLL_TIME)
  }
  const handleDragScroll = useMemoizedFn((e: MouseEvent) => {
    if (!treeContainerRef.current) return;
    const thresholdTop = top ? top : DRAG_SCROLL_THRESHOLD;
    const thresholdBottom = bottom ? bottom : window.innerHeight - DRAG_SCROLL_THRESHOLD
    if (e.clientY <= thresholdTop) {
      // up
      handleScroll('up')
    } else if (e.clientY >= thresholdBottom) {
      // down
      handleScroll('down')
    } else {
      clearScrollEffect();
    }
  })


  useUnmount(() => {
    clearScrollEffect();
  })
  return {
    handleDragScroll,
  }
}
