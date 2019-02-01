import { combineReducers } from 'redux';
import { operatorsReducer } from './operatorsReducer';
import { viewReducer } from './viewReducer';

const GET_OPERATORS = 'GET_OPERATORS';
const GET_OPERATOR = 'GET_OPERATOR';

const SET_ACTIVE_FILTERS = 'SET_ACTIVE_FILTERS';
const SET_KEYWORD_SEARCH = 'SET_KEYWORD_SEARCH';
const SET_SORT_TYPE = 'SET_SORT_TYPE';
const SET_VIEW_TYPE = 'SET_VIEW_TYPE';

const reduxConstants = {
  GET_OPERATORS,
  GET_OPERATOR,
  SET_ACTIVE_FILTERS,
  SET_KEYWORD_SEARCH,
  SET_SORT_TYPE,
  SET_VIEW_TYPE
};

const reducers = {
  operatorsState: operatorsReducer,
  viewState: viewReducer
};

const reduxReducers = combineReducers(reducers);

export { reduxConstants, reduxReducers, reducers };
