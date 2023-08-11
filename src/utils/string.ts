
export function strLength(str: string) {
  let count = 0;
  for (let _ of str) {
    count++;
  }
  return count;
}
