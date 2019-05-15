import * as React from 'react';

import { Button, Intent } from '@blueprintjs/core';

import downloadFile from 'corla/action/downloadFile';

interface UploadedFileProps {
    description: string;
    file: UploadedFile | undefined | null;
}

const UploadedFile = ({ description, file }: UploadedFileProps) => {

    if (null === file || undefined === file) {
        return (
            <div className='pt-card'>
                <h4>{ description }</h4>
                <p>Not yet uploaded</p>
            </div>
        );
    } else {

        const onClick = () => downloadFile(file.id);
        return (
            <div className='pt-card'>
                <h4>{ description }</h4>
                <div><strong>File name:</strong> "{ file.fileName }"</div>
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
    }
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

    return (
        <div className='mt-default'>
            <UploadedFile description='Ballot Manifest' file={ ballotManifest } />
            <UploadedFile description='CVR Export' file={ cvrExport } />
        </div>
    );
};

export default FileDownloadButtons;
