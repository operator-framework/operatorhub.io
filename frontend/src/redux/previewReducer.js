import { reduxConstants } from './index';

const initialState = {
  yaml: '',
  yamlChanged: false,
  contentHeight: 0
};

const previewReducer = (state = initialState, action) => {
  switch (action.type) {
    case reduxConstants.SET_PREVIEW_YAML:
      return Object.assign({}, state, {
        yaml: action.yaml,
        yamlChanged: action.yamlChanged
      });
    case reduxConstants.SET_PREVIEW_CONTENT_HEIGHT:
      return Object.assign({}, state, { contentHeight: action.contentHeight });
    default:
      return state;
  }
};

previewReducer.initialState = initialState;

export { previewReducer };
