import React from 'react';

import OperatorInputWrapper from '../../editor/forms/OperatorInputWrapper';
import { validateOperatorPackageField } from '../../../utils/operatorValidation';

export interface CreateNewOperatorPackageSectionProps {
    onSectionValidatedCallback: (isValid: boolean, packageName: string, channelName: string) => void
}

interface CreateNewOperatorPackageSectionState {
    packageName: string
    packageNameValid: boolean
    defaultChannel: string
    defaultChannelValid: boolean,
    formErrors: any
}

class CreateNewOperatorPackageSection extends React.PureComponent<CreateNewOperatorPackageSectionProps, CreateNewOperatorPackageSectionState>{

    state: CreateNewOperatorPackageSectionState = {
        packageName: '',
        packageNameValid: false,
        defaultChannel: 'stable',
        defaultChannelValid: true,
        formErrors: {}
    }

    descriptions = {
        packageName: 'The name that describes your Operator.',
        defaultChannel: 'Channels allow you to specify different upgrade paths for different users (e.g. alpha vs. stable).'
    }



    commitField = (field: string, value: string) => {
        const { onSectionValidatedCallback } = this.props;
        const { formErrors } = this.state;
        const validationKey: 'defaultChannelValid' | 'packageNameValid' = field + 'Valid' as any;

        // reused package name validation as we follow same rules here
        const error: string | null = validateOperatorPackageField(value, 'name');

        // @ts-ignore
        this.setState({
            formErrors: {
                ...formErrors,
                [field]: error
            },
            [validationKey]: typeof error !== 'string'

        }, () => {
            const {packageName, packageNameValid, defaultChannel, defaultChannelValid } = this.state;
            const isValid = defaultChannelValid && packageNameValid;
            onSectionValidatedCallback(isValid, packageName, defaultChannel);
        });
    }

    updateField = (field: string, value: string) => {
        // @ts-ignore
        this.setState({ [field]: value });
    };

    render() {
        const { defaultChannel, packageName, formErrors } = this.state;

        return (
            <div className="oh-operator-editor-form__field-section">
                <form className="oh-operator-editor-form">
                    <OperatorInputWrapper
                        title="Package Name"
                        descriptions={this.descriptions}
                        field="packageName"
                        formErrors={formErrors}
                        key="packageName"
                    >
                        <input
                            id="packageName"
                            className="form-control"
                            type="text"
                            onBlur={e => this.commitField('packageName', e.target.value)}
                            onChange={e => this.updateField('packageName', e.target.value)}
                            placeholder="e.g. knative-eventing-operator or couchbase-enterprise"
                            value={packageName}
                        />
                    </OperatorInputWrapper>
                    <OperatorInputWrapper
                        title="Default Channel Name"
                        descriptions={this.descriptions}
                        field="defaultChannel"
                        formErrors={formErrors}
                        key="defaultChannel"
                    >
                        <input
                            id="defaultChannel"
                            className="form-control"
                            type="text"
                            onBlur={e => this.commitField('defaultChannel', e.target.value)}
                            onChange={e => this.updateField('defaultChannel', e.target.value)}
                            placeholder="e.g. stable"
                            value={defaultChannel}
                        />
                    </OperatorInputWrapper>
                </form>
            </div>
        )
    }
}

export default CreateNewOperatorPackageSection;