import { reduxConstants } from '../constants';
import { PackageEntry } from '../../utils/packageEditorTypes';



export const setPackageUploadsAction = (uploads: PackageEntry[]) => ({
    type: reduxConstants.SET_PACKAGE_EDITOR_UPLOADS,
    uploads
  });


    