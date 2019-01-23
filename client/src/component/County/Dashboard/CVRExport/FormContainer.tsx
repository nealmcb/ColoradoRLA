import * as React from 'react';
import { connect } from 'react-redux';

import CVRExportForm from './Form';
import Uploading from './Uploading';

import uploadCvrExport from 'corla/action/county/uploadCvrExport';

import deleteFile from 'corla/action/county/deleteFile';
import cvrExportUploadedSelector from 'corla/selector/county/cvrExportUploaded';
import cvrExportUploadingSelector from 'corla/selector/county/cvrExportUploading';


interface UploadedProps {
    enableReupload: OnClick;
    handleDeleteFile: OnClick;
    file: UploadedFile;
}

const UploadedCVRExport = (props: UploadedProps) => {
    const { enableReupload, handleDeleteFile, file } = props;
    return (
        <div className='pt-card'>
            <div><strong>CVR Export</strong></div>
            <div><strong>File name: </strong>"{ file.name }"</div>
            <div><strong>SHA-256 hash: </strong>{ file.hash }</div>
            <button className='pt-button pt-intent-primary' onClick={ enableReupload }>
                Re-upload
            </button>
            <span> &nbsp;&nbsp; </span>
            <button className='pt-button pt-intent-primary' onClick={ handleDeleteFile }>
                Delete File
            </button>

        </div>
    );
};

interface ContainerProps {
    countyState: County.AppState;
    fileUploaded: boolean;
    uploadingFile: boolean;
}

interface ContainerState {
    form: {
        file?: File;
        hash: string;
    };
    fileDeleted: boolean;
    reupload: boolean;
}

class CVRExportFormContainer extends React.Component<ContainerProps, ContainerState> {
    public state: ContainerState = {
        fileDeleted: false,
        form: {
            file: undefined,
            hash: '',
        },
        reupload: false,
    };

    public render() {
        const { countyState, fileUploaded, uploadingFile } = this.props;

        if (uploadingFile) {
            return <Uploading countyState={ countyState } />;
        }

        if (fileUploaded && !this.state.reupload && countyState.cvrExport) {
            return (
                <UploadedCVRExport enableReupload={ this.enableReupload }
                                   handleDeleteFile={ this.handleDeleteFile }
                                   file={ countyState.cvrExport } />
            );
        }

        return (
            <CVRExportForm disableReupload={ this.disableReupload }
                           fileUploaded={ fileUploaded }
                           fileDeleted={ this.state.fileDeleted }
                           form={ this.state.form }
                           onFileChange={ this.onFileChange }
                           onHashChange={ this.onHashChange }
                           upload={ this.upload } />
        );
    }

    private disableReupload = () => {
        this.setState({ reupload: false });
    }

    private enableReupload = () => {
        this.setState({ reupload: true });
    }

    private onFileChange = (e: React.ChangeEvent<any>) => {
        const s = { ...this.state };

        s.form.file = e.target.files[0];

        this.setState(s);
    }

    private onHashChange = (hash: string) => {
        const s = { ...this.state };

        s.form.hash = hash;

        this.setState(s);
    }

    private handleDeleteFile = () => {
        const result = deleteFile('cvr');

        if (result) {
            // clear form
            const s = { ...this.state };
            s.form.hash = '';
            s.form.file = undefined;
            s.fileDeleted = true; // don't show the cancel button momentarily
            this.setState(s);
        }


    }

    private upload = () => {
        const { countyState } = this.props;
        const { file, hash } = this.state.form;

        if (file) {
            uploadCvrExport(countyState.id!, file!, hash);

            this.disableReupload();
        }
    }
}

const select = (countyState: County.AppState) => {
    const uploadingFile = cvrExportUploadingSelector(countyState);

    return {
        countyState,
        fileUploaded: cvrExportUploadedSelector(countyState),
        uploadingFile,
    };
};


export default connect(select)(CVRExportFormContainer);
