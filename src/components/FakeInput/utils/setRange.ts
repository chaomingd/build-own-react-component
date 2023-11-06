
export function setRange(
  el: Element,
  rangeData: {
    startOffset: number;
    endOffset: number;
    collapsed: boolean;
  }
) {
  const { startOffset, endOffset, collapsed } = rangeData;
  const range = document.createRange();
  if (el.firstChild) {
    range.setStart(el.firstChild!, startOffset);
    if (collapsed) {
      range.collapse(true);
    } else {
      range.setEnd(el.firstChild!, endOffset);
    }
  }

  return range;
}
