import { reduxConstants } from './constants';
import { PackageEntry } from '../utils/packageEditorTypes';

export interface PackageEditorState {
  uploads: PackageEntry[]
}

const initialState: PackageEditorState = {
  uploads: []
};

const packageEditorReducer = (state: PackageEditorState = initialState, action) => {
  switch (action.type) {

    case 'SET_PACKAGE_EDITOR_UPLOADS': {
      return {
        ...state,
        uploads: action.uploads
      }
    }
   
    default:
      return state;
  }
};


export { packageEditorReducer };
