import { helpers } from '../common/helpers';
import { reduxConstants } from './index';

const initialState = {
  error: false,
  errorMessage: '',
  errorResults: {},
  pending: false,
  fulfilled: false,
  operators: [],
  operatorsUpdateTime: 0,
  operator: {},
  olmVersion: '0.11.0',
  olmVersionUpdated: false
};

const operatorsReducer = (state = initialState, action) => {
  switch (action.type) {
    case helpers.REJECTED_ACTION(reduxConstants.GET_OPERATORS):
      return {
        ...state,
        pending: false,
        error: true,
        errorMessage: helpers.getErrorMessageFromResults(action.error),
        errorResults: action.error
      };

    case helpers.PENDING_ACTION(reduxConstants.GET_OPERATORS):
      return {
        ...state,
        pending: true,
        error: false,
        errorResults: {}
      };

    case helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATORS):
      return {
        ...state,
        operators: action.payload,
        error: false,
        errorResults: {},
        pending: false,
        fulfilled: true,
        operatorsUpdateTime: Date.now()
      };

    case helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATOR):
      return {
        ...state,
        operator: action.payload,
        error: false,
        errorResults: {},
        pending: false,
        fulfilled: true
      };

    case helpers.FULFILLED_ACTION(reduxConstants.GET_OLM_VERSION):
      return {
        ...state,
        olmVersionUpdated: true,
        olmVersion: action.payload
      };

    // we use fallback version in case update fails - e.g. Github API not responding
    // no need to display error
    case helpers.REJECTED_ACTION(reduxConstants.GET_OLM_VERSION):
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
