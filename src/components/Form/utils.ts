import { ensureArray } from '@/utils/array';
import { Field } from './type';

export function fieldToString(field: Field) {
  if (!field) return '';
  if (Array.isArray(field)) {
    return field.join(',')
  } else {
    return field + '';
  }
}

/**
 * makeObject 填充空对象
 * @example
 * makeObject([], [0, 'test2', 0]) 返回 -> [{ test2: [] }]
 * makeObject({}, ['test1', 'test2', 0]) 返回 -> {test: { test: [] }}
*/

export function makeObject(obj: Record<string, any> | any[] | undefined | null, field: string | number | Array<string | number>) {
  let objectValue = obj;
  field = ensureArray(field);
  if (Array.isArray(field) && field.length > 0) {
    objectValue = make(objectValue, field[0]);
    let subObj = objectValue as any;
    for (let i = 0; i < field.length - 1; i++) {
      const key = field[i];
      subObj[key] = make(subObj[key], field[i + 1])
      subObj = subObj[key];
    }
  }

  function make(obj: any, key: string | number) {
    if (!obj) {
      if (typeof key === 'number') {
        return []
      } else {
        return {}
      }
    }
    return obj;
  }
  return objectValue;
}

export function isObject(obj: any) {
  if (!obj) return false;
  return Object.prototype.toString.call(obj) === '[object Object]'
}