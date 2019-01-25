import { combineReducers } from 'redux';
import { operatorsReducer } from './operatorsReducer';

const GET_OPERATORS = 'GET_OPERATORS';
const GET_OPERATOR = 'GET_OPERATOR';

const reduxConstants = { GET_OPERATORS, GET_OPERATOR };

const reducers = {
  operatorsState: operatorsReducer
};

const reduxReducers = combineReducers(reducers);

export { reduxConstants, reduxReducers, reducers };
