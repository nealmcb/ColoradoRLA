import * as React from 'react';

import { Button, Intent } from '@blueprintjs/core';

import downloadFile from 'corla/action/downloadFile';

interface UploadedFileProps {
    description: string;
    file: UploadedFile;
}

const UploadedFile = ({ description, file }: UploadedFileProps) => {
    const onClick = () => downloadFile(file.id);

    return (
        <div className='mt-default'>
            <h4>{ description }</h4>
            <div><strong>File name:</strong> "{ file.name }"</div>
            <div><strong>SHA-256 hash:</strong> { file.hash }</div>
            <div className='error'>
                <strong>{file.result.success ? '' : 'Error Message: ' }</strong>
                { file.result.errorMessage }
            </div>
            <div className='error rowNum'>
                <strong>{file.result.success ? '' : 'Error row number: ' }</strong>
                { file.result.errorRowNum }
            </div>
            <div className='error rowContent'>
                <strong>{file.result.success ? '' : 'Error row content: ' }</strong>
                { file.result.errorRowContent }
            </div>
            <Button intent={ Intent.PRIMARY }
                    onClick={ onClick }>
                Download
            </Button>
        </div>
    );
};

interface DownloadButtonsProps {
    status: County.AppState | DOS.CountyStatus;
}

const FileDownloadButtons = (props: DownloadButtonsProps) => {
    const { status } = props;

    if (!status) {
        return <div />;
    }

    const { ballotManifest, cvrExport } = status;

    if (!ballotManifest || !cvrExport) {
        return <div />;
    }

    return (
        <div className='mt-default'>
            <UploadedFile description='Ballot Manifest' file={ ballotManifest } />
            <UploadedFile description='CVR Export' file={ cvrExport } />
        </div>
    );
};

export default FileDownloadButtons;
