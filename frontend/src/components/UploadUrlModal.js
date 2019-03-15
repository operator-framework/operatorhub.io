import * as React from 'react';
import PropTypes from 'prop-types';

import { Alert, FormControl, Grid, HelpBlock, Modal } from 'patternfly-react';
import { helpers } from '../common/helpers';

class UploadUrlModal extends React.Component {
  state = {
    url: '',
    validURL: false,
    uploadError: null
  };

  componentDidUpdate(prevProps) {
    if (this.props.show && !prevProps.show) {
      // reset upload states
      this.setState({
        url: '',
        validURL: false,
        uploadError: null
      });
    }
  }

  uploadFile = () => {
    const { url } = this.state;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status === 200) {
        this.props.onUpload(xhr.response);
        return;
      }
      const error = (
        <React.Fragment>
          <span>{`Unable to upload url: ${url}`}</span>
          <br />
          <br />
          <span>{xhr.responseText}</span>
        </React.Fragment>
      );

      this.setState({ uploadError: error });
    };

    xhr.onerror = () => {
      const error = (
        <React.Fragment>
          <span>{`Unable to upload url: ${url}`}</span>
          <br />
          <br />
          <span>Please check that the URL is valid and accessible.</span>
        </React.Fragment>
      );

      this.setState({ uploadError: error });
    };
    xhr.send();
  };

  validURL = url => {
    const urlRegExp = new RegExp(
      '^(?:(?:(?:https?|ftp):)?//)' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port
      '(\\?[;&amp;a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    );

    return urlRegExp.test(url);
  };

  urlChange = e => {
    const url = e.target.value;
    const updateState = {
      url,
      validURL: this.validURL(url)
    };

    if (url && !this.state.url) {
      updateState.uploadType = 'url';
      updateState.uploadFile = null;
      updateState.uploadError = null;
    }

    this.setState(updateState);
  };

  onKeyDown = event => {
    const { validURL } = this.state;

    if (validURL && (event.which === 13 || event.keyCode === 13)) {
      this.uploadFile();
    }
  };

  render() {
    const { show, onClose } = this.props;
    const { validURL, uploadError } = this.state;

    return (
      <Modal show={show} onHide={onClose} bsSize="lg" className="oh-yaml-upload-modal right-side-modal-pf">
        <Modal.Header>
          <Modal.CloseButton onClick={onClose} />
          <Modal.Title>Upload YAML File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Grid fluid>
            <Grid.Row>
              <div className="oh-yaml-upload-modal__input-row">
                <span className="oh-yaml-upload-modal__input-row__label">URL</span>
                <span className="oh-yaml-upload-modal__input-row__input">
                  <FormControl
                    type="text"
                    value={this.state.url}
                    onChange={this.urlChange}
                    autoFocus
                    onKeyDown={this.onKeyDown}
                  />
                  <HelpBlock>Enter the URL to the cluster service version YAML file for your operator</HelpBlock>
                </span>
              </div>
              {uploadError && (
                <Alert type="error">
                  <span>{uploadError}</span>
                </Alert>
              )}
            </Grid.Row>
          </Grid>
        </Modal.Body>
        <Modal.Footer>
          <button className="oh-button oh-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="oh-button oh-button-primary" onClick={this.uploadFile} disabled={!validURL}>
            Upload
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

UploadUrlModal.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onUpload: PropTypes.func.isRequired
};

UploadUrlModal.defaultProps = {
  show: false,
  onClose: helpers.noop
};

export default UploadUrlModal;
