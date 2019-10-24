import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Alert, Grid, Icon } from 'patternfly-react';
import { operatorFieldDescriptions } from '../../utils/operatorDescriptors';
import { helpers } from '../../common';

class ImageEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      advancedUpload: true,
      dragOver: false,
      uploadError: null
    };
  }

  componentDidMount() {
    this.setState({ advancedUpload: helpers.advancedUploadAvailable() });
  }

  doUploadFile = files => {
    const { onUpdate } = this.props;

    const fileToUpload = files && files[0];

    if (!fileToUpload) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64data = reader.result.split('base64,')[1];
      const image = { base64data, mediatype: fileToUpload.type };
      onUpdate([image]);
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

      this.setState({ uploadError: error });
      onUpdate();
      reader.abort();
    };

    if (
      fileToUpload.type === 'image/svg+xml' ||
      fileToUpload.type === 'image/png' ||
      fileToUpload.type === 'image/jpeg' ||
      fileToUpload.type === 'image/gif'
    ) {
      reader.readAsDataURL(fileToUpload);
    } else {
      const error = 'Unable to upload file: Only files of type svg, jpeg, png, or gif are supported';
      this.setState({ uploadError: error });
    }
  };

  handleDragDropEvent = (e, dragOver) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragOver });
  };

  clearImage = event => {
    const { onUpdate } = this.props;
    event.preventDefault();
    onUpdate();
  };

  clearError = event => {
    event.preventDefault();
    this.setState({ uploadError: null });
  };

  render() {
    const { icon } = this.props;
    const { uploadError, advancedUpload, dragOver } = this.state;

    const uploadFileClasses = classNames({
      'oh-file-upload_empty-state': true,
      'oh-drag-drop-box': advancedUpload,
      'drag-over': dragOver
    });

    const imgUrl = icon ? `data:${icon.mediatype};base64,${icon.base64data}` : '';

    return (
      <React.Fragment>
        <h4>Icon</h4>
        <div className="oh-operator-editor-form__field-section">
          <Grid.Row className="oh-operator-editor-form__field">
            {!icon && (
              <Grid.Col sm={6}>
                <div className="oh-file-upload__form">
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
                        accept="image/svg+xml,image/png,image/jpeg,image/gif"
                        type="file"
                        name="imageEditorUploadFile"
                        id="imageEditorUploadFile"
                        onChange={e => this.doUploadFile(e.target.files)}
                      />
                      {advancedUpload ? 'Drag your image file here or' : ''}
                      <label htmlFor="imageEditorUploadFile">
                        <a className="oh-drag-drop-box__upload-file-box__link">
                          {advancedUpload ? 'browse' : 'Browse'}
                        </a>
                      </label>
                      to upload an image.
                    </form>
                  </div>
                </div>
              </Grid.Col>
            )}
            {icon && (
              <React.Fragment>
                <Grid.Col sm={6}>
                  <div className="oh-operator-editor-form__operator-image-container">
                    <div className="oh-operator-header__image-container">
                      <img className="oh-operator-header__image" src={imgUrl} alt="" />
                    </div>
                  </div>
                  <a href="#" className="oh-operator-header__image-clear" onClick={this.clearImage}>
                    Clear Image
                  </a>
                </Grid.Col>
              </React.Fragment>
            )}
            <Grid.Col sm={6} className="oh-operator-editor-form__description">
              <p>{operatorFieldDescriptions.spec.icon}</p>
            </Grid.Col>
            {uploadError && (
              <Grid.Col sm={12}>
                <Alert type="error">
                  <span>{uploadError}</span>
                  <a
                    href="#"
                    className="oh-operator-editor-form__operator-image__clear-error"
                    onClick={this.clearError}
                  >
                    <Icon type="pf" name="close" />
                    <span className="sr-only">Clear Error</span>
                  </a>
                </Alert>
              </Grid.Col>
            )}
          </Grid.Row>
        </div>
      </React.Fragment>
    );
  }
}

ImageEditor.propTypes = {
  icon: PropTypes.object,
  onUpdate: PropTypes.func.isRequired
};

ImageEditor.defaultProps = {
  icon: null
};

export default ImageEditor;
