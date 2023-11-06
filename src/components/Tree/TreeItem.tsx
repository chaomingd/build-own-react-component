import {IndicatorDir, TreeItemInnerProps} from './type';
import {DRAG_KEY, TREE_PREFIX} from './const';
import classNames from 'classnames';
import {getChildren, getIndent, getKey} from './utils';
import {useContext, useMemo, useRef, useState} from 'react';
import {TreePropsContext} from './TreePropsContext';
import {TreeModelContext} from './TreeModelContext';
import Transition from '../Transition';
import {useCollapseTransition} from '@/hooks/useCollapseTransition';
import {CaretRightOutlined} from '@ant-design/icons';
import {DragContext} from './DragContext';
import {useDrag, useDrop} from '@/hooks/useDragAndDrop';
import {Checkbox} from 'antd';
import {useDragScroll} from "@/components/Tree/hooks/useDragScroll";

const prefix = `${TREE_PREFIX}-item`;

const TreeItemNode = (props: {
  treeItemProps: TreeItemInnerProps;
  leaf?: boolean;
  draggable: boolean | ((node: TreeItemInnerProps) => boolean);
  indent: number;
}) => {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const {draggable, keyName, titleRender, onContextMenu, childrenName} = useContext(TreePropsContext);
  const {leaf, treeItemProps, indent} = props;
  const {level = 0, className, title, checkable = true, selectable = true} = treeItemProps;
  const currentKey = getKey(treeItemProps, keyName);
  const treeModel = useContext(TreeModelContext);
  const {openKeysMap, indicator, checkedKeysMap, selectedKeysMap} =
    treeModel.useGetState();
  const isOpen = openKeysMap[currentKey];
  const isChecked = checkedKeysMap[currentKey] !== undefined;
  const isSelected = selectedKeysMap[currentKey] !== undefined;
  const indicatorVisible = indicator.key === currentKey;
  const children = getChildren(treeItemProps, childrenName)
  const checkAllInfo = useMemo(() => {
    if (leaf) {
      return {
        checkAll: true,
        indeterminate: false,
      }
    }
    let indeterminate = false;
    children?.forEach(item => {
      const key = getKey(item, keyName);
      const checked = !!checkedKeysMap[key];
      if (checked) {
        indeterminate = true;
      }
    })
    const checkAll = children?.every(item => {
      const key = getKey(item, keyName);
      const checked = !!checkedKeysMap[key];
      return checked;
    });
    return {
      checkAll,
      indeterminate: checkAll ? false : indeterminate,
    }
  }, [checkedKeysMap, leaf, children])
  const {
    onDragStart,
    onDragEnd,
    onDragEnter,
    onDragLeave,
    onDrop,
    onDragMove,
  } = useContext(DragContext);

  useDrag(nodeRef, {
    key: DRAG_KEY,
    onDragStart: (e, {updateDragEffect}) => {
      updateDragEffect('move');
      onDragStart(e, treeItemProps, nodeRef.current!);
    },
    onDragEnd: (e) => {
      onDrop(e, treeItemProps, nodeRef.current!);
      onDragEnd(e, nodeRef.current!);
    },
    onDragMove: (e) => {
      onDragMove(e, treeItemProps, nodeRef.current!);
    },
    allowDrag: (e) => {
      if (draggable === false) {
        return false;
      }
      if (typeof draggable === "function") {
        return draggable(treeItemProps);
      }
      return true;
    }
  });

  useDrop(nodeRef, {
    key: DRAG_KEY,
    onDragEnter: (e) => {
      onDragEnter(e, treeItemProps, nodeRef.current!);
    },
    onDragLeave: (e) => {
      onDragLeave(e, treeItemProps, nodeRef.current!);
    },
  });
  return (
    <div
      ref={nodeRef}
      className={classNames(
        className,
        prefix,
        `${prefix}-level-${level}`,
        leaf && `${prefix}-leaf`,
        isSelected && `${prefix}--selected`,
        !selectable && leaf && `${prefix}--no-select`,
        isOpen && `${prefix}--open`
      )}
      style={{
        paddingLeft: indent,
      }}
      onContextMenu={(e) => {
        onContextMenu?.(e as any, treeItemProps)
      }}
    >
      {checkable && !leaf && (
        <Checkbox
          className={`${prefix}-checkbox-parent`}
          checked={checkAllInfo.checkAll}
          indeterminate={checkAllInfo.indeterminate}
          onChange={() => {
            treeModel.getEffect('handleCheckAll')(children!.map(item => item.key) as string[], currentKey);
          }}
        />
      )}
      <div
        className={`${prefix}-switcher`}
        onClick={() => {
          if (!leaf) {
            treeModel.getEffect('handleOpen')(getKey(props.treeItemProps));
          }
        }}
      >
        {!leaf && <CaretRightOutlined/>}
      </div>
      {checkable && leaf && (
        <Checkbox
          className={`${prefix}-checkbox-item`}
          checked={isChecked}
          onChange={() => {
            treeModel.getEffect('handleCheck')([currentKey]);
          }}
        />
      )}
      <div
        className={`${prefix}-wrapper`}
        onClick={() => {
          if (!leaf) {
            treeModel.getEffect('handleOpen')(getKey(props.treeItemProps));
          }
        }}
      >
        <div
          {...(treeItemProps.htmlProps || {})}
          onClick={(e) => {
            if (selectable !== false) {
              treeModel.getEffect('handleSelect')(currentKey);
            }
            treeItemProps.htmlProps?.onClick?.(e);
          }}
          className={classNames(
            `${prefix}-title`,
            isSelected && `${prefix}-title--selected`,
            !selectable && leaf && `${prefix}-title--no-select`
          )}
        >
          {
            typeof titleRender === 'function' ?
              titleRender(treeItemProps) :
              title
          }
        </div>
        {indicatorVisible && indicator.dir !== IndicatorDir.outer && (
          <div
            className={classNames(
              `${prefix}-indicator`,
              `${prefix}-indicator--${indicator.dir}`
            )}
            style={{
              left: indicator.left,
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

const TreeItem = (props: { nodeData: TreeItemInnerProps }) => {
  const { nodeData } = props;
  const {level = 0, className} = nodeData;
  const nextLevel = level + 1;
  const {indent, draggable, childrenName, keyName} =
    useContext(TreePropsContext);
  const treeModel = useContext(TreeModelContext);
  const {openKeysMap, oldOpenKeysMap} = treeModel.useGetState();
  const children = getChildren(nodeData, childrenName);
  const currentKey = getKey(nodeData, keyName);
  const renderChildren = !!openKeysMap[currentKey];
  // console.log(renderChildren, currentKey)
  const subContainerRef = useRef<HTMLDivElement | null>(null);

  const levelIndent = getIndent(level, indent!);

  const showSubTransitionRef = useRef<boolean>(false);
  const [_, setHideSubTransition] = useState({});
  if (renderChildren) {
    showSubTransitionRef.current = true;
  }
  const {transitionProps, stylesRef} = useCollapseTransition(subContainerRef, {
    onExited: () => {
      setHideSubTransition({});
      showSubTransitionRef.current = false;
    },
    onEntered: () => {
      onTreeNodeOpened();
    },
  });

  const {onTreeNodeOpened} = useContext(DragContext);
  const { indicator } = treeModel.getState();
  const indicatorVisible = indicator.key === currentKey;
  return (
    <div className={classNames(`${prefix}-box`)}>
      {indicatorVisible && indicator.dir === IndicatorDir.outer && (
        <div
          className={classNames(
            `${prefix}-indicator`,
            `${prefix}-indicator--${IndicatorDir.down}`,
            `${prefix}-indicator--${IndicatorDir.outer}`
          )}
        ></div>
      )}
      <TreeItemNode
        draggable={draggable!}
        treeItemProps={nodeData}
        leaf={!children?.length}
        indent={levelIndent}
      />
      {showSubTransitionRef.current && children?.length! > 0 && (
        <Transition
          visible={renderChildren}
          appear={!oldOpenKeysMap[currentKey]}
          exitUnMount={false}
          duration={150}
          {...transitionProps}
          transitionName="collapse"
        >
          {(_, transitionClassName) => {
            return (
              <div
                ref={subContainerRef}
                className={transitionClassName}
                style={{
                  ...stylesRef.current,
                }}
              >
                {children?.map((childTreeItem) => {
                  return (
                    <TreeItem
                      nodeData={{
                        ...childTreeItem,
                        level: nextLevel,
                        parent: nodeData,
                      }}
                      key={getKey(childTreeItem, keyName)}
                    />
                  );
                })}
              </div>
            );
          }}
        </Transition>
      )}
    </div>
  );
};

TreeItem.defaultProps = {
  level: 0,
};

export default TreeItem;
