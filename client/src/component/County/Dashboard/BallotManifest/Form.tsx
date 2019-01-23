import * as React from 'react';

import { EditableText } from '@blueprintjs/core';


interface FormProps {
    disableReupload: OnClick;
    fileUploaded: boolean;
    fileDeleted: boolean;
    form: {
        file?: File;
        hash: string;
    };
    onFileChange: OnClick;
    onHashChange: OnClick;
    upload: OnClick;
}

const BallotManifestForm = (props: FormProps) => {
    const {
        disableReupload,
        fileUploaded,
        form,
        onFileChange,
        onHashChange,
        upload,
        fileDeleted,
    } = props;

    const { file, hash } = form;

    const fileName = file ? file.name : '';

    const cancelButton = (
        <button className='pt-button pt-intent-warning' onClick={ disableReupload }>
            Cancel
        </button>
    );

    // fileDeleted allows us to not wait for a dashboard refresh to get the asm
    // state, which is what fileUploaded is based on
    // then, we won't show the cancel button momentarily, which looks weird
    const renderedCancelButton = fileUploaded && !fileDeleted
                               ? cancelButton
                               : '';

    return (
        <div className='pt-card'>
            <div className='pt-card'>
                <div className='pt-ui-text-large'>
                    Ballot Manifest
                </div>
                <label className='pt-file-upload truncate'>
                    <input type='file' onChange={ onFileChange } />
                    <span className='pt-file-upload-input'>{ fileName }</span>
                </label>
            </div>
            <div className='pt-card'>
                <div className='pt-ui-text-large'>
                   SHA-256 hash for Ballot Manifest
                </div>
                <label>
                    <EditableText
                        className='pt-input'
                        minWidth={ 500 }
                        maxLength={ 64 }
                        value={ hash }
                        onChange={ onHashChange } />
                </label>
            </div>
            { renderedCancelButton }
            <button className='pt-button pt-intent-primary' onClick={ upload }>
                Upload
            </button>
        </div>
    );
};


export default BallotManifestForm;
