import { reduxConstants } from './constants';
import { getAutoSavedOperatorData, getDefaultOperator } from '../utils/operatorUtils';
import { Operator, OperatorPackage } from '../utils/operatorTypes';
import { ISectionFields, EDITOR_STATUS } from '../utils/constants';

export interface EditorReducerState {
  operator: Operator
  operatorModified: boolean
  operatorPackage: OperatorPackage
  uploads: UploadMetadata[],
  formErrors: any,
  sectionStatus: Record<keyof ISectionFields, keyof EDITOR_STATUS>
}

const getInitialState = () => {
  const autoSaved = getAutoSavedOperatorData();

  const initialState = {
    operator: getDefaultOperator(),
    operatorModified: false,
    operatorPackage: {
      name: '',
      channel: ''
    },
    uploads: [],
    formErrors: {},
    sectionStatus: {
      metadata: EDITOR_STATUS.empty,
      'owned-crds': EDITOR_STATUS.empty,
      'required-crds': EDITOR_STATUS.empty,
      deployments: EDITOR_STATUS.empty,
      permissions: EDITOR_STATUS.empty,
      'cluster-permissions': EDITOR_STATUS.empty,
      'install-modes': EDITOR_STATUS.empty,
      package: EDITOR_STATUS.empty
    }
  };

  if (autoSaved) {
    initialState.operator = autoSaved.operator || initialState.operator;
    initialState.operatorPackage = autoSaved.operatorPackage || initialState.operatorPackage;
    initialState.sectionStatus = autoSaved.sectionStatus || autoSaved.sectionStatus;
    initialState.uploads = autoSaved.uploads || [];
  }

  return initialState;
};

const editorReducer = (state: EditorReducerState = getInitialState(), action) => {
  switch (action.type) {
    case reduxConstants.SET_EDITOR_SECTION_STATUS:
      return {
        ...state,
        sectionStatus: {
          ...state.sectionStatus,
          [action.section]: action.status
        }
      };

    case reduxConstants.SET_EDITOR_ALL_SECTIONS_STATUS:
      return {
        ...state,
        sectionStatus: {
          ...state.sectionStatus,
          ...action.status
        }
      };

    case reduxConstants.RESET_EDITOR_OPERATOR:
      return {
        ...getInitialState()
      };

    case reduxConstants.SET_EDITOR_OPERATOR:
      // save operator on change
      return {
        ...state,
        operator: action.operator,
        operatorModified: true
      };

    case reduxConstants.SET_EDITOR_PACKAGE:
      return {
        ...state,
        operatorPackage: action.operatorPackage
      };

    case reduxConstants.SET_EDITOR_UPLOADS:
      return {
        ...state,
        uploads: action.uploads
      };

    case reduxConstants.SET_EDITOR_FORM_ERRORS:
      return {
        ...state,
        formErrors: action.formErrors
      };

    default:
      return state;
  }
};

editorReducer.initialState = getInitialState();

export { editorReducer };
