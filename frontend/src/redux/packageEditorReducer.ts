import { PackageEntry, PackageEditorOperatorVersionsMap, PacakgeEditorChannel } from '../utils/packageEditorTypes';
import { PackageEditorActions } from './actions';
import { getAutoSavedOperatorData } from '../utils/operatorUtils';


export interface PackageEditorState {
  packageName: string,
  uploads: PackageEntry[],
  channels: PacakgeEditorChannel[],
  operatorVersions: PackageEditorOperatorVersionsMap,
  githubUploadShown: boolean
}


const getInitialState = () => {
  const autoSaved = getAutoSavedOperatorData();

  const initialState: PackageEditorState = {
    packageName: '',
    uploads: [],
    channels: [],
    operatorVersions: {},
    githubUploadShown: false
  };

  if (autoSaved) {
    initialState.packageName = autoSaved.packageName || '';
    initialState.channels = autoSaved.channels || [];
    initialState.operatorVersions = autoSaved.operatorVersions || {};
  }

  return initialState;
};

const packageEditorReducer = (state: PackageEditorState = getInitialState(), action: PackageEditorActions): PackageEditorState => {

  switch (action.type) {
    case 'RESET_PACKAGE_EDITOR': {
      return {
        ...getInitialState()
      }
    }

    case 'SET_PACKAGE_EDITOR_PACKAGE_NAME': {
      return {
        ...state,
        packageName: action.packageName
      }
    }

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

    case 'SET_PACKAGE_EDITOR_CHANNELS': {
      return {
        ...state,
        channels: action.channels
      }
    }

    case 'UPDATE_PACKAGE_EDITOR_CHANNEL': {
      return {
        ...state,
        channels: state.channels.map(channel => {

          if (channel.name === action.name) {
            return {
              ...channel,
              ...action.change
            }
          }
          return channel;
        })
      }
    }

    case 'NEW_PACKAGE_EDITOR_CHANNEL': {
      return {
        ...state,
        channels: [...state.channels, action.newChannel]
      }
    }

    case 'MAKE_PACKAGE_EDITOR_CHANNEL_DEFAULT': {
      return {
        ...state,
        channels: state.channels.map(channel => ({
          ...channel,
          isDefault: channel.name === action.name
        }))
      }
    }

    case 'REMOVE_PACKAGE_EDITOR_CHANNEL': {
      return {
        ...state,
        channels: state.channels.filter(channel => channel.name !== action.name)
      }
    }

    case 'SET_PACKAGE_EDITOR_OPERATOR_VERSIONS': {
      return {
        ...state,
        operatorVersions: {
          ...action.operatorVersions
        }
      }
    }

    case 'UPDATE_PACKAGE_EDITOR_OPERATOR_VERSION': {
      return {
        ...state,
        operatorVersions: {
          ...state.operatorVersions,
          [action.operatorVersion.version]: action.operatorVersion
        }
      }
    }

    case 'CHANGE_PACKAGE_EDITOR_OPERATOR_VERSION_NAME': {
      const updatedVersions: PackageEditorOperatorVersionsMap = {};

      // remove renamed version and add new one
      Object.values(state.operatorVersions)
        .filter(operatorVersion => operatorVersion.version !== action.originalVersionName)
        .forEach(operatorVersion => updatedVersions[operatorVersion.version] = operatorVersion);

      updatedVersions[action.updatedVersion.version] = action.updatedVersion; 

      return {
        ...state,
        channels: state.channels.map(channel => {
          if (channel.name === action.channelName) {
            return {
              ...channel,
              versions: channel.versions.map(version => version === action.originalVersionName ? action.updatedVersion.version : version)
            };
          } else {
            return channel;
          }
        }),
        operatorVersions: updatedVersions
      }
    }

    case 'MAKE_PACKAGE_EDITOR_OPERATOR_VERSION_DEFAULT': {
      return {
        ...state,
        channels: state.channels.map(channel => {

          if(channel.name === action.channelName){
            return {
              ...channel,
              currentVersion: action.operatorVersion,
              currentVersionFullName: action.operatorVersionFullName
            }

          } else {
            return channel;
          }         
        })
      }
    }

    case 'ADD_PACKAGE_EDITOR_OPERATOR_VERSION': {
      return {
        ...state,
        channels: state.channels.map(channel => ({
          ...channel,
          versions: [...channel.versions].concat(
            action.channelName === channel.name ? [action.operatorVersion.version] : []
          )
        })),
        operatorVersions: {
          ...state.operatorVersions,
          [action.operatorVersion.version]: action.operatorVersion
        }
      }
    }

    case 'REMOVE_PACKAGE_EDITOR_OPERATOR_VERSION': {
      const updatedVersions: PackageEditorOperatorVersionsMap = {};

      Object.values(state.operatorVersions)
        .filter(operatorVersion => operatorVersion.version !== action.removedVersion)
        .forEach(operatorVersion => updatedVersions[operatorVersion.version] = operatorVersion);

      return {
        ...state,
        channels: [
          ...state.channels.map(channel => {

            if (channel.name === action.channelName) {
              return {
                ...channel,
                versions: channel.versions.filter(version => version !== action.removedVersion)
              }

            } else {
              return channel
            }
          })
        ],
        operatorVersions: updatedVersions
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
