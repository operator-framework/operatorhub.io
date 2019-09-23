import _ from 'lodash-es';

import {
  generateIdFromVersionedName,
  getDefaultOperator,
  getDefaultOnwedCRD,
  isOwnedCrdDefault,
  isDeploymentDefault,
  isAlmExampleDefault
} from '../../../utils/operatorUtils';
import { addIdToDescriptor } from '../../../pages/operatorBundlePage/bundlePageUtils';

export const securityObjectTypes = ['ClusterRole', 'Role', 'ClusterRoleBinding', 'RoleBinding'];
const almExampleFileNameRegExp = new RegExp('^.+_cr.yaml$');

/**
 * Derive file type from its content
 * @param {*} content
 * @param {string} fileName
 * @returns {TypeAndName|null}
 */
export function getObjectNameAndType(content, fileName) {
  if (almExampleFileNameRegExp.test(fileName) && content.kind) {
    return {
      type: 'CustomResourceExampleTemplate',
      name: content.kind
    };
  } else if (content.kind && content.apiVersion && content.metadata) {
    const type = content.kind;
    const { name } = content.metadata;
    const apiName = content.apiVersion.substring(0, content.apiVersion.indexOf('/'));

    if (type === 'ClusterServiceVersion' && apiName === 'operators.coreos.com') {
      return { type, name };
    } else if (type === 'CustomResourceDefinition' && apiName === 'apiextensions.k8s.io') {
      return { type, name };
    } else if (type === 'Deployment' && apiName === 'apps') {
      return { type, name };
    } else if (type === 'ServiceAccount') {
      return { type, name };
    } else if (securityObjectTypes.includes(type) && apiName === 'rbac.authorization.k8s.io') {
      return { type, name };
    }

    // package file is different with no kind and API
  } else if (content.packageName && content.channels) {
    return {
      type: 'Package',
      name: content.packageName
    };
  }

  return null;
}

/**
 * Detects file upload overwriting other version of same file
 * @param {UploadMetadata[]} uploads
 */
export function markReplacedObjects(uploads) {
  // iterate over uploads backwards
  for (let i = uploads.length - 1; i >= 0; i--) {
    const upload = uploads[i];

    if (
      !upload.errored &&
      (upload.type === 'ClusterServiceVersion' || upload.type === 'CustomResourceDefinition') &&
      upload.data
    ) {
      const id = generateIdFromVersionedName(upload.name);

      if (id) {
        // search for CSVs or CRDs with same name (but not version) and mark them as overriden
        // as they would be replaced by latest upload
        uploads.forEach((otherUpload, index) => {
          // check only older files before current index
          if (index < i && !otherUpload.errored && otherUpload.data && otherUpload.type === upload.type) {
            const otherId = generateIdFromVersionedName(otherUpload.name);

            if (otherId === id) {
              otherUpload.overwritten = true;

              // for CSV mark overriden every previous csv as we can have only single one!
            } else if (upload.type === otherUpload.type && otherUpload.type === 'ClusterServiceVersion') {
              otherUpload.overwritten = true;
            }
          }
        });
      }
    }
  }

  return uploads;
}

/**
 * Identify if operator field was changed by upload
 * @param {string} fieldName
 * @param {Operator} operator
 * @param {Operator} uploadedOperator
 * @param {Operator} mergedOperator
 */
export function operatorFieldWasUpdated(fieldName, operator, uploadedOperator, mergedOperator) {
  const defaultOperator = getDefaultOperator();

  // field changed when either its value changed
  // or uploaded operator was same as default values
  return (
    !_.isEqual(_.get(operator, fieldName), _.get(mergedOperator, fieldName)) ||
    // do not consider updated if value is empty - no real change was doen
    (!_.isEmpty(_.get(defaultOperator, fieldName)) &&
      _.isEqual(_.get(defaultOperator, fieldName), _.get(uploadedOperator, fieldName)))
  );
}

/**
 * @param {string} fileName
 * @returns {UploadMetadata}
 */
export const createtUpload = fileName => ({
  id: `${Date.now()}_${Math.random().toString()}`,
  name: '',
  data: undefined,
  type: 'Unknown',
  status: '',
  fileName,
  errored: false,
  overwritten: false
});

/**
 * Creates errored upload status
 * @param {string} fileName
 * @param {string} errorStatus
 */
export function createErroredUpload(fileName, errorStatus) {
  const upload = this.createtUpload(fileName);
  upload.errored = true;
  upload.status = errorStatus;

  return upload;
}

/**
 * Creates descriptor from path
 * @param {string} path
 * @returns {OperatorCrdDescriptor}
 */
export const generateDescriptorFromPath = path => {
  const descriptor = {
    path,
    description: _.startCase(path),
    displayName: _.startCase(path),
    // @ts-ignore
    'x-descriptors': []
  };

  return addIdToDescriptor(descriptor);
};

/**
 * Filter latest object based on defined type and namespace
 * Used for filtering roles / role bindings / service account
 * @param {UploadMetadata[]} uploads
 * @param {'ClusterRole'|'Role'|'ClusterRoleBinding'|'RoleBinding'|'ServiceAccount'} type
 * @param {string} namespace
 */
export function filterPermissionUploads(uploads, type, namespace) {
  return uploads
    .filter(up => {
      const name = _.get(up.data, 'metadata.name');
      return !up.errored && up.type === type && name === namespace;
    })
    .reverse()[0];
}

/**
 * Add default list of resources to CRD which have them undefined
 */
export function addDefaultResourceStructureToCrd(crd) {
  const resources = crd.resources && crd.resources.length > 0 ? crd.resources : getDefaultOnwedCRD().resources;
  return {
    ...crd,
    resources
  };
}

/**
 * @callback CustomMergerCallback
 * @param {*} initialValue
 * @param {*} updatedValue
 */

/**
 * Merge array of objects using defined object property as key (unique identifier)
 * By default _.merge is used to merge objects with same ID, but custom implementation can be supplied
 * @param {*[]} initialValues base value
 * @param {*[]} updatedValues applied new value
 * @param {string} keyProperty property name used to identify objects
 * @param {CustomMergerCallback} [customMerger] custom implementation of applying updatedValues into objects map
 */
export function mergeArrayOfObjectsByKey(initialValues, updatedValues, keyProperty, customMerger) {
  const map = new Map();

  // fill map with first object values
  initialValues.forEach(element => {
    map.set(element[keyProperty], element);
  });

  // merge second object into map by key value
  updatedValues.forEach(element => {
    const key = element[keyProperty];
    let merged = element;

    if (map.has(key)) {
      const value = map.get(key);

      if (typeof customMerger === 'function') {
        // use custom merge implementation for special cases
        merged = customMerger(value, element);
      } else {
        merged = _.merge(value, element);
      }
    }
    map.set(key, merged);
  });

  return Array.from(map.values());
}

/**
 * Merge CRD and merge its subcontent (resources & descriptors) preserving object uniqueness
 * @param {OperatorOwnedCrd} initial
 * @param {OperatorOwnedCrd} updated
 */
const mergeOwnedCRD = (initial, updated) =>
  _.mergeWith(initial, updated, (objValue, srcValue, key) => {
    switch (key) {
      case 'specDescriptors':
      case 'statusDescriptors':
        return mergeArrayOfObjectsByKey(objValue, srcValue, 'path');

      case 'resources':
        return mergeArrayOfObjectsByKey(objValue, srcValue, 'kind');

      default:
        return undefined;
    }
  });

/**
 * Merge owned CRDs using their kind as ID
 * @param {OperatorOwnedCrd[]} initialValue
 * @param {OperatorOwnedCrd[]} newValue
 */
export const mergeOwnedCRDs = (initialValue, newValue) => {
  let mergedCrds = mergeArrayOfObjectsByKey(initialValue, newValue, 'kind', mergeOwnedCRD);

  // remove sample crd if there is any other crd
  mergedCrds = mergedCrds.filter((crd, index, array) => array.length > 1 && !isOwnedCrdDefault(crd));

  // add default resources to CRDs which are missing them
  mergedCrds = mergedCrds.map(crd => addDefaultResourceStructureToCrd(crd));

  return mergedCrds;
};

/**
 * Converts Alm examples to JSON and merge them by kind before stringifying
 * @param {*} initialValue
 * @param {*} newValue
 */
export const mergeAlmExamples = (initialValue, newValue) => {
  const parsedInitialValue = typeof initialValue === 'string' ? JSON.parse(initialValue) : initialValue;
  const parsedNewValue = typeof newValue === 'string' ? JSON.parse(newValue) : newValue;

  let mergedAlmExamples = mergeArrayOfObjectsByKey(parsedInitialValue, parsedNewValue, 'kind');

  // removed default sample if any other is present (has to be synced with OwnedCRDs behavior!)
  mergedAlmExamples = mergedAlmExamples.filter(
    (example, index, array) => array.length > 1 && !isAlmExampleDefault(example)
  );

  return JSON.stringify(mergedAlmExamples);
};

/**
 * In case of deployments we do not merge them, but overwrite
 * as they do not follow same structure which can be easily merged
 * @param {*[]} initialValue
 * @param {*[]} newValue
 */
export const mergeDeployments = (initialValue, newValue) => {
  let deployments = mergeArrayOfObjectsByKey(initialValue, newValue, 'name', (initial, updated) => updated);

  // remove default sample deployment if any other is provided
  deployments = deployments.filter((deployment, index, array) => array.length > 1 && !isDeploymentDefault(deployment));

  return deployments;
};
