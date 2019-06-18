import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { Icon } from 'patternfly-react';
import { safeLoad } from 'js-yaml';

import { helpers } from '../../../common/helpers';
import UploadUrlModal from '../../modals/UploadUrlModal';
import { reduxConstants } from '../../../redux/index';
import {
  normalizeYamlOperator,
  EDITOR_STATUS,
  sectionsFields,
  getMissingCrdUploads
} from '../../../pages/operatorBundlePage/bundlePageUtils';
import { defaultOperator, getDefaultOnwedCRD } from '../../../utils/operatorUtils';
import UploaderDropArea from './UploaderDropArea';
import UploaderFileList from './UploaderFileList';
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
    uploadExpanded: false,
    uploadCounter: 0
  };

  componentDidMount() {
    const { uploads, operator } = this.props;

    // increase found maximal counter
    const counter = 1 + Math.max(0, ...uploads.map(upload => upload.index));
    const missingCrdUploads = getMissingCrdUploads(uploads, operator).length > 0;

    this.setState({
      uploadCounter: counter,
      uploadExpanded: missingCrdUploads
    });
  }

  /**
   * Derive file type from its content
   */
  getFileType = (content, fileName) => {
    if (content.kind && content.apiVersion) {
      const apiName = content.apiVersion.substring(0, content.apiVersion.indexOf('/'));

      if (content.kind === 'ClusterServiceVersion' && apiName === 'operators.coreos.com') {
        return 'CSV';
      } else if (content.kind === 'CustomResourceDefinition' && apiName === 'apiextensions.k8s.io') {
        return 'CRD';
      }
      // package file is different with no kind and API
    } else if (content.packageName && content.channels) {
      return 'PKG';
    }

    console.warn(`Unknown file ${fileName}. Can't use it.`);
    return 'Unknown';
  };

  /**
   * Parse uploaded file
   * @param {*} upload upload metadata object
   * @param {*} file
   */
  processUploadedFile = (upload, file) => {
    let parsedFile = {};

    try {
      parsedFile = safeLoad(file);
      upload.data = parsedFile;
    } catch (e) {
      upload.status = 'Parsing Errors';
      upload.errored = true;
    }
    const fileType = this.getFileType(parsedFile || {}, upload);
    upload.type = fileType;

    if (fileType === 'Unknown') {
      upload.status = 'Unsupported File';
      upload.errored = true;
      return;
    }

    upload.status = 'Supported File';

    if (fileType === 'CSV') {
      this.processCsvFile(parsedFile);
    } else if (fileType === 'PKG') {
      this.processPackageFile(parsedFile);
    }
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
    const { uploadCounter } = this.state;

    const upload = {
      index: uploadCounter,
      data: undefined,
      type: 'Unknown',
      uploadFile: url,
      errored: false
    };
    this.processUploadedFile(upload, contents);

    this.setState({ uploadCounter: uploadCounter + 1, uploadUrlShown: false });

    setUploads([...uploads, upload]);
  };

  /**
   * Handle direct multi-file upload using file uploader or drag and drop
   */
  doUploadFiles = files => {
    const { uploadCounter } = this.state;

    if (!files) {
      return;
    }
    let fileIndex = 0;
    let fileToUpload = files.item(fileIndex);

    while (fileToUpload) {
      this.readFile(fileToUpload, uploadCounter + fileIndex);

      fileToUpload = files.item(++fileIndex);
    }

    // set counter state so we have correct unique key for uploaded files
    this.setState({ uploadCounter: uploadCounter + fileIndex });
  };

  /**
   * Read file if its valid and pass it for processing
   */
  readFile = (fileToUpload, index) => {
    const isValidFileType = validFileTypesRegExp.test(fileToUpload.name);

    if (isValidFileType) {
      const reader = new FileReader();

      const upload = {
        index,
        type: 'Unkown',
        data: undefined,
        uploadFile: fileToUpload.name,
        errored: false
      };

      reader.onload = () => {
        const { uploads, setUploads } = this.props;

        this.processUploadedFile(upload, reader.result);
        setUploads([...uploads, upload]);
      };

      reader.onerror = () => {
        const { uploads, setUploads } = this.props;

        upload.errored = true;
        upload.status = reader.error.message;

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
   * @param {number} index index (id) of the upload to remove
   */
  removeUpload = (e, index) => {
    const { uploads, setUploads } = this.props;

    e.preventDefault();
    setUploads(uploads.filter(upload => upload.index !== index));
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
            <UploaderFileList
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
