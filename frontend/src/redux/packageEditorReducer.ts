import { PackageEntry } from '../utils/packageEditorTypes';
import { PackageEditorActions } from './actions';

export interface PackageEditorState {
  uploads: PackageEntry[],
  githubUploadShown: boolean
}

const initialState: PackageEditorState = {
  uploads: [],
  githubUploadShown: false
};

const packageEditorReducer = (state: PackageEditorState = initialState, action: PackageEditorActions): PackageEditorState => {
  switch (action.type) {

    case 'SET_PACKAGE_EDITOR_UPLOADS': {
      return {
        ...state,
        uploads: action.uploads
      }
    }

    case 'REMOVE_PACKAGE_EDITOR_UPLOAD': {

      let uploads;

      if (action.nested) {
        // nested entry removed - filter content of dirs to find removed item
        uploads = state.uploads.map(upload => ({
          ...upload,
          content: upload.kind === 'dir' ? upload.content.filter(file => file.path !== action.path) : upload.content
        }));

      } else {
        // root entry removed 
        uploads = state.uploads.filter(upload => upload.path !== action.path);
      }

      return {
        ...state,
        uploads
      }
    }

    case 'CLEAR_PACKAGE_EDITOR_UPLOADS': {
      return {
        ...state,
        uploads: []
      }
    }

    case 'SHOW_PACKAGE_EDITOR_GITHUB_UPLOAD': {
      return {
        ...state,
        githubUploadShown: true
      }
    }

    case 'HIDE_PACKAGE_EDITOR_GITHUB_UPLOAD': {
      return {
        ...state,
        githubUploadShown: false
      }
    }

    default:
      return state;
  }
};


export { packageEditorReducer };
