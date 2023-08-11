
export function addNumberSign(v: number, precision = 1) {
  if (isNaN(v)) return '0';
  if (!v) return '0';
  if (v > 0) {
    return `+${v.toFixed(precision)}`;
  }
  return `${v.toFixed(precision)}`;
}

export function formatKm(n: number) {
  if (n < 10000) return `${n}`;
  return (n / 10000).toFixed(2) + '万';
}

export function toFixed(n: any, precision: number) {
  const v = +n || 0;
  return v.toFixed(precision);
}
