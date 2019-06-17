import { reduxConstants } from '../index';
import { clearAutosavedOperatorData } from '../../utils/operatorUtils';

export const setSectionStatusAction = (section, status) => ({
  type: reduxConstants.SET_EDITOR_SECTION_STATUS,
  section,
  status
});

export const resetEditorOperatorAction = () => {
  clearAutosavedOperatorData();

  return {
    type: reduxConstants.RESET_EDITOR_OPERATOR
  };
};
