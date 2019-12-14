import { reduxConstants } from '../constants';
import { Operator } from '../../utils/operatorTypes';
import { UploadMetadata } from '../../components/uploader';
import { EditorSectionNames, EDITOR_STATUS } from '../../utils/constants';

/**
 * Update status of single section
 */
export const setSectionStatusAction = (section: EditorSectionNames, status: EDITOR_STATUS) => ({
  type: reduxConstants.SET_EDITOR_SECTION_STATUS,
  section,
  status
});

/**
 * Update status of multiple sections at once
 */
export const setBatchSectionsStatusAction = (status: Partial<Record<EditorSectionNames, EDITOR_STATUS>>) => ({
  type: reduxConstants.SET_EDITOR_ALL_SECTIONS_STATUS,
  status
});

export const storeEditorOperatorAction = (operator: Operator) => ({
  type: reduxConstants.SET_EDITOR_OPERATOR,
  operator
});

export const resetEditorOperatorAction = () => {
  return {
    type: reduxConstants.RESET_EDITOR_OPERATOR
  };
};

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
