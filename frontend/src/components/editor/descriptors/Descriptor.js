import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import classNames from 'classnames';
import { Icon } from 'patternfly-react';
import DescriptorInput from './DescriptorInput';
import { operatorFieldPlaceholders } from '../../../utils/operatorDescriptors';
import { sectionsFields } from '../../../pages/operatorBundlePage/bundlePageUtils';
import { helpers } from '../../../common/helpers';
import EditorSelect from '../EditorSelect';

/**
 * @callback OperatorDescriptorChangeCallback
 * @param {OperatorCrdDescriptor} descriptor
 */

/**
 * @callback OperatorDescriptorUpdateCallback
 * @param {string} field
 * @param {OperatorCrdDescriptor} descriptor
 */

/**
 * Single descriptor instance as dumb component to separate logic
 * @class Descriptor
 *
 * @typedef {object} props
 * @prop {number} index
 * @prop {OperatorCrdDescriptor} descriptor
 * @prop {object} errors
 * @prop {boolean} removable
 * @prop {Record<string, boolean>} dirtyFields
 * @prop {string[]} descriptorOptions
 * @prop {OperatorDescriptorChangeCallback} [onDescriptorRemove]
 * @prop {OperatorDescriptorUpdateCallback} onUpdate
 *
 * @typedef {object} state
 * @prop {string} editedValue
 *
 * @extends {React.PureComponent<props, state>}
 */
class Descriptor extends React.PureComponent {
  state = {
    editedValue: ''
  };

  /** @type {DescriptorInput} */
  displayNameInput = null;
  /** @type {DescriptorInput} */
  descriptionInput = null;
  /** @type {DescriptorInput} */
  pathInput = null;

  getFieldError(field) {
    const { errors } = this.props;

    return _.get(errors, field, null);
  }

  onSelectBlur = field => {
    const { descriptor, onUpdate } = this.props;
    onUpdate(field, descriptor);
  };

  updateDescriptor = (field, value) => {
    const { descriptor, onUpdate } = this.props;

    const updatedDescriptor = _.cloneDeep(descriptor);
    updatedDescriptor[field] = value;

    onUpdate(field, updatedDescriptor);
  };

  onRemove = e => {
    const { descriptor, onDescriptorRemove, removable } = this.props;
    e.preventDefault();

    if (removable) {
      //  this.clearInputs();
      onDescriptorRemove(descriptor);
    }
  };

  clearInputs = () => {
    this.displayNameInput && this.displayNameInput.clearInput();
    this.descriptionInput && this.descriptionInput.clearInput();
    this.pathInput && this.pathInput.clearInput();
  };

  onValueEdit = value => {
    this.setState({
      editedValue: value
    });
  };

  validateCustomValue = (results, properties) =>
    properties.text.startsWith('urn:alm:descriptor:io.kubernetes:') ||
    properties.text.startsWith('urn:alm:descriptor:com.tectonic.ui:selector:');

  render() {
    const { index, descriptor, errors, removable, descriptorOptions, dirtyFields } = this.props;

    const xDescriptorsPlaceholder = _.get(
      operatorFieldPlaceholders,
      `${sectionsFields['owned-crds']}.descriptors['x-descriptors']`,
      ''
    );
    const xDescriptorError = dirtyFields['x-descriptors'] && this.getFieldError('x-descriptors');
    const xDescriptorClasses = classNames('col-sm-6', { 'oh-operator-editor-form__field--error': xDescriptorError });

    return (
      <div className="oh-operator-editor__descriptor-editor__row" key={index}>
        <div key={index} className="oh-operator-editor__descriptor-editor__item container-fluid">
          <div className="row">
            <DescriptorInput
              value={descriptor.displayName}
              name="Display Name"
              field="displayName"
              error={dirtyFields.displayName ? errors.displayName : null}
              onBlur={this.updateDescriptor}
              ref={ref => {
                this.displayNameInput = ref;
              }}
            />
            <DescriptorInput
              value={descriptor.description}
              name="Description"
              field="description"
              error={dirtyFields.description ? errors.description : null}
              onBlur={this.updateDescriptor}
              ref={ref => {
                this.descriptionInput = ref;
              }}
            />
            <DescriptorInput
              value={descriptor.path}
              name="Path"
              field="path"
              error={dirtyFields.path ? errors.path : null}
              onBlur={this.updateDescriptor}
              ref={ref => {
                this.pathInput = ref;
              }}
            />
          </div>

          <div className="row">
            <div className={xDescriptorClasses}>
              <div>X-Descriptors</div>
              <EditorSelect
                id={`x-descriptor-${index}`}
                values={descriptor['x-descriptors']}
                options={descriptorOptions}
                initialValue={this.state.editedValue}
                onValueEdit={this.onValueEdit}
                isMulti
                clearButton
                placeholder={xDescriptorsPlaceholder}
                onChange={selections => {
                  this.setState({ editedValue: '' });
                  this.updateDescriptor('x-descriptors', selections);
                }}
                onBlur={() => this.onSelectBlur('x-descriptors')}
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
        <a href="#" className={classNames('remove-label', { disabled: !removable })} onClick={this.onRemove}>
          <Icon type="fa" name="trash" />
          <span className="sr-only">Remove Label</span>
        </a>
      </div>
    );
  }
}

Descriptor.propTypes = {
  index: PropTypes.number.isRequired,
  descriptor: PropTypes.object.isRequired,
  errors: PropTypes.object,
  removable: PropTypes.bool,
  descriptorOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  dirtyFields: PropTypes.object,
  onDescriptorRemove: PropTypes.func,
  onUpdate: PropTypes.func.isRequired
};

Descriptor.defaultProps = {
  errors: {},
  removable: false,
  dirtyFields: {},
  onDescriptorRemove: helpers.noop
};

export default Descriptor;
