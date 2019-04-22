import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';
import JSZip from 'jszip';
import { safeDump } from 'js-yaml';
import { helpers } from '../../common/helpers';
import { reduxConstants } from '../../redux';
import { defaultOperator, validateOperator } from '../../utils/operatorUtils';
import PreviewOperatorModal from '../../components/modals/PreviewOperatorModal';
import OperatorEditorSubPage from './OperatorEditorSubPage';

class OperatorEditorPage extends React.Component {
  state = {
    validCSV: false,
    previewShown: false
  };

  componentDidMount() {
    const { operator } = this.props;
    this.setState({ validCSV: validateOperator(operator) });
  }

  componentDidUpdate(prevProps) {
    const { operator } = this.props;
    if (!_.isEqual(operator, prevProps.operator)) {
      this.setState({ validCSV: validateOperator(operator) });
    }
  }

  onSwitchView = e => {
    const { isForm } = this.props;

    e.preventDefault();
    this.props.history.push(isForm ? '/editor/yaml' : '/editor');
  };

  generateCSV = () => {
    const { operator } = this.props;

    let operatorYaml;
    try {
      operatorYaml = safeDump(operator);
    } catch (e) {
      operatorYaml = '';
    }

    const name = _.get(operator, 'spec.displayName');
    const version = _.get(operator, 'spec,version');

    const zip = new JSZip();
    zip.file(`${name}/${name}.${version}.clusterserviceversion.yaml`, operatorYaml);

    zip.generateAsync({ type: 'base64' }).then(
      base64 => {
        this.generateAction.href = `data:application/zip;base64,${base64}`;
        this.generateAction.download = `${_.get(operator, 'spec.displayName')}.bundle.zip`;
        this.generateAction.click();
      },
      err => {
        console.error(err);
      }
    );
  };

  hidePreviewOperator = () => {
    this.setState({ previewShown: false });
  };

  showPreviewOperator = () => {
    this.setState({ previewShown: true });
  };

  doClearContents = () => {
    const { resetEditorOperator, hideConfirmModal } = this.props;
    resetEditorOperator();
    this.setState({
      validCSV: false
    });
    hideConfirmModal();
  };

  clearContents = () => {
    const { showConfirmModal } = this.props;
    showConfirmModal(this.doClearContents);
  };

  setGenerateAction = ref => {
    this.generateAction = ref;
  };

  renderButtonBar() {
    const { operator, isForm, okToPreview } = this.props;
    const { validCSV } = this.state;

    const isDefault = _.isEqual(operator, defaultOperator);
    const okToDownload = validCSV && okToPreview;

    const downloadClasses = classNames('oh-operator-editor-toolbar__button primary', { disabled: !okToDownload });
    const previewClasses = classNames('oh-operator-editor-toolbar__button', { disabled: !okToPreview });
    const clearClasses = classNames('oh-operator-editor-toolbar__button', { disabled: isDefault });

    return (
      <div className="oh-operator-editor-page__button-bar">
        <div>
          <button className={downloadClasses} disabled={!okToDownload} onClick={this.generateCSV}>
            Download Operator Bundle
          </button>
          <button className="oh-operator-editor-toolbar__button" onClick={this.onSwitchView}>
            {`Edit CSV in ${isForm ? 'YAML' : 'Forms'}`}
          </button>
          <button className={previewClasses} disabled={!okToPreview} onClick={this.showPreviewOperator}>
            Preview
          </button>
        </div>
        <button className={clearClasses} disabled={isDefault} onClick={this.clearContents}>
          Clear Content
        </button>
      </div>
    );
  }

  render() {
    const { operator, title, header, children, history } = this.props;
    const { previewShown } = this.state;

    return (
      <OperatorEditorSubPage title={title} header={header} buttonBar={this.renderButtonBar()} history={history}>
        {children}
        <PreviewOperatorModal show={previewShown} yamlOperator={operator} onClose={this.hidePreviewOperator} />
        <a className="oh-operator-editor-page__download-link" ref={this.setGenerateAction} />
      </OperatorEditorSubPage>
    );
  }
}

OperatorEditorPage.propTypes = {
  operator: PropTypes.object,
  title: PropTypes.string.isRequired,
  header: PropTypes.node,
  isForm: PropTypes.bool,
  okToPreview: PropTypes.bool,
  children: PropTypes.node,
  resetEditorOperator: PropTypes.func,
  showConfirmModal: PropTypes.func,
  hideConfirmModal: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

OperatorEditorPage.defaultProps = {
  operator: {},
  header: null,
  isForm: true,
  okToPreview: true,
  children: null,
  resetEditorOperator: helpers.noop,
  showConfirmModal: helpers.noop,
  hideConfirmModal: helpers.noop
};

const mapDispatchToProps = dispatch => ({
  resetEditorOperator: () =>
    dispatch({
      type: reduxConstants.RESET_EDITOR_OPERATOR
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
    })
});

const mapStateToProps = state => ({
  operator: state.editorState.operator
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OperatorEditorPage);
