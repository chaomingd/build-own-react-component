// 在数组中使用 keys 搜索
export function findItemInArrWithKeys<T = any>(arr: Array<Record<string, any>>, keys: string[], key = 'key') {
  const map: Record<string, any> = {};
  const result: T[] = [];
  if (!arr || !arr.length) return result;
  arr.forEach((item) => {
    map[item[key]] = item;
  });
  keys.forEach((key) => {
    if (map[key]) {
      result.push(map[key]);
    }
  });
  return result;
}

// 数组转对象
export function arrayToMap<T = any, GetValue extends (item: T) => any = () => T>(
  arr: T[],
  getKey?: (item: T) => string,
  getValue?: GetValue) {
  const map: Record<string, ReturnType<GetValue>> = {};
  const _getValue = getValue || ((item: T) => item);
  const _getKey = getKey || ((item) => item);
  if (!arr) return map;
  arr.forEach((item) => {
    map[_getKey(item) as string] = _getValue(item);
  });
  return map;
}

interface IDuplicateRemovalOptions {
  cover?: boolean;
}
// 去重
export function duplicateRemoval<T = any>(
  arr: T[],
  getKey?: (item: T) => string | number,
  options: IDuplicateRemovalOptions = {},
) {
  if (!getKey) {
    getKey = (key) => key as string;
  }
  const map: Record<string, T> = {};
  const res: T[] = [];
  const firstItemMap: Record<string, T> = {};
  const keys: Array<string | number> = [];
  arr.forEach((item) => {
    const key = getKey!(item);
    if (!map[key]) {
      if (!options.cover) {
        res.push(item);
      } else {
        keys.push(key);
        firstItemMap[key] = item;
      }
      map[key] = item;
    } else if (options.cover) {
      map[key] = item;
    }
  });
  if (options.cover) {
    return keys.map((key) => ({ firstItem: firstItemMap[key], data: map[key] }));
  }
  return res;
}

// 分组
export function groupBy<T = any>(arr: T[], getKey: (item: T) => string | number) {
  const map: Record<string, T[]> = {};
  const keys: Array<string | number> = [];
  arr.forEach((item) => {
    const key = getKey(item);
    if (!map[key]) {
      map[key] = [item];
      keys.push(key);
    } else {
      map[key].push(item);
    }
  });
  return {
    keys,
    map,
  };
}

/**
 * [0 0 0 0 0 0 0 0]
 * [1 0 0 1 1 0 0 1 0]
 * [
 *  { start: 0, end: 0 },
 *  { start: 3, end: 4 },
 *  { start: 7, end: 8 }
 * ]
 * */

type TInterator<T = any> = (item: T, index: number, arr: T[]) => any;
export function forEach<T = any>(arr: T[], interator: TInterator<T>, options?: { start?: number; end?: number }) {
  let start = 0;
  let end = arr.length;
  if (options) {
    start = Math.max(options.start || 0, 0);
    end = Math.min(options.end || arr.length, arr.length);
  }
  for (let i = start; i < end; i++) {
    interator(arr[i], i, arr);
  }
}

export function arrayFill<Item = any>(len: number, fillFn: (index: number) => Item) {
  const res: Item[] = [];
  for (let i = 0; i < len; i++) {
    res.push(fillFn(i));
  }
  return res;
}

export function isSameArr<T1 extends any, T2 extends any>(arr1?: T1[], arr2?: T2[], equalityFn?: (item1: T1, item2: T2) => boolean) {
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  // @ts-ignore ...
  equalityFn = equalityFn || ((item1, item2) => item1 === item2);
  for (let i = 0; i < arr1.length; i++) {
    // @ts-ignore ...
    if (!equalityFn(arr1[i], arr2[i])) return false;
  }
  return true;
}

export function ensureArray<T extends any>(obj: T | T[]) {
  if (Array.isArray(obj)) {
    return obj as T[];
  }
  return [obj] as T[];
}
