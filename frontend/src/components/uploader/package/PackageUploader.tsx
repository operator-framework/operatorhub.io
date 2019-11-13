import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import UploaderBase from '../UploaderBase';
import PackageUploaderDropArea from './PackageUploaderDropArea';
import { noop } from '../../../common/helpers';
import { PackageEntry } from '../../../utils/packageEditorTypes';
import { setPackageUploadsAction } from '../../../redux/actions';
import { StoreState } from '../../../redux';
import PackageUploaderObjectList from './PackageUploaderObjectList';


interface OperatorPackageUploaderDerivedProps {
    uploads: PackageEntry[]
}

interface OperatorPackageUploaderActions {
    setPackageUploads: typeof setPackageUploadsAction
}

export interface OperatorPackageUploaderProps extends OperatorPackageUploaderDerivedProps, OperatorPackageUploaderActions {
    createFromScratch: () => void
}


class OperatorPackageUploader extends React.PureComponent<OperatorPackageUploaderProps> {


    static defaultProps;


    /**
     * Parse uploaded file
     * @param upload upload metadata object
     */
    processUploadedObject = (upload: any) => {


        return upload;
    };



    onPackageUpload = (entries: PackageEntry[]) => {
        const { setPackageUploads } = this.props;

        setPackageUploads(entries);
    }


    /**
     * Remove all uploaded files from the list
     */
    removeAllUploads = e => {
        e.preventDefault();
    };

    /**
     * Remove specific upload by its index
     */
    removeUpload = (e: React.MouseEvent, id: string) => {
        e.preventDefault();

    };


    render() {
        const { createFromScratch, uploads } = this.props;

        return (
            <UploaderBase
                description={(
                    <p>
                        Upload your entire Operator Package directory with Kubernetes YAML manifests. The editor will parses
                        and recognizes all the contained bundle versions and the associated channel definition.
                    </p>
                )}
            >
                <PackageUploaderDropArea
                    onUpload={this.onPackageUpload}
                    onUrlDownload={noop}
                    createFromScratch={createFromScratch}
                />
                <PackageUploaderObjectList
                    uploads={uploads}
                    removeUpload={noop}
                    removeAllUploads={noop}
                />
            </UploaderBase>
        );
    }
}

OperatorPackageUploader.defaultProps = {
};

const mapDispatchToProps = dispatch => ({
    ...bindActionCreators(
        {
            setPackageUploads: setPackageUploadsAction
        },
        dispatch
    )
});

const mapStateToProps = (state: StoreState) => ({
    uploads: state.packageEditorState.uploads
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OperatorPackageUploader);
