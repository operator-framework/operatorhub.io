import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash-es';

import { noop } from '../../common/helpers';

import OperatorEditorSubPage from './OperatorEditorSubPage';
import { validateOperatorPackageField, validateOperatorPackage } from '../../utils/operatorValidation';
import { setSectionStatusAction, updateOperatorPackageAction } from '../../redux/actions/editorActions';
import OperatorInput from '../../components/editor/forms/OperatorInput';
import { EDITOR_STATUS } from '../../utils/constants';

class OperatorPackagePage extends React.Component {
  originalStatus = EDITOR_STATUS.empty;

  state = {
    errors: {}
  };

  validatePage = () => {
    const { operatorPackage, sectionStatus } = this.props;

    let valid = true;

    if (sectionStatus.package !== EDITOR_STATUS.empty) {
      // check that every field is valid
      valid = validateOperatorPackage(operatorPackage);
    }

    return valid;
  };

  hasErrors = errors => Object.values(errors).some(err => typeof err === 'string');

  validateField = field => {
    const { setSectionStatus, operatorPackage } = this.props;
    const { errors } = this.state;

    const value = operatorPackage[field];
    const upatedFormErrors = { ...errors };

    upatedFormErrors[field] = validateOperatorPackageField(value, field);

    this.setState({
      errors: { ...upatedFormErrors }
    });

    const haveErrors = this.hasErrors(upatedFormErrors);

    if (haveErrors) {
      setSectionStatus(EDITOR_STATUS.errors);
    } else {
      setSectionStatus(EDITOR_STATUS.pending);
    }
  };

  updateOperatorPackage = (field, value) => {
    const { operatorPackage, storeEditorOperatorPackage } = this.props;

    const updatedPackage = {
      ...operatorPackage,
      [field]: value
    };

    storeEditorOperatorPackage(updatedPackage);
  };

  renderFormField = (title, field) => {
    const { operatorPackage } = this.props;
    const { errors } = this.state;

    return (
      <OperatorInput
        field={field}
        title={title}
        inputType="text"
        formErrors={errors}
        value={_.get(operatorPackage, field, '')}
        updateOperator={this.updateOperatorPackage}
        commitField={this.validateField}
      />
    );
  };

  render() {
    const { history } = this.props;
    const { errors } = this.state;

    // do not allow setting section as done when it was not touched as all fields are mandatory!
    const hasErrors = this.hasErrors(errors);

    return (
      <OperatorEditorSubPage
        title="Operator Package"
        description="The package sections contains informations about unique package name and channel where is operator distributed."
        secondary
        history={history}
        section="package"
        pageErrors={hasErrors}
        validatePage={this.validatePage}
      >
        <form className="oh-operator-editor-form">
          {this.renderFormField('Package Name', 'name')}
          {this.renderFormField('Channel Name', 'channel')}
        </form>
      </OperatorEditorSubPage>
    );
  }
}

OperatorPackagePage.propTypes = {
  operatorPackage: PropTypes.object,
  sectionStatus: PropTypes.object,
  setSectionStatus: PropTypes.func,
  storeEditorOperatorPackage: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorPackagePage.defaultProps = {
  operatorPackage: {},
  sectionStatus: {},
  setSectionStatus: noop,
  storeEditorOperatorPackage: noop
};

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      storeEditorOperatorPackage: updateOperatorPackageAction,
      setSectionStatus: status => setSectionStatusAction('package', status)
    },
    dispatch
  )
});

const mapStateToProps = state => ({
  operatorPackage: state.editorState.operatorPackage,
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorPackagePage);
