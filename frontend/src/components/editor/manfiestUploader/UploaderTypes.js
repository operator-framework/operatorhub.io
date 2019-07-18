/**
 * @typedef {'Package'|'ClusterServiceVersion'|'CustomResourceDefinition'|'Deployment'|
 * 'ServiceAccount'|'ClusterRole'| 'Role'|'ClusterRoleBinding'|'RoleBinding'|'Unknown'} ObjectType
 */

/**
 * @typedef TypeAndName
 * @prop  {ObjectType} TypeAndName.type
 * @prop {string} TypeAndName.name
 */

/**
 * @typedef UploadMetadata
 * @prop {string} UploadMetadata.id
 * @prop {string} UploadMetadata.name
 * @prop {string} UploadMetadata.fileName
 * @prop {object=} UploadMetadata.data
 * @prop {ObjectType} UploadMetadata.type
 * @prop {boolean} UploadMetadata.errored
 * @prop {string} UploadMetadata.status
 * @prop {boolean} UploadMetadata.overwritten
 */

/**
 * @typedef MissingCRD
 * @prop {string} MissingCRD.name
 */

/**
 * @typedef KubernetesObject
 * @prop {string} KubernetesObject.apiVersion
 * @prop {string} KubernetesObject.kind
 * @prop {object} KubernetesObject.UploadMetadata
 * @prop {string} KubernetesObject.metadata.name
 */

/**
 * @typedef RoleObject
 * @prop {*} rules
 */

/**
 * @typedef {KubernetesObject & RoleObject} KubernetesRoleObject
 */

/**
 * @typedef RoleBindingSubject
 * @prop {string} RoleBindingSubject.kind
 * @prop {string} RoleBindingSubject.name
 */

/**
 * @typedef RoleBindingObject
 * @prop {RoleBindingSubject[]} RoleBindingObject.subjects
 * @prop {object} RoleBindingObject.roleRef
 * @prop {string} RoleBindingObject.roleRef.kind
 * @prop {string} RoleBindingObject.roleRef.name
 * @prop {string} RoleBindingObject.roleRef.apiGroup
 */

/**
 * @typedef {KubernetesObject & RoleBindingObject} KubernetsRoleBindingObject
 */
