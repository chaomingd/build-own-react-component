import TreeItem from './TreeItem';
import { TreeProps, TreeItemProps } from './type';
import classNames from 'classnames';
import { getKey } from './utils';
import { TreePropsContext } from './TreePropsContext';
import { TreeModelContext } from './TreeModelContext';
import { useTreePropsContextValue } from './hooks/useTreePropsContextValue';
import { DragContext } from './DragContext';
import './index.less';
import '@/animation/animation.less';
import { useTreeModel } from './hooks/useTreeModel';
import { useNodeDrag } from './hooks/useNodeDrag';
import {useRef} from "react";

const Tree = (props: TreeProps) => {
  const {
    className,
    treeData = [],
    htmlProps = {},
    keyName,
    containerRef,
  } = props;
  const treeContainerRef = useRef<HTMLDivElement | null>(null);
  const treePropsContextValue = useTreePropsContextValue(props);

  const treeModel = useTreeModel(props);
  treeModel.useGetState();

  const dragContextValue = useNodeDrag({
    treeModel,
    treeProps: treePropsContextValue,
    treeContainerRef,
  });
  return (
    <TreeModelContext.Provider value={treeModel}>
      <TreePropsContext.Provider value={treePropsContextValue}>
        <DragContext.Provider value={dragContextValue}>
          <div
            ref={(el) => {
              if (containerRef) {
                containerRef.current = el
              }
              treeContainerRef.current = el;
            }}
            className={classNames('sh-tree', className)}
            {...htmlProps}
          >
            {treeData.map((treeItem: TreeItemProps) => {
              return (
                <TreeItem
                  nodeData={{
                    ...treeItem,
                    parent: null,
                    level: 0,
                  }}
                  key={getKey(treeItem, keyName)}
                />
              );
            })}
          </div>
        </DragContext.Provider>
      </TreePropsContext.Provider>
    </TreeModelContext.Provider>
  );
};

export default Tree;
