import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import * as _ from 'lodash-es';
import { Alert, Modal, Grid, Icon } from 'patternfly-react';

import { helpers } from '../../common';
import UploadUrlModal from './UploadUrlModal';

class UploadFileModal extends React.Component {
  state = {
    url: '',
    advancedUpload: false,
    dragOver: false,
    uploadFile: null,
    uploadError: null,
    uploadUrlShown: false
  };

  componentDidMount() {
    this.setState({ advancedUpload: helpers.advancedUploadAvailable() });
  }

  componentDidUpdate(prevProps) {
    if (this.props.show && !prevProps.show) {
      // reset upload states
      this.setState({
        url: '',
        contents: '',
        dragOver: false,
        uploadUrlShown: false,
        uploadFile: null,
        uploadError: null
      });
    }
  }

  doUploadUrl = (contents, url) => {
    this.setState({ url, contents, uploadError: null, uploadFile: null, uploadUrlShown: false });
  };

  doUploadFile = files => {
    const fileToUpload = files && files[0];

    if (!fileToUpload) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      this.setState({ uploadFile: fileToUpload, contents: reader.result, uploadError: null, url: '' });
    };

    reader.onerror = () => {
      const error = (
        <React.Fragment>
          <span>{`Unable to upload file: ${fileToUpload.name}`}</span>
          <br />
          <br />
          <span>{reader.error.message}</span>
        </React.Fragment>
      );

      this.setState({ uploadFile: fileToUpload, uploadError: error, contents: '', url: '' });
      reader.abort();
    };

    reader.readAsText(fileToUpload);
  };

  handleDragDropEvent = (e, dragOver) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragOver });
  };

  clearUpload = e => {
    e.preventDefault();
    this.setState({ uploadFile: null, url: '', uploadError: null, contents: '' });
  };

  showUploadUrl = e => {
    e.preventDefault();
    this.setState({ uploadUrlShown: true });
  };

  hideUploadUrl = () => {
    this.setState({ uploadUrlShown: false });
  };

  render() {
    const { show, onClose, onUpload } = this.props;
    const { contents, advancedUpload, dragOver, uploadFile, url, uploadError, uploadUrlShown } = this.state;

    const uploadFileClasses = classNames({
      'oh-file-upload_empty-state': true,
      'oh-drag-drop-box': advancedUpload,
      'drag-over': dragOver
    });

    const uploadEnabled = !_.isEmpty(contents);

    return (
      <Modal show={show} onHide={onClose} bsSize="lg" className="oh-file-upload right-side-modal-pf">
        <Modal.Header>
          <Modal.CloseButton onClick={onClose} />
          <Modal.Title>Upload File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Grid fluid>
            <Grid.Row>
              <Grid.Col>
                <div className="oh-file-upload__form">
                  {!uploadFile && !url && (
                    <div
                      className={uploadFileClasses}
                      onDrag={e => this.handleDragDropEvent(e)}
                      onDragStart={e => this.handleDragDropEvent(e)}
                      onDragEnd={e => this.handleDragDropEvent(e)}
                      onDragOver={e => this.handleDragDropEvent(e)}
                      onDragEnter={e => this.handleDragDropEvent(e)}
                      onDragLeave={e => this.handleDragDropEvent(e)}
                      onDrop={e => {
                        this.handleDragDropEvent(e);
                        this.doUploadFile(e.dataTransfer.files);
                      }}
                    >
                      <form
                        className="oh-drag-drop-box__upload-file-box"
                        method="post"
                        action=""
                        encType="multipart/form-data"
                        onDrag={e => this.handleDragDropEvent(e)}
                        onDragStart={e => this.handleDragDropEvent(e)}
                        onDragEnd={e => this.handleDragDropEvent(e)}
                        onDragOver={e => this.handleDragDropEvent(e, true)}
                        onDragEnter={e => this.handleDragDropEvent(e, true)}
                        onDragLeave={e => this.handleDragDropEvent(e)}
                        onDrop={e => {
                          this.handleDragDropEvent(e);
                          this.doUploadFile(e.dataTransfer.files);
                        }}
                      >
                        <input
                          className="oh-drag-drop-box__upload-file-box__file"
                          type="file"
                          name="fileModalUploadFile"
                          id="fileModalUploadFile"
                          onChange={e => this.doUploadFile(e.target.files)}
                        />
                        {advancedUpload ? 'Drag your file here,' : ''}
                        <label htmlFor="fileModalUploadFile">
                          <a className="oh-drag-drop-box__upload-file-box__link">
                            {advancedUpload ? 'browse' : 'Browse'}
                          </a>
                        </label>
                        to upload, or
                        <label>
                          <a href="#" className="oh-drag-drop-box__upload-file-box__link" onClick={this.showUploadUrl}>
                            upload
                          </a>
                        </label>
                        from a URL.
                      </form>
                    </div>
                  )}
                  {(uploadFile || url) && (
                    <div className="oh-file-upload__uploaded-file">
                      <span className="oh-file-upload__uploaded-file__name">{uploadFile ? uploadFile.name : url}</span>
                      {uploadFile && (
                        <span className="oh-file-upload__uploaded-file__size">{`${uploadFile.size} bytes`}</span>
                      )}
                      <a href="#" className="oh-file-upload__uploaded-file__clear" onClick={this.clearUpload}>
                        <Icon type="pf" name="close" />
                        <span className="sr-only">Clear uploaded file</span>
                      </a>
                    </div>
                  )}
                </div>
                {uploadError && (
                  <Alert type="error">
                    <span>{uploadError}</span>
                  </Alert>
                )}
              </Grid.Col>
            </Grid.Row>
          </Grid>
        </Modal.Body>
        <Modal.Footer>
          <button className="oh-button oh-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="oh-button oh-button-primary" onClick={() => onUpload(contents)} disabled={!uploadEnabled}>
            Upload
          </button>
        </Modal.Footer>
        <UploadUrlModal show={uploadUrlShown} onUpload={this.doUploadUrl} onClose={this.hideUploadUrl} />
      </Modal>
    );
  }
}

UploadFileModal.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onUpload: PropTypes.func.isRequired
};

UploadFileModal.defaultProps = {
  show: false,
  onClose: helpers.noop
};

export default UploadFileModal;
