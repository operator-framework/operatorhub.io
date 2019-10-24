/* eslint-disable jsx-a11y/no-autofocus */
import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Modal } from 'patternfly-react';

import { helpers } from '../../common';

export interface MessageDialogProps {
  show: boolean
    className?: string
    primaryActionButtonContent: ReactNode
    onHide: () => void
    /** callback to trigger when clicking the default footer primary action button */
    primaryAction?: (e: React.MouseEvent) => void
    secondaryAction?: (e: React.MouseEvent) => void
    primaryActionButtonBsStyle?: string
    secondaryActionButtonBsStyle?: string
    secondaryActionButtonContent?: ReactNode
    title?: string
    icon?: ReactNode
    primaryText?: ReactNode
    secondaryText?: ReactNode
    footer?: ReactNode
    restoreFocus?: boolean
}

const MessageDialog: React.FC<MessageDialogProps> = ({
  show,
  onHide,
  primaryAction,
  secondaryAction,
  title,
  icon,
  primaryText,
  secondaryText,
  primaryActionButtonBsStyle,
  secondaryActionButtonBsStyle,
  primaryActionButtonContent,
  secondaryActionButtonContent,
  className,
  footer,
  ...props
}) => (
  <Modal className={classNames('message-dialog-pf', className)} show={show} onHide={onHide} {...props}>
    <Modal.Header>
      <Modal.CloseButton onClick={onHide} />
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {icon && icon}
      <div>
        {primaryText && primaryText}
        {secondaryText && secondaryText}
      </div>
    </Modal.Body>
    <Modal.Footer>
      {!footer ? (
        <React.Fragment>
          {secondaryActionButtonContent && (
            <button className="oh-button oh-button-secondary" onClick={secondaryAction}>
              {secondaryActionButtonContent}
            </button>
          )}
          <button autoFocus className="oh-button oh-button-primary" onClick={primaryAction}>
            {primaryActionButtonContent}
          </button>
        </React.Fragment>
      ) : (
        footer
      )}
    </Modal.Footer>
  </Modal>
);

MessageDialog.propTypes = {
  /** additional class(es) */
  className: PropTypes.string,
  /** When true, the modal will show itself */
  show: PropTypes.bool.isRequired,
  /** A callback fired when the header closeButton or backdrop is clicked */
  onHide: PropTypes.func.isRequired,
  /** callback to trigger when clicking the default footer primary action button */
  primaryAction: PropTypes.func,
  /** callback to trigger when clicking the default footer secondary action button */
  secondaryAction: PropTypes.func,
  /** Bootstrap button style for primary action */
  primaryActionButtonBsStyle: PropTypes.string,
  /** Bootstrap button style for secondary action */
  secondaryActionButtonBsStyle: PropTypes.string,
  /** content for default footer primary action button */
  primaryActionButtonContent: PropTypes.node.isRequired,
  /** content for default footer secondary action button */
  secondaryActionButtonContent: PropTypes.node,
  /** modal title */
  title: PropTypes.string,
  /** modal body icon */
  icon: PropTypes.node,
  /** primary message text */
  primaryText: PropTypes.node,
  /** secondary message text */
  secondaryText: PropTypes.node,
  /** custom footer */
  footer: PropTypes.node
};

MessageDialog.defaultProps = {
  className: '',
  primaryAction: helpers.noop as any,
  secondaryAction: helpers.noop as any,
  primaryActionButtonBsStyle: 'primary',
  secondaryActionButtonBsStyle: 'default',
  secondaryActionButtonContent: null,
  title: '',
  icon: null,
  primaryText: null,
  secondaryText: null,
  footer: null
};

export default MessageDialog;
