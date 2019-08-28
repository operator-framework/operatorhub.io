import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { ExpandCollapse, Icon } from 'patternfly-react';
import Dragula from 'react-dragula';

import Descriptor from './Descriptor';
import { getDefaultCrdDescriptor, isCrdDescriptorDefault } from '../../../utils/operatorUtils';

/**
 * @callback DescriptorsUpdated
 * @param {OperatorCrdDescriptor[]} descriptors
 */

/**
 * Single descriptor instance as dumb component to separate logic
 * @class DescriptorsEditor
 *
 * @typedef {object} props
 * @prop {OperatorCrdDescriptor[]} descriptors
 * @prop {object[]} descriptorsErrors
 * @prop {string} title
 * @prop {string} singular
 * @prop {string} description
 * @prop {string[]} descriptorOptions
 * @prop {boolean} [expanded]
 * @prop {boolean} [noSeparator]
 * @prop {DescriptorsUpdated} onUpdate
 *
 * @extends {React.PureComponent<props, {}>}
 */
class DescriptorsEditor extends React.PureComponent {
  dirtyDescriptors = [];

  /** @type {import('dragula').Drake} */
  drake;

  ordering = false;

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

  /**
   * Descriptor was added
   */
  addDescriptor = event => {
    const { onUpdate, descriptors } = this.props;

    event.preventDefault();

    onUpdate([...descriptors, getDefaultCrdDescriptor()]);
  };

  /**
   * Descriptor was udpated - build new descriptors array
   */
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

  /**
   * Descriptor was removed
   */
  removeDescriptor = (descriptor, index) => {
    const { onUpdate, descriptors } = this.props;

    const updatedDescriptors = descriptors.filter(desc => descriptor !== desc);

    this.dirtyDescriptors.splice(index, 1);

    onUpdate(updatedDescriptors);
  };

  /**
   * Descriptor field changed so udpate it and mark dirty
   */
  onDescriptorUpdate = (field, updatedDescriptor, index) => {
    this.makeFieldDirty(field, index);
    this.updateDescriptor(updatedDescriptor, index);
  };

  /**
   * Set flag when ordering started in this instance
   */
  startOrdering = (el, source) => {
    if (source === this.drake.containers[0]) {
      this.ordering = true;
    }
  };

  /**
   * Read resulting order from DOM and update descriptors order
   */
  updateOnOrderingEnd = () => {
    const { onUpdate, descriptors } = this.props;

    // ignore updates triggered by other instances
    if (this.ordering) {
      const updatedDescriptors = [];
      const descriptorElements = this.drake.containers[0].children;

      for (let i = 0; i < descriptorElements.length; i++) {
        /** @type {HTMLElement} */
        const descirptorEl = descriptorElements.item(i);
        const { index } = descirptorEl.dataset;

        // skip mirror element
        if (!descirptorEl.classList.contains('gu-mirror')) {
          updatedDescriptors.push({
            ...descriptors[index]
          });
        }
      }

      this.ordering = false;
      onUpdate(updatedDescriptors);
    }
  };

  /**
   * Create drag & drop pane to reorder descriptors
   */
  initDragula = container => {
    /** @type {import('dragula').Dragula} */
    const dragula = Dragula;

    if (container) {
      this.drake = dragula({
        direction: 'vertical',
        copy: false,
        containers: [container],
        mirrorContainer: container,
        // allow only dragging by handle
        moves: (el, source, handle) => handle.className === 'oh-operator-editor__descriptor-editor__dragula-handle'
      });

      this.drake.on('drag', this.startOrdering);
      this.drake.on('dragend', this.updateOnOrderingEnd);
    }
  };

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
          <p className="oh-operator-editor__descriptor-editor__description">{description}</p>
          <div className="oh-operator-editor__descriptor-editor__dragula-container" ref={this.initDragula}>
            {descriptors.map((descriptor, index) => {
              // eslint-disable-next-line prefer-destructuring
              const errors = (_.find(descriptorsErrors, { index }) || { errors: {} }).errors;

              return (
                <Descriptor
                  key={descriptor.path}
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
          </div>
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
