import * as React from 'react';

import {
    Button,
    Card,
    EditableText,
    FileInput,
    FormGroup,
    Intent,
} from '@blueprintjs/core';

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
        <Button intent={ Intent.WARNING } onClick={ disableReupload }>
            Cancel
        </Button>
    );

    // fileDeleted allows us to not wait for a dashboard refresh to get the asm
    // state, which is what fileUploaded is based on
    // then, we won't show the cancel button momentarily, which looks weird
    const renderedCancelButton = fileUploaded && !fileDeleted
                               ? cancelButton
                               : '';

    return (
        <Card>
            <Card>
                <div style={{ width: '600px' }}>
                    <FormGroup label={ <span className='pt-ui-text-large font-weight-bold'>Ballot Manifest</span> }>
                        <FileInput fill={ true } text={ fileName } onInputChange={ onFileChange } />
                    </FormGroup>
                    <FormGroup label={ <span className='pt-ui-text-large font-weight-bold'>SHA-256 hash for Ballot Manifest</span> }>
                        <EditableText className='pt-input'
                                      minWidth={ 600 }
                                      maxLength={ 64 }
                                      value={ hash }
                                      onChange={ onHashChange } />
                    </FormGroup>
                </div>
            </Card>
            { renderedCancelButton }
            <Button intent={ Intent.PRIMARY } onClick={ upload }>
                Upload
            </Button>
        </Card>
    );
};

export default BallotManifestForm;
