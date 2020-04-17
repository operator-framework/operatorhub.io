import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { History } from 'history';

import { noop } from '../../common/helpers';
import { getFieldValueError } from '../../utils/operatorValidation';
import InstallModeEditor from '../../components/editor/InstallModeEditor';
import OperatorEditorSubPage from './subPage/OperatorEditorSubPage';
import { storeEditorFormErrorsAction, storeEditorOperatorAction } from '../../redux/actions/editorActions';
import { sectionsFields, VersionEditorParamsMatch } from '../../utils/constants';
import { getVersionEditorRootPath } from './bundlePageUtils';

const installModesFields = sectionsFields['install-modes'];

const OperatorInstallModesPageActions = {
  storeEditorOperator: storeEditorOperatorAction,
  storeEditorFormErrors: storeEditorFormErrorsAction
};

export type OperatorInstallModesPageProps = {
  history: History,
  match: VersionEditorParamsMatch
} & ReturnType<typeof mapStateToProps> & typeof OperatorInstallModesPageActions;

const OperatorInstallModesPage: React.FC<OperatorInstallModesPageProps> = ({
  operator,
  match,
  formErrors,
  storeEditorOperator,
  storeEditorFormErrors,
  history
}) => {
  const validateField = field => {
    const error = getFieldValueError(operator, field);
    _.set(formErrors, field, error);
    storeEditorFormErrors(formErrors);
  };

  const updateInstallModes = installModes => {
    const updatedOperator = _.cloneDeep(operator);
    _.set(updatedOperator, installModesFields, installModes);
    storeEditorOperator(updatedOperator);
    validateField('spec.install.spec.deployments');
  };

  return (
    <OperatorEditorSubPage
      title="Install Modes"
      field={installModesFields}
      versionEditorRootPath={getVersionEditorRootPath(match)}
      secondary
      history={history}
      match={match}
      section="install-modes"
      validatePage={() => true}
    >
      <InstallModeEditor operator={operator} onUpdate={updateInstallModes} />
    </OperatorEditorSubPage>
  );
};

OperatorInstallModesPage.propTypes = {
  history: PropTypes.any.isRequired,
  match: PropTypes.any,
  operator: PropTypes.object,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.any,
  storeEditorFormErrors: PropTypes.any
};

OperatorInstallModesPage.defaultProps = {
  operator: {},
  formErrors: {},
  storeEditorFormErrors: noop as any,
  storeEditorOperator: noop as any
};

const mapDispatchToProps = dispatch => bindActionCreators(OperatorInstallModesPageActions, dispatch);

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorInstallModesPage);
