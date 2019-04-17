import * as React from 'react';

import { Button, Card, Intent } from '@blueprintjs/core';

import downloadFile from 'corla/action/downloadFile';

interface UploadedFileProps {
    description: string;
    file: UploadedFile;
}

const UploadedFile = ({ description, file }: UploadedFileProps) => {
    const onClick = () => downloadFile(file.id);

    return (
        <Card>
            <h4>{ description }</h4>
            <div><strong>File name:</strong> "{ file.name }"</div>
            <div><strong>SHA-256 hash:</strong> { file.hash }</div>
            <Button intent={ Intent.PRIMARY }
                    onClick={ onClick }>
                Download
            </Button>
        </Card>
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
        <Card>
            <UploadedFile description='Ballot Manifest' file={ ballotManifest } />
            <UploadedFile description='CVR Export' file={ cvrExport } />
        </Card>
    );
};

export default FileDownloadButtons;
