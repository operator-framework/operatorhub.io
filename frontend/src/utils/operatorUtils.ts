import _ from 'lodash-es';
import {
  OPERATOR_DESCRIPTION_ABOUT_HEADER,
  OPERATOR_DESCRIPTION_APPLICATION_HEADER,
  OPERATOR_DESCRIPTION_PREREQUISITES_HEADER,
  LOCAL_STORAGE_KEY
} from './constants';
import * as operatorTypes from './operatorTypes';
import { PacakgeEditorChannel, PackageEditorOperatorVersionMetadata } from './packageEditorTypes';
import { UploadMetadata } from '../components/uploader';

/**
 * Convert version format without dashes
 */
const normalizeVersion = (version: string) => {
  let normVersion = version.replace(/-beta/gi, 'beta');
  normVersion = normVersion.replace(/-alpha/gi, 'alpha');

  return normVersion;
};

export const validCapabilityStrings = [
  'Basic Install',
  'Seamless Upgrades',
  'Full Lifecycle',
  'Deep Insights',
  'Auto Pilot'
];

/**
 * Maps capability to fixed lists
 */
const normalizeCapabilityLevel = (capability: string) => {
  if (validCapabilityStrings.includes(capability)) {
    return capability;
  }
  return validCapabilityStrings[0];
};

/**
 * Search for deployment example by kind
 */
const getExampleYAML = (kind: string, operator: operatorTypes.Operator): object | null => {
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

/**
 * Merge operator description subsections into single string
 */
export const mergeDescriptions = (operator: operatorTypes.Operator) => {
  const description: string[] = [
    _.get(operator, 'spec.description.aboutApplication', ''),
    _.get(operator, 'spec.description.aboutOperator', ''),
    _.get(operator, 'spec.description.prerequisites', '')
  ];

  // add trailing line break if is missing
  return description.reduce((aggregator, value) => aggregator + (value.endsWith('\n') ? value : `${value}\n`), '');
};



const normalizeCRD = (crd: operatorTypes.CustomResourceFile, operator: operatorTypes.Operator): operatorTypes.NormalizedCrdPreview => ({
  name: _.get(crd, 'name', 'Name Not Available'),
  kind: crd.kind,
  displayName: _.get(crd, 'displayName', 'Name Not Available'),
  description: _.get(crd, 'description', 'No description available'),
  yamlExample: getExampleYAML(crd.kind, operator)
});

const normalizeCRDs = (operator: operatorTypes.Operator) => {
  const customResourceDefinitions = _.get(operator, 'spec.customresourcedefinitions.owned');
  return _.map(customResourceDefinitions, crd => normalizeCRD(crd, operator));
};

export const generateIdFromVersionedName = (name: string) => name.slice(0, name.indexOf('.'));

const isGlobalOperator = installModes => _.some(installModes, { type: 'AllNamespaces', supported: true });




export const normalizeOperator = (operator: operatorTypes.Operator) => {
  const annotations: operatorTypes.OperatorMetadataAnnotations = _.get(operator, 'metadata.annotations', {});
  const spec: operatorTypes.OperatorSpec | null = _.get(operator, 'spec', null);
  const iconObj = _.get(spec, 'icon[0]');
  const categoriesString = _.get(annotations, 'categories', '');
  const packageInfo = _.get(operator, 'packageInfo', {});

  const description = _.get(spec, 'description', '');
  // fallback to short description
  let longDescription = annotations.description || '';

  // replace with proper long description if available
  if (typeof description === 'object') {
    longDescription = mergeDescriptions(operator);
  } else if (description !== '') {
    longDescription = description;
  }

  const normalized: operatorTypes.NormalizedOperatorPreview = {
    id: generateIdFromVersionedName(operator.metadata.name),
    name: operator.metadata.name,
    displayName: _.get(spec, 'displayName', operator.metadata.name),
    imgUrl: iconObj ? `data:${iconObj.mediatype};base64,${iconObj.base64data}` : '',
    longDescription,
    provider: _.get(spec, 'provider.name'),
    version: spec ? spec.version : '',
    versionForCompare: normalizeVersion(spec ? spec.version : ''),
    capabilityLevel: normalizeCapabilityLevel(annotations.capabilities || ''),
    links: spec ? spec.links : [],
    repository: annotations.repository,
    maintainers: spec ? spec.maintainers : [],
    managedBy: annotations['app.kubernetes.io/managed-by'],
    helmRepoName: annotations['app.kubernetes.io/helm-repo-name'],
    helmRepoUrl: annotations['app.kubernetes.io/helm-repo-url'],
    helmChart: annotations['app.kubernetes.io/helm-chart'],
    description: annotations.description,
    categories: categoriesString && categoriesString.split(',').map(category => category.trim()) || [],
    createdAt: annotations.createdAt && `${annotations.createdAt}`,
    containerImage: annotations.containerImage,
    customResourceDefinitions: normalizeCRDs(operator),
    packageName: packageInfo.packageName,
    channels: packageInfo.channels,
    globalOperator: isGlobalOperator(_.get(spec, 'installModes'))
  };

  return normalized;
};

export const getDefaultAlmExample = () => ({
  apiVersion: '',
  kind: '',
  metadata: {
    name: ''
  },
  spec: {}
});

const defaultOperator: operatorTypes.Operator = {
  apiVersion: 'operators.coreos.com/v1alpha1',
  kind: 'ClusterServiceVersion',
  metadata: {
    name: '',
    namespace: 'placeholder',
    annotations: {
      'alm-examples': `[${JSON.stringify(getDefaultAlmExample())}]`,
      categories: '',
      certified: 'false',
      createdAt: '',
      description: '',
      containerImage: '',
      support: '',
      capabilities: validCapabilityStrings[0],
      repository: ''
    }
  },
  spec: {
    displayName: '',
    description: {
      aboutApplication: `${OPERATOR_DESCRIPTION_APPLICATION_HEADER}\n`,
      aboutOperator: `${OPERATOR_DESCRIPTION_ABOUT_HEADER}\n`,
      prerequisites: `${OPERATOR_DESCRIPTION_PREREQUISITES_HEADER}\n`
    },
    maturity: '',
    version: '',
    replaces: '',
    skips: [],
    minKubeVersion: '',
    keywords: [],
    maintainers: [{ name: '', email: '' }],
    provider: { name: '' },
    labels: {},
    selector: {
      matchLabels: {}
    },
    links: [{ name: '', url: '' }],
    icon: [{ base64data: '', mediatype: '' }],
    customresourcedefinitions: {
      owned: [
        {
          name: 'add-crd',
          displayName: '',
          kind: '',
          version: '',
          description: '',
          resources: [
            { version: 'v1', kind: 'Deployment' },
            { version: 'v1', kind: 'Service' },
            { version: 'v1', kind: 'ReplicaSet' },
            { version: 'v1', kind: 'Pod' },
            { version: 'v1', kind: 'Secret' },
            { version: 'v1', kind: 'ConfigMap' }
          ],
          specDescriptors: [],
          statusDescriptors: []
        }
      ],
      required: []
    },
    install: {
      strategy: 'deployment',
      spec: {
        permissions: [],
        clusterPermissions: [],
        deployments: [
          {
            name: 'add-deployment',
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
          }
        ]
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

// parsing json is significantly faster than deepCloning it
const defaultOperatorJSON = JSON.stringify(defaultOperator);

export function getDefaultOperator(): operatorTypes.Operator {
  return JSON.parse(defaultOperatorJSON);
}

export function getDefaultOperatorWithName(packageName: string, version: string){
  const operator = getDefaultOperator();

  operator.metadata.name = packageName;
  operator.spec.version = version;

  return operator;
}

export function getDefaultDescription() {
  return _.clone(defaultOperator.spec.description);
}

export function getDefaultRequiredCRD() {
  return {
    name: 'add-crd',
    displayName: '',
    kind: '',
    version: '',
    description: ''
  };
}

/** @private */
const defaultOnwedCrdRef = getDefaultOperator().spec.customresourcedefinitions.owned[0];

export function getDefaultOnwedCRD() {
  return _.cloneDeep(defaultOnwedCrdRef);
}

export function getDefaultOwnedCRDResources() {
  return [
    { version: 'v1', kind: 'Deployment' },
    { version: 'v1', kind: 'Service' },
    { version: 'v1', kind: 'ReplicaSet' },
    { version: 'v1', kind: 'Pod' },
    { version: 'v1', kind: 'Secret' },
    { version: 'v1', kind: 'ConfigMap' }
  ];
}

/** @private */
const defaultDeploymentRef = getDefaultOperator().spec.install.spec.deployments[0];

export function getDefaultDeployment() {
  return _.cloneDeep(defaultDeploymentRef);
}

export function getDefaultCrdDescriptor(): operatorTypes.OperatorCrdDescriptor {
  return { id: Date.now().toString(), displayName: '', description: '', path: '', 'x-descriptors': [] };
}

/** @param {operatorTypes.Operator} operator */
export const isDefaultOperator = operator => _.isEqual(operator, defaultOperator);
export const isOwnedCrdDefault = crd => _.isEqual(crd, defaultOnwedCrdRef);
export const isRequiredCrdDefault = crd => _.isEqual(crd, getDefaultRequiredCRD());
export const isDeploymentDefault = deployment => _.isEqual(deployment, defaultDeploymentRef);
export const isAlmExampleDefault = almExample => _.isEqual(almExample, getDefaultAlmExample());
export const isCrdDescriptorDefault = descriptor => {
  const defaultDescriptor = getDefaultCrdDescriptor();

  return ['displayName', 'description', 'path', 'x-descriptors'].every(prop =>
    _.isEqual(descriptor[prop], defaultDescriptor[prop])
  );
};

/**
 * Convert ALM examples to objects so we can find one for current CRD
 * @returns {*[]}
 */
export const convertExampleYamlToObj = examples => {
  let crdTemplates;
  if (_.isString(examples)) {
    try {
      crdTemplates = JSON.parse(examples);
    } catch (e) {
      console.error(`Unable to convert alm-examples: ${e}`);
      crdTemplates = [];
    }
  } else {
    crdTemplates = examples;
  }
  return crdTemplates;
};

export interface AutoSavedData {
  editorState: {
    uploads: UploadMetadata[],
    operator: operatorTypes.Operator
  },
  packageEditorState: {
    packageName: string,
    channels: PacakgeEditorChannel[],
    operatorVersions: PackageEditorOperatorVersionMetadata[],
    versionsWithoutChannel: string[]
  }
}

// cache data to reduce reads from multiple requests
let savedData: AutoSavedData | null = null;

/**
 * Load autosaved operator and editor metadata or use default if none is saved
 * or browser disabled local storage (e.g. some private modes)
 */
export const getAutoSavedOperatorData = () => {

  if(savedData === null){
    try {
      // cast response to string if it is null - clear local data
      savedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) + '');
    } catch (e) {
      console.warn("Localstorage is disabled. Autosave won't work.");
    }
  }

  return savedData;
};

export const clearAutosavedOperatorData = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    return false;
  }
  return true;
};
