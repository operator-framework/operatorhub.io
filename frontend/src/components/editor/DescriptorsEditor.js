import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import classNames from 'classnames';
import { ExpandCollapse, Icon } from 'patternfly-react';

class DescriptorsEditor extends React.Component {
  areDescriptorsEmpty = () => {
    const { crd, descriptorsField } = this.props;

    return (
      crd[descriptorsField].length === 1 &&
      crd[descriptorsField][0].displayName === '' &&
      crd[descriptorsField][0].description === '' &&
      crd[descriptorsField][0].path === '' &&
      crd[descriptorsField][0]['x-descriptors'] === ''
    );
  };

  componentDidUpdate(prevProps) {
    const { crd, descriptorsField, onUpdate } = this.props;

    if (crd && !_.isEqual(crd, prevProps.crd)) {
      if (!_.size(_.get(crd, descriptorsField))) {
        crd[descriptorsField] = [{ displayName: '', description: '', path: '', 'x-descriptors': [] }];
        onUpdate(crd);
      }
    }
  }

  addDescriptor = event => {
    const { crd, descriptorsField, onUpdate } = this.props;

    event.preventDefault();
    crd[descriptorsField] = [
      ..._.get(crd, descriptorsField, []),
      { displayName: '', description: '', path: '', 'x-descriptors': [] }
    ];
    onUpdate(crd);
  };

  onFieldBlur = descriptor => {
    const { crd, onUpdate } = this.props;

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
      crd.descriptors = crd[descriptorsField].filter(nextDescriptor => nextDescriptor !== descriptor);
      if (_.isEmpty(crd[descriptorsField])) {
        crd[descriptorsField].push({ displayName: '', description: '', path: '', 'x-descriptors': [] });
      }

      onUpdate(crd);
    }
  };

  renderDescriptor = (descriptor, index) => {
    const { displayNamePlaceholder, descriptionPlaceholder, pathPlaceholder, xDescriptorsPlaceholder } = this.props;
    const removeDescriptorClass = classNames('remove-label', { disabled: this.areDescriptorsEmpty() });

    return (
      <div className="oh-operator-editor__descriptor-editor__row" key={index}>
        <div key={index} className="oh-operator-editor__descriptor-editor__item container-fluid">
          <div className="row">
            <span className="col-sm-4">Display Name</span>
            <span className="col-sm-4">Description</span>
            <span className="col-sm-4">Path</span>
            <span className="form-group col-sm-4">
              <input
                className="form-control"
                type="text"
                value={descriptor.displayName}
                onChange={e => this.updateDescriptor(descriptor, 'displayName', e.target.value)}
                onBlur={() => this.onFieldBlur(descriptor)}
                placeholder={displayNamePlaceholder}
              />
            </span>
            <span className="form-group col-sm-4">
              <input
                className="form-control"
                type="text"
                value={descriptor.description}
                onChange={e => this.updateDescriptor(descriptor, 'description', e.target.value)}
                onBlur={() => this.onFieldBlur(descriptor)}
                placeholder={descriptionPlaceholder}
              />
            </span>
            <span className="form-group col-sm-4">
              <input
                className="form-control"
                type="text"
                value={descriptor.path}
                onChange={e => this.updateDescriptor(descriptor, 'path', e.target.value)}
                onBlur={() => this.onFieldBlur(descriptor)}
                placeholder={pathPlaceholder}
              />
            </span>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <div>X-Descriptors</div>
              <input
                className="form-control"
                type="text"
                value={descriptor['x-descriptors']}
                onChange={e => this.updateDescriptor(descriptor, 'x-descriptors', e.target.value)}
                onBlur={() => this.onFieldBlur(descriptor)}
                placeholder={xDescriptorsPlaceholder}
              />
            </div>
            <span className="form-group col-sm-6">
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
  title: PropTypes.string.isRequired,
  singular: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  descriptorsField: PropTypes.string.isRequired,
  noSeparator: PropTypes.bool,
  onUpdate: PropTypes.func.isRequired,
  displayNamePlaceholder: PropTypes.string,
  descriptionPlaceholder: PropTypes.string,
  pathPlaceholder: PropTypes.string,
  xDescriptorsPlaceholder: PropTypes.string
};

DescriptorsEditor.defaultProps = {
  crd: {},
  noSeparator: false,
  displayNamePlaceholder: 'e.g. Credentials',
  descriptionPlaceholder: 'e.g. Credentials for Ops Manager or Cloud Manager',
  pathPlaceholder: 'e.g. credentials',
  xDescriptorsPlaceholder: "e.g. 'urn:alm:descriptor:com.tectonic.ui-selector:core:v1:Secret'"
};

export default DescriptorsEditor;
