import { reduxConstants } from '../index';
import { clearAutosavedOperatorData } from '../../utils/operatorUtils';

/**
 * Update status of single section
 * @param {EditorSectionNames} section
 * @param {EDITOR_STATUS} status
 */
export const setSectionStatusAction = (section, status) => ({
  type: reduxConstants.SET_EDITOR_SECTION_STATUS,
  section,
  status
});

/**
 * Update status of multiple sections at once
 * @param {Record<EditorSectionNames, EDITOR_STATUS>} status
 */
export const setBatchSectionsStatusAction = status => ({
  type: reduxConstants.SET_EDITOR_ALL_SECTIONS_STATUS,
  status
});

export const storeEditorOperatorAction = operator => ({
  type: reduxConstants.SET_EDITOR_OPERATOR,
  operator
});

export const resetEditorOperatorAction = () => {
  clearAutosavedOperatorData();

  return {
    type: reduxConstants.RESET_EDITOR_OPERATOR
  };
};

/**
 * Updates operator package
 * @param {OperatorPackage} operatorPackage
 */
export const updateOperatorPackageAction = operatorPackage => ({
  type: reduxConstants.SET_EDITOR_PACKAGE,
  operatorPackage
});

/**
 * Update uploads list
 * @param {UploadMetadata} uploads
 */
export const setUploadsAction = uploads => ({
  type: reduxConstants.SET_EDITOR_UPLOADS,
  uploads
});

export const storeEditorFormErrorsAction = formErrors => ({
  type: reduxConstants.SET_EDITOR_FORM_ERRORS,
  formErrors
});
