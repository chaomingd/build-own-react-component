import { treeForEach } from './treeForEach';

export function treeToMap<T extends any = any, K extends string | number | symbol = string, V extends any = T>(treeData: T[], getKey: (item: T) => K, getValue?: (item: T) => V) {
  const res = {} as Record<K, V>;
  treeForEach(treeData, item => {
    res[getKey(item)] = getValue ? getValue(item) : (item as unknown as V);
  })
  return res;
}
