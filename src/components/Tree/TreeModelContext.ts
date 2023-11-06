import { createContext } from 'react';
import { useTreeModel } from './hooks/useTreeModel';

type ContextValue = ReturnType<typeof useTreeModel>
export const TreeModelContext = createContext({} as ContextValue);
