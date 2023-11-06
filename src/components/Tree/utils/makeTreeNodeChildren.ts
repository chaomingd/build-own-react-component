import { TreeItemProps } from '../type';

export function makeTreeNodeChildren(treeNode: TreeItemProps, childrenName?: string) {
  const childName = childrenName || 'children';
  if (!treeNode[childName]) {
    treeNode[childName] = []
  }
}
