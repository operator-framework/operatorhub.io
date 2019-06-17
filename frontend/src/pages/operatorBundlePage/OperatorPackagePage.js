import * as React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import { renderOperatorFormField, EDITOR_STATUS } from './bundlePageUtils';

import OperatorEditorSubPage from './OperatorEditorSubPage';
import { operatorPackageFieldValidators } from '../../utils/operatorDescriptors';
import { getValueError } from '../../utils/operatorUtils';
import { setSectionStatusAction } from '../../redux/actions/editorActions';

const FIELDS = ['name', 'channel'];

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
      valid = FIELDS.every(field => this.validateFieldValue(operatorPackage[field], field) === null);
    }

    return valid;
  };

  validateFieldValue = (value, fieldName) => getValueError(value, _.get(operatorPackageFieldValidators, fieldName), {});

  hasErrors = errors => Object.values(errors).some(err => typeof err === 'string');

  validateField = field => {
    const { setSectionStatus, operatorPackage } = this.props;
    const { errors } = this.state;

    const value = operatorPackage[field];
    const upatedFormErrors = { ...errors };

    upatedFormErrors[field] = this.validateFieldValue(value, field);

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

  updateOperatorPackage = (value, field) => {
    const { operatorPackage, storeEditorOperatorPackage } = this.props;

    const updatedPackage = {
      ...operatorPackage,
      [field]: value
    };

    storeEditorOperatorPackage(updatedPackage);
  };

  renderFormField = (title, field, fieldType) => {
    const { operatorPackage } = this.props;
    const { errors } = this.state;

    return renderOperatorFormField(
      operatorPackage,
      errors,
      this.updateOperatorPackage,
      this.validateField,
      title,
      field,
      fieldType
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
          {this.renderFormField('Package Name', 'name', 'text')}
          {this.renderFormField('Channel Name', 'channel', 'text')}
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
  setSectionStatus: helpers.noop,
  storeEditorOperatorPackage: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  storeEditorOperatorPackage: operatorPackage =>
    dispatch({
      type: reduxConstants.SET_EDITOR_PACKAGE,
      operatorPackage
    }),
  setSectionStatus: status => dispatch(setSectionStatusAction('package', status))
});

const mapStateToProps = state => ({
  operatorPackage: state.editorState.operatorPackage,
  sectionStatus: state.editorState.sectionStatus
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorPackagePage);
