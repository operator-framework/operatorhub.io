import * as _ from 'lodash-es';
import { operatorFieldValidators } from './operatorDescriptors';
import {
  OPERATOR_DESCRIPTION_ABOUT_HEADER,
  OPERATOR_DESCRIPTION_APPLICATION_HEADER,
  OPERATOR_DESCRIPTION_PREREQUISITES_HEADER
} from './constants';
import { sectionsFields, mergeDescriptions } from '../pages/operatorBundlePage/bundlePageUtils';

const normalizeVersion = version => {
  let normVersion = version.replace(/-beta/gi, 'beta');
  normVersion = normVersion.replace(/-alpha/gi, 'alpha');

  return normVersion;
};

const validCapabilityStrings = ['Basic Install', 'Seamless Upgrades', 'Full Lifecycle', 'Deep Insights', 'Auto Pilot'];

const normalizeCapabilityLevel = capability => {
  if (validCapabilityStrings.includes(capability)) {
    return capability;
  }
  return validCapabilityStrings[0];
};

const getExampleYAML = (kind, operator) => {
  const examples = _.get(operator, 'metadata.annotations.alm-examples');
  if (!examples) {
    return null;
  }

  try {
    let yamlExamples = examples;

    if (typeof yamlExamples === 'string') {
      yamlExamples = JSON.parse(examples);
    }

    return _.find(yamlExamples, { kind });
  } catch (e) {
    return null;
  }
};

const normalizeCRD = (crd, operator) => ({
  name: _.get(crd, 'name', 'Name Not Available'),
  kind: crd.kind,
  displayName: _.get(crd, 'displayName', 'Name Not Available'),
  description: _.get(crd, 'description', 'No description available'),
  yamlExample: getExampleYAML(crd.kind, operator)
});

const normalizeCRDs = operator => {
  const customResourceDefinitions = _.get(operator, 'spec.customresourcedefinitions.owned');
  return _.map(customResourceDefinitions, crd => normalizeCRD(crd, operator));
};

const generateIdFromVersionedName = name => name.slice(0, name.indexOf('.'));

const isGlobalOperator = installModes => _.some(installModes, { type: 'AllNamespaces', supported: true });

const normalizeOperator = operator => {
  const annotations = _.get(operator, 'metadata.annotations', {});
  const spec = _.get(operator, 'spec', {});
  const iconObj = _.get(spec, 'icon[0]');
  const categoriesString = _.get(annotations, 'categories');
  const packageInfo = _.get(operator, 'packageInfo', {});

  const description = _.get(spec, 'description');
  let longDescription = annotations.description;

  if (typeof description === 'object') {
    longDescription = mergeDescriptions(operator);
  }

  return {
    id: generateIdFromVersionedName(operator.metadata.name),
    name: operator.metadata.name,
    displayName: _.get(spec, 'displayName', operator.metadata.name),
    imgUrl: iconObj ? `data:${iconObj.mediatype};base64,${iconObj.base64data}` : '',
    longDescription,
    provider: _.get(spec, 'provider.name'),
    version: spec.version,
    versionForCompare: normalizeVersion(spec.version),
    capabilityLevel: normalizeCapabilityLevel(annotations.capabilities || ''),
    links: spec.links,
    repository: annotations.repository,
    maintainers: spec.maintainers,
    description: _.get(annotations, 'description'),
    categories: categoriesString && _.map(categoriesString.split(','), category => category.trim()),
    createdAt: annotations.createdAt && `${annotations.createdAt}`,
    containerImage: annotations.containerImage,
    customResourceDefinitions: normalizeCRDs(operator),
    packageName: packageInfo.packageName,
    channels: packageInfo.channels,
    globalOperator: isGlobalOperator(_.get(spec, 'installModes'))
  };
};

function getDefaultDescription() {
  return {
    aboutApplication: `${OPERATOR_DESCRIPTION_APPLICATION_HEADER}\n`,
    aboutOperator: `${OPERATOR_DESCRIPTION_ABOUT_HEADER}\n`,
    prerequisites: `${OPERATOR_DESCRIPTION_PREREQUISITES_HEADER}\n`
  };
}

const defaultCRD = {
  name: '',
  displayName: '',
  kind: '',
  version: '',
  description: ''
};

const defaultDeployment = {
  name: 'example-operator',
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        'k8s-app': 'example-operator'
      }
    },
    template: {
      metadata: {
        labels: {
          'k8s-app': 'example-operator'
        }
      },
      spec: {
        containers: {
          image: 'quay.io/example/example-operator:v0.0.1',
          imagePullPolicy: 'Always',
          name: 'example-operator',
          resources: {
            limits: {
              cpu: '200m',
              memory: '100Mi'
            },
            requests: {
              cpu: '100m',
              memory: '50Mi'
            }
          },
          env: [
            {
              name: 'WATCH_NAMESPACE',
              valueFrom: {
                fieldRef: {
                  fieldPath: "metadata.annotations['olm.targetNamespaces']"
                }
              }
            },
            {
              name: 'POD_NAME',
              valueFrom: {
                fieldRef: {
                  fieldPath: 'metadata.name'
                }
              }
            },
            {
              name: 'OPERATOR_NAME',
              value: 'example-operator'
            }
          ]
        },
        imagePullSecrets: [
          {
            name: ''
          }
        ],
        nodeSelector: {
          'beta.kubernetes.io/os': 'linux'
        },
        serviceAccountName: 'example-operator'
      }
    }
  }
};

const defaultOperator = {
  apiVersion: 'operators.coreos.com/v1alpha1',
  kind: 'ClusterServiceVersion',
  metadata: {
    name: '',
    namespace: 'placeholder',
    annotations: {
      'alm-examples': `[
        {
          "apiVersion": "",
          "kind": "",
          "metadata": {
            "name": ""
          },
          "spec": {}
        }
      ]`,
      categories: '',
      certified: false,
      description: '',
      containerImage: '',
      support: '',
      capabilities: validCapabilityStrings[0],
      repository: ''
    }
  },
  spec: {
    displayName: '',
    description: getDefaultDescription(),
    maturity: '',
    version: '',
    replaces: '',
    minKubeVersion: '',
    keywords: [],
    maintainers: [{ name: '', email: '' }],
    provider: { name: '' },
    labels: {},
    selector: {
      matchLabels: {}
    },
    links: [{ name: '', url: '' }],
    icon: { base64data: '', mediatype: '' },
    customresourcedefinitions: {
      owned: [_.clone(defaultCRD)],
      required: [_.clone(defaultCRD)]
    },
    install: {
      strategy: 'deployment',
      spec: {
        permissions: null,
        clusterPermissions: null,
        deployments: [_.cloneDeep(defaultDeployment)]
      }
    },
    installModes: [
      { type: 'OwnNamespace', supported: true },
      { type: 'SingleNamespace', supported: true },
      { type: 'MultiNamespace', supported: false },
      { type: 'AllNamespaces', supported: false }
    ]
  }
};

const isCrdDefault = crd => _.isEqual(crd, defaultCRD);

/**
 * @typedef PropError
 * @prop {string} PropError.key
 * @prop {string} PropError.value
 * @prop {string} PropError.keyError
 * @prop {string} PropError.valueError
 */

/**
 * Validate key - value object type and return array of error objects
 * @param {*} value
 * @param {FieldValidator} fieldValidator
 * @param {*} operator
 * @returns {string | PropError[] | null}
 */
const getObjectPropsErrors = (value, fieldValidator, operator) => {
  /** @type {PropError[]} */
  const propErrors = [];

  if (fieldValidator.required && _.isEmpty(value)) {
    return 'This field is required';
  }

  _.forEach(_.keys(value), key => {
    if (key || value[key]) {
      // check separately key and value
      const keyError = getValueError(key, _.get(fieldValidator, 'key'), operator);
      const valueError = getValueError(_.get(value, key), _.get(fieldValidator, 'value'), operator);

      if (keyError || valueError) {
        propErrors.push({ key, value: _.get(value, key), keyError, valueError });
      }
    }
  });

  return _.size(propErrors) ? propErrors : null;
};

/**
 * @typedef ArrayError
 * @prop {string} index
 * @prop {Object} errors - array of error messages for properties
 */

/**
 * Validates array of values and returns array of error objects
 * @param {*} value
 * @param {FieldValidator} fieldValidator
 * @param {*} operator
 */
const getArrayValueErrors = (value, fieldValidator, operator) => {
  /** @type {ArrayError[]} */
  const fieldErrors = [];

  _.forEach(value, (nextValue, index) => {
    const valueErrors = {};
    _.forEach(_.keys(fieldValidator.itemValidator), key => {
      const valueError = getValueError(nextValue[key], fieldValidator.itemValidator[key], operator);
      if (valueError) {
        valueErrors[key] = valueError;
      }
    });
    if (!_.isEmpty(valueErrors)) {
      fieldErrors.push({ index, errors: valueErrors });
    }
  });

  if (_.size(fieldErrors)) {
    return fieldErrors;
  }

  return null;
};

/**
 * @typedef FieldValidator
 * @prop {boolean=} FieldValidator.isObjectProps
 * @prop {boolean=} FieldValidator.isArray
 * @prop {FieldValidator=} FieldValidator.itemValidator
 * @prop {boolean=} FieldValidator.required
 * @prop {string=} FieldValidator.requiredError
 * @prop {function=} FieldValidator.validator
 * @prop {function=} FieldValidator.contextualValidator
 * @prop {function=} FieldValidator.isEmpty
 * @prop {any=} FieldValidator.regex
 */

/**
 * Validates single value
 * @param {*} value
 * @param {FieldValidator} fieldValidator
 * @param {*} operator
 */
const getValueError = (value, fieldValidator, operator) => {
  if (!fieldValidator) {
    return null;
  }

  if (fieldValidator.isObjectProps) {
    return getObjectPropsErrors(value, fieldValidator, operator);
  }

  if (fieldValidator.isArray) {
    if (fieldValidator.required && _.isEmpty(value)) {
      return fieldValidator.requiredError || 'At least one value is required.';
    }
    return getArrayValueErrors(value, fieldValidator, operator);
  }

  if (fieldValidator.contextualValidator) {
    return fieldValidator.contextualValidator(value, operator, fieldValidator);
  }

  if (_.isEmpty(value)) {
    return fieldValidator.required ? 'This field is required' : null;
  }

  if (fieldValidator.regex) {
    if (!fieldValidator.regex.test(value)) {
      return _.get(fieldValidator, 'regexErrorMessage');
    }
  }

  if (fieldValidator.validator) {
    return fieldValidator.validator(value);
  }

  return null;
};

/**
 * Validates field at defined path in operator
 * @param {*} operator
 * @param {string} field field path
 */
const getFieldValueError = (operator, field) => {
  const value = _.get(operator, field);
  const fieldValidator = _.get(operatorFieldValidators, field);

  return getValueError(value, fieldValidator, operator);
};

/**
 * Check validity of the operator part at defined path
 * @param {*} operatorSubSection
 * @param {*} validators
 * @param {string[]} path
 * @param {*} operator
 */
const areSubFieldValid = (operatorSubSection, validators, path, operator) => {
  const error = _.find(_.keys(validators), key => {
    const fieldValue = operatorSubSection[key];
    const fieldPath = path.concat([key]);

    /** @type FieldValidator */
    const validator = validators[key];

    if (getValueError(fieldValue, validator, operator)) {
      console.log(`${fieldPath.join('.')}:`, getValueError(fieldValue, validator, operator));
      return true;
    }

    if (!_.isObject(validator) || !_.isObject(fieldValue)) {
      return false;
    }

    // array or key-value pairs are already deeply validated by "getValueError" method
    if (validator.isArray || validator.isObjectProps) {
      // validator = validator.itemValidator;
      return false;
    }

    // props is used for extended validation data, not a nested field :/
    if (key !== 'props') {
      return !areSubFieldValid(fieldValue, validator, fieldPath, operator);
    }
    return false;
  });

  return !error;
};

/**
 * Removes empty values which are part of default operator,
 * but should not be part of final operator as they are invalid
 * @param {*} operator
 */
const removeEmptyOptionalValuesFromOperator = operator => {
  const clonedOperator = _.cloneDeep(operator);

  const ownedCRDs = _.get(clonedOperator, sectionsFields['owned-crds'], []).filter(crd => !isCrdDefault(crd));
  _.set(clonedOperator, sectionsFields['owned-crds'], ownedCRDs);

  const requiredCRDs = _.get(clonedOperator, sectionsFields['required-crds'], []).filter(crd => !isCrdDefault(crd));
  _.set(clonedOperator, sectionsFields['required-crds'], requiredCRDs);

  return clonedOperator;
};

/**
 * Validates complete operator
 * @param {*} operator
 */
const validateOperator = operator => {
  if (_.isEmpty(operator)) {
    return false;
  }

  // remove invalid defaults before validation so they do not cause false errors
  // they will get stripped before operator is exported
  const cleanedOperator = removeEmptyOptionalValuesFromOperator(operator);

  const error = _.find(_.keys(operatorFieldValidators), key => {
    // check root level validators
    if (getFieldValueError(cleanedOperator, key)) {
      console.log(`${key}: ${getFieldValueError(cleanedOperator, key)}`);
      return true;
    }

    // if root level is valid continue deeper
    return !areSubFieldValid(cleanedOperator[key], operatorFieldValidators[key], [key], operator);
  });

  return !error;
};

export {
  generateIdFromVersionedName,
  getDefaultDescription,
  normalizeOperator,
  defaultOperator,
  defaultDeployment,
  removeEmptyOptionalValuesFromOperator,
  validCapabilityStrings,
  validateOperator,
  getValueError,
  getFieldValueError
};
