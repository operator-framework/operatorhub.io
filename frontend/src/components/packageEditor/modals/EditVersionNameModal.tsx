import React from 'react';
import { pureVersionValidator } from '../../../utils/operatorValidators';
import { getValueError } from '../../../utils/operatorValidation';

import EditNameInChannelModal from './EditNameModal';

export interface EditVersionNameModalProps {
    headline: string,
    name: string,
    allVersions: string[],
    onConfirm: (name: string, initialName: string) => void
    onClose: () => void
}

const EditVersionNameModal: React.FC<EditVersionNameModalProps> = ({ headline, name, allVersions, onConfirm, onClose }) => {
    const description = 'The semantic version of the Operator. This value should be incremented each time a new Operator is published';

    const validator = (value: string) => {
        const error = getValueError(value, pureVersionValidator, {} as any);

        if(error){
            return error;
        // proceed to validation against other versions only if we have valid version
        } else {
            return allVersions.includes(value) ? 'Version cannot match any other existing operator version.' : null;
        }
    }


    return (
        <EditNameInChannelModal
            name={name}
            headline={headline}
            nameFieldTitle="Operator Version Name"
            nameFieldDescription={description}
            nameFieldPlaceholder="e.g. 1.2.3 or 1.0.0-beta1"
            nameValidator={validator}
            onConfirm={onConfirm}
            onClose={onClose}
        />
    );
};

export default EditVersionNameModal;
