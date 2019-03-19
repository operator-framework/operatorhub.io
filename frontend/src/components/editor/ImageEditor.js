import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import classNames from 'classnames';
import { Alert, Grid, Icon } from 'patternfly-react';
import { operatorFieldDescriptions } from '../../utils/operatorDescriptors';
import { helpers } from '../../common/helpers';

class ImageEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      image: _.get(props.operator, 'spec.icon', [])[0] || '',
      advancedUpload: true,
      dragOver: false,
      uploadError: null
    };
  }

  componentDidMount() {
    this.setState({ advancedUpload: helpers.advancedUploadAvailable() });
  }

  componentDidUpdate(prevProps) {
    const { operator } = this.props;
    if (operator !== prevProps.operator) {
      this.setState({ image: _.get(operator, 'spec.icon', [])[0] });
    }
  }

  doUploadFile = files => {
    const fileToUpload = files && files[0];

    if (!fileToUpload) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64data = reader.result.split('base64,')[1];
      const image = { base64data, mediatype: fileToUpload.type };
      this.setState({ image, uploadError: null });
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

      this.setState({ uploadError: error, image: '' });
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
      this.setState({ uploadError: error, image: '' });
    }
  };

  handleDragDropEvent = (e, dragOver) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragOver });
  };

  clearImage = event => {
    event.preventDefault();
    this.setState({ image: null, uploadError: null });
  };

  clearError = event => {
    event.preventDefault();
    this.setState({ uploadError: null });
  };

  render() {
    const { image, uploadError, advancedUpload, dragOver } = this.state;

    const uploadFileClasses = classNames({
      'oh-file-upload_empty-state': true,
      'oh-drag-drop-box': advancedUpload,
      'drag-over': dragOver
    });

    const imgUrl = image ? `data:${image.mediatype};base64,${image.base64data}` : '';

    return (
      <React.Fragment>
        <h3>Icon</h3>
        <div className="oh-operator-editor-form__field-section">
          <Grid.Row className="oh-operator-editor-form__field">
            {!image && (
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
                    <div
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
                    </div>
                  </div>
                </div>
              </Grid.Col>
            )}
            {image && (
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
  operator: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default ImageEditor;
