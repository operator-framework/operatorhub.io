import { ConfirmationModalActions } from './actions';

export interface ConfirmationModalReducerState {
  show: boolean;
  title: string;
  heading: string | null;
  iconName: string | undefined;
  body: React.ReactNode;
  confirmButtonText: string;
  cancelButtonText: string | null;
  restoreFocus?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}

const initialState: ConfirmationModalReducerState = {
  show: false,
  title: 'Confirm',
  heading: null,
  iconName: undefined,
  body: null,
  confirmButtonText: 'Confirm',
  cancelButtonText: null
};

const confirmationModalReducer = (state: ConfirmationModalReducerState = initialState, action: ConfirmationModalActions): ConfirmationModalReducerState => {  
  switch (action.type) {

    case 'CONFIRMATION_MODAL_SHOW':
      return {
        ...state,
        show: true,
        title: action.title,
        heading: action.heading,
        iconName: action.iconName,
        body: action.body,
        confirmButtonText: action.confirmButtonText || 'Confirm',
        cancelButtonText: action.cancelButtonText || null,
        onConfirm: action.onConfirm,
        onCancel: action.onCancel,
        restoreFocus: action.restoreFocus
      };

    case 'CONFIRMATION_MODAL_HIDE':
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
