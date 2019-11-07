import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { advancedUploadAvailable } from '../../../common/helpers';

export interface UploaderDropAreaProps {
  showUploadUrl: (e: React.MouseEvent) => void
  doUploadFile: (files: FileList | null) => void
}

interface UploaderDropAreaState {
  dragOver: boolean
  advancedUpload: boolean
}

/**
 * Drop area for uploading files by draging them in
 */
class UploaderDropArea extends React.PureComponent<UploaderDropAreaProps, UploaderDropAreaState> {

  static propTypes;

  state: UploaderDropAreaState = {
    dragOver: false,
    advancedUpload: false
  };

  componentDidMount() {
    this.setState({ advancedUpload: advancedUploadAvailable() });
  }

  /**
   * Visually notify user where to drop files on drag over
   */
  highlightOnDragEnter = (e: React.DragEvent) => {
    this.handleDragDropEvent(e);
    this.setState({ dragOver: true });
  };

  clearOnDragLeave = (e: React.DragEvent) => {
    this.handleDragDropEvent(e);
    this.setState({ dragOver: false });
  };

  handleDragDropEvent = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * Upload files on drop
   */
  onDropEvent = (e: React.DragEvent) => {
    const { doUploadFile } = this.props;

    this.handleDragDropEvent(e);
    doUploadFile(e.dataTransfer.files);
  };

  render() {
    const { showUploadUrl, doUploadFile } = this.props;
    const { dragOver, advancedUpload } = this.state;

    const uploadFileClasses = classNames({
      'oh-file-upload_empty-state': true,
      'oh-drag-drop-box': advancedUpload,
      'drag-over': dragOver
    });

    return (
      <div className="oh-file-upload__form">
        <div className={uploadFileClasses}>
          <form
            className="oh-drag-drop-box__upload-file-box"
            method="post"
            action=""
            encType="multipart/form-data"
            onDrag={this.handleDragDropEvent}
            onDragStart={this.handleDragDropEvent}
            onDragEnd={this.handleDragDropEvent}
            onDragOver={this.highlightOnDragEnter}
            onDragEnter={this.highlightOnDragEnter}
            onDragLeave={this.clearOnDragLeave}
            onDrop={this.onDropEvent}
          >
            {
              // @ts-ignore            
              <input
                className="oh-drag-drop-box__upload-file-box__file"
                type="file"
                webkitdirectory=" webkitdirectory"
                name="fileModalUploadFile"
                id="fileModalUploadFile"
                multiple
                onChange={e => doUploadFile(e.target.files)}
              />
            }
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
