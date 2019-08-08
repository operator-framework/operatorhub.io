export const OPERATOR_DESCRIPTION_APPLICATION_HEADER = '## About the managed application';
export const OPERATOR_DESCRIPTION_ABOUT_HEADER = '## About this Operator';
export const OPERATOR_DESCRIPTION_PREREQUISITES_HEADER = '## Prerequisites for enabling this Operator';
export const LOCAL_STORAGE_KEY = 'rh-operator-editor';
export const AUTOSAVE_FIELDS = ['operator', 'operatorPackage', 'sectionStatus', 'uploads'];
export const NEW_CRD_NAME = 'new-crd';

export const SPEC_CAPABILITIES = [
  'urn:alm:descriptor:com.tectonic.ui:podCount',
  'urn:alm:descriptor:com.tectonic.ui:endpointList',
  'urn:alm:descriptor:com.tectonic.ui:label',
  'urn:alm:descriptor:com.tectonic.ui:resourceRequirements',
  'urn:alm:descriptor:com.tectonic.ui:selector:',
  'urn:alm:descriptor:com.tectonic.ui:namespaceSelector',
  'urn:alm:descriptor:io.kubernetes:',
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
