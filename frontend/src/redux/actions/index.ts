import { clearAutosavedOperatorData } from '../../utils/operatorUtils';

export * from './editorActions';
export * from './viewActions';
export * from './previewActions';
export * from './confirmationModalActions';
export * from './packageEditorActions';

export function clearLocalStorageAction(){
    clearAutosavedOperatorData();
}