
export function ticker(timerFunc: (elapsed: number) => void) {
  let startTime = 0;
  let isStop = false;
  let frameId: number;
  const start = () => {
    if (isStop) return;
    if (!startTime) {
      startTime = +new Date();
    }
    const elapsed = +new Date() - startTime;
    timerFunc(elapsed);
    frameId = window.requestAnimationFrame(start);
  }
  const stop = () => {
    startTime = 0;
    isStop = true;
    window.cancelAnimationFrame(frameId);
  }

  return {
    start,
    stop,
  }
}
