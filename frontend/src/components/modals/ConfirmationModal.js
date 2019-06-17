import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon } from 'patternfly-react';

import store from '../../redux/store';
import { reduxConstants } from '../../redux/index';
import MessageDialog from './MessageDialog';

class ConfirmationModal extends React.Component {
  cancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    } else {
      store.dispatch({
        type: reduxConstants.CONFIRMATION_MODAL_HIDE
      });
    }
  };

  render() {
    const { show, title, heading, body, icon, confirmButtonText, cancelButtonText, onConfirm } = this.props;

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
        enforceFocus
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
  onConfirm: null,
  onCancel: null
};

const mapStateToProps = state => ({ ...state.confirmationModal });

export default connect(mapStateToProps)(ConfirmationModal);
