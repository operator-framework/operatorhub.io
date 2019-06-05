import { combineReducers } from 'redux';
import { operatorsReducer } from './operatorsReducer';
import { viewReducer } from './viewReducer';
import { editorReducer } from './editorReducer';
import { previewReducer } from './previewReducer';
import { confirmationModalReducer } from './confirmationModalReducer';

const GET_OPERATORS = 'GET_OPERATORS';
const GET_OPERATOR = 'GET_OPERATOR';

const SET_ACTIVE_FILTERS = 'SET_ACTIVE_FILTERS';
const SET_SELECTED_CATEGORY = 'SET_SELECTED_CATEGORY';
const SET_KEYWORD_SEARCH = 'SET_KEYWORD_SEARCH';
const SET_SORT_TYPE = 'SET_SORT_TYPE';
const SET_VIEW_TYPE = 'SET_VIEW_TYPE';

const SET_URL_SEARCH_STRING = 'SET_URL_SEARCH_STRING';

const SET_EDITOR_OPERATOR = 'SET_EDITOR_OPERATOR';
const SET_EDITOR_FORM_ERRORS = 'SET_EDITOR_FORM_ERRORS';
const SET_EDITOR_SECTION_STATUS = 'SET_EDITOR_SECTION_STATUS';

const SET_EDITOR_PACKAGE = 'SET_EDITOR_PACKAGE';

const RESET_EDITOR_OPERATOR = 'RESET_EDITOR_OPERATOR';
const SET_PREVIEW_YAML = 'SET_PREVIEW_YAML';
const SET_PREVIEW_CONTENT_HEIGHT = 'SET_PREVIEW_CONTENT_HEIGHT';

const CONFIRMATION_MODAL_SHOW = 'CONFIRMATION_MODAL_SHOW';
const CONFIRMATION_MODAL_HIDE = 'CONFIRMATION_MODAL_HIDE';

const reduxConstants = {
  GET_OPERATORS,
  GET_OPERATOR,
  SET_ACTIVE_FILTERS,
  SET_SELECTED_CATEGORY,
  SET_KEYWORD_SEARCH,
  SET_SORT_TYPE,
  SET_VIEW_TYPE,
  SET_URL_SEARCH_STRING,
  SET_EDITOR_OPERATOR,
  SET_EDITOR_FORM_ERRORS,
  SET_EDITOR_SECTION_STATUS,
  SET_EDITOR_PACKAGE,
  RESET_EDITOR_OPERATOR,
  SET_PREVIEW_YAML,
  SET_PREVIEW_CONTENT_HEIGHT,
  CONFIRMATION_MODAL_SHOW,
  CONFIRMATION_MODAL_HIDE,
  GET_OLM_VERSION: 'GET_OLM_RELEASE_VERSION'
};

const reducers = {
  operatorsState: operatorsReducer,
  viewState: viewReducer,
  editorState: editorReducer,
  previewState: previewReducer,
  confirmationModal: confirmationModalReducer
};

const reduxReducers = combineReducers(reducers);

export { reduxConstants, reduxReducers, reducers };
