import * as React from 'react';
import PropTypes from 'prop-types';
import * as _ from 'lodash-es';
import { Tooltip } from 'react-lightweight-tooltip';
import copy from 'copy-to-clipboard';
import { ExpandCollapse, Icon, Modal } from 'patternfly-react';
import { CatalogItemHeader } from 'patternfly-react-extensions';

import { helpers } from '../../common/helpers';
import * as operatorImg from '../../imgs/operator.svg';
import { InternalLink } from '../../components/InternalLink';

const olmRepo = 'https://raw.githubusercontent.com/operator-framework/operator-lifecycle-manager';
const olmYAMLFile = `${olmRepo}/master/deploy/upstream/quickstart/olm.yaml`;

const INSTALL_OLM_COMMAND = `kubectl create -f ${olmYAMLFile}`;

class InstallModal extends React.Component {
  state = { installCommand: '', copied: false };

  copyToClipboard = (e, command) => {
    e.preventDefault();
    copy(command);
    this.setState({ copied: true });
  };

  onCopyEnter = () => {
    this.setState({ copied: false });
  };

  componentDidUpdate(prevProps) {
    const { operator } = this.props;

    if (operator !== prevProps.operator) {
      this.setState({
        installCommand: `kubectl create -f ${window.location.origin}/install/${_.get(this.props.operator, 'name')}.yaml`
      });
    }
  }

  render() {
    const { show, operator, onClose, history } = this.props;
    const { installCommand, copied } = this.state;

    const tooltipText = copied ? 'Copied' : 'Copy to Clipboard';
    const tooltipContent = [
      <span className="oh-nowrap" key="nowrap">
        {tooltipText}
      </span>
    ];

    const tooltipOverrides = Object.freeze({
      wrapper: {
        cursor: 'pointer',
        top: '-5px'
      },
      tooltip: {
        maxWidth: '170px',
        minWidth: 'auto'
      }
    });

    const globalOperator = _.get(operator, 'globalOperator', true);

    return (
      <Modal show={show} onHide={onClose} bsSize="lg" className="oh-install-modal right-side-modal-pf">
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
              <h2>Install on Kubernetes</h2>
              <ExpandCollapse
                className="oh-install-expander"
                textCollapsed="Show Prerequisites"
                textExpanded="Hide Prerequisites"
              >
                <div className="oh-install-olm-instructions">
                  <p>
                    Install Operator Lifecycle Manager (OLM), a tool to help manage the Operators running on your
                    cluster. Platforms like OpenShift / OKD will have it pre-installed.
                  </p>
                  <div className="oh-install-modal__install-command-container">
                    <div className="oh-code">{`$ ${INSTALL_OLM_COMMAND}`}</div>
                    <Tooltip content={tooltipContent} styles={tooltipOverrides}>
                      <a
                        href="#"
                        onClick={e => this.copyToClipboard(e, INSTALL_OLM_COMMAND)}
                        className="oh-install-modal__install-command-copy"
                        onMouseEnter={this.onCopyEnter}
                      >
                        <Icon type="fa" name="clipboard" />
                        <span className="sr-only">Copy to Clipboard</span>
                      </a>
                    </Tooltip>
                  </div>
                </div>
              </ExpandCollapse>

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
              <blockquote>
                <p>
                  {globalOperator && (
                    <span>
                      {`This Operator will be installed in the "`}
                      <span className="oh-install-modal__namespace-text">operators</span>
                      {`" namespace and will be usable from all namespaces in the cluster.`}
                    </span>
                  )}
                  {!globalOperator && (
                    <span>
                      {`This Operator will be installed in the "`}
                      <span className="oh-install-modal__namespace-text">{`my-${operator.packageName}`}</span>
                      {`" namespace and will be usable from this namespace only.`}
                    </span>
                  )}
                </p>
              </blockquote>
              <p>
                After install, checkout the custom resource definitions (CRDs) introduced by this operator to start
                using it.
              </p>
            </Modal.Body>
          </React.Fragment>
        )}
      </Modal>
    );
  }
}

InstallModal.propTypes = {
  show: PropTypes.bool,
  operator: PropTypes.object,
  onClose: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

InstallModal.defaultProps = {
  show: false,
  operator: null,
  onClose: helpers.noop
};

export default InstallModal;
