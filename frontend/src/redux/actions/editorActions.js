import { reduxConstants } from '../index';
import { clearAutosavedOperatorData } from '../../utils/operatorUtils';

export const setSectionStatusAction = (section, status) => ({
  type: reduxConstants.SET_EDITOR_SECTION_STATUS,
  section,
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

export const updateOperatorPackageAction = operatorPackage => ({
  type: reduxConstants.SET_EDITOR_PACKAGE,
  operatorPackage
});

export const setUploadsAction = uploads => ({
  type: reduxConstants.SET_EDITOR_UPLOADS,
  uploads
});

export const storeEditorFormErrorsAction = formErrors => ({
  type: reduxConstants.SET_EDITOR_FORM_ERRORS,
  formErrors
});
