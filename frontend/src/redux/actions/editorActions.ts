import { reduxConstants } from '../constants';
import { clearAutosavedOperatorData } from '../../utils/operatorUtils';
import { Operator, OperatorPackage } from '../../utils/operatorTypes';
import { UploadMetadata } from '../../components/editor/manfiestUploader/UploaderTypes';
import { EditorSectionNames, EDITOR_STATUS } from '../../utils/constants';

/**
 * Update status of single section
 */
export const setSectionStatusAction = (section: EditorSectionNames, status: keyof typeof EDITOR_STATUS) => ({
  type: reduxConstants.SET_EDITOR_SECTION_STATUS,
  section,
  status
});

/**
 * Update status of multiple sections at once
 * @param {Record<EditorSectionNames, EDITOR_STATUS>} status
 */
export const setBatchSectionsStatusAction = (status: Record<EditorSectionNames, keyof typeof EDITOR_STATUS>) => ({
  type: reduxConstants.SET_EDITOR_ALL_SECTIONS_STATUS,
  status
});

export const storeEditorOperatorAction = (operator: Operator) => ({
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
 */
export const updateOperatorPackageAction = (operatorPackage: OperatorPackage) => ({
  type: reduxConstants.SET_EDITOR_PACKAGE,
  operatorPackage
});

/**
 * Update uploads list
 */
export const setUploadsAction = (uploads: UploadMetadata[]) => ({
  type: reduxConstants.SET_EDITOR_UPLOADS,
  uploads
});

export const storeEditorFormErrorsAction = formErrors => ({
  type: reduxConstants.SET_EDITOR_FORM_ERRORS,
  formErrors
});
