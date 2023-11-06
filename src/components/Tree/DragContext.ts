import { createContext } from 'react';
import { DragContentValue } from './type';

export const DragContext = createContext<DragContentValue>({} as DragContentValue);
