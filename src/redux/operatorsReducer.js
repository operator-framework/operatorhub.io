import { helpers } from '../common/helpers';
import { reduxConstants } from './index';

const initialState = {
  error: false,
  errorMessage: '',
  pending: false,
  fulfilled: false,
  operators: []
};

const operatorsReducer = (state = initialState, action) => {
  switch (action.type) {
    case helpers.REJECTED_ACTION(reduxConstants.GET_OPERATORS):
      console.dir(action);
      return Object.assign({}, state, {
        pending: false,
        error: true,
        errorMessage: helpers.getErrorMessageFromResults(action.error)
      });

    case helpers.PENDING_ACTION(reduxConstants.GET_OPERATORS):
      return Object.assign({}, state, {
        pending: true,
        error: false,
        operators: []
      });

    case helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATORS):
      return Object.assign({}, state, {
        operators: action.payload,
        error: false,
        pending: false,
        fulfilled: true
      });

    default:
      return state;
  }
};

operatorsReducer.initialState = initialState;

export { initialState, operatorsReducer };
