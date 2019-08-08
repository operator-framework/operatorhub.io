import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import classNames from 'classnames';
import { ExpandCollapse, Icon } from 'patternfly-react';
import EditorSelect from './EditorSelect';

const isDescriptorEmpty = descriptor =>
  descriptor.displayName === '' &&
  descriptor.description === '' &&
  descriptor.path === '' &&
  _.isEmpty(descriptor['x-descriptors']);

class DescriptorsEditor extends React.Component {
  dirtyDescriptors = [];

  componentDidMount() {
    const { crd, descriptorsField } = this.props;
    const existingDescriptors = _.get(crd, descriptorsField);
    _.forEach(existingDescriptors, (nextDescriptor, index) => {
      if (!isDescriptorEmpty(nextDescriptor)) {
        _.set(this.dirtyDescriptors, [index, 'displayName'], true);
        _.set(this.dirtyDescriptors, [index, 'description'], true);
        _.set(this.dirtyDescriptors, [index, 'path'], true);
        _.set(this.dirtyDescriptors, [index, 'x-descriptors'], true);
      }
    });
  }

  componentDidUpdate(prevProps) {
    const { crd, descriptorsField, onUpdate } = this.props;

    if (crd && !_.isEqual(crd, prevProps.crd)) {
      if (!_.size(_.get(crd, descriptorsField))) {
        crd[descriptorsField] = [{ displayName: '', description: '', path: '', 'x-descriptors': [] }];
        onUpdate(crd);
      }
    }
  }

  areDescriptorsEmpty = () => {
    const { crd, descriptorsField } = this.props;

    return crd[descriptorsField].length === 1 && isDescriptorEmpty(crd[descriptorsField][0]);
  };

  addDescriptor = event => {
    const { crd, descriptorsField, onUpdate } = this.props;

    event.preventDefault();
    crd[descriptorsField] = [
      ..._.get(crd, descriptorsField, []),
      { displayName: '', description: '', path: '', 'x-descriptors': [] }
    ];
    onUpdate(crd);
  };

  onFieldBlur = (field, index) => {
    const { crd, onUpdate } = this.props;

    _.set(this.dirtyDescriptors, [index, field], true);
    onUpdate(crd);
  };

  updateDescriptor = (descriptor, field, value) => {
    _.set(descriptor, field, value);
    this.forceUpdate();
  };

  removeDescriptor = (event, descriptor) => {
    const { crd, descriptorsField, onUpdate } = this.props;

    event.preventDefault();

    if (!this.areDescriptorsEmpty()) {
      crd[descriptorsField] = crd[descriptorsField].filter(nextDescriptor => descriptor !== nextDescriptor);

      if (_.isEmpty(crd[descriptorsField])) {
        crd[descriptorsField].push({ displayName: '', description: '', path: '', 'x-descriptors': [] });
      }

      onUpdate(crd);
    }
  };

  isDirtyField = (index, field) => _.get(this.dirtyDescriptors, [index, field], false);

  getFieldError = (errors, field) => _.get(errors, ['errors', field]);

  validateCustomValue = (results, props) =>
    props.text.startsWith('urn:alm:descriptor:io.kubernetes:') ||
    props.text.startsWith('urn:alm:descriptor:com.tectonic.ui:selector:');

  renderDescriptor = (descriptor, index) => {
    const {
      descriptorsErrors,
      descriptorOptions,
      displayNamePlaceholder,
      descriptionPlaceholder,
      pathPlaceholder,
      xDescriptorsPlaceholder
    } = this.props;
    const removeDescriptorClass = classNames('remove-label', { disabled: this.areDescriptorsEmpty() });
    const errors = _.find(descriptorsErrors, { index });

    const displayNameError = this.isDirtyField(index, 'displayName') && this.getFieldError(errors, 'displayName');
    const descriptionError = this.isDirtyField(index, 'description') && this.getFieldError(errors, 'description');
    const pathError = this.isDirtyField(index, 'path') && this.getFieldError(errors, 'path');
    const xDescriptorError = this.isDirtyField(index, 'x-descriptors') && this.getFieldError(errors, 'x-descriptors');

    const displayNameClasses = classNames('form-group col-sm-4', {
      'oh-operator-editor-form__field--error': displayNameError
    });
    const descriptionClasses = classNames('form-group col-sm-4', {
      'oh-operator-editor-form__field--error': descriptionError
    });
    const pathClasses = classNames('form-group col-sm-4', { 'oh-operator-editor-form__field--error': pathError });
    const xDescriptorClasses = classNames('col-sm-6', { 'oh-operator-editor-form__field--error': xDescriptorError });

    return (
      <div className="oh-operator-editor__descriptor-editor__row" key={index}>
        <div key={index} className="oh-operator-editor__descriptor-editor__item container-fluid">
          <div className="row">
            <span className="col-sm-4">Display Name</span>
            <span className="col-sm-4">Description</span>
            <span className="col-sm-4">Path</span>
            <span className={displayNameClasses}>
              <input
                className="form-control"
                type="text"
                value={descriptor.displayName}
                onChange={e => this.updateDescriptor(descriptor, 'displayName', e.target.value)}
                onBlur={() => this.onFieldBlur('displayName', index)}
                placeholder={displayNamePlaceholder}
              />
              {displayNameError && <div className="oh-operator-editor-form__error-block">{displayNameError}</div>}
            </span>
            <span className={descriptionClasses}>
              <input
                className="form-control"
                type="text"
                value={descriptor.description}
                onChange={e => this.updateDescriptor(descriptor, 'description', e.target.value)}
                onBlur={() => this.onFieldBlur('description', index)}
                placeholder={descriptionPlaceholder}
              />
              {descriptionError && <div className="oh-operator-editor-form__error-block">{descriptionError}</div>}
            </span>
            <span className={pathClasses}>
              <input
                className="form-control"
                type="text"
                value={descriptor.path}
                onChange={e => this.updateDescriptor(descriptor, 'path', e.target.value)}
                onBlur={() => this.onFieldBlur('path', index)}
                placeholder={pathPlaceholder}
              />
              {pathError && <div className="oh-operator-editor-form__error-block">{pathError}</div>}
            </span>
          </div>
          <div className="row">
            <div className={xDescriptorClasses}>
              <div>X-Descriptors</div>
              <EditorSelect
                id={`x-descriptor-${index}`}
                values={descriptor['x-descriptors']}
                options={descriptorOptions}
                isMulti
                clearButton
                placeholder={xDescriptorsPlaceholder}
                onChange={selections => {
                  this.updateDescriptor(descriptor, 'x-descriptors', selections);
                }}
                onBlur={() => this.onFieldBlur('x-descriptors', index)}
                newSelectionPrefix="Add x-descriptor:"
                emptyLabel="Add x-descriptor:"
                customSelectValidator={this.validateCustomValue}
              />
              {xDescriptorError && <div className="oh-operator-editor-form__error-block">{xDescriptorError}</div>}
            </div>
            <span className="oh-operator-editor-form__description  col-sm-6">
              Used to determine which {'"capabilities"'} this descriptor has and which UI component to use.
            </span>
          </div>
        </div>
        <a href="#" className={removeDescriptorClass} onClick={e => this.removeDescriptor(e, descriptor)}>
          <Icon type="fa" name="trash" />
          <span className="sr-only">Remove Label</span>
        </a>
      </div>
    );
  };

  render() {
    const { crd, title, singular, descriptorsField, description, noSeparator } = this.props;
    if (!crd) {
      return null;
    }

    return (
      <ExpandCollapse textCollapsed={`Show ${title}`} textExpanded={`Hide ${title}`}>
        <div className="oh-operator-editor__descriptor-editor">
          <p>{description}</p>
          {_.map(crd[descriptorsField], (descriptor, index) => this.renderDescriptor(descriptor, index))}
          <div className="oh-operator-editor__list__adder">
            <a href="#" className="oh-operator-editor-form__label-adder" onClick={e => this.addDescriptor(e)}>
              <Icon type="fa" name="plus-circle" />
              <span>{`Add ${singular}`}</span>
            </a>
          </div>
          {!noSeparator && <div className="oh-operator-editor__separator" />}
        </div>
      </ExpandCollapse>
    );
  }
}

DescriptorsEditor.propTypes = {
  crd: PropTypes.object,
  descriptorsErrors: PropTypes.array,
  title: PropTypes.string.isRequired,
  singular: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  descriptorsField: PropTypes.string.isRequired,
  descriptorOptions: PropTypes.array.isRequired,
  noSeparator: PropTypes.bool,
  onUpdate: PropTypes.func.isRequired,
  displayNamePlaceholder: PropTypes.string,
  descriptionPlaceholder: PropTypes.string,
  pathPlaceholder: PropTypes.string,
  xDescriptorsPlaceholder: PropTypes.string
};

DescriptorsEditor.defaultProps = {
  crd: {},
  descriptorsErrors: [],
  noSeparator: false,
  displayNamePlaceholder: 'e.g. Credentials',
  descriptionPlaceholder: 'e.g. Credentials for Ops Manager or Cloud Manager',
  pathPlaceholder: 'e.g. credentials',
  xDescriptorsPlaceholder: "e.g. 'urn:alm:descriptor:com.tectonic.ui-selector:core:v1:Secret'"
};

export default DescriptorsEditor;
export { isDescriptorEmpty };
