import React from 'react';

const SocialMediaLinks = ({ ...props }) => (
  <div className="oh-footer__contents-right__links__list__social" {...props}>
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
      href="https://kubernetes.slack.com/messages/kubernetes-operators"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="sr-only">Slack</span>
    </a>
  </div>
);

export default SocialMediaLinks;
