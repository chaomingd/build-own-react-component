
export function makePromiseTimeoutFinally(promise: Promise<any>, func: Function, wait: number) {
  const startTime = +new Date();
  let timer
  promise.finally(() => {
    const currentTime = +new Date();
    const duration = currentTime - startTime;
    if (duration < wait) {
      timer = setTimeout(() => {
        func();
      }, wait - duration)
    } else {
      func();
    }
  })
  return () => {
    clearTimeout(timer);
  }
}
