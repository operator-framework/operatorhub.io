import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import classNames from 'classnames';
import { Icon } from 'patternfly-react';
import { operatorFieldDescriptions } from '../../utils/operatorDescriptors';
import EditorSelect from './EditorSelect';
import { kindOptions } from '../../utils/constants';

class ResourcesEditor extends React.Component {
  dirtyResources = [];

  isResourceEmpty = resource => resource.version === '' && resource.kind === '';

  areResourcesEmpty = () => {
    const { resources } = this.props;

    return resources.length === 1 && this.isResourceEmpty(resources[0]);
  };

  componentDidMount() {
    const { resources } = this.props;

    _.forEach(resources, (nextResource, index) => {
      if (!this.isResourceEmpty(nextResource)) {
        _.set(this.dirtyResources, [index, 'version'], true);
        _.set(this.dirtyResources, [index, 'kind'], true);
      }
    });
  }

  addResource = event => {
    const { resources, onUpdate } = this.props;

    event.preventDefault();
    const udpatedResources = [...resources, { version: '', kind: '' }];
    onUpdate(udpatedResources);
  };

  onFieldBlur = (field, index) => {
    _.set(this.dirtyResources, [index, field], true);
  };

  updateResource = (resource, field, value) => {
    const { resources, onUpdate } = this.props;

    const updatedResources = resources.map((res, i) => {
      let updated = res;

      if (resource === res) {
        updated = { ...res, [field]: value };
      }
      return updated;
    });
    _.set(resource, field, value);

    onUpdate(updatedResources);
  };

  removeResource = (event, resource) => {
    const { resources, onUpdate } = this.props;

    event.preventDefault();

    let updatedResources = [];

    if (!this.areResourcesEmpty()) {
      updatedResources = resources.filter(nextResource => nextResource !== resource);

      if (resources.length === 0) {
        updatedResources.push({ version: '', kind: '' });
      }

      onUpdate(updatedResources);
    }
  };

  renderResource = (resource, index) => {
    const { versionPlaceholder, kindPlaceholder, errors } = this.props;
    const removeResourceClass = classNames('remove-label', { disabled: this.areResourcesEmpty() });

    const fieldErrors = _.find(errors, { index });

    const versionError = _.get(this.dirtyResources, [index, 'version'], false) && _.get(fieldErrors, 'errors.version');
    const kindError = _.get(this.dirtyResources, [index, 'kind'], false) && _.get(fieldErrors, 'errors.kind');
    const versionClasses = classNames('form-group col-sm-6', { 'oh-operator-editor-form__field--error': versionError });
    const kindClasses = classNames('form-group col-sm-6', { 'oh-operator-editor-form__field--error': kindError });

    return (
      <div key={index} className="oh-operator-editor-form__field row">
        <div className={versionClasses}>
          <input
            className="form-control"
            type="text"
            defaultValue={resource.version}
            onBlur={e => {
              this.onFieldBlur('version', index);
              this.updateResource(resource, 'version', e.target.value);
            }}
            placeholder={versionPlaceholder}
          />
          {versionError && <div className="oh-operator-editor-form__error-block">{versionError}</div>}
        </div>
        <div className={kindClasses}>
          <div className="oh-operator-editor-form__label-value-col">
            <EditorSelect
              id={`kind-${index}`}
              values={resource.kind ? [resource.kind] : []}
              options={kindOptions}
              isMulti={false}
              placeholder={kindPlaceholder}
              onChange={selections => {
                this.updateResource(resource, 'kind', selections[0]);
              }}
              onBlur={() => this.onFieldBlur('kind', index)}
            />
            <a href="#" className={removeResourceClass} onClick={e => this.removeResource(e, resource)}>
              <Icon type="fa" name="trash" />
              <span className="sr-only">Remove Label</span>
            </a>
          </div>
          {kindError && <div className="oh-operator-editor-form__error-block">{kindError}</div>}
        </div>
      </div>
    );
  };

  render() {
    const { resources, title, field } = this.props;

    return (
      <React.Fragment>
        <h3>{title}</h3>
        <p>{_.get(operatorFieldDescriptions, field)}</p>
        <div className="oh-operator-editor-form__field row">
          <span className="col-sm-6">Version</span>
          <span className="col-sm-6">Kind</span>
        </div>
        {_.map(resources, (resource, index) => this.renderResource(resource, index))}
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
  resources: PropTypes.array,
  errors: PropTypes.array,
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  versionPlaceholder: PropTypes.string,
  kindPlaceholder: PropTypes.string
};

ResourcesEditor.defaultProps = {
  resources: [],
  errors: [],
  versionPlaceholder: 'e.g. v1beta2',
  kindPlaceholder: 'e.g. StatefulSet'
};

export default ResourcesEditor;
