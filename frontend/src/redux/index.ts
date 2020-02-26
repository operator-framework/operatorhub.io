import { OperatorsReducersState } from './operatorsReducer';
import { ViewReducerState } from './viewReducer';
import { EditorReducerState } from './editorReducer';
import { PreviewReducerState } from './previewReducer';
import { ConfirmationModalReducerState } from './confirmationModalReducer';
import { RouterState } from 'connected-react-router';
import { PackageEditorState } from './packageEditorReducer';

export * from './constants';
export * from './actions';

export interface StoreState {
    router:  RouterState
    operatorsState: OperatorsReducersState
    viewState: ViewReducerState
    editorState: EditorReducerState
    previewState: PreviewReducerState
    confirmationModal: ConfirmationModalReducerState
    packageEditorState: PackageEditorState
  }

export type IDispatch = (payload: {
    type: string,
    payload?: any,
    error?: any
}) => void
