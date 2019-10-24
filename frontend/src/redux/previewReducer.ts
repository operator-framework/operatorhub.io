import { reduxConstants } from './constants';

export interface PreviewReducerState {
  yaml: string
  yamlChanged: boolean
  contentHeight: number
}

const initialState: PreviewReducerState = {
  yaml: '',
  yamlChanged: false,
  contentHeight: 0
};

const previewReducer = (state: PreviewReducerState = initialState, action) => {
  switch (action.type) {

    case reduxConstants.SET_PREVIEW_YAML:
      return {
        ...state,
        yaml: action.yaml,
        yamlChanged: action.yamlChanged
      };

    case reduxConstants.SET_PREVIEW_CONTENT_HEIGHT:
      return { 
        ...state,
        contentHeight: action.contentHeight 
      };
    default:
      return state;
  }
};

previewReducer.initialState = initialState;

export { previewReducer };
