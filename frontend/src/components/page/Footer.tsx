import React from 'react';
import PropTypes from 'prop-types';
import {History} from 'history';

// @ts-ignore
import hubLogo from '../../imgs/operatorhub-header-logo.svg';
// @ts-ignore
import frameworkLogo from '../../imgs/operator-framework-logo-lite.svg';
import { InternalLink } from '../InternalLink';
import { ExternalLink } from '../ExternalLink';
import * as documentationLinks from '../../utils/documentationLinks';

export interface FooterProps{
  history: History
  visible?: boolean
  [prop: string]: any
}

const Footer: React.FC<FooterProps> = ({ history, visible, ...props }) => (
  <div className={`oh-footer${visible ? '' : ' oh-not-visible'}`} {...props}>
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
            route="/getting-started"
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
                href={documentationLinks.gettingStarted}
                text="Documentation"
                
              />
              <ExternalLink
                className="oh-footer__contents-right__links__list__link"
                href={`${documentationLinks.privacyPolicy}`}
                text="Privacy Policy"
                
              />
            </div>
            <div className="oh-footer__contents-right__links__list">
              <h4 className="oh-footer__contents-right__links__list__header">NETWORK</h4>
              <ExternalLink
                className="oh-footer__contents-right__links__list__link"
                href={documentationLinks.hubTwitter}
                text="Twitter"
                
              />
              <ExternalLink
                className="oh-footer__contents-right__links__list__link"
                href={documentationLinks.hubYoutube}
                text="YouTube"
                
              />
              <ExternalLink
                className="oh-footer__contents-right__links__list__link"
                href={documentationLinks.operatorsFramework}
                text="GitHub"
                
              />
              <ExternalLink
                className="oh-footer__contents-right__links__list__link"
                href={documentationLinks.fileAnIssue}
                text="File an issue on GitHub"
                
              />
              <ExternalLink
                className="oh-footer__contents-right__links__list__link"
                href={documentationLinks.kubernetesSlack}
                text="Join us on Slack"
                
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Footer.propTypes = {
  history: PropTypes.any.isRequired,
  visible: PropTypes.bool
};

Footer.defaultProps = {
  visible: true
};

export default Footer;
