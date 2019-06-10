import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { helpers } from '../../../common/helpers';

class UploaderDropArea extends React.Component {
  state = {
    dragOver: false,
    advancedUpload: false
  };

  componentDidMount() {
    this.setState({ advancedUpload: helpers.advancedUploadAvailable() });
  }

  highlightOnDragEnter = e => {
    this.handleDragDropEvent(e);
    this.setState({ dragOver: true });
  };

  clearOnDragLeave = e => {
    this.handleDragDropEvent(e);
    this.setState({ dragOver: false });
  };

  handleDragDropEvent = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  onDropEvent = e => {
    const { doUploadFile } = this.props;

    this.handleDragDropEvent(e);
    doUploadFile(e.dataTransfer.files);
  };

  render() {
    const { showUploadUrl, doUploadFile } = this.props;
    const { dragOver, advancedUpload } = this.state;

    const onDragEvents = {
      onDrag: this.handleDragDropEvent,
      onDragStart: this.handleDragDropEvent,
      onDragEnd: this.handleDragDropEvent,
      onDragOver: this.handleDragDropEvent,
      onDragEnter: this.handleDragDropEvent,
      onDragLeave: this.handleDragDropEvent,
      onDrop: this.onDropEvent
    };

    const uploadFileClasses = classNames({
      'oh-file-upload_empty-state': true,
      'oh-drag-drop-box': advancedUpload,
      'drag-over': dragOver
    });

    return (
      <div className="oh-file-upload__form">
        <div className={uploadFileClasses} {...onDragEvents}>
          <form
            className="oh-drag-drop-box__upload-file-box"
            method="post"
            action=""
            encType="multipart/form-data"
            {...onDragEvents}
            onDragOver={this.highlightOnDragEnter}
            onDragEnter={this.highlightOnDragEnter}
            onDragLeave={this.clearOnDragLeave}
          >
            <input
              className="oh-drag-drop-box__upload-file-box__file"
              type="file"
              name="fileModalUploadFile"
              id="fileModalUploadFile"
              onChange={e => doUploadFile(e.target.files)}
            />
            {advancedUpload ? 'Drag your file here,' : ''}
            <label htmlFor="fileModalUploadFile">
              <a className="oh-drag-drop-box__upload-file-box__link">{advancedUpload ? 'browse' : 'Browse'}</a>
            </label>
            to upload, or
            <label>
              <a href="#" className="oh-drag-drop-box__upload-file-box__link" onClick={showUploadUrl}>
                upload
              </a>
            </label>
            from a URL.
          </form>
        </div>
      </div>
    );
  }
}

UploaderDropArea.propTypes = {
  showUploadUrl: PropTypes.func.isRequired,
  doUploadFile: PropTypes.func.isRequired
};

export default UploaderDropArea;
