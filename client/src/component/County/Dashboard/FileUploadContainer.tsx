import * as React from 'react';
import { connect } from 'react-redux';

import { Card, Icon, Intent } from '@blueprintjs/core';

import BallotManifestFormContainer from './BallotManifest/FormContainer';
import CVRExportFormContainer from './CVRExport/FormContainer';

interface MatchStatusProps {
    ballotManifestCount: number;
    cvrExportCount: number;
    uploadedBothFiles: boolean;
}

const MatchStatus = (props: MatchStatusProps) => {
    const { ballotManifestCount, cvrExportCount, uploadedBothFiles } = props;

    if (!uploadedBothFiles) {
        return <div />;
    }

    if (ballotManifestCount === cvrExportCount) {
        return (
            <Card>
                <Icon icon='tick-circle' intent={ Intent.SUCCESS } />
                <span> </span>
                CVR Export and Ballot Manifest record counts <strong>match.</strong>
            </Card>
        );
    } else {
        return (
            <Card>
                <Icon icon='error' intent={ Intent.DANGER } />
                <span> </span>
                CVR Export and Ballot Manifest record counts <strong>do not match.</strong>
                <Card>
                    <div>Ballot Manifest count: { ballotManifestCount }</div>
                    <div>CVR Export count: { cvrExportCount }</div>
                </Card>
            </Card>
        );
    }
};

interface FileUploadFormsProps {
    countyState: County.AppState;
    uploadedBothFiles: boolean;
}

const FileUploadForms = (props: FileUploadFormsProps) => {
    const { countyState, uploadedBothFiles } = props;

    if (!countyState) { return null; }

    const { ballotManifestCount, cvrExportCount } = countyState;

    return (
        <div>
            <MatchStatus ballotManifestCount={ ballotManifestCount! }
                         cvrExportCount={ cvrExportCount! }
                         uploadedBothFiles={ uploadedBothFiles } />
            <BallotManifestFormContainer />
            <CVRExportFormContainer />
        </div>
    );
};

const MissedDeadline = () => {
    return (
        <Card>
            The Risk-Limiting Audit has already begun.
            Please contact the Department of State for assistance.
        </Card>
    );
};

interface FileUploadContainerProps {
    countyState: County.AppState;
    missedDeadline: boolean;
    uploadedBothFiles: boolean;
}

class FileUploadContainer extends React.Component<FileUploadContainerProps> {
    public render() {
        const { countyState, missedDeadline, uploadedBothFiles } = this.props;

        if (missedDeadline) {
            return <MissedDeadline />;
        }

        return (
            <FileUploadForms countyState={ countyState }
                             uploadedBothFiles={ uploadedBothFiles } />
        );
    }
}

function select(countyState: County.AppState) {
    const { asm } = countyState;

    const uploadedBothFiles = !!(countyState.ballotManifestHash
                              && countyState.cvrExportHash);
    const missedDeadline = asm.county === 'DEADLINE_MISSED';

    return { countyState, missedDeadline, uploadedBothFiles };
}

export default connect(select)(FileUploadContainer);
