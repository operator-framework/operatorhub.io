import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { advancedUploadAvailable } from '../../../common/helpers';
import UploadUrlModal from '../../modals/UploadUrlModal';

export interface UploaderDropAreaProps {
  onFileUpload: (files: FileList | null) => void
  onUrlDownload: (contents: string, url: string) => void
}

interface UploaderDropAreaState {
  dragOver: boolean
  advancedUpload: boolean
  uploadUrlShown: boolean
}

/**
 * Drop area for uploading files by draging them in
 */
class UploaderDropArea extends React.PureComponent<UploaderDropAreaProps, UploaderDropAreaState> {

  props: UploaderDropAreaProps;
  static propTypes;

  state: UploaderDropAreaState = {
    dragOver: false,
    advancedUpload: false,
    uploadUrlShown: false
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

  showUploadUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    this.setState({ uploadUrlShown: true });
  };

  hideUploadUrl = () => {
    this.setState({ uploadUrlShown: false });
  };

  onUrlDownloaded = (contents: string, url: string) => {
    const {onUrlDownload} = this.props;

    this.setState({uploadUrlShown: false});

    onUrlDownload(contents, url);
  };

  /**
   * Upload files on drop
   */
  onDropEvent = (e: React.DragEvent) => {
    const { onFileUpload: doUploadFile } = this.props;

    this.handleDragDropEvent(e);
    doUploadFile(e.dataTransfer.files);
  };
  

  render() {
    const { onFileUpload } = this.props;
    const { dragOver, advancedUpload, uploadUrlShown } = this.state;

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
              <input
                className="oh-drag-drop-box__upload-file-box__file"
                type="file"
                name="fileModalUploadFile"
                id="fileModalUploadFile"
                multiple
                onChange={e => onFileUpload(e.target.files)}
              />
            }
            {advancedUpload ? 'Drag your file here,' : ''}
            <label htmlFor="fileModalUploadFile">
              <a className="oh-drag-drop-box__upload-file-box__link">{advancedUpload ? 'browse' : 'Browse'}</a>
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
        {uploadUrlShown && <UploadUrlModal onUpload={this.onUrlDownloaded} onClose={this.hideUploadUrl} />}
      </div>
    );
  }
}

UploaderDropArea.propTypes = {
  onFileUpload: PropTypes.func.isRequired,
  onUrlDownload: PropTypes.func.isRequired
};

export default UploaderDropArea;
