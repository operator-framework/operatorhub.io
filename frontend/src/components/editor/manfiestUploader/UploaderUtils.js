import _ from 'lodash-es';

import { generateIdFromVersionedName, getDefaultOperator, getDefaultOnwedCRD } from '../../../utils/operatorUtils';
import { sectionsFields } from '../../../utils/constants';

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
export const generateDescriptorFromPath = path => ({
  path,
  description: _.startCase(path),
  displayName: _.startCase(path),
  // @ts-ignore
  'x-descriptors': []
});

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
 * Apply modifications on uploaded operator as adding default resources to CRDs
 */
export function augmentOperator(operator, uploadedOperator) {
  const clonedOperator = _.cloneDeep(operator);
  const ownedCrds = _.get(clonedOperator, sectionsFields['owned-crds'], []);

  _.set(clonedOperator, sectionsFields['owned-crds'], ownedCrds.map(crd => addDefaultResourceStructureToCrd(crd)));

  // replace example deployments with uploaded as merge might add undesired properties!
  const deployments = _.get(uploadedOperator, sectionsFields.deployments);
  if (deployments) {
    _.set(clonedOperator, sectionsFields.deployments, deployments);
  }

  return clonedOperator;
}
