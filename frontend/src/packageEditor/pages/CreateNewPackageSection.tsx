import React from 'react';
import OperatorInputWrapper from '../../components/editor/forms/OperatorInputWrapper';
import { operatorPackageFieldValidators } from '../../utils/operatorValidators';
import { validateOperatorPackageField } from '../../utils/operatorValidation';

export interface CreateNewOperatorPackageSectionProps {
    onSectionValidatedCallback: (isValid: boolean) => void
}

interface CreateNewOperatorPackageSectionState {
    packageName: string
    packageNameValid: boolean
    defaultChannel: string
    defaultChannelValid: false,
    formErrors: any
}

class CreateNewOperatorPackageSection extends React.PureComponent<CreateNewOperatorPackageSectionProps, CreateNewOperatorPackageSectionState>{

    state: CreateNewOperatorPackageSectionState = {
        packageName: '',
        packageNameValid: false,
        defaultChannel: 'stable',
        defaultChannelValid: false,
        formErrors: {}
    }

    descriptions = {
        packageName: 'The name that describes your Operator.',
        defaultChannel: 'Channels allow you to specify different upgrade paths for different users (e.g. alpha vs. stable).'
    }

  

    commitField = (field: string, value: string) => {
        const {onSectionValidatedCallback} = this.props;
        const {formErrors} = this.state;

        // reused package name validation as we follow same rules here
        const error: string | null = validateOperatorPackageField(value, 'name');
        console.log(error);      

        this.setState({ formErrors: {
            ...formErrors,
            [field + 'Valid']: typeof error !== 'string',
            [field]: error
        }});

        onSectionValidatedCallback(this.state.defaultChannelValid && this.state.packageNameValid);      
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