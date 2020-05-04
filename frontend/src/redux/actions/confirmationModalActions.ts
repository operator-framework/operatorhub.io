export const showUploaderErrorConfirmationModalAction = (error: string) => showConfirmationModalAction({
    title: 'Error Uploading File',
    heading: error,
    iconName: "error-circle-o",
    confirmButtonText: 'OK'
});

export const showClearOperatorBundleModalAction = (version: string, onConfirm: () => void) => showConfirmationModalAction({
    title: 'Clear Operator Bundle',
    heading: `Clear the Operator Bundle Version "${version}"?`,
    confirmButtonText: 'Clear',
    cancelButtonText: 'Cancel',
    onConfirm
});

export const showClearOperatorPackageModalAction = (packageName: string, onConfirm: () => void) => showConfirmationModalAction({
    title: 'Clear Operator Package',
    heading: `Clear the Operator Package "${packageName}"?`,
    confirmButtonText: 'Clear',
    cancelButtonText: 'Cancel',
    onConfirm
});

export const showClearConfirmationModalAction = (onConfirm: () => void) => showConfirmationModalAction({
    title: 'Clear Content',
    heading: 'Are you sure you want to clear the current content of the editor?',
    confirmButtonText: 'Clear',
    cancelButtonText: 'Cancel',
    onConfirm
});

export const showRemoveChannelConfirmationModalAction = (onConfirm: () => void) => showConfirmationModalAction({
    title: 'Remove Channel Content',
    heading: 'Are you sure you want to remove channel and all the associated versions?',
    confirmButtonText: 'Remove',
    cancelButtonText: 'Cancel',
    onConfirm
});

export const showRemoveVersionConfirmationModalAction = (onConfirm: () => void) => showConfirmationModalAction({
    title: 'Remove Operator Version',
    heading: 'Are you sure you want to remove operator version?',
    confirmButtonText: 'Remove',
    cancelButtonText: 'Cancel',
    onConfirm
});

export const showMissingDefaultChannelConfirmationModalAction = () => showConfirmationModalAction({
    title: 'Missing Default Channel',
    heading: 'Please set one of the channels as default.',
    confirmButtonText: 'OK'
});

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
