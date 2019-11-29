import React from 'react';
import { Icon } from 'patternfly-react';

export interface ChannelEditorChannelIconProps {
    expanded: boolean;
}

/**
 * Upload result icon with type of 'success' or 'failure' or 'missing
 */
const ChannelEditorChannelIcon: React.FC<ChannelEditorChannelIconProps> = ({ expanded: exapnded }) => {
    return (
        <span className="oh-package-channels-editor__channel__header__icon">
            <Icon type="fa" name={`angle-${exapnded ? 'down' : 'right'}`} />
        </span>
    );
}



export default ChannelEditorChannelIcon;
