import React from 'react';
import hubLogo from '../imgs/operatorhub-header-logo.svg';
import frameworkLogo from '../imgs/operator-framework-logo-lite.svg';

const Footer = ({ ...props }) => (
  <div className="oh-footer" {...props}>
    <div className="oh-footer__top-bar">
      <h3>List your operator on OperatorHub.io</h3>
      <a
        className="oh-footer__top-bar__link"
        href="https://github.com/operator-framework/operator-lifecycle-manager#getting-started"
        target="_blank"
        rel="noopener noreferrer"
      >
        {`Submit your operator >`}
      </a>
    </div>
    <div className="oh-footer__contents">
      <div className="oh-footer__contents__inner">
        <div className="oh-footer__contents-left">
          <img className="oh-footer__contents-left__logo" src={frameworkLogo} alt="Operator Framework" />
          <div className="oh-footer__contents-left__text">
            The Operator Framework is an open source toolkit to manage Kubernetes native applications, called Operators,
            in an effective, automated, and scalable way.
          </div>
          <a
            className="oh-footer__button"
            href="https://github.com/operator-framework/operator-lifecycle-manager#getting-started"
            target="_blank"
            rel="noopener noreferrer"
          >
            Jump-start with our SDK
          </a>
        </div>
        <div className="oh-footer__contents-right">
          <img className="oh-footer__contents-right__logo" src={hubLogo} alt="OperatorHub" />
          <div className="oh-footer__contents-right__links">
            <div className="oh-footer__contents-right__links__list">
              <h4 className="oh-footer__contents-right__links__list__header">ABOUT</h4>
              <a
                className="oh-footer__contents-right__links__list__link"
                href="https://github.com/operator-framework/operator-lifecycle-manager#getting-started"
                target="_blank"
                rel="noopener noreferrer"
              >
                What are Operators?
              </a>
              <a
                className="oh-footer__contents-right__links__list__link"
                href="https://github.com/operator-framework/operator-lifecycle-manager#getting-started"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </a>
              <a
                className="oh-footer__contents-right__links__list__link"
                href="https://github.com/operator-framework/operator-lifecycle-manager#getting-started"
                target="_blank"
                rel="noopener noreferrer"
              >
                Community
              </a>
              <a
                className="oh-footer__contents-right__links__list__link"
                href="https://github.com/operator-framework/operator-lifecycle-manager#getting-started"
                target="_blank"
                rel="noopener noreferrer"
              >
                FAQ
              </a>
            </div>
            <div className="oh-footer__contents-right__links__list">
              <h4 className="oh-footer__contents-right__links__list__header">NETWORK</h4>
              <a
                className="oh-footer__contents-right__links__list__link"
                href="https://github.com/operator-framework/operator-lifecycle-manager#getting-started"
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
                Forum
              </a>
              <a
                className="oh-footer__contents-right__links__list__link"
                href="https://github.com/operator-framework/operator-lifecycle-manager#getting-started"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact Us
              </a>
              <div className="oh-footer__contents-right__links__list__social">
                <a
                  className="fa fa-twitter"
                  href="https://github.com/operator-framework/operator-lifecycle-manager#getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">Twitter</span>
                </a>
                <a
                  className="fa fa-facebook"
                  href="https://github.com/operator-framework/operator-lifecycle-manager#getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">Facebook</span>
                </a>
                <a
                  className="fa fa-slack"
                  href="https://github.com/operator-framework/operator-lifecycle-manager#getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">Slack</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Footer;
