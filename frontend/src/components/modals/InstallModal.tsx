import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { History } from 'history';
import { Tooltip } from 'react-lightweight-tooltip';
import copy from 'copy-to-clipboard';
import { Icon, Modal } from 'patternfly-react';
import { CatalogItemHeader } from 'patternfly-react-extensions';

// @ts-ignore
import * as operatorImg from '../../imgs/operator.svg';
import { InternalLink } from '../InternalLink';
import { NormalizedOperatorPreview } from '../../utils/operatorTypes';

const olmRepo = 'https://github.com/operator-framework/operator-lifecycle-manager';

const VERIFY_OPERATOR_CMD = 'kubectl get csv -n ';

const getAddHelmRepoCommand = (repoName: string, repoUrl: string): string => `helm repo add ${repoName} ${repoUrl}`;
const getInstallHelmChartCommand = (repoName: string, helmChart: string): string =>
  `helm install -name my-release --namespace ${helmChart} ${repoName}/${helmChart}`;
const getVerifyHelmCommand = (helmChart: string): string => `helm list --namespace ${helmChart}`;

const getInstallOlmCommand = version =>
  `curl -sL ${olmRepo}/releases/download/${version}/install.sh | bash -s ${version}`;

const tooltipOverrides = Object.freeze({
  wrapper: {
    cursor: 'pointer',
    top: '2px'
  },
  tooltip: {
    maxWidth: '170px',
    minWidth: 'auto'
  },
  content: {},
  arrow: {},
  gap: {}
});

export interface InstallModalProps {
  olmVersion: string;
  operator: NormalizedOperatorPreview;
  onClose: () => void;
  history: History;
}

interface InstallModalState {
  installCommand: string;
  copied: boolean;
}

/**
 * Provides install instructions for operator
 * @param {string} olmVersion
 * @param {Operator} operator
 * @param {*} history
 * @param {Function} onClose
 */
class InstallModal extends React.PureComponent<InstallModalProps, InstallModalState> {
  static propTypes;
  static defaultProps;

  state = { installCommand: '', copied: false };

  componentDidMount() {
    const { operator, history } = this.props;
    const path = history.location.pathname.split('/');

    let installPath;

    // ["", "operator", packageName] - default path for latest operator in default channel
    // ["", "operator", channelName, operatorName] - legacy path
    // ["", "operator", packageName, channelName, operatorName] - full path (version / channel selected)

    if (path.length > 3) {
      // eslint-disable-next-line prefer-destructuring
      const channelName = path.length === 5 ? path[3] : path[2];

      installPath = `install/${channelName}/${operator.packageName}.yaml`;
    } else {
      installPath = `install/${operator.packageName}.yaml`;
    }

    this.setState({
      installCommand: `kubectl create -f ${window.location.origin}/${installPath}`
    });
  }

  copyToClipboard = (e, command: string) => {
    e.preventDefault();
    copy(command);
    this.setState({ copied: true });
  };

  onCopyEnter = () => {
    this.setState({ copied: false });
  };

  renderKubernetesInstallInstructions = () => {
    const { operator, history, olmVersion } = this.props;
    const { installCommand, copied } = this.state;

    const tooltipText = copied ? 'Copied' : 'Copy to Clipboard';
    const tooltipContent = [
      <span className="oh-nowrap" key="nowrap">
        {tooltipText}
      </span>
    ];

    const globalOperator = _.get(operator, 'globalOperator', true);
    const operatorNamespace = globalOperator ? 'operators' : `my-${operator.packageName}`;
    const verifyOperatorCommandFull = VERIFY_OPERATOR_CMD + operatorNamespace;
    const installOlmCommand = getInstallOlmCommand(olmVersion);

    return (
      <>
        <h2>Install on Kubernetes</h2>
        <ol className="oh-install-modal__list">
          <li className="oh-install-modal__list__olm">
            <p>
              Install Operator Lifecycle Manager (OLM), a tool to help manage the Operators running on your cluster.
            </p>
            <div className="oh-install-modal__install-command-container">
              <div className="oh-code">{`$ ${installOlmCommand}`}</div>
              <Tooltip content={tooltipContent} styles={tooltipOverrides}>
                <a
                  href="#"
                  onClick={e => this.copyToClipboard(e, installOlmCommand)}
                  className="oh-install-modal__install-command-copy"
                  onMouseEnter={this.onCopyEnter}
                >
                  <Icon type="fa" name="clipboard" />
                  <span className="sr-only">Copy to Clipboard</span>
                </a>
              </Tooltip>
            </div>
          </li>
          <li>
            <p>
              Install the operator by running the following command:
              <InternalLink
                className="pull-right"
                route="/how-to-install-an-operator#What-happens-when-I-execute-the-'Install'-command-presented-in-the-pop-up?"
                history={history}
                text="What happens when I execute this command?"
              />
            </p>
            <div className="oh-install-modal__install-command-container">
              <div className="oh-code">{`$ ${installCommand}`}</div>
              <Tooltip content={tooltipContent} styles={tooltipOverrides}>
                <a
                  href="#"
                  onClick={e => this.copyToClipboard(e, installCommand)}
                  className="oh-install-modal__install-command-copy"
                  onMouseEnter={this.onCopyEnter}
                >
                  <Icon type="fa" name="clipboard" />
                  <span className="sr-only">Copy to Clipboard</span>
                </a>
              </Tooltip>
            </div>
            <p>
              This Operator will be installed in the &quot;
              <span className="oh-install-modal__namespace-text">{operatorNamespace}</span>
              {`" namespace and will be usable from ${
                globalOperator ? 'all namespaces in the cluster' : 'this namespace only'
              }.`}
            </p>
          </li>
          <li>
            <p>After install, watch your operator come up using next command.</p>
            <div className="oh-install-modal__install-command-container">
              <div className="oh-code">{`$ ${verifyOperatorCommandFull}`}</div>
              <Tooltip content={tooltipContent} styles={tooltipOverrides}>
                <a
                  href="#"
                  onClick={e => this.copyToClipboard(e, verifyOperatorCommandFull)}
                  className="oh-install-modal__install-command-copy"
                  onMouseEnter={this.onCopyEnter}
                >
                  <Icon type="fa" name="clipboard" />
                  <span className="sr-only">Copy to Clipboard</span>
                </a>
              </Tooltip>
            </div>
            <p>
              To use it, checkout the custom resource definitions (CRDs) introduced by this operator to start using it.
            </p>
          </li>
        </ol>
      </>
    );
  };

  renderHelmInstallInstructions = () => {
    const { operator } = this.props;
    const { copied } = this.state;
    const { helmRepoName, helmRepoUrl, helmChart } = operator;
    const tooltipText = copied ? 'Copied' : 'Copy to Clipboard';
    const tooltipContent = [
      <span className="oh-nowrap" key="nowrap">
        {tooltipText}
      </span>
    ];

    const addHelmRepoCommand = getAddHelmRepoCommand(helmRepoName || '', helmRepoUrl || '');
    const installHelmChartCommand = getInstallHelmChartCommand(helmRepoName || '', helmChart || '');
    const verifyHelmCommand = getVerifyHelmCommand(helmChart || '');

    return (
      <>
        <h2>Install on Kubernetes</h2>
        <ol className="oh-install-modal__list">
          <li className="oh-install-modal__list__olm">
            <p>To install this Operator via helm, first add the repository to your local configuration</p>
            <div className="oh-install-modal__install-command-container">
              <div className="oh-code">{`$ ${addHelmRepoCommand}`}</div>
              <Tooltip content={tooltipContent} styles={tooltipOverrides}>
                <a
                  href="#"
                  onClick={e => this.copyToClipboard(e, addHelmRepoCommand)}
                  className="oh-install-modal__install-command-copy"
                  onMouseEnter={this.onCopyEnter}
                >
                  <Icon type="fa" name="clipboard" />
                  <span className="sr-only">Copy to Clipboard</span>
                </a>
              </Tooltip>
            </div>
          </li>
          <li>
            <p>Then, install the ${helmChart} helm chart:</p>
            <div className="oh-install-modal__install-command-container">
              <div className="oh-code">{`$ ${installHelmChartCommand}`}</div>
              <Tooltip content={tooltipContent} styles={tooltipOverrides}>
                <a
                  href="#"
                  onClick={e => this.copyToClipboard(e, installHelmChartCommand)}
                  className="oh-install-modal__install-command-copy"
                  onMouseEnter={this.onCopyEnter}
                >
                  <Icon type="fa" name="clipboard" />
                  <span className="sr-only">Copy to Clipboard</span>
                </a>
              </Tooltip>
            </div>
            <p>
              This Operator will be installed in the &quot;
              <span className="oh-install-modal__namespace-text">{helmChart}</span>
              &quot; namespace and will be usable from all namespaces in the cluster.
            </p>
          </li>
          <li>
            <p>Verify your deployed release.</p>
            <div className="oh-install-modal__install-command-container">
              <div className="oh-code">{`$ ${verifyHelmCommand}`}</div>
              <Tooltip content={tooltipContent} styles={tooltipOverrides}>
                <a
                  href="#"
                  onClick={e => this.copyToClipboard(e, verifyHelmCommand)}
                  className="oh-install-modal__install-command-copy"
                  onMouseEnter={this.onCopyEnter}
                >
                  <Icon type="fa" name="clipboard" />
                  <span className="sr-only">Copy to Clipboard</span>
                </a>
              </Tooltip>
            </div>
            <p>To use it, refer to the instructions on the detail page.</p>
          </li>
        </ol>
      </>
    );
  };

  render() {
    const { operator, onClose } = this.props;
    const isHelmOperator = operator.managedBy === 'helm';

    return (
      <Modal show onHide={onClose} bsSize="lg" className="oh-install-modal right-side-modal-pf">
        {_.get(operator, 'displayName') && (
          <React.Fragment>
            <Modal.Header>
              <Modal.CloseButton onClick={onClose} />
              <CatalogItemHeader
                iconImg={_.get(operator, 'imgUrl') || operatorImg}
                title={_.get(operator, 'displayName')}
                vendor={`${_.get(operator, 'version')} provided by ${_.get(operator, 'provider')}`}
              />
            </Modal.Header>
            <Modal.Body>
              {isHelmOperator ? this.renderHelmInstallInstructions() : this.renderKubernetesInstallInstructions()}
            </Modal.Body>
          </React.Fragment>
        )}
      </Modal>
    );
  }
}

InstallModal.propTypes = {
  olmVersion: PropTypes.string.isRequired,
  operator: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string
    })
  }).isRequired
};

export default InstallModal;
