import React from 'react';
import { Icon } from 'patternfly-react';

/**
 * Upload result icon with type of 'success' or 'failure' or 'missing
 */
const  PackageUploaderFileIcon: React.FC<{}> = () => {
  return (
    <span className="oh-operator-editor-upload__uploads__file">
      <Icon type="fa" name="file-code-o" />
    </span>
  );
}



export default PackageUploaderFileIcon;
