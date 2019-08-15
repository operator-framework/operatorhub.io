/**
 * @typedef OperatorMetadataAnnotations
 * @prop {string}  'alm-examples'
 * @prop {string}  categories
 * @prop {'true'|'false'} certified
 * @prop {string}  description
 * @prop {string}  containerImage
 * @prop {string}  support
 * @prop {string}  capabilities
 * @prop {string}  repository
 */

/**
 * @typedef OperatorMetadata
 * @prop {string} name
 * @prop {string} namespace
 * @prop {OperatorMetadataAnnotations} annotations
 */

/**
 * @typedef OperatorDescription
 * @prop {string} aboutApplication
 * @prop {string} aboutOperator
 * @prop {string} prerequisites
 */

/**
 * @typedef OperatorMaintainer
 * @prop {string} name
 * @prop {string} email
 */

/**
 * @typedef OperatorProvider
 * @prop {string} name
 */

/**
 * @typedef OperatorLink
 * @prop {string} name
 * @prop {string} url
 */

/**
 * @typedef OperatorIcon
 * @prop {string} base64data
 * @prop {string} mediatype
 */

/**
 * @typedef OperatorCrd
 * @prop {string} name
 * @prop {string} displayName
 * @prop {string} kind
 * @prop {string} version
 * @prop {string} description
 */

/**
 * @typedef OperatorCrdResource
 * @prop {string} version
 * @prop {string} kind
 */

/**
 * @typedef OperatorCrdDescriptor
 * @prop {string} displayName
 * @prop {string} description
 * @prop {string} path
 * @prop {string[]} 'x-descriptors'
 */

/**
 * @typedef OperatorOwnedCrdResources
 * @prop {OperatorCrdResource[]} resources
 * @prop {OperatorCrdDescriptor[]} specDescriptors
 * @prop {OperatorCrdDescriptor[]} statusDescriptors
 */

/**
 * @typedef {OperatorCrd & OperatorOwnedCrdResources} OperatorOwnedCrd
 * @prop {OperatorCrdResource[]} resources
 */

/**
 * @typedef OperatorPermissionRule
 * @prop {string} apiGroup
 * @prop {string[]} resources
 * @prop {string[]} verbs
 */

/**
 * @typedef OperatorPermission
 * @prop {string} serviceAccountName
 * @prop {OperatorPermissionRule[]} rules
 */

/**
 * @typedef OperatorInstall
 * @prop {string} strategy
 * @prop {object} spec
 * @prop {OperatorPermission[]} spec.permissions
 * @prop {OperatorPermission[]} spec.clusterPermissions
 * @prop {*[]} spec.deployments
 */

/**
 * @typedef OperatorSpec
 * @prop {string} displayName
 * @prop {OperatorDescription} description
 * @prop {string} maturity
 * @prop {string} version
 * @prop {string} replaces
 * @prop {string}  minKubeVersion
 * @prop {string[]} keywords
 * @prop {OperatorMaintainer[]} maintainers
 * @prop {OperatorProvider} provider
 * @prop {Record<string, string>}  labels
 * @prop {object} selector
 * @prop {Record<string, string>} selector.matchLabels
 * @prop {OperatorLink[]} links
 * @prop {OperatorIcon} icon
 * @prop {object} customresourcedefinitions
 * @prop {OperatorOwnedCrd[]} customresourcedefinitions.owned
 * @prop {OperatorCrd[]} customresourcedefinitions.required
 * @prop {OperatorInstall} install
 * @prop {OperatorInstallModes} installModes
 */

/**
 * @typedef OperatorInstallMode
 * @prop {string} type
 * @prop {boolean} supported
 */

/**
 * @typedef {OperatorInstallMode[]} OperatorInstallModes
 */

/**
 * @typedef Operator
 * @prop {'operators.coreos.com/v1alpha1'} apiVersion
 * @prop {'ClusterServiceVersion'} kind
 * @prop {OperatorMetadata} metadata
 * @prop {OperatorSpec} spec
 */
