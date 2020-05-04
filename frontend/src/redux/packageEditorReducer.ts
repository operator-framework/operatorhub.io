import satisfies from 'semver/functions/satisfies';

import { PackageEntry, PackageEditorChannel, PackageEditorOperatorVersionMetadata } from '../utils/packageEditorTypes';
import { PackageEditorActions } from './actions';
import { getAutoSavedOperatorData } from '../utils/operatorUtils';
import { getChannelVersions } from '../utils/packageEditorUtils';


export interface PackageEditorState {
  packageName: string,
  uploads: PackageEntry[],
  channels: PackageEditorChannel[],
  versionsWithoutChannel: string[],
  operatorVersions: PackageEditorOperatorVersionMetadata[],
  githubUploadShown: boolean
}

const initialState: PackageEditorState = {
    packageName: '',
    uploads: [],
    channels: [],
    versionsWithoutChannel: [],
    operatorVersions: [],
    githubUploadShown: false
};

const getInitialState = () => {
  const autoSaved = getAutoSavedOperatorData();

  if (autoSaved) {
      return {
          ...initialState,
          packageName: autoSaved.packageEditorState.packageName || initialState.packageName,
          channels: autoSaved.packageEditorState.channels || initialState.channels,
          operatorVersions: autoSaved.packageEditorState.operatorVersions || initialState.operatorVersions,
          versionsWithoutChannel: autoSaved.packageEditorState.versionsWithoutChannel || initialState.versionsWithoutChannel
      };
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
      const versionsInChannels = new Set(action.channels.flatMap(channel => channel.versions));

      return {
        ...state,
        channels: action.channels,
        versionsWithoutChannel: state.operatorVersions
          .filter(versionMeta => !versionsInChannels.has(versionMeta.version))
          .map(versionMeta => versionMeta.version)
      }
    }

    case 'UPDATE_PACKAGE_EDITOR_CHANNEL': {
      const channels = state.channels.map(channel => {

        if (channel.name === action.name) {
          return {
            ...channel,
            ...action.change
          }
        }
        return channel;
      });
      const versionsInChannels = new Set(channels.flatMap(channel => channel.versions));


      return {
        ...state,
        channels,
        versionsWithoutChannel: state.operatorVersions
          .filter(versionMeta => !versionsInChannels.has(versionMeta.version))
          .map(versionMeta => versionMeta.version)
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

      const channels = state.channels.filter(channel => channel.name !== action.name);
      const versionFromOtherChannels = new Set(channels.flatMap(channel => channel.versions));

      // versions used by this channel only to remove with it
      const versionsToRemove = new Set(
        state.channels
          .flatMap(channel => channel.name === action.name ? channel.versions : [])
          .filter(version => !versionFromOtherChannels.has(version))
      );

      return {
        ...state,
        channels,
        operatorVersions: state.operatorVersions.filter(version => !versionsToRemove.has(version.version))
      }

    }

    case 'SET_PACKAGE_EDITOR_OPERATOR_VERSIONS': {
      const versionsInChannels = new Set(state.channels.flatMap(channel => channel.versions));

      return {
        ...state,
        versionsWithoutChannel: action.operatorVersions
          .filter(versionMeta => !versionsInChannels.has(versionMeta.version))
          .map(versionMeta => versionMeta.version),
        operatorVersions: [
          ...action.operatorVersions
        ]
      }
    }

    case 'UPDATE_PACKAGE_EDITOR_OPERATOR_VERSION': {
      const updatedVersion = action.operatorVersion;

      return {
        ...state,
        channels: state.channels.map(channel => ({
          ...channel,
          currentVersionFullName: channel.currentVersion === updatedVersion.version ? updatedVersion.name : channel.currentVersionFullName
        })),
        operatorVersions: state.operatorVersions.map(
          operatorVersion => operatorVersion.version === updatedVersion.version ? updatedVersion : operatorVersion)
      }
    }

    case 'UPDATE_PACKAGE_EDITOR_OPERATOR_VERSION_UPGRADE_PATH': {
      const relevantChannel = state.channels.find(channel => channel.name === action.channelName);
      const operatorVersions = state.operatorVersions.map(version => {

        if (version.version === action.operatorVersion.version) {
          return { ...action.operatorVersion };
        }
        return version;
      });

      const channels = state.channels.map(channel => {

        if (channel === relevantChannel) {
          return {
            ...relevantChannel,
            versions: getChannelVersions(operatorVersions, channel.currentVersionFullName)
          };

        } else {
          return {
            ...channel,
            versions: getChannelVersions(operatorVersions, channel.currentVersionFullName)
          }
        }
      });
      const versionsInChannels = new Set(channels.flatMap(channel => channel.versions));


      return {
        ...state,
        // add possibly added versions into channel
        channels,
        // update versions without channel based on changed to channel versions
        versionsWithoutChannel: operatorVersions
          .filter(versionMeta => !versionsInChannels.has(versionMeta.version))
          .map(versionMeta => versionMeta.version),
        // update version meta - csv in particular
        operatorVersions,
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
        versionsWithoutChannel: state.versionsWithoutChannel.map(
          version => version === action.originalVersionName ? action.updatedVersion.version : version
        ),
        operatorVersions: state.operatorVersions.map(
          operatorVersion => operatorVersion.version === action.originalVersionName ? action.updatedVersion : operatorVersion
        )
      }
    }

    case 'MAKE_PACKAGE_EDITOR_OPERATOR_VERSION_DEFAULT': {
      const channels = state.channels.map(channel => {
        if (channel.name === action.channelName) {
          return {
            ...channel,
            currentVersion: action.operatorVersion,
            currentVersionFullName: action.operatorVersionFullName,
            versions: getChannelVersions(state.operatorVersions, action.operatorVersionFullName)
          }
        }

        return {
          ...channel,
          versions: getChannelVersions(state.operatorVersions, channel.currentVersionFullName)
        }
      });
      const versionsInChannels = new Set(channels.flatMap(channel => channel.versions));


      return {
        ...state,
        channels,
        versionsWithoutChannel: state.operatorVersions
          .filter(versionMeta => !versionsInChannels.has(versionMeta.version))
          .map(versionMeta => versionMeta.version),
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
        versionsWithoutChannel: [...state.versionsWithoutChannel, action.operatorVersion.version],
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
                currentVersion: channel.currentVersion === action.removedVersion ? '' : channel.currentVersion,
                currentVersionFullName: channel.currentVersion === action.removedVersion ? '' : channel.currentVersionFullName,
                versions: channel.versions.filter(version => version !== action.removedVersion)
              }

            } else {
              return channel
            }
          })
        ],
        versionsWithoutChannel: state.versionsWithoutChannel.filter(version => version !== action.removedVersion),
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
