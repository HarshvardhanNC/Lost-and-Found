import { useDispatch, useSelector } from 'react-redux';

// Typed hooks for better TypeScript support (works in JS too)
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
