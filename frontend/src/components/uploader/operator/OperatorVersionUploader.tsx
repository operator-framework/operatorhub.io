import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { safeLoadAll } from 'js-yaml';

import { noop } from '../../../common/helpers';
import { normalizeYamlOperator, getMissingCrdUploads, getUpdatedFormErrors } from '../../../pages/operatorBundlePage/bundlePageUtils';
import * as operatorUtils from '../../../utils/operatorUtils';
import { EDITOR_STATUS, sectionsFields, EditorSectionNames } from '../../../utils/constants';
import * as actions from '../../../redux/actions';
import * as utils from './UploaderUtils';
import { SecurityObjectTypes } from './UploaderUtils';

import UploaderDropArea from './UploaderDropArea';
import UploaderObjectList from './UploaderObjectList';
import { Operator, CustomResourceFile, OperatorOwnedCrd, CustomResourceTemplateFile } from '../../../utils/operatorTypes';
import { UploadMetadata, KubernetesRoleObject, KubernetsRoleBindingObject } from './UploaderTypes';
import UploaderBase from '../UploaderBase';

const validFileTypesRegExp = new RegExp(`(${['.yaml'].join('|').replace(/\./g, '\\.')})$`, 'i');

const OperatorVersionUploaderActions = {
  showErrorModal: actions.showUploaderErrorConfirmationModalAction,
  setSectionStatus: actions.setSectionStatusAction,
  setAllSectionsStatus: actions.setBatchSectionsStatusAction,
  setUploads: actions.setUploadsAction,
  storeEditorOperator: actions.storeEditorOperatorAction,
  showVersionMismatchWarning: (uploadVersion: string, currentVersion: string) => actions.showConfirmationModalAction({
    title: 'Uploaded CSV Version Mismatch',
    heading: `The uploaded CSV version ("${uploadVersion}") is not matched with the Operator Version previously specified. 
    The CSV version will be set as "${currentVersion}". You can change version on the Package Definition View.`,
    confirmButtonText: 'OK'
  })
};

export type OperatorVersionUploaderProps = {
  operator: Operator,
  version: string,
  uploads: UploadMetadata[]
} & typeof OperatorVersionUploaderActions;

class OperatorVersionUploader extends React.PureComponent<OperatorVersionUploaderProps> {

  static propTypes;
  static defaultProps;

  /**
   * Parse uploaded file
   * @param upload upload metadata object
   * @param processedUploads already processed uploads
   */
  processUploadedObject = (upload: UploadMetadata, processedUploads: UploadMetadata[]) => {
    const typeAndName = utils.getObjectNameAndType(upload.data || {});

    if (!typeAndName) {
      upload.status = 'Unsupported Object';
      upload.errored = true;
      return upload;
    }

    upload.type = typeAndName.type;
    upload.name = typeAndName.name;
    upload.status = 'Supported Object';

    if (upload.type === 'ClusterServiceVersion') {
      this.processCsvFile(upload.data);
    } else if (upload.type === 'CustomResourceDefinition') {
      this.processCrdFile(upload.data);
    } else if (upload.type === 'Deployment') {
      this.processDeployment(upload.data);
      // } else if (upload.type === 'Package') {
      //   this.processPackageFile(upload.data);
    } else if (upload.type === 'ServiceAccount') {
      this.processPermissionObject(upload, processedUploads);
    } else if (utils.securityObjectTypes.includes(upload.type)) {
      this.processPermissionObject(upload, processedUploads);
      // effectively CustomResource Template, but type vary...
    } else if (upload.type !== 'Unknown') {
      this.processCrTemplate(upload.data);
    }

    return upload;
  };

  /**
   * Converts file content into separate objects after upload
   * @param  fileContent yaml string to parse
   * @param  fileName
   */
  splitUploadedFileToObjects = (fileContent: string, fileName: string) => {
    let parsedObjects: any[] = [];

    try {
      parsedObjects = safeLoadAll(fileContent);
    } catch (e) {
      return [utils.createErroredUpload(fileName, 'Parsing Errors')];
    }

    // remove empty sections and fix mallformed files
    return parsedObjects
      .filter(object => object !== null)
      .reduce((uploads, object) => {
        const upload = utils.createtUpload(fileName);
        upload.data = object;

        return uploads.concat(this.processUploadedObject(upload, uploads));
      }, []);
  };

  /**
   * Parse CRD file and create Owned CRD and relevant alm example (cr template) for it
   */
  processCrdFile = (parsedFile: CustomResourceFile) => {
    const { operator, storeEditorOperator } = this.props;
    const newOperator = _.cloneDeep(operator);

    const specDescriptors = Object.keys(
      _.get(parsedFile, 'spec.validation.openAPIV3Schema.properties.spec.properties', {})
    );
    const statusDescriptors = Object.keys(
      _.get(parsedFile, 'spec.validation.openAPIV3Schema.properties.status.properties', {})
    );
    const kind: string = _.get(parsedFile, 'spec.names.kind', '');

    const uploadedCrd: OperatorOwnedCrd = {
      name: _.get(parsedFile, 'metadata.name', ''),
      displayName: _.startCase(kind),
      kind,
      version: _.get(parsedFile, 'spec.versions[0].name') || _.get(parsedFile, 'spec.version', ''),
      description: _.startCase(kind),
      resources: operatorUtils.getDefaultOwnedCRDResources(),
      specDescriptors: specDescriptors.map(utils.generateDescriptorFromPath),
      statusDescriptors: statusDescriptors.map(utils.generateDescriptorFromPath)
    };
    // use kind as display name - user can customize it later on
    uploadedCrd.displayName = uploadedCrd.kind;

    const ownedCrds: OperatorOwnedCrd[] = _.get(newOperator, sectionsFields['owned-crds'], []);
    let crd = ownedCrds.find(owned => owned.kind === uploadedCrd.kind);
    const examples = _.get(operator, 'metadata.annotations.alm-examples');
    const crdTemplates = operatorUtils.convertExampleYamlToObj(examples);

    if (crd) {
      console.log('Found existing CRD. Not overriding it.');

      // override generated CRDs, but not complete ones
      // cover usage with CR example which creates placeholder CR
      if (crd.name === '') {
        const index = ownedCrds.findIndex(ownedCrd => ownedCrd === crd);
        ownedCrds[index] = _.merge({}, crd, uploadedCrd);
      }
    } else {
      crd = _.merge(operatorUtils.getDefaultOnwedCRD(), uploadedCrd);

      // replace default crd example
      if (ownedCrds.length === 1 && operatorUtils.isOwnedCrdDefault(ownedCrds[0])) {
        ownedCrds[0] = crd;
      } else {
        ownedCrds.push(crd);
      }
    }

    const crdTemplate = this.findCustomResourceTemplate(crdTemplates, uploadedCrd.kind);

    if (crdTemplates.length === 1 && operatorUtils.isAlmExampleDefault(crdTemplates[0])) {
      crdTemplates[0] = crdTemplate;
    } else {
      crdTemplates.push(crdTemplate);
    }

    _.set(newOperator, sectionsFields['owned-crds'], ownedCrds);
    _.set(newOperator, 'metadata.annotations.alm-examples', JSON.stringify(crdTemplates));

    this.validateSection(newOperator, 'owned-crds');
    storeEditorOperator(newOperator);
  };

  /**
   * Find and provide relevant CR Template matching uploaded CRD
   */
  findCustomResourceTemplate = (crdTemplates: CustomResourceTemplateFile[], kind: string) => {
    const { uploads } = this.props;

    const matchingCrdTemplateUpload = uploads.find(upload => upload.type === kind);

    if (matchingCrdTemplateUpload) {
      return matchingCrdTemplateUpload.data;
    }

    let crdTemplate = crdTemplates.find(template => template.kind === kind);

    if (crdTemplate) {
      return crdTemplate;
    }
    crdTemplate = operatorUtils.getDefaultAlmExample();
    crdTemplate.kind = kind;
    return crdTemplate;
  };

  /**
   * Extract ALM example out of CR template if relevant CRD already exists
   */
  processCrTemplate = (parsedFile: CustomResourceTemplateFile) => {
    const { operator } = this.props;

    const crds = _.get(operator, sectionsFields['owned-crds'], []);
    const matchingCrd = crds.find(crd => crd.kind === parsedFile.kind);

    if (matchingCrd) {
      this.addCustomResourceExampleTemplate(parsedFile);
    }
  };

  /**
   * Pre-process CSV file and store it redux
   */
  processDeployment = parsedFile => {
    const { operator, storeEditorOperator } = this.props;
    const newOperator = _.cloneDeep(operator);
    let deployments = _.get(newOperator, sectionsFields.deployments, []);
    const name = _.get(parsedFile, 'metadata.name', `Deployment-${deployments.length + 1}`);

    if (parsedFile.spec) {
      const newDeployment = {
        // add name to deployment from operator, in case none exists
        name: name || _.get(newOperator, 'metadata.name'),
        spec: parsedFile.spec
      };

      // replace default deployment
      if (deployments.length === 1 && operatorUtils.isDeploymentDefault(deployments[0])) {
        deployments = [newDeployment];
      } else {
        deployments.push(newDeployment);
      }

      // set new deployments
      _.set(newOperator, sectionsFields.deployments, deployments);

      this.validateSection(newOperator, 'deployments');
      storeEditorOperator(newOperator);
    } else {
      console.warn(`Deployment object is invalid as doesn't contain spec object`);
    }
  };

  /**
   * Checks latest permission related object and decide
   * if we have enough uploaded data to create from it permission record
   */
  processPermissionObject = (upload: UploadMetadata, processedUploads: UploadMetadata[]) => {
    const { uploads } = this.props;
    const allUploads = uploads.concat(...processedUploads).concat(upload);

    const name = _.get(upload.data, 'metadata.name');
    if (!name) {
      console.log('Can\'t identify namespace for which to apply permissions!');
      return;
    }

    const hasAllServiceAccounts = (bindingUpload: UploadMetadata) => {
      const subjects = _.get(bindingUpload.data, 'subjects');
      return subjects
        .filter(subject => subject.kind === 'ServiceAccount')
        .every(subject => allUploads.some(upload => upload.type === 'ServiceAccount' && _.get(upload.data, 'metadata.name') === subject.name));
    };

    const processBinding = (kind: SecurityObjectTypes) => (bindingUpload: UploadMetadata) => {
      const roles = utils.filterPermissionUploads(allUploads, kind, 'metadata.name', _.get(bindingUpload.data, 'roleRef.name'));
      if (roles.length > 0) {
        console.log('Processing permissions for role: ', roles[0]);
        this.setPermissions(roles[0].data, bindingUpload.data);
      }
    };

    switch (upload.type) {
      case 'ServiceAccount':
        utils
          .filterServiceAccountBindings(allUploads, 'RoleBinding', name)
          .filter(bindingUpload => hasAllServiceAccounts(bindingUpload))
          .forEach(processBinding('Role'));

        utils
          .filterServiceAccountBindings(allUploads, 'ClusterRoleBinding', name)
          .filter(bindingUpload => hasAllServiceAccounts(bindingUpload))
          .forEach(processBinding('ClusterRole'));
        break;
      case 'RoleBinding':
        if (hasAllServiceAccounts(upload)) {
          processBinding('Role')(upload);
        }
        break;
      case 'ClusterRoleBinding':
        if (hasAllServiceAccounts(upload)) {
          processBinding('ClusterRole')(upload);
        }
        break;
      case 'Role':
        utils
          .filterPermissionUploads(allUploads, 'RoleBinding', 'roleRef.name', name)
          .filter(bindingUpload => hasAllServiceAccounts(bindingUpload))
          .forEach(processBinding('Role'));
        break;
      case 'ClusterRole':
        utils
          .filterPermissionUploads(allUploads, 'ClusterRoleBinding', 'roleRef.name', name)
          .filter(bindingUpload => hasAllServiceAccounts(bindingUpload))
          .forEach(processBinding('ClusterRole'));
        break;
    }
  };

  /**
   * Set permissions from collected kubernets objects
   */
  setPermissions = (roleObject: KubernetesRoleObject, roleBindingObject: KubernetsRoleBindingObject) => {
    const { operator, storeEditorOperator } = this.props;
    const newOperator = _.cloneDeep(operator);

    const { roleRef } = roleBindingObject;
    const subjects = roleBindingObject.subjects || [];
    const serviceAccounts = subjects.filter(subject => subject.kind === 'ServiceAccount');

    if (roleRef && roleRef.name) {
      const { rules } = roleObject;

      serviceAccounts.forEach(serviceAccount => {
        const serviceAccountName = serviceAccount.name;

        const permission = {
          serviceAccountName,
          rules: [...rules]
        };

        // define where to add permission based on kind
        const permissionType = roleObject.kind === 'Role' ? 'permissions' : 'cluster-permissions';

        // update operator with added permission
        const newPermissions = _.get(newOperator, sectionsFields[permissionType], []);
        newPermissions.push(permission);
        _.set(newOperator, sectionsFields[permissionType], newPermissions);

        this.validateSection(newOperator, permissionType);

        storeEditorOperator(newOperator);
      });
    } else {
      console.warn(`Role binding does not contain "roleRef" or it does not have name!`, roleBindingObject);
    }
  };

  /**
   * Pre-process CSV file and store it redux
   */
  processCsvFile = parsedFile => {
    const { operator, storeEditorOperator, version, showVersionMismatchWarning } = this.props;

    const normalizedOperator = normalizeYamlOperator(parsedFile);
    const clonedOperator = _.cloneDeep(operator);

    // only CSV.yaml is used to populate operator in editor. Other files have special roles
    const mergedOperator = _.mergeWith(clonedOperator, normalizedOperator, (objValue, srcValue, key) => {
      // handle owned CRDs
      switch (key) {
        // merge owned CRDs by kind
        case 'owned':
          return utils.mergeOwnedCRDs(objValue, srcValue);
        // merge requried CRDs by kind
        case 'required':
          return utils.mergeArrayOfObjectsByKey(objValue, srcValue, 'kind');
        case 'alm-examples':
          return utils.mergeAlmExamples(objValue, srcValue);
        // replace deployments instead of merging
        case 'deployments':
          return utils.mergeDeployments(objValue, srcValue);
        // merge permissions using serviceAccountName as unique ID
        case 'permissions':
        case 'clusterPermissions':
          return utils.mergeArrayOfObjectsByKey(objValue, srcValue, 'serviceAccountName');

        default:
          return undefined;
      }
    });

    if (mergedOperator.spec.version !== version) {
      showVersionMismatchWarning(mergedOperator.spec.version, version);

      // override version as it has to be defined in channel editor
      mergedOperator.spec.version = version;
    }

    this.compareSections(operator, mergedOperator, normalizedOperator);
    storeEditorOperator(mergedOperator);
  };

  /**
   * Proccess uploaded custom resource example file into ALM examples
   */
  addCustomResourceExampleTemplate = (template: CustomResourceTemplateFile) => {
    const { operator, storeEditorOperator } = this.props;
    const newOperator = _.cloneDeep(operator);

    const almExamples = _.get(newOperator, 'metadata.annotations.alm-examples', []);
    const crdExamples = operatorUtils.convertExampleYamlToObj(almExamples);

    const exampleIndex = crdExamples.findIndex(example => example.kind === template.kind);

    if (exampleIndex === -1) {
      // override default template
      if (crdExamples.length === 1 && operatorUtils.isAlmExampleDefault(crdExamples[0])) {
        crdExamples[0] = template;
      } else {
        crdExamples.push(template);
      }
    } else {
      crdExamples[exampleIndex] = _.merge(crdExamples[exampleIndex], template);
    }

    _.set(newOperator, 'metadata.annotations.alm-examples', JSON.stringify(crdExamples));

    this.validateSection(newOperator, 'owned-crds');
    storeEditorOperator(newOperator);
  };

  /**
   * Check defined editor sections and mark them for review if are affected by upload
   * @param  operator operator state before upload
   * @param  merged operator state after upload is applied
   * @param  uploaded actual uploaded operator
   */
  compareSections = (operator: Operator, merged: Operator, uploaded: Operator) => {
    const { setAllSectionsStatus } = this.props;

    const updatedSectionsStatus: Partial<Record<EditorSectionNames, EDITOR_STATUS>> = {};

    Object.keys(sectionsFields).forEach(sectionName => {
      const fields = sectionsFields[sectionName];
      let updated = false;

      // check if operator fields are same as before upload
      if (typeof fields === 'string') {
        updated = utils.operatorFieldWasUpdated(fields, operator, uploaded, merged);
      } else {
        updated = fields.some(path => utils.operatorFieldWasUpdated(path, operator, uploaded, merged));
      }

      if (updated) {
        const sectionErrors = getUpdatedFormErrors(merged, {}, fields);

        // check if some section field has error
        if (_.castArray(fields).some(field => _.get(sectionErrors, field))) {
          updatedSectionsStatus[sectionName] = EDITOR_STATUS.errors;
        } else {
          updatedSectionsStatus[sectionName] = EDITOR_STATUS.all_good;
        }
      }
    });

    if (Object.keys(updatedSectionsStatus).length > 0) {
      // section has errors / missing content so draw attention
      setAllSectionsStatus(updatedSectionsStatus);
    }
  };

  /**
   * Validates section and updates errors
   */
  validateSection = (operator: Operator, sectionName: EditorSectionNames) => {
    const { setSectionStatus } = this.props;
    const fields = sectionsFields[sectionName];

    const sectionErrors = getUpdatedFormErrors(operator, {}, fields);

    // check if some section field has error
    const sectionHasErrors = _.castArray(fields).some(field => _.get(sectionErrors, field));

    if (sectionHasErrors) {
      // section has errors / missing content so draw attention
      setSectionStatus(sectionName, EDITOR_STATUS.errors);
    } else {
      // mark section as review needed
      setSectionStatus(sectionName, EDITOR_STATUS.all_good);
    }
  };

  /**
   * Handle upload using URL dialog
   */
  doUploadUrl = (contents: string, url: string) => {
    const { uploads, setUploads } = this.props;

    const recentUploads = this.splitUploadedFileToObjects(contents, url);

    const newUploads = utils.markReplacedObjects([...uploads, ...recentUploads]);

    setUploads(newUploads);
  };

  /**
   * Handle direct multi-file upload using file uploader or drag and drop
   */
  doUploadFiles = files => {
    if (!files) {
      return;
    }
    let fileIndex = 0;
    let fileToUpload = files.item(0);

    while (fileToUpload) {
      this.readFile(fileToUpload);

      fileToUpload = files.item(++fileIndex);
    }
  };

  /**
   * Read file if its valid and pass it for processing
   */
  readFile = fileToUpload => {
    const isValidFileType = validFileTypesRegExp.test(fileToUpload.name);

    if (isValidFileType) {
      const reader = new FileReader();

      reader.onload = () => {
        const { uploads, setUploads } = this.props;

        const upload = this.splitUploadedFileToObjects(reader.result as string, fileToUpload.name);
        const newUploads = utils.markReplacedObjects([...uploads, ...upload]);

        setUploads(newUploads);
      };

      reader.onerror = () => {
        const { uploads, setUploads } = this.props;
        const errorMsg = reader.error && reader.error.message || '';

        const upload = utils.createErroredUpload(fileToUpload.name, errorMsg);

        // skip finding replaced files as this file errored

        setUploads([...uploads, upload]);

        reader.abort();
      };
      reader.readAsText(fileToUpload);
    } else {
      this.props.showErrorModal(`Unable to upload file '${fileToUpload.name}': Only yaml files are supported`);
    }
  };

  /**
   * Remove all uploaded files from the list
   */
  removeAllUploads = e => {
    const { setUploads } = this.props;

    e.preventDefault();
    setUploads([]);
  };

  /**
   * Remove specific upload by its index
   */
  removeUpload = (e: React.MouseEvent, id: string) => {
    const { uploads, setUploads } = this.props;

    e.preventDefault();

    // reset overwritten state of uploads and determine new
    let newUploads = uploads
      .filter(upload => upload.id !== id)
      .map(upload => ({
        ...upload,
        overwritten: false
      }));
    newUploads = utils.markReplacedObjects(newUploads);

    setUploads(newUploads);
  };

  render() {
    const { uploads, operator } = this.props;
    const missingCrds = getMissingCrdUploads(uploads, operator);

    return (
      <UploaderBase
        description={(
          <p>
            Upload your existing YAML manifests of your Operators deployment. We support <code>Deployments</code>,
                 <code>(Cluster)Roles</code>, <code>(Cluster)RoleBindings</code>, <code>ServiceAccounts</code> and{' '}
            <code>CustomResourceDefinition</code> objects. The information from these objects will be used to populate
              your Operator metadata. Alternatively, you can also upload an existing CSV.
                 <br />
            <br />
            <b>Note:</b> For a complete bundle the CRDs manifests are required.
          </p>
        )}
      >
        <React.Fragment>
          <UploaderDropArea onFileUpload={this.doUploadFiles} onUrlDownload={this.doUploadUrl} />
          <UploaderObjectList
            uploads={uploads}
            missingUploads={missingCrds}
            removeUpload={this.removeUpload}
            removeAllUploads={this.removeAllUploads}
          />
        </React.Fragment>
      </UploaderBase>
    );
  }
}

OperatorVersionUploader.propTypes = {
  operator: PropTypes.object,
  uploads: PropTypes.array,
  showErrorModal: PropTypes.func,
  setSectionStatus: PropTypes.func,
  setAllSectionsStatus: PropTypes.func,
  updateOperatorPackage: PropTypes.func,
  setUploads: PropTypes.func,
  storeEditorOperator: PropTypes.func
};

OperatorVersionUploader.defaultProps = {
  operator: {},
  uploads: [],
  showErrorModal: noop,
  setSectionStatus: noop,
  setAllSectionsStatus: noop,
  updateOperatorPackage: noop,
  setUploads: noop,
  storeEditorOperator: noop
};

const mapDispatchToProps = dispatch => bindActionCreators(OperatorVersionUploaderActions, dispatch);

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  uploads: state.editorState.uploads
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorVersionUploader);
