import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// useDispatch tipi ayarı
export const useAppDispatch = () => useDispatch<AppDispatch>();

// useSelector tipi ayarı
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
