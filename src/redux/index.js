import { combineReducers } from 'redux';
import { operatorsReducer } from './operatorsReducer';

const GET_OPERATORS = 'GET_OPERATORS';

const reduxConstants = { GET_OPERATORS };

const reducers = {
  operatorsState: operatorsReducer
};

const reduxReducers = combineReducers(reducers);

export { reduxConstants, reduxReducers, reducers };
