import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import connect from 'react-redux/es/connect/connect';
import { Alert, Icon, EmptyState, OverlayTrigger, Tooltip } from 'patternfly-react';
import * as ace from 'brace';
import 'brace/ext/searchbox';
import 'brace/mode/yaml';
import 'brace/theme/clouds';
import 'brace/ext/language_tools';
import 'brace/snippets/yaml';
import copy from 'copy-to-clipboard';
import UploadUrlModal from './UploadUrlModal';
import { reduxConstants } from '../redux';
import { helpers } from '../common/helpers';

let id = 0;

class YamlViewer extends React.Component {
  id = `yaml-editor-${++id}`;
  ace = null;
  doc = null;
  state = {
    yamlEntered: false,
    yamlChanged: false,
    copied: false,
    uploadUrlShown: false,
    contentHeight: null,
    advancedUpload: false,
    dragOver: false
  };

  componentDidUpdate(prevProps) {
    const { error } = this.props;
    if (error && error !== prevProps.error) {
      document.getElementById('yaml-editor-error').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  componentDidMount() {
    const { yaml, initYaml, initYamlChanged, initContentHeight } = this.props;
    const currentYaml = yaml || initYaml;

    const div = document.createElement('div');
    const advancedUpload =
      'draggable' in div || ('ondragstart' in div && 'ondrop' in div && 'FormData' in window && 'FileReader' in window);

    this.initEditor(currentYaml);
    this.setState({
      contentHeight: initContentHeight || this.contentView.clientHeight,
      yamlEntered: !!currentYaml,
      yamlChanged: initYamlChanged,
      advancedUpload
    });

    if (currentYaml) {
      this.props.onSave(currentYaml);
    }
  }

  componentWillUnmount() {
    if (this.ace) {
      this.ace.destroy();
      this.ace.container.parentNode.removeChild(this.ace.container);
      this.ace = null;
      window.ace = null;
    }

    this.doc.off('change', this.onYamlChange);
    this.doc = null;
  }

  onYamlChange = (event, yamlDoc) => {
    if (!this.props.editable) {
      return;
    }

    const yamlEntered = !!yamlDoc.getValue();
    this.setState({ yamlEntered, yamlChanged: true });
    this.props.storePreviewYaml(yamlDoc.getValue(), true);
  };

  copyToClipboard = e => {
    e.preventDefault();
    copy(this.doc.getValue());
    this.setState({ copied: true });
  };

  onCopyEnter = () => {
    this.setState({ copied: false });
  };

  clearYaml = e => {
    e.preventDefault();
    this.ace.focus();
    this.props.showConfirmModal(this.confirmClearYaml);
  };

  confirmClearYaml = () => {
    this.doc.setValue('');
    this.props.storePreviewYaml('', false, false);
    this.props.hideConfirmModal();
    this.saveYAML();
  };

  showUploadUrl = e => {
    e.preventDefault();
    this.setState({ uploadUrlShown: true });
  };

  hideUploadUrl = () => {
    this.setState({ uploadUrlShown: false });
  };

  onUpload = uploadedYaml => {
    this.doc.setValue(uploadedYaml);
    this.saveYAML();
    this.hideUploadUrl();
  };

  handleDragDropEvent = (e, dragOver) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragOver });
  };

  initEditor(currentYaml) {
    const { editable } = this.props;

    if (!this.ace) {
      this.ace = ace.edit(this.id);
      window.ace = this.ace;

      // Squelch warning from Ace
      this.ace.$blockScrolling = Infinity;

      const es = this.ace.getSession();
      es.setMode('ace/mode/yaml');
      this.ace.setTheme('ace/theme/clouds');
      es.setUseWrapMode(true);
      this.doc = es.getDocument();
      this.doc.on('change', this.onYamlChange);
    }

    this.doc.setValue(currentYaml);
    this.ace.moveCursorTo(0, 0);
    this.ace.clearSelection();
    this.ace.setOption('scrollPastEnd', 0.1);
    this.ace.setOption('tabSize', 2);
    this.ace.setOption('showPrintMargin', false);

    this.ace.focus();
    this.ace.setReadOnly(!editable);
  }

  saveYAML = () => {
    if (!this.props.editable) {
      return;
    }

    const yamlEntered = !!this.doc.getValue();

    this.props.onSave(this.doc.getValue());
    this.setState({ yamlEntered, yamlChanged: false });
    this.props.storePreviewYaml(this.doc.getValue(), false);
  };

  uploadFile = files => {
    if (!files || files.length !== 1) {
      return;
    }

    const uploadFile = files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.doc.setValue(reader.result);
      this.saveYAML();
    };

    reader.onerror = () => {
      reader.abort();
      const error = (
        <React.Fragment>
          <span>{`Unable to upload file: ${uploadFile.name}`}</span>
          <br />
          <br />
          <span>{reader.error.message}</span>
        </React.Fragment>
      );
      this.props.showErrorModal(error);
      this.formRef.reset();
    };

    reader.readAsText(uploadFile);
  };

  startResize = event => {
    this.setState({
      isDragging: true,
      initialPos: event.clientY
    });
  };

  stopResize = () => {
    if (this.state.isDragging) {
      this.setState({ isDragging: false });
      this.props.storeContentHeight(this.state.contentHeight);
    }
  };

  resizeViewer = event => {
    if (this.state.isDragging) {
      const { minHeight } = this.props;
      const { contentHeight, initialPos } = this.state;
      const delta = event.clientY - initialPos;
      const newHeight = contentHeight + delta;

      if (newHeight >= minHeight) {
        this.setState({ initialPos: event.clientY, contentHeight: newHeight });
        this.ace.resize();
      }
    }
  };

  renderEmptyState = () => {
    const { yamlEntered, advancedUpload, dragOver } = this.state;

    if (yamlEntered) {
      return null;
    }

    const uploadFileClasses = classNames({
      'oh-yaml-viewer__empty-state': true,
      'drag-drop': advancedUpload,
      'drag-over': dragOver
    });

    return (
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
          this.uploadFile(e.dataTransfer.files);
        }}
      >
        <form
          className="oh-yaml-viewer__empty-state__form__input oh-yaml-viewer__empty-state__upload-file-box"
          ref={ref => {
            this.formRef = ref;
          }}
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
            this.uploadFile(e.dataTransfer.files);
          }}
        >
          <div className="oh-yaml-viewer__empty-state__upload-file-box__input">
            <input
              className="oh-yaml-viewer__empty-state__upload-file-box__file"
              type="file"
              name="uploadFile"
              id="uploadFile"
              onChange={e => this.uploadFile(e.target.files)}
            />
            Start typing, paste in your text, {advancedUpload ? 'drag your file here,' : ''}
            <label htmlFor="uploadFile">
              <a className="oh-yaml-viewer__empty-state__upload-file-box__link">browse</a>
            </label>
            to upload, or
            <label>
              <a href="#" className="oh-yaml-viewer__empty-state__upload-file-box__link" onClick={this.showUploadUrl}>
                upload
              </a>
            </label>
            from a URL.
          </div>
        </form>
      </div>
    );
  };

  renderError = () => {
    const { error } = this.props;
    return (
      <div id="yaml-editor-error">
        {error && (
          <EmptyState className="blank-slate-content-pf">
            <Alert type="error">
              <span>{`Error parsing YAML: ${error}`}</span>
            </Alert>
          </EmptyState>
        )}
      </div>
    );
  };

  render() {
    const { editable, saveButtonText } = this.props;
    const { yamlEntered, yamlChanged, copied, uploadUrlShown, contentHeight } = this.state;

    const toolbarButtonClasses = classNames('oh-yaml-viewer__toolbar__button', { 'oh-disabled': !yamlEntered });
    const copyTooltip = (
      <Tooltip id="copy-tip">
        <span className="oh-nowrap" key="nowrap">
          Copied
        </span>
      </Tooltip>
    );

    const copyLink = (
      <a href="#" onClick={this.copyToClipboard} className={toolbarButtonClasses} onMouseEnter={this.onCopyEnter}>
        <Icon type="fa" name="clipboard" />
        Copy to Clipboard
      </a>
    );

    return (
      <div
        className="oh-yaml-viewer"
        onMouseMove={this.resizeViewer}
        onMouseUp={this.stopResize}
        onMouseLeave={this.stopResize}
      >
        <div className="oh-yaml-viewer__toolbar">
          {copied && (
            <OverlayTrigger placement="top" overlay={copyTooltip}>
              {copyLink}
            </OverlayTrigger>
          )}
          {!copied && copyLink}
          {editable && (
            <a href="#" onClick={this.clearYaml} className={toolbarButtonClasses}>
              <Icon type="pf" name="close" />
              Clear Contents
            </a>
          )}
        </div>
        <div
          className="oh-yaml-viewer__content"
          ref={ref => {
            this.contentView = ref;
          }}
          style={contentHeight ? { height: contentHeight } : {}}
        >
          <div
            id={this.id}
            key={this.id}
            className="oh-yaml-viewer__acebox"
            onDrag={e => this.handleDragDropEvent(e)}
            onDragStart={e => this.handleDragDropEvent(e)}
            onDragEnd={e => this.handleDragDropEvent(e)}
            onDragOver={e => this.handleDragDropEvent(e)}
            onDragEnter={e => this.handleDragDropEvent(e)}
            onDragLeave={e => this.handleDragDropEvent(e)}
            onDrop={e => {
              this.handleDragDropEvent(e);
              this.uploadFile(e.dataTransfer.files);
            }}
          />
        </div>
        {editable && (
          <React.Fragment>
            {this.renderEmptyState()}
            <div className="oh-yaml-viewer__resizer" onMouseDown={this.startResize} />
            {this.renderError()}
            <div className="oh-yaml-viewer__button-bar">
              <button
                className="oh-button oh-button-primary"
                onClick={this.saveYAML}
                disabled={!yamlChanged || !yamlEntered}
              >
                {saveButtonText}
              </button>
            </div>
          </React.Fragment>
        )}
        <UploadUrlModal show={uploadUrlShown} onClose={this.hideUploadUrl} onUpload={this.onUpload} />
      </div>
    );
  }
}

YamlViewer.propTypes = {
  yaml: PropTypes.string,
  minHeight: PropTypes.number,
  editable: PropTypes.bool,
  saveButtonText: PropTypes.string,
  onSave: PropTypes.func,
  error: PropTypes.node,
  storePreviewYaml: PropTypes.func,
  storeContentHeight: PropTypes.func,
  showConfirmModal: PropTypes.func,
  hideConfirmModal: PropTypes.func,
  showErrorModal: PropTypes.func,
  initYaml: PropTypes.string,
  initYamlChanged: PropTypes.bool,
  initContentHeight: PropTypes.number
};

YamlViewer.defaultProps = {
  yaml: '',
  minHeight: 225,
  editable: false,
  saveButtonText: 'Save',
  onSave: helpers.noop,
  error: null,
  storePreviewYaml: helpers.noop,
  storeContentHeight: helpers.noop,
  showConfirmModal: helpers.noop,
  hideConfirmModal: helpers.noop,
  showErrorModal: helpers.noop,
  initYaml: '',
  initYamlChanged: false,
  initContentHeight: 0
};

const mapDispatchToProps = dispatch => ({
  storePreviewYaml: (yaml, yamlChanged) =>
    dispatch({
      type: reduxConstants.SET_PREVIEW_YAML,
      yaml,
      yamlChanged
    }),
  storeContentHeight: contentHeight =>
    dispatch({
      type: reduxConstants.SET_PREVIEW_CONTENT_HEIGHT,
      contentHeight
    }),
  showConfirmModal: onConfirm =>
    dispatch({
      type: reduxConstants.CONFIRMATION_MODAL_SHOW,
      title: 'Clear Content',
      heading: <span>Are you sure you want to clear the current content of the editor?</span>,
      confirmButtonText: 'Clear',
      cancelButtonText: 'Cancel',
      onConfirm
    }),
  hideConfirmModal: () =>
    dispatch({
      type: reduxConstants.CONFIRMATION_MODAL_HIDE
    }),
  showErrorModal: error =>
    dispatch({
      type: reduxConstants.CONFIRMATION_MODAL_SHOW,
      title: 'Error Uploading File',
      heading: error,
      confirmButtonText: 'OK'
    })
});

const mapStateToProps = state => ({
  initYaml: state.previewState.yaml,
  initYamlChanged: state.previewState.yamlChanged,
  initContentHeight: state.previewState.contentHeight
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(YamlViewer);
