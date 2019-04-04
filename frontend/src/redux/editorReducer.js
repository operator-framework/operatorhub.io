import { reduxConstants } from './index';

const initialState = {
  operator: {},
  yaml: '',
  formErrors: {},
  yamlChanged: false,
  mode: 'form'
};

const editorReducer = (state = initialState, action) => {
  switch (action.type) {
    case reduxConstants.SET_EDITOR_MODE:
      return Object.assign({}, state, {
        mode: action.mode
      });
    case reduxConstants.SET_EDITOR_OPERATOR:
      return Object.assign({}, state, {
        operator: action.operator
      });
    case reduxConstants.SET_EDITOR_YAML:
      return Object.assign({}, state, {
        yaml: action.yaml,
        yamlChanged: action.yamlChanged
      });
    case reduxConstants.SET_EDITOR_FORM_ERRORS:
      return Object.assign({}, state, {
        formErrors: action.formErrors
      });
    default:
      return state;
  }
};

editorReducer.initialState = initialState;

export { editorReducer };
