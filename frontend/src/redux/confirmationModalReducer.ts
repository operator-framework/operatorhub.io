import { reduxConstants } from './constants';

export interface ConfirmationModalReducerState {
  show: boolean;
  title: string;
  heading: React.ReactNode;
  icon: React.ReactNode;
  body: React.ReactNode;
  confirmButtonText: string;
  cancelButtonText: React.ReactNode;
  restoreFocus?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}

const initialState: ConfirmationModalReducerState = {
  show: false,
  title: 'Confirm',
  heading: null,
  icon: null,
  body: null,
  confirmButtonText: 'Confirm',
  cancelButtonText: null
};

const confirmationModalReducer = (state: ConfirmationModalReducerState = initialState, action): ConfirmationModalReducerState => {  
  switch (action.type) {

    case reduxConstants.CONFIRMATION_MODAL_SHOW:
      return {
        ...state,
        show: true,
        title: action.title,
        heading: action.heading,
        icon: action.icon,
        body: action.body,
        confirmButtonText: action.confirmButtonText || 'Confirm',
        cancelButtonText: action.cancelButtonText || null,
        onConfirm: action.onConfirm,
        onCancel: action.onCancel,
        restoreFocus: action.restoreFocus
      };

    case reduxConstants.CONFIRMATION_MODAL_HIDE:
      return {
        ...state,
        show: false
      };

    default:
      return state;
  }
};

confirmationModalReducer.initialState = initialState;

export { confirmationModalReducer };

export default confirmationModalReducer;
