import React from 'react';
import _ from 'lodash-es';
import { safeDump, safeLoad } from 'js-yaml';

import { getDefaultDescription, mergeDescriptions } from '../../utils/operatorUtils';
import { getFieldValueError } from '../../utils/operatorValidation';
import {
  OPERATOR_DESCRIPTION_ABOUT_HEADER,
  OPERATOR_DESCRIPTION_PREREQUISITES_HEADER,
  NEW_CRD_NAME,
  sectionsFields
} from '../../utils/constants';

/**
 *
 * @param {string|string[]} field
 * @param {*} formErrors
 */
export const renderFormError = (field, formErrors) => {
  const error = _.get(formErrors, field);
  if (!error) {
    return null;
  }
  return <div className="oh-operator-editor-form__error-block">{error}</div>;
};

/**
 * Takes formErrors object and overrides it with validation result of fields
 * @param {Operator} operator
 * @param {*} formErrors
 * @param {string | string[]} fields
 */
export const getUpdatedFormErrors = (operator, formErrors, fields) => {
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

export const operatorNameFromOperator = operator => {
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
export const parseYamlOperator = yaml => {
  const operator = safeLoad(yaml);

  return normalizeYamlOperator(operator);
};

/**
 * Convert operator data into standardized form
 * @param {*} operator
 */
export const normalizeYamlOperator = operator => {
  const normalizedOperator = _.cloneDeep(operator);
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

  // index crd descriptors with ID for UI to distinct them
  modifyOwnedCrdsDescriptors(normalizedOperator, addIdToDescriptor);

  return normalizedOperator;
};

/**
 * Removes ID prop from descriptor before export to yaml
 * @param {OperatorCrdDescriptor} descriptor
 * @returns {Omit<OperatorCrdDescriptor, 'id'>}
 */
const removeIdFromDescriptor = descriptor => {
  const { id, ...rest } = descriptor;
  return { ...rest };
};

let idIndex = 0;

/**
 * Add ID prop to descriptor so UI can index it properly for reordering
 * @param {OperatorCrdDescriptor} descriptor
 */
export const addIdToDescriptor = descriptor => ({
  id: (++idIndex + Date.now()).toString(),
  ...descriptor
});

/**
 * Modifies operator owned CRDs descriptor using provided method (add / remove ID)
 * @param {Operator} operator
 * @param {Function} descriptorMapperFn
 */
const modifyOwnedCrdsDescriptors = (operator, descriptorMapperFn) => {
  // clear id from descriptors as they are used only internally
  const ownedCrds = _.get(operator, sectionsFields['owned-crds'], []).map(
    /** @param {OperatorOwnedCrd} crd */
    crd => ({
      ...crd,
      specDescriptors: (crd.specDescriptors || []).map(descriptor => descriptorMapperFn(descriptor)),
      statusDescriptors: (crd.statusDescriptors || []).map(descriptor => descriptorMapperFn(descriptor))
    })
  );

  _.set(operator, sectionsFields['owned-crds'], ownedCrds);

  return operator;
};

/**
 * Converts operator to YAML
 * @param {Operator} operator
 */
export const yamlFromOperator = operator => {
  const yamlizedOperator = _.cloneDeep(operator);

  _.set(yamlizedOperator, 'metadata.name', operatorNameFromOperator(operator));
  _.set(yamlizedOperator, 'spec.description', mergeDescriptions(operator));

  modifyOwnedCrdsDescriptors(yamlizedOperator, removeIdFromDescriptor);

  return safeDump(yamlizedOperator, { noRefs: true });
};

/**
 * Get valid CRDs from all uploaded files
 * @param {UploadMetadata[]} uploads
 */
export const filterValidCrdUploads = uploads =>
  uploads.filter(upload => !upload.errored && upload.type === 'CustomResourceDefinition');

/**
 * Identify CRDs which needs to be uploaded before we can create bundle
 * @param {UploadMetadata[]} uploads set of uploaded files with metadata
 * @param {*} operator
 * @returns {MissingCRD[]}
 */
export const getMissingCrdUploads = (uploads, operator) => {
  const uploadedCrds = filterValidCrdUploads(uploads).map(upload => upload.name);

  const missingCrds = _.get(operator, sectionsFields['owned-crds']).filter(
    crd => crd.name !== NEW_CRD_NAME && !uploadedCrds.includes(crd.name)
  );

  return missingCrds;
};
