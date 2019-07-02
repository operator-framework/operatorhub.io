import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { Icon } from 'patternfly-react';
import { safeLoadAll } from 'js-yaml';

import { helpers } from '../../../common/helpers';
import UploadUrlModal from '../../modals/UploadUrlModal';
import { reduxConstants } from '../../../redux/index';
import {
  normalizeYamlOperator,
  EDITOR_STATUS,
  sectionsFields,
  getMissingCrdUploads
} from '../../../pages/operatorBundlePage/bundlePageUtils';
import { defaultOperator, getDefaultOnwedCRD, generateIdFromVersionedName } from '../../../utils/operatorUtils';
import UploaderDropArea from './UploaderDropArea';
import UploaderObjectList from './UploaderObjectList';
import {
  setSectionStatusAction,
  updateOperatorPackageAction,
  setUploadsAction,
  storeEditorOperatorAction
} from '../../../redux/actions/editorActions';

const validFileTypes = ['.yaml'];
const validFileTypesRegExp = new RegExp(`(${validFileTypes.join('|').replace(/\./g, '\\.')})$`, 'i');

class ManifestUploader extends React.Component {
  state = {
    uploadUrlShown: false,
    uploadExpanded: false
  };

  componentDidMount() {
    const { uploads, operator } = this.props;

    const missingCrdUploads = getMissingCrdUploads(uploads, operator).length > 0;

    this.setState({
      uploadExpanded: missingCrdUploads
    });
  }

  /**
   * Derive file type from its content
   * @param {*} content
   * @returns {TypeAndName|null}
   */
  getObjectNameAndType = content => {
    if (content.kind && content.apiVersion && content.metadata) {
      const apiName = content.apiVersion.substring(0, content.apiVersion.indexOf('/'));

      if (content.kind === 'ClusterServiceVersion' && apiName === 'operators.coreos.com') {
        return {
          type: 'ClusterServiceVersion',
          name: content.metadata.name
        };
      } else if (content.kind === 'CustomResourceDefinition' && apiName === 'apiextensions.k8s.io') {
        return {
          type: 'CustomResourceDefinition',
          name: content.metadata.name
        };
      }
      // package file is different with no kind and API
    } else if (content.packageName && content.channels) {
      return {
        type: 'Package',
        name: content.packageName
      };
    }

    return null;
  };

  /**
   * Detects file upload overwriting other version of same file
   * @param {UploadMetadata[]} uploads
   */
  markReplacedObjects = uploads => {
    // iterate over uploads backwards
    for (let i = uploads.length - 1; i >= 0; i--) {
      const upload = uploads[i];

      if (
        (!upload.errored && upload.type === 'ClusterServiceVersion') ||
        (upload.type === 'CustomResourceDefinition' && upload.data)
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
  };

  /**
   * Parse uploaded file
   * @param {UploadMetadata} upload upload metadata object
   */
  processUploadedObject = upload => {
    const typeAndName = this.getObjectNameAndType(upload.data || {});

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
    } else if (upload.type === 'Package') {
      this.processPackageFile(upload.data);
    }

    return upload;
  };

  /**
   * @param {string} fileName
   * @returns {UploadMetadata}
   */
  createtUpload = fileName => ({
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
  createErroredUpload = (fileName, errorStatus) => {
    const upload = this.createtUpload(fileName);
    upload.errored = true;
    upload.status = errorStatus;

    return upload;
  };

  /**
   * Converts file content into separate objects after upload
   * @param {string} fileContent yaml string to parse
   * @param {string} fileName
   */
  splitUploadedFileToObjects = (fileContent, fileName) => {
    let parsedObjects = [];

    try {
      parsedObjects = safeLoadAll(fileContent);
    } catch (e) {
      return [this.createErroredUpload(fileName, 'Parsing Errors')];
    }

    const uploads = parsedObjects.map(object => {
      const upload = this.createtUpload(fileName);
      upload.data = object;

      return this.processUploadedObject(upload);
    });

    return uploads;
  };

  /**
   * Update package data from package file
   */
  processPackageFile = parsedFile => {
    const { operatorPackage, updateOperatorPackage, markSectionForReview } = this.props;
    const channel = parsedFile.channels && parsedFile.channels[0] ? parsedFile.channels[0] : null;

    updateOperatorPackage({
      name: parsedFile.packageName,
      channel: channel ? channel.name : operatorPackage.channel
    });

    markSectionForReview('package');
  };

  /**
   * Pre-process CSV file and store it redux
   * @param {*} parsedFile
   */
  processCsvFile = parsedFile => {
    const { operator, storeEditorOperator } = this.props;

    const normalizedOperator = normalizeYamlOperator(parsedFile);

    // only CSV.yaml is used to populate operator in editor. Other files have special roles
    const mergedOperator = _.merge({}, operator, normalizedOperator);

    this.compareSections(operator, mergedOperator, normalizedOperator);
    this.augmentOperator(mergedOperator, normalizedOperator);
    storeEditorOperator(mergedOperator);
  };

  /**
   * Apply modifications on uploaded operator as adding default resources to CRDs
   */
  augmentOperator = (operator, uploadedOperator) => {
    const clonedOperator = _.cloneDeep(operator);
    const ownedCrds = _.get(clonedOperator, sectionsFields['owned-crds'], []);

    _.set(
      clonedOperator,
      sectionsFields['owned-crds'],
      ownedCrds.map(crd => this.addDefaultResourceStructureToCrd(crd))
    );

    // replace example deployments with uploaded as merge might add undesired properties!
    const deployments = _.get(uploadedOperator, sectionsFields.deployments);
    if (deployments) {
      _.set(operator, sectionsFields.deployments, deployments);
    }

    return clonedOperator;
  };

  /**
   * Add default list of resources to CRD which have them undefined
   */
  addDefaultResourceStructureToCrd = crd => {
    const resources = crd.resources && crd.resources.length > 0 ? crd.resources : getDefaultOnwedCRD().resources;
    return {
      ...crd,
      resources
    };
  };

  /**
   * Check defined editor sections and mark them for review if are affected by upload
   * @param {*} operator operator state before upload
   * @param {*} merged operator state after upload is applied
   * @param {*} uploaded actual uploaded operator
   */
  compareSections = (operator, merged, uploaded) => {
    const { markSectionForReview } = this.props;

    Object.keys(sectionsFields).forEach(sectionName => {
      const fields = sectionsFields[sectionName];
      let updated = false;

      // check if operator fields are same as before upload
      if (typeof fields === 'string') {
        updated = this.operatorFieldWasUpdated(fields, operator, uploaded, merged);
      } else {
        updated = fields.some(path => this.operatorFieldWasUpdated(path, operator, uploaded, merged));
      }

      if (updated) {
        // mark section as review needed
        markSectionForReview(sectionName);
      }
    });
  };

  /**
   * Identify if operator field was changed by upload
   */
  operatorFieldWasUpdated = (fieldName, operator, uploadedOperator, mergedOperator) =>
    // field changed when either its value changed
    // or uploaded operator was same as default values
    !_.isEqual(_.get(operator, fieldName), _.get(mergedOperator, fieldName)) ||
    // do not consider updated if value is empty - no real change was doen
    (!_.isEmpty(_.get(defaultOperator, fieldName)) &&
      _.isEqual(_.get(defaultOperator, fieldName), _.get(uploadedOperator, fieldName)));

  /**
   * Handle upload using URL dialog
   */
  doUploadUrl = (contents, url) => {
    const { uploads, setUploads } = this.props;

    const recentUploads = this.splitUploadedFileToObjects(contents, url);

    this.setState({ uploadUrlShown: false });

    const newUploads = this.markReplacedObjects([...uploads, ...recentUploads]);

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
    let fileToUpload = files.item(fileIndex);

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

        const upload = this.splitUploadedFileToObjects(reader.result, fileToUpload.name);
        const newUploads = this.markReplacedObjects([...uploads, ...upload]);

        setUploads(newUploads);
      };

      reader.onerror = () => {
        const { uploads, setUploads } = this.props;

        const upload = this.createErroredUpload(fileToUpload.name, reader.error.message);

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
   * @param {*} e
   * @param {number} id index (id) of the upload to remove
   */
  removeUpload = (e, id) => {
    const { uploads, setUploads } = this.props;

    e.preventDefault();

    // reset overwritten state of uploads and determine new
    let newUploads = uploads
      .filter(upload => upload.id !== id)
      .map(upload => ({
        ...upload,
        overwritten: false
      }));
    newUploads = this.markReplacedObjects(newUploads);

    setUploads(newUploads);
  };

  showUploadUrl = e => {
    e.preventDefault();
    this.setState({ uploadUrlShown: true });
  };

  hideUploadUrl = () => {
    this.setState({ uploadUrlShown: false });
  };

  /**
   * Exapnd / collapse uploader and file list
   */
  toggleUploadExpanded = event => {
    const { uploadExpanded } = this.state;

    event.preventDefault();
    this.setState({ uploadExpanded: !uploadExpanded });
  };

  render() {
    const { uploads, operator } = this.props;
    const { uploadUrlShown, uploadExpanded } = this.state;
    const missingCrds = getMissingCrdUploads(uploads, operator);

    return (
      <div className="oh-operator-editor-page__section">
        <div className="oh-operator-editor-page__section__header">
          <div className="oh-operator-editor-page__section__header__text">
            <h2 id="oh-operator--editor-page__manifest-uploader">Upload your Kubernetes manifests</h2>
            <p>
              Upload your existing YAML manifests of your Operators deployment. We support <code>Deployments</code>,
              <code>(Cluster)Roles</code>, <code>(Cluster)RoleBindings</code>, <code>ServiceAccounts</code> and{' '}
              <code>CustomResourceDefinition</code> objects. The information from these objects will be used to populate
              your Operator metadata. Alternatively, you can also upload an existing CSV.
              <br />
              <br />
              <b>Note:</b> For a complete bundle the CRDs manifests are required.
            </p>
          </div>
          <div className="oh-operator-editor-page__section__status">
            {uploadExpanded ? (
              <a onClick={this.toggleUploadExpanded}>
                <Icon type="fa" name="compress" />
                Collapse
              </a>
            ) : (
              <a onClick={this.toggleUploadExpanded}>
                <Icon type="fa" name="expand" />
                Expand
              </a>
            )}
          </div>
        </div>
        {uploadExpanded && (
          <React.Fragment>
            <UploaderDropArea showUploadUrl={this.showUploadUrl} doUploadFile={this.doUploadFiles} />
            <UploaderObjectList
              uploads={uploads}
              missingUploads={missingCrds}
              removeUpload={this.removeUpload}
              removeAllUploads={this.removeAllUploads}
            />
            <UploadUrlModal show={uploadUrlShown} onUpload={this.doUploadUrl} onClose={this.hideUploadUrl} />
          </React.Fragment>
        )}
      </div>
    );
  }
}

ManifestUploader.propTypes = {
  operator: PropTypes.object,
  operatorPackage: PropTypes.object,
  uploads: PropTypes.array,
  showErrorModal: PropTypes.func,
  markSectionForReview: PropTypes.func,
  updateOperatorPackage: PropTypes.func,
  setUploads: PropTypes.func,
  storeEditorOperator: PropTypes.func
};

ManifestUploader.defaultProps = {
  operator: {},
  operatorPackage: {},
  uploads: [],
  showErrorModal: helpers.noop,
  markSectionForReview: helpers.noop,
  updateOperatorPackage: helpers.noop,
  setUploads: helpers.noop,
  storeEditorOperator: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  ...bindActionCreators(
    {
      showErrorModal: error => ({
        type: reduxConstants.CONFIRMATION_MODAL_SHOW,
        title: 'Error Uploading File',
        icon: <Icon type="pf" name="error-circle-o" />,
        heading: error,
        confirmButtonText: 'OK'
      }),
      markSectionForReview: sectionName => setSectionStatusAction(sectionName, EDITOR_STATUS.pending),
      updateOperatorPackage: updateOperatorPackageAction,
      setUploads: setUploadsAction,
      storeEditorOperator: storeEditorOperatorAction
    },
    dispatch
  )
});

const mapStateToProps = state => ({
  operator: state.editorState.operator,
  operatorPackage: state.editorState.operatorPackage,
  uploads: state.editorState.uploads
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ManifestUploader);
