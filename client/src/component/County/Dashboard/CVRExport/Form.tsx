import * as React from 'react';

import { EditableText, FileInput, FormGroup } from '@blueprintjs/core';


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

const CVRExportForm = (props: FormProps) => {
    const {
        disableReupload,
        fileUploaded,
        fileDeleted,
        form,
        onFileChange,
        onHashChange,
        upload,
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
                <div style={{ width: '600px' }}>
                    <FormGroup label={ <span className='pt-ui-text-large'>CVR Export</span> }>
                        <FileInput fill={ true } text={ fileName } onInputChange={ onFileChange } />
                    </FormGroup>
                    <FormGroup label={ <span className='pt-ui-text-large'>SHA-256 hash for CVR Export</span> }>
                        <EditableText className='pt-input'
                                      minWidth={ 600 }
                                      maxLength={ 64 }
                                      value={ hash }
                                      onChange={ onHashChange } />
                    </FormGroup>
                </div>
            </div>
            { renderedCancelButton }
            <button className='pt-button pt-intent-primary' onClick={ upload }>
                Upload
            </button>
        </div>
    );
};


export default CVRExportForm;
