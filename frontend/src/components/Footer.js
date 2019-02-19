import React from 'react';
import PropTypes from 'prop-types';
import hubLogo from '../imgs/operatorhub-header-logo.svg';
import frameworkLogo from '../imgs/operator-framework-logo-lite.svg';
import { InternalLink } from './InternalLink';
import { ExternalLink } from './ExternalLink';
import { gettingStarted, operatorsFramework, kubernetesSlack, contactUsEmail } from '../utils/documentationLinks';

const Footer = ({ history, ...props }) => (
  <div className="oh-footer" {...props}>
    <div className="oh-footer__top-bar">
      <h3>List your operator on OperatorHub.io</h3>
      <InternalLink
        className="oh-footer__top-bar__link"
        route="/contribute"
        history={history}
        text={`Submit your operator >`}
      />
    </div>
    <div className="oh-footer__contents">
      <div className="oh-footer__contents__inner">
        <div className="oh-footer__contents-left">
          <img className="oh-footer__contents-left__logo" src={frameworkLogo} alt="Operator Framework" />
          <div className="oh-footer__contents-left__text">
            The Operator Framework is an open source toolkit to manage Kubernetes native applications, called Operators,
            in an effective, automated, and scalable way.
          </div>
          <InternalLink
            className="oh-footer__button"
            route="/getting-started-with-operators"
            history={history}
            text="Jump-start with the SDK"
          />
        </div>
        <div className="oh-footer__contents-right">
          <img className="oh-footer__contents-right__logo" src={hubLogo} alt="OperatorHub" />
          <div className="oh-footer__contents-right__links">
            <div className="oh-footer__contents-right__links__list">
              <h4 className="oh-footer__contents-right__links__list__header">ABOUT</h4>
              <InternalLink
                className="oh-footer__contents-right__links__list__link"
                route="/about"
                history={history}
                text="About OperatorHub.io"
              />
              <InternalLink
                className="oh-footer__contents-right__links__list__link"
                route="/what-is-an-operator"
                history={history}
                text="What is an Operator?"
              />
              <ExternalLink
                className="oh-footer__contents-right__links__list__link"
                href={gettingStarted}
                text="Documentation"
                indicator={false}
              />
            </div>
            <div className="oh-footer__contents-right__links__list">
              <h4 className="oh-footer__contents-right__links__list__header">NETWORK</h4>
              <ExternalLink
                className="oh-footer__contents-right__links__list__link"
                href={operatorsFramework}
                text="GitHub"
                indicator={false}
              />
              <ExternalLink
                className="oh-footer__contents-right__links__list__link"
                href={`mailto: ${contactUsEmail}`}
                text="Contact Us"
                indicator={false}
              />
              <ExternalLink
                className="oh-footer__contents-right__links__list__link"
                href={kubernetesSlack}
                text="Join us on Slack"
                indicator={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Footer.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
};

export default Footer;
