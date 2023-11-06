import { createContext } from 'react';
import { TreeProps, TreePropsContextValue } from './type';

export const TreePropsContext = createContext<TreeProps>({} as TreeProps)

