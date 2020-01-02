import React from 'react';
import { simpleNameValidator } from '../../../utils/operatorValidators';
import { getValueError } from '../../../utils/operatorValidation';

import EditNameInChannelModal from './EditNameModal';


export interface EditChannelNameModalProps {
    name: string,
    onConfirm: (name: string, initialName: string) => void
    onClose: () => void
}



const EditChannelNameModal: React.FC<EditChannelNameModalProps> = ({ name, onConfirm, onClose }) => {

    const headline = `${name ? 'Edit' : 'Add'} Package Channel Name`;
    const description = 'Channels allow you to specify different upgrade paths for different users. Name has to be unique per package.';

    const validator = (value: string) => getValueError(value, simpleNameValidator, {} as any);


    return (
        <EditNameInChannelModal
            name={name}
            headline={headline}
            nameFieldTitle="Channel Name"
            nameFieldDescription={description}
            nameFieldPlaceholder="e.g. alpha or stable"
            nameValidator={validator}
            onConfirm={onConfirm}
            onClose={onClose}
        />
    );
};

export default EditChannelNameModal;
