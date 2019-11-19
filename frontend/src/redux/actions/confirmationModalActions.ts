export const showUploaderErrorConfirmationModalAction = (error) => showConfirmationModalAction({
    title: 'Error Uploading File',
    heading: error,
    iconName: "error-circle-o",
    confirmButtonText: 'OK'
})

export const showConfirmationModalAction = (options: {
    title: string,
    heading: string | null,
    body?: React.ReactNode,
    iconName?: string,
    confirmButtonText?: string,
    cancelButtonText?: string,
    restoreFocus?: boolean,
    onConfirm?: () => void,
    onCancel?: () => void
}) => ({
    type: 'CONFIRMATION_MODAL_SHOW' as 'CONFIRMATION_MODAL_SHOW',
       ...options
})

export const hideConfirmModalAction = () => ({
    type: 'CONFIRMATION_MODAL_HIDE' as 'CONFIRMATION_MODAL_HIDE'
});

export type ConfirmationModalActions = ReturnType<typeof showConfirmationModalAction> | ReturnType<typeof hideConfirmModalAction>
