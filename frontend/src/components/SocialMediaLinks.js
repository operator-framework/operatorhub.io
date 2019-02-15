import React from 'react';
import { ExternalLink } from './ExternalLink';
import { kubernetesSlack, hubFacebook, hubTwitter } from '../utils/documentationLinks';

const SocialMediaLinks = ({ ...props }) => (
  <div className="oh-footer__contents-right__links__list__social" {...props}>
    <ExternalLink className="fa fa-twitter" href={hubTwitter} text={<span className="sr-only">Twitter</span>} />
    <ExternalLink className="fa fa-facebook" href={hubFacebook} text={<span className="sr-only">Facebook</span>} />
    <ExternalLink className="fa fa-slack" href={kubernetesSlack} text={<span className="sr-only">Slack</span>} />
  </div>
);

export default SocialMediaLinks;
