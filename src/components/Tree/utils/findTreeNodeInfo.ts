import { treeFind } from '@/utils/treeFind';
import { TreeItemInnerProps, TreeItemProps } from '../type';
import { getChildren, getKey } from '../utils';

export interface NodeInfo {
  node: TreeItemInnerProps;
  parent: TreeItemInnerProps | null;
  localIndex: number;
  position: number;
  isLast: boolean;
  level: number;
}

export interface TreeNodeInfo {
  current: NodeInfo | null;
  prev: NodeInfo | null;
  next: NodeInfo | null;
}

export function findTreeNodeInfo(treeData: TreeItemProps[], targetNode: TreeItemInnerProps, childrenName?: string, keyName?: string): TreeNodeInfo {
  let current: NodeInfo | null = null;
  let prev: NodeInfo | null = null;
  let next: NodeInfo | null = null;
  let findIndex = -1;
  let nextIndex = -1;
  treeFind(treeData, (item, index, parent, localIndex, level) => {
    item.parent = parent;
    item.level = level;
    const node = item as TreeItemInnerProps;
    const find = getKey(item, keyName) === getKey(targetNode, keyName);
    const isLast = localIndex === (parent ? getChildren(parent, childrenName)!.length - 1 : treeData.length - 1)
    if (find) {
      current = {
        node,
        parent: parent as TreeItemInnerProps,
        localIndex,
        position: index,
        isLast,
        level
      }
      findIndex = index
      nextIndex = index + 1;
    }
    if (findIndex === -1) {
      prev = {
        node,
        parent: parent as TreeItemInnerProps,
        localIndex,
        position: index,
        isLast,
        level
      }
    }
    const findNext = nextIndex === index;
    if (findNext) {
      next = {
        node,
        parent: parent as TreeItemInnerProps,
        localIndex,
        position: index,
        isLast,
        level
      }
    }
    return findNext;
  });

  return {
    current,
    prev,
    next,
  };
}

