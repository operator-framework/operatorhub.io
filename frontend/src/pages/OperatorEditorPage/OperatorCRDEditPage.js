import * as React from 'react';
import PropTypes from 'prop-types';
import connect from 'react-redux/es/connect/connect';
import * as _ from 'lodash-es';

import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import { getFieldValueError } from '../../utils/operatorUtils';
import { renderObjectFormField } from './editorPageUtils';
import OperatorEditorSubPage from './OperatorEditorSubPage';
import ResourcesEditor from '../../components/editor/ResourcesEditor';
import { operatorFieldDescriptions } from '../../utils/operatorDescriptors';
import DescriptorsEditor from '../../components/editor/DescriptorsEditor';

class OperatorCRDEditPage extends React.Component {
  state = {
    crd: null
  };

  componentDidMount() {
    const { operator, crdsField, objectType, storeEditorOperator } = this.props;
    const name = _.get(this.props.match, 'params.crd');

    let operatorCRDs = _.get(operator, crdsField);

    let crd;
    if (name === `Add ${objectType}`) {
      crd = _.find(operatorCRDs, { name: 'New CRD' });
    } else {
      crd = _.find(operatorCRDs, { name });
    }

    if (!crd) {
      crd = { name: 'New CRD' };
      if (!_.size(operatorCRDs)) {
        operatorCRDs = [];
      }

      operatorCRDs.push(crd);
      const updatedOperator = _.cloneDeep(operator);
      _.set(updatedOperator, crdsField, operatorCRDs);
      storeEditorOperator(updatedOperator);
    }

    this.setState({ crd });

    if (crd.name === 'New CRD') {
      setTimeout(() => {
        this.nameInput.focus();
        this.nameInput.select();
      }, 100);
    }
  }

  updateCRD = (value, field) => {
    const { operator, crdsField, storeEditorOperator } = this.props;
    const { crd } = this.state;

    const updatedOperator = _.cloneDeep(operator);
    const updatedCRD = _.find(_.get(updatedOperator, crdsField), { name: crd.name });
    _.set(updatedCRD, field, value);

    this.setState({ crd: updatedCRD });
    storeEditorOperator(updatedOperator);
  };

  updateCrdResources = crd => {
    this.updateCRD(crd.resources, 'resources');
  };

  updateCrdSpecDescriptors = crd => {
    this.updateCRD(crd.specDescriptors, 'specDescriptors');
  };

  updateCrdStatusDescriptors = crd => {
    this.updateCRD(crd.statusDescriptors, 'statusDescriptors');
  };

  updateCrdActionDescriptors = crd => {
    this.updateCRD(crd.actionDescriptors, 'actionDescriptors');
  };

  validateField = field => {
    const { operator, formErrors, storeEditorFormErrors } = this.props;

    const error = getFieldValueError(operator, field);
    _.set(formErrors, field, error);
    storeEditorFormErrors(formErrors);
  };

  setNameInputRef = ref => {
    this.nameInput = ref;
  };

  renderFormField = (title, field, fieldType, options, nameField) => {
    const { crdsField } = this.props;

    return renderObjectFormField(
      this.state.crd,
      field.replace(`${crdsField}.`, ''),
      this.props.formErrors,
      this.updateCRD,
      this.validateField,
      title,
      field,
      fieldType,
      options,
      nameField ? this.setNameInputRef : helpers.noop
    );
  };

  renderCRDFields = () => {
    const { crdsField } = this.props;

    return (
      <React.Fragment>
        {this.renderFormField('Name', `${crdsField}.name`, 'text', null, true)}
        {this.renderFormField('Display Name', `${crdsField}.displayName`, 'text')}
        {this.renderFormField('Description', `${crdsField}.description`, 'text-area')}
        {this.renderFormField('Group', `${crdsField}.group`, 'text-area', 5)}
        {this.renderFormField('Kind', `${crdsField}.kind`, 'text')}
        {this.renderFormField('Version', `${crdsField}.version`, 'text')}
      </React.Fragment>
    );
  };

  renderDescriptors = () => {
    const { crdsField } = this.props;
    const { crd } = this.state;

    return (
      <div className="oh_operator-editor__crd-descriptors">
        <h3>SpecDescriptors, StatusDescriptors, and ActionDescriptors</h3>
        <p>{_.get(operatorFieldDescriptions, `${crdsField}.descriptors`)}</p>
        <DescriptorsEditor
          crd={crd}
          title="SpecDescriptors"
          singular="SpecDescriptor"
          description="A reference to fields in the spec block of an object."
          onUpdate={this.updateCrdSpecDescriptors}
          descriptorsField="specDescriptors"
        />
        <DescriptorsEditor
          crd={crd}
          title="StatusDescriptors"
          singular="StatusDescriptor"
          description="A reference to fields in the status block of an object."
          onUpdate={this.updateCrdSpecDescriptors}
          descriptorsField="statusDescriptors"
        />
        <DescriptorsEditor
          crd={crd}
          title="ActionDescriptors"
          singular="ActionDescriptor"
          description="A reference to fields in the action block of an object."
          noSeparator
          onUpdate={this.updateCrdSpecDescriptors}
          descriptorsField="actionDescriptors"
        />
      </div>
    );
  };

  renderTemplates = () => (
    <React.Fragment>
      <h3>CRD Templates</h3>
      <p>{_.get(operatorFieldDescriptions, 'metadata.annotations.alm-examples')}</p>
    </React.Fragment>
  );
  render() {
    const { crdsField, objectType, lastPage, lastPageTitle, history } = this.props;
    const { crd } = this.state;

    return (
      <OperatorEditorSubPage
        title={`Edit ${objectType}`}
        tertiary
        lastPage={lastPage}
        lastPageTitle={lastPageTitle}
        history={history}
      >
        <form className="oh-operator-editor-form">
          {this.renderCRDFields()}
          <ResourcesEditor
            crd={crd}
            onUpdate={this.updateCrdResources}
            title="Resources"
            field={`${crdsField}.resources`}
          />
          {this.renderDescriptors()}
          {this.renderTemplates()}
        </form>
      </OperatorEditorSubPage>
    );
  }
}

OperatorCRDEditPage.propTypes = {
  operator: PropTypes.object,
  crdsField: PropTypes.string.isRequired,
  objectType: PropTypes.string.isRequired,
  lastPage: PropTypes.string.isRequired,
  lastPageTitle: PropTypes.string.isRequired,
  formErrors: PropTypes.object,
  storeEditorOperator: PropTypes.func,
  storeEditorFormErrors: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  match: PropTypes.object.isRequired
};

OperatorCRDEditPage.defaultProps = {
  operator: {},
  formErrors: {},
  storeEditorFormErrors: helpers.noop,
  storeEditorOperator: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  storeEditorOperator: operator =>
    dispatch({
      type: reduxConstants.SET_EDITOR_OPERATOR,
      operator
    }),
  storeEditorFormErrors: formErrors =>
    dispatch({
      type: reduxConstants.SET_EDITOR_FORM_ERRORS,
      formErrors
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  formErrors: state.editorState.formErrors
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorCRDEditPage);
