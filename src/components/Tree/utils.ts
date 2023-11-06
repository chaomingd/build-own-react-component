import { Indent, TreeItemProps, TreeItemWithExtraData } from './type';

export function getKey(treeItem: TreeItemProps, keyName?: string) {
  if (!treeItem) return '';
  if (keyName) {
    return treeItem[keyName]
  }
  return treeItem.key;
}

export function getChildren(treeItem: TreeItemProps, childrenName?: string): TreeItemProps['children'] {
  if (childrenName) {
    return treeItem[childrenName]
  }

  return treeItem.children;
}

export function getLevelIndent(level: number, indent: Indent) {
  return level ? indent : 0
}

export function getIndent(level: number, indent: Indent) {
  return level ? (level * indent) : 0
}

