import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import classNames from 'classnames';
import { Icon } from 'patternfly-react';
import { operatorFieldDescriptions } from '../../utils/operatorDescriptors';

class ResourcesEditor extends React.Component {
  areResourcesEmpty = () => {
    const { crd } = this.props;

    return (
      crd.resources.length === 1 &&
      crd.resources[0].version === '' &&
      crd.resources[0].kind === '' &&
      crd.resources[0].name === ''
    );
  };

  componentDidUpdate(prevProps) {
    const { crd, onUpdate } = this.props;

    if (crd && !_.isEqual(crd, prevProps.crd)) {
      if (!_.size(_.get(crd, 'resources'))) {
        crd.resources = [{ version: '', kind: '', name: '' }];
        onUpdate(crd);
      }
    }
  }

  addResource = event => {
    const { crd, onUpdate } = this.props;

    event.preventDefault();
    crd.resources = [..._.get(crd, 'resources', []), { version: '', kind: '', name: '' }];
    onUpdate(crd);
  };

  onFieldBlur = resource => {
    const { crd, onUpdate } = this.props;

    onUpdate(crd);
  };

  updateResource = (resource, field, value) => {
    _.set(resource, field, value);
    this.forceUpdate();
  };

  removeResource = (event, resource) => {
    const { crd, onUpdate } = this.props;

    event.preventDefault();

    if (!this.areResourcesEmpty()) {
      crd.resources = crd.resources.filter(nextResource => nextResource !== resource);
      if (_.isEmpty(crd.resources)) {
        crd.resources.push({ version: '', kind: '', name: '' });
      }

      onUpdate(crd);
    }
  };

  renderResource = (resource, index) => {
    const { versionPlaceholder, kindPlaceholder, namePlaceholder } = this.props;
    const removeResourceClass = classNames('remove-label', { disabled: this.areResourcesEmpty() });

    return (
      <div key={index} className="oh-operator-editor-form__field row">
        <div className="form-group col-sm-4">
          <input
            className="form-control"
            type="text"
            value={resource.version}
            onChange={e => this.updateResource(resource, 'version', e.target.value)}
            onBlur={() => this.onFieldBlur(resource)}
            placeholder={versionPlaceholder}
          />
        </div>
        <div className="form-group col-sm-4">
          <input
            className="form-control"
            type="text"
            value={resource.kind}
            onChange={e => this.updateResource(resource, 'kind', e.target.value)}
            onBlur={() => this.onFieldBlur(resource)}
            placeholder={kindPlaceholder}
          />
        </div>
        <div className="form-group col-sm-4">
          <div className="oh-operator-editor-form__label-key-col">
            <input
              className="form-control"
              type="text"
              value={resource.name}
              onChange={e => this.updateResource(resource, 'name', e.target.value)}
              onBlur={() => this.onFieldBlur(resource)}
              placeholder={namePlaceholder}
            />
            <a href="#" className={removeResourceClass} onClick={e => this.removeResource(e, resource)}>
              <Icon type="fa" name="trash" />
              <span className="sr-only">Remove Label</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { crd, title, field } = this.props;
    if (!crd) {
      return null;
    }

    return (
      <React.Fragment>
        <h3>{title}</h3>
        <p>{_.get(operatorFieldDescriptions, field)}</p>
        <div className="oh-operator-editor-form__field row">
          <span className="col-sm-4">Version</span>
          <span className="col-sm-4">Kind</span>
          <span className="col-sm-4">Name</span>
        </div>
        {_.map(crd.resources, (resource, index) => this.renderResource(resource, index))}
        <div className="oh-operator-editor__list__adder">
          <a href="#" className="oh-operator-editor-form__label-adder" onClick={e => this.addResource(e)}>
            <Icon type="fa" name="plus-circle" />
            <span>Add Resource</span>
          </a>
        </div>
      </React.Fragment>
    );
  }
}

ResourcesEditor.propTypes = {
  crd: PropTypes.object,
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  versionPlaceholder: PropTypes.string,
  kindPlaceholder: PropTypes.string,
  namePlaceholder: PropTypes.string
};

ResourcesEditor.defaultProps = {
  crd: {},
  versionPlaceholder: 'e.g. v1beta2',
  kindPlaceholder: 'e.g. StatefulSet',
  namePlaceholder: 'e.g. ""'
};

export default ResourcesEditor;
