import { combineReducers } from 'redux';

import { operatorsReducer } from './operatorsReducer';
import { viewReducer } from './viewReducer';
import { editorReducer } from './editorReducer';
import { previewReducer } from './previewReducer';
import { confirmationModalReducer } from './confirmationModalReducer';
import { connectRouter } from 'connected-react-router';

export const createRootReducer = history => combineReducers({
    router: connectRouter(history),
    operatorsState: operatorsReducer,
    viewState: viewReducer,
    editorState: editorReducer,
    previewState: previewReducer,
    confirmationModal: confirmationModalReducer
  });
