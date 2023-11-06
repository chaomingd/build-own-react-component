import {MutableRefObject, useRef} from 'react';
import {DropInfo, IndicatorDir, TreeItemInnerProps, TreeProps} from '../type';
import {useLatest, useMemoizedFn, useUnmount} from 'ahooks'
import {DRAG_ENTERED_OPEN_TIMER, DRAG_TO_NEXT_LEVEL_DISTANCE,} from '../const';
import {useTreeModel} from './useTreeModel';
import {getChildren, getKey} from '../utils';
import {findTreeNodeInfo, TreeNodeInfo} from '../utils/findTreeNodeInfo';
import {contains} from '../utils/contains';
import {makeTreeNodeChildren} from '../utils/makeTreeNodeChildren';
import {useDragScroll} from "@/components/Tree/hooks/useDragScroll";

interface IConfig {
  treeModel: ReturnType<typeof useTreeModel>;
  treeProps: TreeProps;
  treeContainerRef: MutableRefObject<HTMLElement | null>;
}
export function useNodeDrag({ treeModel, treeProps, treeContainerRef }: IConfig) {
  const { keyName, childrenName } = treeProps;
  const { handleDragScroll } = useDragScroll({
    treeContainerRef
  })
  const dragMetaRef = useRef<{
    dragInfo: TreeNodeInfo;
    dropInfo: DropInfo | null;
    enterInfo: TreeNodeInfo | null;
    dragNode: TreeItemInnerProps;
    dragDir: IndicatorDir;
    enterClientPosition: {
      x: number;
      y: number;
    };
    mousePosition: {
      x: number;
      y: number;
    };
  } | null>(null);
  const treePropsRef = useLatest(treeProps);
  const openTimerRef = useRef<any>();
  const clearOpenTimer = () => {
    clearTimeout(openTimerRef.current);
  };
  useUnmount(() => {
    clearOpenTimer();
  });
  const onDragStart = useMemoizedFn(
    (e: MouseEvent, dragNode: TreeItemInnerProps, dom: HTMLElement) => {
      clearOpenTimer();
      const dragInfo = findTreeNodeInfo(
        treePropsRef.current.treeData,
        dragNode,
        childrenName,
        keyName,
      );
      dragMetaRef.current = {
        dragNode,
        enterInfo: dragInfo,
        dragInfo,
        enterClientPosition: {
          x: 0,
          y: 0,
        },
        mousePosition: {
          x: 0,
          y: 0,
        },
        dragDir: IndicatorDir.down,
        dropInfo: null,
      };
      const { openKeysMap } = treeModel.getState();
      const key = getKey(dragNode, keyName);
      if (openKeysMap[key]) {
        treeModel.getEffect('handleOpen')(key);
      }
      treePropsRef.current.onDragStart?.(e, dragMetaRef.current.dragInfo);
    }
  );

  const onDragEnd = useMemoizedFn((e: MouseEvent) => {
    clearOpenTimer();
    treePropsRef.current.onDragEnd?.(e);
    dragMetaRef.current = null;
    treeModel.getEffect('updateIndicator')(null)
  });

  const getNextIndicatorInfo = (enterNode: TreeItemInnerProps) => {
    const key = getKey(enterNode, keyName);
    const { indent } = treePropsRef.current;
    return {
      key,
      dir: IndicatorDir.down,
      left: indent!,
    };
  };

  const getPreIndicatorInfo = (
    enterNode: TreeItemInnerProps,
    dir: IndicatorDir
  ) => {
    const key = getKey(enterNode, keyName);
    const { indent } = treePropsRef.current;
    return {
      key,
      dir,
      left: -indent!,
    };
  };
  const getIndicatorInfo = (
    enterNode: TreeItemInnerProps,
    dir: IndicatorDir
  ) => {
    const key = getKey(enterNode, keyName);
    return {
      key,
      dir,
      left: 0,
    };
  };

  const dragToNextLevel = ({
    dragDir,
    dragNode,
    enterNode,
    enterNodeDragDistance,
    enterInfo,
    dragSelf,
  }: {
    enterInfo: TreeNodeInfo;
    enterNodeDragDistance: number;
    dragDir: 1 | -1;
    enterNode: TreeItemInnerProps;
    dragNode: TreeItemInnerProps;
    dragSelf?: boolean;
  }): DropInfo | null => {
    const { current, prev } = enterInfo;
    if (Math.abs(enterNodeDragDistance) > DRAG_TO_NEXT_LEVEL_DISTANCE) {
      let dropNode = enterNode;
      let indicator = getNextIndicatorInfo(enterNode);
      let dropPosition = -1;
      if (dragDir === 1) {
        // 拖拽到下一级
        if (dragSelf) {
          if (prev) {
            dropNode = prev.node;
            if (enterNode.level! < dropNode.level!) {
              indicator = getIndicatorInfo(dropNode, IndicatorDir.down);
              dropPosition = prev.localIndex;
            } else {
              indicator = getNextIndicatorInfo(dropNode);
            }
          }
        }
        return {
          dragNode,
          dropNode,
          dropPosition,
          indicator,
        };
      }
      // 拖拽到上一级
      // console.log('上一级', current)
      if (current!.isLast && current!.parent) {
        const parent = enterNode.parent;
        let dropPosition = -1;
        let indicator = getPreIndicatorInfo(enterNode, IndicatorDir.down);
        if (parent) {
          const parentInfo = findTreeNodeInfo(
            treePropsRef.current.treeData!,
            parent,
            childrenName,
            keyName,
          );
          if (parentInfo.current) {
            dropPosition = parentInfo.current.localIndex;
            indicator = {
              key: getKey(parent, keyName),
              dir: IndicatorDir.outer,
              left: 0,
            }
          }
        }
        return {
          dragNode,
          dropNode: parent,
          dropPosition,
          indicator,
        };
      }
    }
    return null;
  };

  const dragToPosition = (
    enterNode: TreeItemInnerProps,
    enterInfo: TreeNodeInfo
  ): DropInfo | null => {
    const key = getKey(enterNode, keyName);
    const children = getChildren(enterNode, childrenName);
    const { openKeysMap } = treeModel.getState();
    const { current, prev } = enterInfo;
    // 进入节点后横向位移
    const enterNodeDragDistance =
      dragMetaRef.current!.mousePosition.x -
      dragMetaRef.current!.enterClientPosition.x;
    const dragDir = enterNodeDragDistance > 0 ? 1 : -1;
    const isOpen = openKeysMap[key];
    const hasChildren = !!children?.length;
    const { dragNode } = dragMetaRef.current!;
    if (getKey(dragNode, keyName) === getKey(enterNode, keyName)) {
      const nextLevelDropInfo = dragToNextLevel({
        dragDir,
        dragNode,
        enterInfo,
        enterNode,
        enterNodeDragDistance,
        dragSelf: true,
      });
      return nextLevelDropInfo;
    }
    if (hasChildren) {
      if (isOpen) {
        // 拖动到第一个子节点
        const firstChildren = getChildren(enterNode, childrenName)![0];
        return {
          dragNode,
          dropNode: enterNode,
          dropPosition: -1,
          indicator: getIndicatorInfo(firstChildren as TreeItemInnerProps, IndicatorDir.up),
        };
      }
      return {
        dragNode,
        dropNode: enterNode,
        dropPosition: current!.localIndex,
        indicator: getIndicatorInfo(enterNode, IndicatorDir.down),
      };
    } else {
      const nextLevelDropInfo = dragToNextLevel({
        dragDir,
        dragNode,
        enterInfo,
        enterNode,
        enterNodeDragDistance,
      });
      if (nextLevelDropInfo) return nextLevelDropInfo;
      return {
        dragNode,
        dropNode: enterNode,
        dropPosition: current!.localIndex,
        indicator: getIndicatorInfo(enterNode, IndicatorDir.down),
      };
    }
  };

  const updateIndicator = (
    enterNode: TreeItemInnerProps,
    prevEnterInfo?: TreeNodeInfo
  ): DropInfo | null => {
    let dropInfo = _updateIndicator(enterNode, prevEnterInfo);
    let canDrop = true;
    if (dropInfo) {
      if (treePropsRef.current.changeDropInfo) {
        // 更新dropInfo
        const changedDropInfo = treePropsRef.current.changeDropInfo(dropInfo, {
          dragNodeInfo: findTreeNodeInfo(
            treePropsRef.current.treeData,
            dragMetaRef.current!.dragNode,
            childrenName,
            keyName,
          ),
          dropNodeInfo: findTreeNodeInfo(
            treePropsRef.current.treeData,
            dropInfo.dropNode!,
            childrenName,
            keyName
          )
        });
        if (changedDropInfo) {
          dropInfo = changedDropInfo;
        }
      }
      if (treePropsRef.current.allowDrop) {
        canDrop = treePropsRef.current.allowDrop?.(dropInfo)
      }

      if (!canDrop) {
        dragMetaRef.current!.dropInfo = null;
        treeModel.getEffect('updateIndicator')(null)
        return null;
      }
    }
    dragMetaRef.current!.dropInfo = dropInfo;
    // console.log(dropInfo)
    treeModel.getEffect('updateIndicator')(dropInfo?.indicator || null)
    return dropInfo;
  };

  const _updateIndicator = (
    enterNode: TreeItemInnerProps,
    prevEnterInfo?: TreeNodeInfo
  ): DropInfo | null => {
    const { openKeysMap } = treeModel.getState();
    const enterInfo =
      prevEnterInfo ||
      findTreeNodeInfo(treePropsRef.current.treeData!, enterNode, childrenName, keyName,);
    const { current, prev } = enterInfo;
    const { dragNode, dragInfo } = dragMetaRef.current!;
    if (contains(dragNode, enterNode)) {
      return null;
    }
    dragMetaRef.current!.enterInfo = enterInfo;
    if (current)
      if (current!.position > dragInfo.current!.position) {
        // 向下拖拽
        dragMetaRef.current!.dragDir = IndicatorDir.down;
        return dragToPosition(enterNode, enterInfo);
      }
    if (current!.position === dragInfo.current!.position) {
      // 平级
      dragMetaRef.current!.dragDir = IndicatorDir.same;
      return dragToPosition(enterNode, enterInfo);
    }
    dragMetaRef.current!.dragDir = IndicatorDir.up;
    // 向上拖拽
    if (prev) {
      const preParentKey = getKey(prev.parent!, keyName);
      const isPrevOpen = !!openKeysMap[preParentKey];
      if (prev.parent && isPrevOpen) {
        // console.trace()
        return dragToPosition(
          prev.node,
          findTreeNodeInfo(
            treePropsRef.current.treeData,
            prev.node,
            childrenName,
            keyName,
          )
        );
      }

      // treeModel.setState({
      //   indicator: getIndicatorInfo(enterNode, IndicatorDir.up),
      // });
      // return {
      //   dragNode,
      //   dropNode: enterNode,
      //   dropPosition: current!.localIndex + 1,
      // };
      if (prev.parent) {
        return dragToPosition(
          prev.parent,
          findTreeNodeInfo(treePropsRef.current.treeData, prev.node, childrenName, keyName)
        );
      }
      return dragToPosition(
        prev.node,
        findTreeNodeInfo(treePropsRef.current.treeData, prev.node, childrenName, keyName)
      );
    }
    return {
      dragNode,
      dropNode: enterNode,
      dropPosition: -2,
      indicator: getIndicatorInfo(enterNode, IndicatorDir.up),
    };
  };

  const onDragEnter = useMemoizedFn(
    (e: MouseEvent, enterNode: TreeItemInnerProps, node: HTMLElement) => {
      dragMetaRef.current!.enterClientPosition = {
        x: e.clientX,
        y: e.clientY,
      };
      dragMetaRef.current!.mousePosition = {
        x: e.clientX,
        y: e.clientY,
      };
      const { dragNode } = dragMetaRef.current!;
      clearOpenTimer();
      const { openKeysMap } = treeModel.getState();
      const key = getKey(enterNode, keyName);
      if (
        enterNode.children?.length &&
        !openKeysMap[key] &&
        getKey(dragNode, keyName) !== getKey(enterNode, keyName)
      ) {
        // 自动打开当前节点
        openTimerRef.current = setTimeout(() => {
          treeModel.getEffect('handleOpen')(key);
        }, DRAG_ENTERED_OPEN_TIMER);
      }
      const dropInfo = updateIndicator(enterNode);
      treePropsRef.current?.onDragEnter?.(
        e,
        dragMetaRef.current!.enterInfo!,
        dropInfo
      );
      return dropInfo;
    }
  );

  const onTreeNodeOpened = useMemoizedFn(() => {
    if (dragMetaRef.current && dragMetaRef.current.enterInfo) {
      updateIndicator(
        dragMetaRef.current.enterInfo!.current!.node,
        dragMetaRef.current.enterInfo
      );
    }
  });

  const onDragMove = useMemoizedFn((e: MouseEvent) => {
    dragMetaRef.current!.mousePosition = {
      x: e.clientX,
      y: e.clientY,
    };
    if (dragMetaRef.current && dragMetaRef.current.enterInfo) {
      updateIndicator(
        dragMetaRef.current.enterInfo!.current!.node,
        dragMetaRef.current.enterInfo
      );
    }

    // 托拽滚动
    handleDragScroll(e);
  });

  const onDragLeave = useMemoizedFn(
    (e: MouseEvent, treeNode: TreeItemInnerProps) => {
      const key = getKey(treeNode, keyName);
      if (treeModel.getState().indicator === key) {
        clearOpenTimer();
        treeModel.getEffect('updateIndicator')(null)
      }
    }
  );

  const onDrop = useMemoizedFn(
    (e: MouseEvent, treeNode: TreeItemInnerProps, node: HTMLElement) => {
      clearOpenTimer();
      let dropInfo = dragMetaRef.current?.dropInfo;
      // console.log(dropInfo);
      if (dropInfo) {
        const { openKeysMap } = treeModel.getState();
        let { dropNode, dragNode, dropPosition } = dropInfo;
        if (dropNode && getKey(dragNode, keyName) === getKey(dropNode, keyName))
          return;
        const newTreeData = [...treePropsRef.current.treeData];
        const dragNodeInfo = findTreeNodeInfo(
          newTreeData,
          dragMetaRef.current!.dragNode,
          childrenName,
          keyName,
        );
        const dropNodeInfo = findTreeNodeInfo(newTreeData, dropNode!, childrenName, keyName);
        dropNode = dropNodeInfo.current!.node;
        const dragChildren = dragNodeInfo.current!.parent
          ? getChildren(dragNodeInfo.current!.parent, childrenName)
          : newTreeData;
        const enterChildren = dropNode?.parent
          ? getChildren(dropNode!.parent!, childrenName)
          : newTreeData;
        dragChildren!.splice(dragNodeInfo.current!.localIndex, 1);
        if (dropPosition === -1) {
          if (dropNode) {
            makeTreeNodeChildren(dropNode, childrenName);
            getChildren(dropNode, childrenName)!.unshift(
              dragNodeInfo.current!.node
            );
            if (!openKeysMap[getKey(dropNode, keyName)]) {
              treeModel.getEffect('handleOpen')(getKey(dropNode, keyName));
            }
          } else {
            enterChildren!.unshift(dragNodeInfo.current!.node);
          }
        } else if (dropPosition === -2) {
          enterChildren!.unshift(dragNodeInfo.current!.node);
        } else {
          const dropIndex = enterChildren!.findIndex(item => getKey(item, keyName) === getKey(dropNode!, keyName))
          console.log(dropIndex);
          enterChildren!.splice(dropIndex + 1, 0, dragNodeInfo.current!.node);
        }
        treePropsRef.current?.onDrop?.(e, {
          dragNode: dragNodeInfo.current!.node,
          dropNode,
          dropPosition,
        } as any, newTreeData);
      }
    }
  );

  return {
    onDragStart,
    onDragEnd,
    onDragEnter,
    onDragLeave,
    onDrop,
    onDragMove,
    onTreeNodeOpened,
  };
}
