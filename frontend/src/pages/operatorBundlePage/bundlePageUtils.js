import * as React from 'react';
import * as _ from 'lodash-es';
import classNames from 'classnames';
import { safeDump, safeLoad } from 'js-yaml';

import {
  operatorFieldDescriptions,
  operatorFieldPlaceholders,
  operatorFieldValidators
} from '../../utils/operatorDescriptors';
import { getFieldValueError, getDefaultDescription } from '../../utils/operatorUtils';
import { OPERATOR_DESCRIPTION_ABOUT_HEADER, OPERATOR_DESCRIPTION_PREREQUISITES_HEADER } from '../../utils/constants';

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
    'spec.description.aboutApplication',
    'spec.description.aboutOperator',
    'spec.description.prerequisites',
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

/**
 * Takes formErrors object and overrides it with validation result of fields
 * @param {*} operator
 * @param {*} formErrors
 * @param {string | string[]} fields
 */
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

/**
 * Split operator description into 3 subsections
 * @param {*} operator
 */
const splitDescriptionIntoSections = operator => {
  /** @type {string} */
  const description = _.get(operator, 'spec.description', '');

  let aboutApplication = description;
  let aboutOperator = '';
  let prerequisites = '';

  const aboutHeaderMatch = description.match(new RegExp(`^${OPERATOR_DESCRIPTION_ABOUT_HEADER}`, 'm'));
  const prerequisitesHeaderMatch = description.match(new RegExp(`^${OPERATOR_DESCRIPTION_PREREQUISITES_HEADER}`, 'm'));

  const aboutHeaderIndex = aboutHeaderMatch !== null ? aboutHeaderMatch.index : -1;
  const prerequisitesHeaderIndex = prerequisitesHeaderMatch !== null ? prerequisitesHeaderMatch.index : -1;

  // if we can identify headers, split using them
  // at least one header must be available
  if (aboutHeaderIndex > -1) {
    if (prerequisitesHeaderIndex > -1) {
      aboutOperator = description.substring(aboutHeaderIndex, prerequisitesHeaderIndex);
      prerequisites = description.substring(prerequisitesHeaderIndex);
    } else {
      aboutOperator = description.substring(aboutHeaderIndex);
    }

    aboutApplication = description.substring(0, aboutHeaderIndex);
  } else if (prerequisitesHeaderIndex > -1) {
    aboutApplication = description.substring(0, prerequisitesHeaderIndex);
    prerequisites = description.substring(prerequisitesHeaderIndex);

    // no our headers found, trying to match using level 2 headers
  } else {
    // contains splitted sections and headers using capture group inbetween splitted sections
    const segments = description.split(/^(## [^\r?\n]+)/m);

    // take first 3 ## headers and populates sections

    // we have at least 3 headlines
    if (segments.length >= 7) {
      aboutApplication = segments.slice(0, 3).join('');
      aboutOperator = segments.slice(3, 5).join('');
      prerequisites = segments.slice(5).join('');

      // at least 2 headlines
    } else if (segments.length >= 5) {
      aboutApplication = segments.slice(0, 3).join('');
      aboutOperator = segments.slice(3).join('');
    }
  }

  return {
    aboutApplication,
    aboutOperator,
    prerequisites
  };
};

/**
 * Parse and normalize yaml operator (not suitable for CRDs!)
 * @param {*} yaml operator yaml file
 */
const parseYamlOperator = yaml => {
  const operator = safeLoad(yaml);

  return normalizeYamlOperator(operator);
};

/**
 * Convert operator data into standardized form
 * @param {*} operator
 */
const normalizeYamlOperator = operator => {
  const normalizedOperator = operator;
  const name = _.get(normalizedOperator, 'metadata.name');
  const description = _.get(normalizedOperator, 'spec.description');

  if (name) {
    const versionStart = name.indexOf('.v');
    // do not remove last character if there is no version e.g. CRD!
    const normalizedName = versionStart > -1 ? name.slice(0, versionStart) : name;
    _.set(normalizedOperator, 'metadata.name', normalizedName);
  }

  if (description) {
    _.set(normalizedOperator, 'spec.description', splitDescriptionIntoSections(normalizedOperator));

    // if no description is available provide default one
  } else {
    _.set(normalizedOperator, 'spec.description', getDefaultDescription());
  }

  return normalizedOperator;
};

/**
 * Merge operator description subsections into single string
 * @param {*} operator
 * @returns {string}
 */
const mergeDescriptions = operator => {
  const description = [
    _.get(operator, 'spec.description.aboutApplication', ''),
    _.get(operator, 'spec.description.aboutOperator', ''),
    _.get(operator, 'spec.description.prerequisites', '')
  ];

  // add trailing line break if is missing
  return description.reduce((aggregator, value) => aggregator + (value.endsWith('\n') ? value : `${value}\n`), '');
};

const yamlFromOperator = operator => {
  const yamlizedOperator = _.cloneDeep(operator);

  _.set(yamlizedOperator, 'metadata.name', operatorNameFromOperator(operator));
  _.set(yamlizedOperator, 'spec.description', mergeDescriptions(operator));

  return safeDump(yamlizedOperator);
};

/**
 * Get valid CRDs from all uploaded files
 * @param {UploadMetadata[]} uploads
 */
const filterValidCrdUploads = uploads =>
  uploads.filter(upload => !upload.errored && upload.type === 'CustomResourceDefinition');

/**
 * Identify CRDs which needs to be uploaded before we can create bundle
 * @param {UploadMetadata[]} uploads set of uploaded files with metadata
 * @param {*} operator
 * @returns {MissingCRD[]}
 */
const getMissingCrdUploads = (uploads, operator) => {
  const uploadedCrds = filterValidCrdUploads(uploads).map(upload => upload.name);

  const missingCrds = _.get(operator, sectionsFields['owned-crds']).filter(
    crd => crd.name && !uploadedCrds.includes(crd.name)
  );

  return missingCrds;
};

export {
  sectionsFields,
  renderOperatorInput,
  renderOperatorFormField,
  renderFormError,
  EDITOR_STATUS,
  getUpdatedFormErrors,
  mergeDescriptions,
  operatorNameFromOperator,
  parseYamlOperator,
  normalizeYamlOperator,
  yamlFromOperator,
  filterValidCrdUploads,
  getMissingCrdUploads
};
