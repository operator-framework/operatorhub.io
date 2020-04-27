import { REJECTED_ACTION, getErrorMessageFromResults, PENDING_ACTION, FULFILLED_ACTION } from '../common/helpers';
import { reduxConstants } from './constants';
import { NormalizedOperatorPreview } from '../utils/operatorTypes';

export interface OperatorsReducersState{
  error: boolean,
  errorMessage: string
  errorResults: any
  pending: boolean
  fulfilled: boolean
  operators: any[]
  operator: NormalizedOperatorPreview
  olmVersion: string
  olmVersionUpdated: boolean
}

const initialState: OperatorsReducersState = {
  error: false,
  errorMessage: '',
  errorResults: {},
  pending: false,
  fulfilled: false,
  operators: [],
  operator: {} as any,
  olmVersion: '0.14.1',
  olmVersionUpdated: false
};

const operatorsReducer = (state: OperatorsReducersState = initialState, action) => {  
  switch (action.type) {

    case REJECTED_ACTION(reduxConstants.GET_OPERATORS):
      return {
        ...state,
        pending: false,
        error: true,
        errorMessage: getErrorMessageFromResults(action.error),
        errorResults: action.error
      };

    case PENDING_ACTION(reduxConstants.GET_OPERATORS):
      return {
        ...state,
        pending: true,
        error: false,
        errorResults: {},
        operators: []
      };

    case FULFILLED_ACTION(reduxConstants.GET_OPERATORS):
      return {
        ...state,
        operators: action.payload,
        error: false,
        errorResults: {},
        pending: false,
        fulfilled: true,
        operatorsUpdateTime: Date.now()
      };

    case FULFILLED_ACTION(reduxConstants.GET_OPERATOR):
      return {
        ...state,
        operator: action.payload,
        error: false,
        errorResults: {},
        pending: false,
        fulfilled: true
      };

    case FULFILLED_ACTION(reduxConstants.GET_OLM_VERSION):
      return {
        ...state,
        olmVersionUpdated: true,
        olmVersion: action.payload
      };

    // we use fallback version in case update fails - e.g. Github API not responding
    // no need to display error
    case REJECTED_ACTION(reduxConstants.GET_OLM_VERSION):
      return {
        ...state,
        olmVersionUpdated: true
      };

    default:
      return state;
  }
};

operatorsReducer.initialState = initialState;

export { initialState, operatorsReducer };
