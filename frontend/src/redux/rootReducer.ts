import { combineReducers } from 'redux';

import { operatorsReducer, OperatorsReducersState } from './operatorsReducer';
import { viewReducer, ViewReducerState } from './viewReducer';
import { editorReducer, EditorReducerState } from './editorReducer';
import { previewReducer, PreviewReducerState } from './previewReducer';
import { confirmationModalReducer, ConfirmationModalReducerState } from './confirmationModalReducer';
import { connectRouter, RouterState } from 'connected-react-router';

export const createRootReducer = history => combineReducers({
    router: connectRouter(history),
    operatorsState: operatorsReducer,
    viewState: viewReducer,
    editorState: editorReducer,
    previewState: previewReducer,
    confirmationModal: confirmationModalReducer
  });

  export interface StoreState {
    router:  RouterState
    operatorsState: OperatorsReducersState
    viewState: ViewReducerState
    editorState: EditorReducerState
    previewState: PreviewReducerState
    confirmationModal: ConfirmationModalReducerState
  }