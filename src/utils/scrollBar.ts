
export interface ScrollBarSize {
  width: number;
  height: number;
}

let scrollBarSize: ScrollBarSize | null = null;
export function getScrollBarSize() {
  if (!scrollBarSize) {
    const div = document.createElement('div');
    div.style.cssText = `
      position: absolute;
      left: -200px;
      top: -200px;
      width: 100px;
      height: 100px;
      box-sizing: border-box;
      background: #fff;
      overflow: scroll;
    `;

    document.body.appendChild(div);

    scrollBarSize = {
      width: div.offsetWidth - div.clientWidth,
      height: div.offsetHeight - div.clientHeight,
    }

    document.body.removeChild(div);
  }

  return scrollBarSize!;
}
