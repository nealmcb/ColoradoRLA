import * as React from 'react';

import { Button, Callout, Intent, Popover } from '@blueprintjs/core';

import downloadFile from 'corla/action/downloadFile';

interface UploadedFileProps {
    description: string;
    file: UploadedFile | undefined | null;
}

const UploadedFile = ({ description, file }: UploadedFileProps) => {
    if (null === file || undefined === file) {
        return (
            <div className='uploaded-file mt-default'>
                <h4>{ description }</h4>
                <p>Not yet uploaded</p>
            </div>
        );
    } else {

        const onClick = () => downloadFile(file.id);
        return (
            <div className='uploaded-file mt-default'>
                <h4>{ description }</h4>
                <dl className='uploaded-file-details'>
                    <dt>File name</dt>
                    <dd>{ file.fileName }</dd>

                    <dt>SHA-256 hash</dt>
                    <dd>{ file.hash }</dd>
                </dl>
                <Callout className='uploaded-file-footer'>
                    { file.result.success ?
                        <Callout className='uploaded-file-footer-status'
                                 intent={ Intent.SUCCESS }
                                 icon='tick-circle'>
                            File successfully uploaded
                        </Callout> :
                        <Callout className='uploaded-file-footer-status'
                                 intent={ Intent.DANGER }
                                 icon='error'>
                            <p>
                                <strong>Error: </strong>
                                { file.result.errorMessage ? file.result.errorMessage : 'unknown' }
                                { file.result.errorRowNum &&
                                    <Popover className='uploaded-file-popover-target'
                                             popoverClassName='uploaded-file-popover'>
                                        <span>at row { file.result.errorRowNum }</span>
                                        <div>
                                            <h4>Row { file.result.errorRowNum }</h4>
                                            <p>The content of row { file.result.errorRowNum } is displayed below:</p>
                                            <pre>{ file.result.errorRowContent }</pre>
                                        </div>
                                    </Popover>
                                }
                            </p>
                        </Callout>
                    }
                    <div className='uploaded-file-footer-action'>
                        <Button disabled={ !file.result.success }
                                intent={ Intent.PRIMARY }
                                onClick={ onClick }>
                            Download
                        </Button>
                    </div>
                </Callout>
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
