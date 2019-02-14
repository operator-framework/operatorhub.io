import React from 'react';
import PropTypes from 'prop-types';
import hubLogo from '../imgs/operatorhub-header-logo.svg';
import frameworkLogo from '../imgs/operator-framework-logo-lite.svg';

const Footer = ({ history, ...props }) => {
  const onGettingStarted = e => {
    e.preventDefault();
    history.push('/getting-started-with-operators');
  };

  const onSubmitYourOperator = e => {
    e.preventDefault();
    history.push('/contribute');
  };

  const onWhatIsAnOperator = e => {
    e.preventDefault();
    history.push('/what-is-an-operator');
  };

  return (
    <div className="oh-footer" {...props}>
      <div className="oh-footer__top-bar">
        <h3>List your operator on OperatorHub.io</h3>
        <a className="oh-footer__top-bar__link" href="#" onClick={onSubmitYourOperator}>
          {`Submit your operator >`}
        </a>
      </div>
      <div className="oh-footer__contents">
        <div className="oh-footer__contents__inner">
          <div className="oh-footer__contents-left">
            <img className="oh-footer__contents-left__logo" src={frameworkLogo} alt="Operator Framework" />
            <div className="oh-footer__contents-left__text">
              The Operator Framework is an open source toolkit to manage Kubernetes native applications, called
              Operators, in an effective, automated, and scalable way.
            </div>
            <a className="oh-footer__button" href="/getting-started-with-operators" onClick={onGettingStarted}>
              Jump-start with the SDK
            </a>
          </div>
          <div className="oh-footer__contents-right">
            <img className="oh-footer__contents-right__logo" src={hubLogo} alt="OperatorHub" />
            <div className="oh-footer__contents-right__links">
              <div className="oh-footer__contents-right__links__list">
                <h4 className="oh-footer__contents-right__links__list__header">ABOUT</h4>
                <a
                  className="oh-footer__contents-right__links__list__link"
                  href="/what-is-an-operator"
                  onClick={onWhatIsAnOperator}
                >
                  What are Operators?
                </a>
                <a
                  className="oh-footer__contents-right__links__list__link"
                  href="https://github.com/operator-framework/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Documentation
                </a>
              </div>
              <div className="oh-footer__contents-right__links__list">
                <h4 className="oh-footer__contents-right__links__list__header">NETWORK</h4>
                <a
                  className="oh-footer__contents-right__links__list__link"
                  href="https://github.com/operator-framework"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  className="oh-footer__contents-right__links__list__link"
                  href="https://github.com/operator-framework/operator-lifecycle-manager#getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact Us
                </a>
                <a
                  className="oh-footer__contents-right__links__list__link"
                  href="https://kubernetes.slack.com/messages/kubernetes-operators"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join us on Slack
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Footer.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

export default Footer;
