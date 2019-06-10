import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { Icon } from 'patternfly-react';
import { helpers } from '../../../common/helpers';
import UploadUrlModal from '../../modals/UploadUrlModal';
import { reduxConstants } from '../../../redux/index';
import { parseYamlOperator, EDITOR_STATUS, sectionsFields } from '../../../pages/operatorBundlePage/bundlePageUtils';
import { defaultOperator, getDefaultOnwedCRD } from '../../../utils/operatorUtils';
import { default as UploadStatusIcon, IconStatus } from './UploaderStatusIcon';
import UploaderDropArea from './UploaderDropArea';
import UploaderFileList from './UploaderFileList';

const validFileTypes = ['.yaml'];
const validFileTypesRegExp = new RegExp(`(${validFileTypes.join('|').replace(/\./g, '\\.')})$`, 'i');

class ManifestUploader extends React.Component {
  state = {
    uploadUrlShown: false,
    uploadCounter: 0
  };

  componentDidMount() {
    const { uploads } = this.props;

    // increase found maximal counter
    const counter = 1 + Math.max(0, ...uploads.map(upload => upload.index));

    this.setState({
      uploadCounter: counter
    });
  }

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

  applyUpload = (upload, file) => {
    const { operator, onUpdate, operatorPackage, updateOperatorPackage, markSectionForReview } = this.props;

    let parsedFile = {};
    try {
      parsedFile = parseYamlOperator(file, false);
      upload.data = parsedFile;
    } catch (e) {
      upload.status = <UploadStatusIcon text="Parsing Errors" status={IconStatus.ERROR} />;
      upload.uploadError = true;
    }
    const fileType = this.getFileType(parsedFile || {}, upload);
    upload.type = fileType;

    if (fileType === 'Unknown') {
      upload.status = <UploadStatusIcon text="Unsupported File" status={IconStatus.ERROR} />;
      return;
    }

    upload.status = <UploadStatusIcon text="Supported File" status={IconStatus.SUCCESS} />;

    if (fileType === 'CSV') {
      // only CSV.yaml is used to populate operator in editor. Other files have special roles
      const mergedOperator = _.merge({}, operator, parsedFile);

      this.compareSections(operator, mergedOperator, parsedFile);
      this.augmentOperator(mergedOperator);
      onUpdate(mergedOperator);
    } else if (fileType === 'CRD') {
      // kkkk
      console.log('CRD');
    } else if (fileType === 'PKG') {
      const channel = parsedFile.channels && parsedFile.channels[0] ? parsedFile.channels[0] : null;

      updateOperatorPackage({
        name: parsedFile.packageName,
        channel: channel ? channel.name : operatorPackage.channel
      });

      markSectionForReview('package');
    }
  };

  augmentOperator = operator => {
    const clonedOperator = _.cloneDeep(operator);
    const ownedCrds = _.get(clonedOperator, sectionsFields['owned-crds'], []);

    _.set(
      clonedOperator,
      sectionsFields['owned-crds'],
      ownedCrds.map(crd => this.addDefaultResourceStructureToCrd(crd))
    );

    return clonedOperator;
  };

  addDefaultResourceStructureToCrd = crd => {
    const resources = crd.resources && crd.resources.length > 0 ? crd.resources : getDefaultOnwedCRD().resources;
    return {
      ...crd,
      resources
    };
  };

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

  operatorFieldWasUpdated = (fieldName, operator, uploadedOperator, mergedOperator) =>
    // field changed when either its value changed
    // or uploaded operator was same as default values
    !_.isEqual(_.get(operator, fieldName), _.get(mergedOperator, fieldName)) ||
    // do not consider updated if value is empty - no real change was doen
    (!_.isEmpty(_.get(defaultOperator, fieldName)) &&
      _.isEqual(_.get(defaultOperator, fieldName), _.get(uploadedOperator, fieldName)));

  doUploadUrl = (contents, url) => {
    const { uploads, setUploads } = this.props;
    const { uploadCounter } = this.state;

    const upload = {
      index: uploadCounter,
      data: undefined,
      type: 'Unknown',
      uploadFile: url,
      uploadError: false
    };
    this.applyUpload(upload, contents);

    this.setState({ uploadCounter: uploadCounter + 1, uploadUrlShown: false });

    setUploads([...uploads, upload]);
  };

  doUploadFile = files => {
    const { uploads, setUploads } = this.props;
    const { uploadCounter } = this.state;

    const fileToUpload = files && files[0];

    if (!fileToUpload) {
      return;
    }

    const isValidFileType = validFileTypesRegExp.test(fileToUpload.name);
    if (!isValidFileType) {
      this.props.showErrorModal('Unable to upload file: Only yaml files are supported');
      return;
    }

    const reader = new FileReader();

    const upload = {
      index: uploadCounter,
      type: 'Unkown',
      data: undefined,
      uploadFile: fileToUpload.name,
      uploadError: false
    };
    this.setState({ uploadCounter: uploadCounter + 1 });

    reader.onload = () => {
      this.applyUpload(upload, reader.result);

      setUploads([...uploads, upload]);
    };

    reader.onerror = () => {
      upload.uploadError = true;
      upload.status = <UploadStatusIcon text={reader.error.message} status={IconStatus.ERROR} />;

      setUploads([...uploads, upload]);

      reader.abort();
    };

    reader.readAsText(fileToUpload);
  };

  removeAllUploads = e => {
    const { setUploads } = this.props;

    e.preventDefault();
    setUploads([]);
  };

  removeUpload = (e, upload) => {
    const { uploads, setUploads } = this.props;

    e.preventDefault();
    setUploads(uploads.filter(up => up.index !== upload.index));
  };

  showUploadUrl = e => {
    e.preventDefault();
    this.setState({ uploadUrlShown: true });
  };

  hideUploadUrl = () => {
    this.setState({ uploadUrlShown: false });
  };

  render() {
    const { uploads, operator } = this.props;
    const { uploadUrlShown } = this.state;

    const uploadedCrds = uploads
      // accept only valid crds
      .filter(upload => !upload.uploadError && upload.type === 'CRD' && upload.data && upload.data.metadata)
      .map(upload => upload.data.metadata.name);

    const missingCrds = _.get(operator, sectionsFields['owned-crds']).filter(
      crd => crd.name && !uploadedCrds.includes(crd.name)
    );

    return (
      <React.Fragment>
        <UploaderDropArea showUploadUrl={this.showUploadUrl} doUploadFile={this.doUploadFile} />
        <UploaderFileList
          uploads={uploads}
          missingUploads={missingCrds}
          removeUpload={this.removeUpload}
          removeAllUploads={this.removeAllUploads}
        />
        <UploadUrlModal show={uploadUrlShown} onUpload={this.doUploadUrl} onClose={this.hideUploadUrl} />
      </React.Fragment>
    );
  }
}

ManifestUploader.propTypes = {
  operator: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  operatorPackage: PropTypes.object.isRequired,
  uploads: PropTypes.array,
  showErrorModal: PropTypes.func,
  markSectionForReview: PropTypes.func,
  updateOperatorPackage: PropTypes.func,
  setUploads: PropTypes.func
};

ManifestUploader.defaultProps = {
  uploads: [],
  showErrorModal: helpers.noop,
  markSectionForReview: helpers.noop,
  updateOperatorPackage: helpers.noop,
  setUploads: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  showErrorModal: error =>
    dispatch({
      type: reduxConstants.CONFIRMATION_MODAL_SHOW,
      title: 'Error Uploading File',
      icon: <Icon type="pf" name="error-circle-o" />,
      heading: error,
      confirmButtonText: 'OK'
    }),
  markSectionForReview: sectionName =>
    dispatch({
      type: reduxConstants.SET_EDITOR_SECTION_STATUS,
      section: sectionName,
      status: EDITOR_STATUS.pending
    }),
  updateOperatorPackage: operatorPackage =>
    dispatch({
      type: reduxConstants.SET_EDITOR_PACKAGE,
      operatorPackage
    }),
  setUploads: uploads =>
    dispatch({
      type: reduxConstants.SET_EDITOR_UPLOADS,
      uploads
    })
});

const mapStateToProps = state => ({
  operatorPackage: state.editorState.operatorPackage,
  uploads: state.editorState.uploads
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ManifestUploader);
