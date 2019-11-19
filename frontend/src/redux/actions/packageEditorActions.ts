import { PackageEntry } from '../../utils/packageEditorTypes';

export type BoundActionCreator<T extends (...args: any) => any> = (...args: Parameters<T>) => void;

export const setPackageUploadsAction = (uploads: PackageEntry[]) => ({
  type: 'SET_PACKAGE_EDITOR_UPLOADS' as 'SET_PACKAGE_EDITOR_UPLOADS',
  uploads
});


export const removePackageUploadAction = (path: string, nested: boolean) => ({
  type: 'REMOVE_PACKAGE_EDITOR_UPLOAD' as 'REMOVE_PACKAGE_EDITOR_UPLOAD',
  path,
  nested
});

export const clearPackageUploadsAction = () => ({
  type: 'CLEAR_PACKAGE_EDITOR_UPLOADS' as 'CLEAR_PACKAGE_EDITOR_UPLOADS'
});

export const showGithubPackageUploadAction = () => ({
  type: 'SHOW_PACKAGE_EDITOR_GITHUB_UPLOAD' as 'SHOW_PACKAGE_EDITOR_GITHUB_UPLOAD'
});

export const hideGithubPackageUploadAction = () => ({
  type: 'HIDE_PACKAGE_EDITOR_GITHUB_UPLOAD' as 'HIDE_PACKAGE_EDITOR_GITHUB_UPLOAD'
});


export type PackageEditorActions = ReturnType<typeof setPackageUploadsAction> | ReturnType<typeof removePackageUploadAction> |
  ReturnType<typeof clearPackageUploadsAction> | ReturnType<typeof showGithubPackageUploadAction> |
  ReturnType<typeof hideGithubPackageUploadAction>;
