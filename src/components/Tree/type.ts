import {DragEvent, HTMLAttributes, MutableRefObject, ReactNode} from 'react';
import {NodeInfo, TreeNodeInfo} from './utils/findTreeNodeInfo';

export interface TreeItemProps {
  key?: string;
  title?: ReactNode;
  className?: string;
  htmlProps?: HTMLAttributes<HTMLDivElement>;
  children?: TreeItemProps[];
  selectable?: boolean;
  checkable?: boolean;
  [key: string]: any;
}

export interface TreeItemWithExtraData {
  parentId: string;
  id: string;
  itemData: TreeItemProps;
}

export interface TreeItemInnerProps extends TreeItemProps {
  level?: number;
  parent: TreeItemInnerProps | null;
}

export type Indent = number;

export interface TreeProps {
  openKeys?: string[];
  childrenName?: string;
  keyName?: string;
  onOpenKeysChange?: (keys: string[]) => void;
  treeData: TreeItemProps[];
  selectedKeys?: string[];
  onSelect?: (keys?: string[]) => void;
  checkedKeys?: string[];
  onCheckChange?: (keys: string[], triggerKeys: string[]) => void;
  className?: string;
  htmlProps?: HTMLAttributes<HTMLDivElement>;
  indent?: Indent;
  onDragStart?: (e: MouseEvent, dragInfo: TreeNodeInfo) => void,
  onDragMove?: (e: MouseEvent, dragInfo: TreeNodeInfo) => void,
  onDragEnter?: (e: MouseEvent, dragInfo: TreeNodeInfo, dropInfo: DropInfo | null) => void,
  onDragEnd?: (e: MouseEvent) => void,
  onDrop?: (e: MouseEvent, dropInfo: DropInfo, treeData: TreeItemProps[]) => void,
  changeDropInfo?: (dropInfo: DropInfo, detail: {
    dragNodeInfo: TreeNodeInfo;
    dropNodeInfo: TreeNodeInfo;
  }) => DropInfo | null;
  allowDrop?: (dropInfo: DropInfo) => boolean;
  draggable?: boolean | ((node: TreeItemInnerProps) => boolean);
  titleRender?: (nodeData: TreeItemInnerProps) => JSX.Element;
  onContextMenu?: (e: MouseEvent, nodeData: TreeItemInnerProps) => void;
  containerRef?: MutableRefObject<HTMLDivElement | null>;
}

export interface TreePropsContextValue {
  indent: Indent;
  draggable: boolean;
}

export enum IndicatorDir {
  up = 'up',
  down = 'down',
  same = 'same',
  outer = 'outer',
}

export interface TreeState {
  selectedKeys: string[];
  selectedKeysMap: Record<string, string>;
  checkedKeys: string[];
  checkedKeysMap: Record<string, string>;
  openKeys: string[];
  openKeysMap: Record<string, string>;
  oldOpenKeysMap: Record<string, string>;
  indicator: {
    key: string;
    dir: IndicatorDir;
    left: number;
  };
}


export interface TreeEffects {
  handleSelect: (key: string) => void;
  handleOpen: (key: string) => void;
  handleCheck: (keys: string[]) => void;
  handleCheckAll: (keys: string[], parentKey: string) => void;
  updateIndicator: (indicator: TreeState['indicator'] | null) => void;
}


export interface DragContentValue {
  onDragStart: (e: MouseEvent, dragNode: TreeItemInnerProps, node: HTMLElement) => void;
  onDragEnd: (e: MouseEvent, node: HTMLElement) => void;
  onDragEnter: (e: MouseEvent, dragNode: TreeItemInnerProps, node: HTMLElement) => void;
  onDragLeave: (e: MouseEvent, dragNode: TreeItemInnerProps, node: HTMLElement) => void;
  onDragMove: (e: MouseEvent, dragNode: TreeItemInnerProps, node: HTMLElement) => void;
  onDrop: (e: MouseEvent, dragNode: TreeItemInnerProps, node: HTMLElement) => void;
  onTreeNodeOpened: () => void;
}

export interface DropInfo {
  dragNode: TreeItemInnerProps;
  dropNode: TreeItemInnerProps | null;
  dropPosition: number;
  indicator: TreeState['indicator']
}
