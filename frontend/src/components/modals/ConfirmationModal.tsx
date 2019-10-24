import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon } from 'patternfly-react';

import { reduxConstants } from '../../redux/constants';
import MessageDialog from './MessageDialog';
import { StoreState } from '../../redux';
import { ConfirmationModalReducerState } from '../../redux/confirmationModalReducer';

export type ConfirmationModalProps = ConfirmationModalReducerState & {
  hideModal: () => void
};

class ConfirmationModal extends React.PureComponent<ConfirmationModalProps> {

  static propTypes;
  static defaultProps;

  cancel = () => {
    const { onCancel, hideModal } = this.props;

    onCancel ? onCancel() : hideModal();
  };

  render() {
    const {
      show,
      title,
      heading,
      body,
      icon,
      confirmButtonText,
      cancelButtonText,
      onConfirm,
      restoreFocus
    } = this.props;

    return (
      <MessageDialog
        show={show}
        onHide={this.cancel}
        primaryAction={onConfirm || this.cancel}
        secondaryAction={this.cancel}
        primaryActionButtonContent={confirmButtonText}
        secondaryActionButtonContent={cancelButtonText}
        primaryActionButtonBsStyle="primary"
        title={title}
        icon={icon}
        primaryText={heading}
        secondaryText={body}
        restoreFocus={restoreFocus}
      />
    );
  }
}

ConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string,
  heading: PropTypes.node,
  icon: PropTypes.node,
  body: PropTypes.node,
  confirmButtonText: PropTypes.string,
  restoreFocus: PropTypes.bool,
  cancelButtonText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func
};

ConfirmationModal.defaultProps = {
  title: 'Confirm',
  heading: null,
  body: null,
  icon: <Icon type="pf" name="warning-triangle-o" />,
  confirmButtonText: 'Confirm',
  cancelButtonText: 'Cancel',
  restoreFocus: true,
  onConfirm: null,
  onCancel: null
};

const mapDispatchToProps = dispatch => ({
  hideModal: () => dispatch({
    type: reduxConstants.CONFIRMATION_MODAL_HIDE
  })
});

const mapStateToProps = (state: StoreState) => ({ ...state.confirmationModal });

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmationModal);
