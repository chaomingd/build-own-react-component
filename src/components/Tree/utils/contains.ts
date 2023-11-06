import { TreeItemInnerProps } from '../type';
import { getKey } from '../utils';

export function contains(parent: TreeItemInnerProps, child: TreeItemInnerProps, keyName?: string) {
  let target: TreeItemInnerProps | null = child;
  // 去除自身
  if (getKey(target, keyName) === getKey(parent, keyName)) return false;
  while (target) {
    if (getKey(target, keyName) === getKey(parent, keyName)) return true;
    target = target.parentNode
  }
  return false;
}
