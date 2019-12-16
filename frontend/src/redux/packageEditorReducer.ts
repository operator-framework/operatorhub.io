import { PackageEntry, PacakgeEditorChannel, PackageEditorOperatorVersionMetadata } from '../utils/packageEditorTypes';
import { PackageEditorActions } from './actions';
import { getAutoSavedOperatorData } from '../utils/operatorUtils';


export interface PackageEditorState {
  packageName: string,
  uploads: PackageEntry[],
  channels: PacakgeEditorChannel[],
  operatorVersions: PackageEditorOperatorVersionMetadata[],
  githubUploadShown: boolean
}


const getInitialState = () => {
  const autoSaved = getAutoSavedOperatorData();

  const initialState: PackageEditorState = {
    packageName: '',
    uploads: [],
    channels: [],
    operatorVersions: [],
    githubUploadShown: false
  };

  if (autoSaved) {
    initialState.packageName = autoSaved.packageEditorState.packageName || initialState.packageName;
    initialState.channels = autoSaved.packageEditorState.channels || initialState.channels;
    initialState.operatorVersions = autoSaved.packageEditorState.operatorVersions || initialState.operatorVersions;
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
      // versions used by other channels to keep
       const versionsToKeep = state.channels
        .filter(channel => channel.name !== action.name)
        .flatMap(channel => channel.versions);      

      return {
        ...state,
        channels: state.channels.filter(channel => channel.name !== action.name),
        operatorVersions: state.operatorVersions.filter(version => versionsToKeep.includes(version.version))
      }
    }

    case 'SET_PACKAGE_EDITOR_OPERATOR_VERSIONS': {
      return {
        ...state,
        operatorVersions: [
          ...action.operatorVersions
        ]        
      }
    }

    case 'UPDATE_PACKAGE_EDITOR_OPERATOR_VERSION': {
      const updatedVersion = action.operatorVersion;      

      return {
        ...state,
        channels:state.channels.map(channel => ({
          ...channel,
          currentVersionFullName: channel.currentVersion === updatedVersion.version ? updatedVersion.name : channel.currentVersionFullName
        })),
        operatorVersions: state.operatorVersions.map(
          operatorVersion => operatorVersion.version === updatedVersion.version ? updatedVersion : operatorVersion)        
      }
    }

    case 'UPDATE_PACKAGE_EDITOR_OPERATOR_VERSIONS_VALIDITY': {

      return {
        ...state,
        operatorVersions: state.operatorVersions.map(version => {
          const updatedIndex = action.operatorVersions.findIndex(updatedVersion => updatedVersion.name === version.name);

          return updatedIndex >= -1 ? action.operatorVersions[updatedIndex] : version;
        })
      }
    }

    case 'CHANGE_PACKAGE_EDITOR_OPERATOR_VERSION_NAME': {

      return {
        ...state,
        channels: state.channels.map(channel => {
          if (channel.name === action.channelName) {
            return {
              ...channel,
              currentVersion: channel.currentVersion === action.originalVersionName ? action.updatedVersion.version : channel.currentVersion,
              currentVersionFullName: channel.currentVersion === action.originalVersionName ? action.updatedVersion.name : channel.currentVersionFullName,
              versions: channel.versions.map(
                version => version === action.originalVersionName ? action.updatedVersion.version : version
              )
            };
          } else {
            return channel;
          }
        }),
        operatorVersions: state.operatorVersions.map(
          operatorVersion => operatorVersion.name === action.originalVersionName ? action.updatedVersion : operatorVersion
        )
      }
    }

    case 'MAKE_PACKAGE_EDITOR_OPERATOR_VERSION_DEFAULT': {
      return {
        ...state,
        channels: state.channels.map(channel => {

          if (channel.name === action.channelName) {
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
        operatorVersions: [
          ...state.operatorVersions,
          action.operatorVersion
        ]      
    }
  }

    case 'REMOVE_PACKAGE_EDITOR_OPERATOR_VERSION': {

  return {
    ...state,
    channels: [
      ...state.channels.map(channel => {

        if (channel.name === action.channelName) {
          return {
            ...channel,
            currentVersion: channel.currentVersion === action.removedVersion ? '' :  channel.currentVersion,
            currentVersionFullName: channel.currentVersion === action.removedVersion ? '' :  channel.currentVersionFullName,
            versions: channel.versions.filter(version => version !== action.removedVersion)
          }

        } else {
          return channel
        }
      })
    ],
    operatorVersions: state.operatorVersions.filter(operatorVersion => operatorVersion.version !== action.removedVersion)
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
