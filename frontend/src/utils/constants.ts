import { match } from "react-router";

export const OPERATOR_DESCRIPTION_APPLICATION_HEADER = '## About the managed application';
export const OPERATOR_DESCRIPTION_ABOUT_HEADER = '## About this Operator';
export const OPERATOR_DESCRIPTION_PREREQUISITES_HEADER = '## Prerequisites for enabling this Operator';
export const LOCAL_STORAGE_KEY = 'oh-package-editor';
export const AUTOSAVED_STATE: {stateKey: string, fields: string[]}[]  = [
  {
    stateKey: 'editorState',
    fields: ['uploads', 'operator']
  },
  {
    stateKey: 'packageEditorState',
    fields: ['packageName', 'channels', 'operatorVersions', 'versionsWithoutChannel']
  }
];  


export const NEW_CRD_NAME = 'add-crd';

export const SPEC_CAPABILITIES = [
  'urn:alm:descriptor:com.tectonic.ui:podCount',
  'urn:alm:descriptor:com.tectonic.ui:endpointList',
  'urn:alm:descriptor:com.tectonic.ui:label',
  'urn:alm:descriptor:com.tectonic.ui:resourceRequirements',
  'urn:alm:descriptor:com.tectonic.ui:selector:',
  'urn:alm:descriptor:com.tectonic.ui:namespaceSelector',
  'urn:alm:descriptor:io.kubernetes:',
  'urn:alm:descriptor:io.kubernetes:Service',
  'urn:alm:descriptor:io.kubernetes:ServiceAccount',
  'urn:alm:descriptor:io.kubernetes:Secret',
  'urn:alm:descriptor:io.kubernetes:ConfigMap',
  'urn:alm:descriptor:com.tectonic.ui:booleanSwitch',
  'urn:alm:descriptor:com.tectonic.ui:password',
  'urn:alm:descriptor:com.tectonic.ui:checkbox',
  'urn:alm:descriptor:com.tectonic.ui:imagePullPolicy',
  'urn:alm:descriptor:com.tectonic.ui:updateStrategy',
  'urn:alm:descriptor:com.tectonic.ui:text',
  'urn:alm:descriptor:com.tectonic.ui:number',
  'urn:alm:descriptor:com.tectonic.ui:nodeAffinity',
  'urn:alm:descriptor:com.tectonic.ui:podAffinity',
  'urn:alm:descriptor:com.tectonic.ui:podAntiAffinity'
];

export const STATUS_CAPABILITIES = [
  'urn:alm:descriptor:com.tectonic.ui:podStatuses',
  'urn:alm:descriptor:com.tectonic.ui:podCount',
  'urn:alm:descriptor:org.w3:link',
  'urn:alm:descriptor:io.kubernetes.conditions',
  'urn:alm:descriptor:text',
  'urn:alm:descriptor:prometheusEndpoint',
  'urn:alm:descriptor:io.kubernetes.phase',
  'urn:alm:descriptor:io.kubernetes.phase:reason',
  'urn:alm:descriptor:io.kubernetes:'
];

export enum EDITOR_STATUS {
  empty = 'Empty',
  modified = 'Modified',
  all_good = 'All Good',
  errors= 'Invalid Entries'
};

export type EditorSectionNames = keyof typeof sectionsFields;

export type VersionEditorParamsMatch = match<{packageName: string, channelName: string, operatorVersion: string}>;

export interface ISectionFields{
  metadata: string[]
  'owned-crds': string
  'required-crds': string
  deployments: string
  permissions: string
  'cluster-permissions': string
  'install-modes': string
}

export const sectionsFields: ISectionFields = {
  metadata: [
    'metadata.name',
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


export const maturityOptions = ['planning', 'pre-alpha', 'alpha', 'beta', 'stable', 'mature', 'inactive', 'deprecated'];

export const categoryOptions = [
  'AI/Machine Learning',
  'Application Runtime',
  'Big Data',
  'Cloud Provider',
  'Database',
  'Developer Tools',
  'Integration & Delivery',
  'Logging & Tracing',
  'Monitoring',
  'Networking',
  'OpenShift Optional',
  'Security',
  'Storage',
  'Streaming & Messaging'
];

export const kindOptions = [
  'APIService',
  'CertificateSigningRequest',
  'ClusterRole',
  'ClusterRoleBinding',
  'ComponentStatus',
  'ConfigMap',
  'ControllerRevision',
  'CronJob',
  'CustomResourceDefinition',
  'DaemonSet',
  'Deployment',
  'Endpoints',
  'Event',
  'HorizontalPodAutoscaler',
  'Ingress',
  'Job',
  'Lease',
  'LimitRange',
  'LocalSubjectAccessReview',
  'MutatingWebhookConfiguration',
  'Namespace',
  'NetworkPolicy',
  'Node',
  'PersistentVolume',
  'PersistentVolumeClaim',
  'Pod',
  'PodDisruptionBudget',
  'PodSecurityPolicy',
  'PodTemplate',
  'PriorityClass',
  'ReplicaSet',
  'ReplicationController',
  'ResourceQuota',
  'Role',
  'RoleBinding',
  'Secret',
  'SelfSubjectAccessReview',
  'SelfSubjectRulesReview',
  'Service',
  'ServiceAccount',
  'StatefulSet',
  'StorageClass',
  'SubjectAccessReview',
  'TokenReview',
  'ValidatingWebhookConfiguration',
  'VolumeAttachment'
];
