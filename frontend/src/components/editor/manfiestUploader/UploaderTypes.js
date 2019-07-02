/**
 * @typedef {'Package'|'ClusterServiceVersion'|'CustomResourceDefinition'|'Unknown'} ObjectType
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
