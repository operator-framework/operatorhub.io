import React from 'react';
import { Icon } from 'patternfly-react';

export interface UploaderBaseProps {
    description: React.ReactNode
}

interface UploaderBaseState {
    uploadExpanded: boolean
}

class UploaderBase extends React.PureComponent<UploaderBaseProps, UploaderBaseState> {

    static defaultProps;

    state: UploaderBaseState = {
        uploadExpanded: true
    }

    /**
     * Exapnd / collapse uploader and file list
     */
    toggleUploadExpanded = event => {
        const { uploadExpanded } = this.state;

        event.preventDefault();
        this.setState({ uploadExpanded: !uploadExpanded });
    };

    render() {
        const { children, description } = this.props;
        const { uploadExpanded } = this.state;

        return (
            <div id="manifest-uploader" className="oh-operator-editor-page__section">
                <div className="oh-operator-editor-page__section__header">
                    <div className="oh-operator-editor-page__section__header__text">
                        <h2 id="oh-operator--editor-page__manifest-uploader">Upload your Kubernetes manifests</h2>
                        {description}
                    </div>
                    <div className="oh-operator-editor-page__section__status">
                        <a onClick={this.toggleUploadExpanded}>
                            <Icon type="fa" name={uploadExpanded ? 'compress' : 'expand'} />
                            {uploadExpanded ? 'Collapse' : 'Expand'}
                        </a>
                    </div>
                </div>
                {uploadExpanded && children}
            </div>
        );
    }
}



export default UploaderBase;
