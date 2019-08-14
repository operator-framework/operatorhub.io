import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import classNames from 'classnames';
import { Icon } from 'patternfly-react';
import { kindOptions, operatorFieldDescriptions } from '../../utils/operatorDescriptors';
import EditorSelect from './EditorSelect';

class ResourcesEditor extends React.Component {
  dirtyResources = [];

  isResourceEmpty = resource => resource.version === '' && resource.kind === '';

  areResourcesEmpty = () => {
    const { crd } = this.props;

    return crd.resources.length === 1 && this.isResourceEmpty(crd.resources[0]);
  };

  componentDidMount() {
    const { crd } = this.props;
    const existingResources = _.get(crd, 'resources');
    _.forEach(existingResources, (nextResource, index) => {
      if (!this.isResourceEmpty(nextResource)) {
        _.set(this.dirtyResources, [index, 'version'], true);
        _.set(this.dirtyResources, [index, 'kind'], true);
      }
    });
  }

  addResource = event => {
    const { crd, onUpdate } = this.props;

    event.preventDefault();
    crd.resources = [..._.get(crd, 'resources', []), { version: '', kind: '' }];
    onUpdate(crd);
  };

  onFieldBlur = (field, index) => {
    const { crd, onUpdate } = this.props;

    _.set(this.dirtyResources, [index, field], true);
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
        crd.resources.push({ version: '', kind: '' });
      }

      onUpdate(crd);
    }
  };

  renderResource = (resource, index) => {
    const { versionPlaceholder, kindPlaceholder, crdErrors } = this.props;
    const removeResourceClass = classNames('remove-label', { disabled: this.areResourcesEmpty() });

    const fieldErrors = _.find(_.get(crdErrors, 'resources'), { index });

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
            value={resource.version}
            onChange={e => this.updateResource(resource, 'version', e.target.value)}
            onBlur={() => this.onFieldBlur('version', index)}
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
    const { crd, title, field } = this.props;
    if (!crd) {
      return null;
    }

    return (
      <React.Fragment>
        <h3>{title}</h3>
        <p>{_.get(operatorFieldDescriptions, field)}</p>
        <div className="oh-operator-editor-form__field row">
          <span className="col-sm-6">Version</span>
          <span className="col-sm-6">Kind</span>
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
  crdErrors: PropTypes.object,
  title: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  versionPlaceholder: PropTypes.string,
  kindPlaceholder: PropTypes.string
};

ResourcesEditor.defaultProps = {
  crd: {},
  crdErrors: {},
  versionPlaceholder: 'e.g. v1beta2',
  kindPlaceholder: 'e.g. StatefulSet'
};

export default ResourcesEditor;
