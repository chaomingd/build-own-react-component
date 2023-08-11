export function plainClone(
  obj: Record<string, any> | any[] | undefined | null
) {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return [...obj];
  }
  return { ...obj };
}
