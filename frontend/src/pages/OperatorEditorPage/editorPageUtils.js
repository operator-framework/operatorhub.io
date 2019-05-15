import * as React from 'react';
import * as _ from 'lodash-es';
import classNames from 'classnames';
import { safeDump, safeLoad } from 'js-yaml';

import {
  operatorFieldDescriptions,
  operatorFieldPlaceholders,
  operatorFieldValidators
} from '../../utils/operatorDescriptors';
import { getFieldValueError } from '../../utils/operatorUtils';

const EDITOR_STATUS = {
  empty: 'empty',
  pending: 'pending',
  complete: 'complete',
  errors: 'errors'
};

const sectionsFields = {
  metadata: [
    'spec.displayName',
    'metadata.annotations.description',
    'spec.maturity',
    'spec.version',
    'spec.replaces',
    'spec.minKubeVersion',
    'spec.description',
    'metadata.annotations.capabilities',
    'spec.labels',
    'spec.selector.matchLabels',
    'metadata.annotations.categories',
    'spec.keywords',
    'spec.icon',
    'spec.links',
    'spec.provider.name',
    'spec.maintainers'
  ],
  'owned-crds': 'spec.customresourcedefinitions.owned',
  'required-crds': 'spec.customresourcedefinitions.required',
  deployments: 'spec.install.spec.deployments',
  permissions: 'spec.install.spec.permissions',
  'cluster-permissions': 'spec.install.spec.clusterPermissions',
  'install-modes': 'spec.installModes'
};

const renderFormError = (field, formErrors) => {
  const error = _.get(formErrors, field);
  if (!error) {
    return null;
  }
  return <div className="oh-operator-editor-form__error-block">{error}</div>;
};

const renderOperatorInput = (title, field, inputComponent, formErrors) => {
  const formFieldClasses = classNames({
    'oh-operator-editor-form__field': true,
    row: true,
    'oh-operator-editor-form__field--error': _.get(formErrors, field)
  });

  return (
    <div className={formFieldClasses}>
      <div className="form-group col-sm-6">
        <label htmlFor={field}>{title}</label>
        {inputComponent}
        {renderFormError(field, formErrors)}
      </div>
      <div className="oh-operator-editor-form__description col-sm-6">{_.get(operatorFieldDescriptions, field, '')}</div>
    </div>
  );
};

const renderOperatorFormField = (operator, formErrors, updateOperator, commitField, title, field, fieldType) => {
  let inputComponent;

  if (fieldType === 'text-area') {
    inputComponent = (
      <textarea
        id={field}
        className="form-control"
        rows={3}
        {..._.get(_.get(operatorFieldValidators, field), 'props')}
        onChange={e => updateOperator(e.target.value, field)}
        onBlur={() => commitField(field)}
        value={_.get(operator, field, '')}
        placeholder={_.get(operatorFieldPlaceholders, field)}
      />
    );
  } else {
    inputComponent = (
      <input
        id={field}
        className="form-control"
        type={fieldType}
        {..._.get(_.get(operatorFieldValidators, field), 'props')}
        onChange={e => updateOperator(e.target.value, field)}
        onBlur={() => commitField(field)}
        value={_.get(operator, field, '')}
        placeholder={_.get(operatorFieldPlaceholders, field)}
      />
    );
  }

  return renderOperatorInput(title, field, inputComponent, formErrors);
};

const getUpdatedFormErrors = (operator, formErrors, fields) => {
  if (!formErrors) {
    throw new Error('FormErrors is undefined!');
  }

  const fieldsArray = _.castArray(fields);
  const updatedFormErrors = _.cloneDeep(formErrors);

  _.forEach(fieldsArray, field => {
    _.set(updatedFormErrors, field, getFieldValueError(operator, field));
  });

  return updatedFormErrors;
};

const operatorNameFromOperator = operator => {
  const name = _.get(operator, 'metadata.name');
  const version = _.get(operator, 'spec.version');

  const versionStart = _.startsWith(version, 'v') || _.startsWith(version, 'V') ? 1 : 0;

  return `${name}.v${version.slice(versionStart)}`;
};

const normalizeYamlOperator = yaml => {
  const normalizedOperator = safeLoad(yaml);

  const name = _.get(normalizedOperator, 'metadata.name');
  if (name) {
    const versionStart = name.indexOf('.v');
    const normalizedName = name.slice(0, versionStart);
    _.set(normalizedOperator, 'metadata.name', normalizedName);
  }
  return normalizedOperator;
};

const yamlFromOperator = operator => {
  const yamlizedOperator = _.cloneDeep(operator);

  _.set(yamlizedOperator, 'metadata.name', operatorNameFromOperator(operator));

  return safeDump(yamlizedOperator);
};

export {
  sectionsFields,
  renderOperatorInput,
  renderOperatorFormField,
  renderFormError,
  EDITOR_STATUS,
  getUpdatedFormErrors,
  operatorNameFromOperator,
  normalizeYamlOperator,
  yamlFromOperator
};
