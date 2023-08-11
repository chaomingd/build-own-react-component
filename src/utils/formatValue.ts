
export function formatValue(val: any, placeholder = '--') {
  return (val !== undefined && val !== null) ? val : placeholder;
}
