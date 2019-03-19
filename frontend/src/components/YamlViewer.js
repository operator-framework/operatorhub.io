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
import UploadUrlModal from './modals/UploadUrlModal';
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
    const { yaml, isPreview, initYaml, initYamlChanged, initContentHeight } = this.props;
    const currentYaml = yaml || (isPreview && initYaml) || '';

    this.initEditor(currentYaml);
    this.setState({
      contentHeight: (isPreview && initContentHeight) || this.contentView.clientHeight,
      yamlEntered: !!currentYaml,
      yamlChanged: isPreview && initYamlChanged,
      advancedUpload: helpers.advancedUploadAvailable()
    });

    if (currentYaml) {
      this.props.onChange(currentYaml);
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
    const { editable, isPreview, storePreviewYaml, onChange } = this.props;
    if (!editable) {
      return;
    }

    const yamlEntered = !!yamlDoc.getValue();
    this.setState({ yamlEntered, yamlChanged: true });
    if (isPreview) {
      storePreviewYaml(yamlDoc.getValue(), true);
    }
    onChange(yamlDoc.getValue());
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
    const { storePreviewYaml, isPreview, hideConfirmModal } = this.props;

    this.doc.setValue('');
    if (isPreview) {
      storePreviewYaml('', false, false);
    }
    hideConfirmModal();
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
    const { editable, onSave, onChange, isPreview, storePreviewYaml } = this.props;

    if (!editable) {
      return;
    }

    const yamlEntered = !!this.doc.getValue();

    onSave(this.doc.getValue());
    onChange(this.doc.getValue());
    this.setState({ yamlEntered, yamlChanged: false });
    if (isPreview) {
      storePreviewYaml(this.doc.getValue(), false);
    }
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
      if (this.props.isPreview) {
        this.props.storeContentHeight(this.state.contentHeight);
      }
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
      'oh-drag-drop-box': advancedUpload,
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
        <div
          className="oh-drag-drop-box__upload-file-box"
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
          <div>
            <input
              className="oh-drag-drop-box__upload-file-box__file"
              type="file"
              name={`yamlViewerUploadFile-${this.id}`}
              id={`yamlViewerUploadFile-${this.id}`}
              onChange={e => this.uploadFile(e.target.files)}
            />
            Start typing, paste in your text, {advancedUpload ? 'drag your file here,' : ''}
            <label htmlFor={`yamlViewerUploadFile-${this.id}`}>
              <a className="oh-drag-drop-box__upload-file-box__link">browse</a>
            </label>
            to upload, or
            <label>
              <a href="#" className="oh-drag-drop-box__upload-file-box__link" onClick={this.showUploadUrl}>
                upload
              </a>
            </label>
            from a URL.
          </div>
        </div>
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
    const { editable, saveButtonText, onSave, allowClear, showRemove, onRemove } = this.props;
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
          {editable && allowClear && (
            <a href="#" onClick={this.clearYaml} className={toolbarButtonClasses}>
              <Icon type="pf" name="close" />
              Clear Contents
            </a>
          )}
          {showRemove && (
            <a href="#" onClick={onRemove} className="oh-yaml-viewer__toolbar__button">
              <Icon type="fa" name="trash" />
              Remove
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
            {onSave !== helpers.noop && (
              <div className="oh-yaml-viewer__button-bar">
                <button
                  className="oh-button oh-button-primary"
                  onClick={this.saveYAML}
                  disabled={!yamlChanged || !yamlEntered}
                >
                  {saveButtonText}
                </button>
              </div>
            )}
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
  isPreview: PropTypes.bool,
  saveButtonText: PropTypes.string,
  onSave: PropTypes.func,
  allowClear: PropTypes.bool,
  showRemove: PropTypes.bool,
  onRemove: PropTypes.func,
  onChange: PropTypes.func,
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
  minHeight: 250,
  editable: false,
  isPreview: false,
  saveButtonText: 'Save',
  onSave: helpers.noop,
  allowClear: true,
  showRemove: false,
  onRemove: helpers.noop,
  onChange: helpers.noop,
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
