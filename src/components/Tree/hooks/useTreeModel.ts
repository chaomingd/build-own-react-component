import { Model, useModel } from '@/hooks/react-store/useModel';
import { TreeState, TreeProps, TreeEffects, IndicatorDir } from '../type';
import { useMemo } from 'react';
import { arrayToMap } from '@/utils/array';
import { isSameObject } from '@/utils/object';

export function useTreeModel(props: TreeProps) {
  const hasSelectedKeys = 'selectedKeys' in props;
  const hasCheckedKeys = 'checkedKeys' in props;
  const hasOpenKeys = 'openKeys' in props;
  const model: Model<TreeState, TreeEffects> = useModel<TreeState, TreeEffects>({
    state: {
      selectedKeys: [],
      selectedKeysMap: {},
      checkedKeys: [],
      checkedKeysMap: {},
      openKeys: [],
      openKeysMap: {},
      oldOpenKeysMap: {},
      indicator: {
        key: '',
        dir: IndicatorDir.up,
        left: 0,
      },
    },
    computed: [
      {
        keys: ['openKeys'],
        handler: ({ openKeys }, _, prevState) => {
          const openKeysMap = arrayToMap(openKeys)
          return {
            openKeysMap,
            oldOpenKeysMap: prevState.openKeysMap,
          };
        },
      },
      {
        keys: ['checkedKeys'],
        handler: ({ checkedKeys }) => {
          const checkedKeysMap = arrayToMap(checkedKeys)
          return {
            checkedKeysMap,
          };
        },
      },
      {
        keys: ['selectedKeys'],
        handler: ({ selectedKeys }) => {
          return {
            selectedKeysMap: arrayToMap(selectedKeys),
          };
        },
      },
    ],
    effects: {
      handleOpen: (key: string) => {
        const { openKeys } = model.getState();
        const newOpenKeys = [ ...openKeys ];
        const index = newOpenKeys.indexOf(key);
        if (index >= 0) {
          newOpenKeys.splice(index, 1);
        } else {
          newOpenKeys.push(key)
        }
        if (!hasOpenKeys) {
          model.setState({
            openKeys: newOpenKeys,
          });
        }
        props.onOpenKeysChange?.(newOpenKeys)
      },
      handleSelect(key) {
        if (!hasSelectedKeys) {
          model.setState({
            selectedKeys: [key]
          })
        }
        props.onSelect?.([key]);
      },
      handleCheck: (keys) => {
        const { checkedKeys } = model.getState();
        const newCheckedKeys = [...checkedKeys];
        keys.forEach(key => {
          const index = checkedKeys.indexOf(key);
          if (index === -1) {
            newCheckedKeys.push(key)
          } else {
            newCheckedKeys.splice(index, 1);
          }
        })
        if (!hasCheckedKeys) {
          model.setState({
            checkedKeys: newCheckedKeys,
          })
        }
        props.onCheckChange?.(newCheckedKeys, keys);
      },
      handleCheckAll: (keys: string[], parentKey: string) => {
        const { checkedKeysMap, checkedKeys } = model.getState();
        const isCheckAll = keys.every(key => checkedKeysMap[key]);
        let newCheckedKeys: string[];
        if (isCheckAll) {
          newCheckedKeys = checkedKeys.filter(key => !keys.includes(key) && key !== parentKey);
        } else {
          newCheckedKeys = [...new Set([...checkedKeys, ...keys, parentKey])];
        }

        if (!hasCheckedKeys) {
          model.setState({
            checkedKeys: newCheckedKeys,
          })
        }
        props.onCheckChange?.(newCheckedKeys, keys);
      },
      updateIndicator: (indicator) => {
        if (!indicator) {
          indicator = {
            key: '',
            dir: IndicatorDir.up,
            left: 0,
          }
        }
        if (!isSameObject(model.getState().indicator, indicator)) {
          model.setState({
            indicator,
          })
        }
      }
    },
  });



  // selectedKeys in control mode
  useMemo(() => {
    if (hasSelectedKeys) {
      model.setState(
        {
          selectedKeys: props.selectedKeys!,
        },
        {
          silent: true,
        }
      );
    }
  }, [props.selectedKeys]);

  // checkedKeys in control mode
  useMemo(() => {
    if (hasCheckedKeys) {
      model.setState(
        {
          checkedKeys: props.checkedKeys,
        },
        {
          silent: true,
        }
      );
    }
  }, [props.checkedKeys]);

  // openKeys in control mode
  useMemo(() => {
    if (hasOpenKeys) {
      model.setState(
        {
          openKeys: props.openKeys,
        },
        {
          silent: true,
        }
      );
    }
  }, [props.openKeys]);

  return model;
}
