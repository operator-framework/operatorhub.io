export { StoreState } from './rootReducer';
export * from './constants';

export type IDispatch = (payload: {
    type: string,
    payload?: any,
    error?: any
}) => void
