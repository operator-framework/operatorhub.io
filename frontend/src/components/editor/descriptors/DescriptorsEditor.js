import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import { ExpandCollapse, Icon } from 'patternfly-react';
import Descriptor from './Descriptor';
import { getDefaultCrdDescriptor, isCrdDescriptorDefault } from '../../../utils/operatorUtils';

class DescriptorsEditor extends React.Component {
  dirtyDescriptors = [];

  componentDidMount() {
    const { descriptors } = this.props;

    descriptors.forEach((nextDescriptor, index) => {
      if (!isCrdDescriptorDefault(nextDescriptor)) {
        this.makeFieldDirty('displayName', index);
        this.makeFieldDirty('description', index);
        this.makeFieldDirty('path', index);
        this.makeFieldDirty('x-descriptors', index);
      }
    });
  }

  makeFieldDirty = (field, index) => {
    _.set(this.dirtyDescriptors, [index, field], true);
  };

  addDescriptor = event => {
    const { onUpdate, descriptors } = this.props;

    event.preventDefault();

    onUpdate([...descriptors, getDefaultCrdDescriptor()]);
  };

  updateDescriptor = (updatedDescriptor, index) => {
    const { onUpdate, descriptors } = this.props;

    // do not update when not really changed - otherwise descirptor can't be deleted :/
    if (isCrdDescriptorDefault(updatedDescriptor)) {
      console.log('Skipped udpate as nothing changed in descriptor');
    } else {
      const updatedDescriptors = [...descriptors.slice(0, index), updatedDescriptor, ...descriptors.slice(index + 1)];

      onUpdate(updatedDescriptors);
    }
  };

  removeDescriptor = (descriptor, index) => {
    const { onUpdate, descriptors } = this.props;

    const updatedDescriptors = descriptors.filter(desc => descriptor !== desc);

    this.dirtyDescriptors.splice(index, 1);

    onUpdate(updatedDescriptors);
  };

  onDescriptorUpdate = (field, updatedDescriptor, index) => {
    this.makeFieldDirty(field, index);
    this.updateDescriptor(updatedDescriptor, index);
  };

  validateCustomValue = (results, props) =>
    props.text.startsWith('urn:alm:descriptor:io.kubernetes:') ||
    props.text.startsWith('urn:alm:descriptor:com.tectonic.ui:selector:');

  render() {
    const {
      title,
      singular,
      description,
      noSeparator,
      descriptorsErrors,
      descriptorOptions,
      descriptors,
      expanded
    } = this.props;

    return (
      <ExpandCollapse textCollapsed={`Show ${title}`} textExpanded={`Hide ${title}`} expanded={expanded}>
        <div className="oh-operator-editor__descriptor-editor">
          <p>{description}</p>
          {descriptors.map((descriptor, index) => {
            // eslint-disable-next-line prefer-destructuring
            const errors = (_.find(descriptorsErrors, { index }) || { errors: {} }).errors;

            return (
              <Descriptor
                key={index}
                index={index}
                descriptor={descriptor}
                descriptorOptions={descriptorOptions}
                errors={errors}
                removable={index > 0 || !isCrdDescriptorDefault(descriptor)}
                dirtyFields={this.dirtyDescriptors[index]}
                onDescriptorRemove={() => this.removeDescriptor(descriptor, index)}
                onUpdate={(field, updatedDescriptor) => this.onDescriptorUpdate(field, updatedDescriptor, index)}
              />
            );
          })}
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
  descriptors: PropTypes.array.isRequired,
  descriptorsErrors: PropTypes.array,
  title: PropTypes.string.isRequired,
  singular: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  descriptorOptions: PropTypes.array.isRequired,
  expanded: PropTypes.bool,
  noSeparator: PropTypes.bool,
  onUpdate: PropTypes.func.isRequired
};

DescriptorsEditor.defaultProps = {
  descriptorsErrors: [],
  noSeparator: false,
  expanded: false
};

export default DescriptorsEditor;
