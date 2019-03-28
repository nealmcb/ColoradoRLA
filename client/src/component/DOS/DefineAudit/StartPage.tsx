import * as React from 'react';

import Nav from '../Nav';

import ElectionDateForm from './ElectionDateForm';
import ElectionTypeForm from './ElectionTypeForm';
import PublicMeetingDateForm from './PublicMeetingDateForm';
import RiskLimitForm from './RiskLimitForm';
import UploadFileButton from './UploadFileButton';

import * as format from 'corla/format';

const Breadcrumb = () => (
    <ul className='pt-breadcrumbs'>
        <li>
            <a className='pt-breadcrumb' href='/sos'>
                SoS
            </a>
        </li>
        <li>
            <a className='pt-breadcrumb pt-breadcrumb-current'>
                Audit Admin
            </a>
        </li>
    </ul>
);

function round(val: number, digits: number) {
    const factor = Math.pow(10, digits);
    return Math.round(val * factor) / factor;
}

interface SaveButtonProps {
    disabled: boolean;
    nextPage: OnClick;
}

const SaveButton = (props: SaveButtonProps) => {
    const { disabled, nextPage } = props;

    const buttonClick = () => {
        nextPage();
    };

    return (
        <button
            disabled={ disabled }
            onClick={ buttonClick }
            className='pt-button pt-intent-primary'>
            Save & Next
        </button>
    );
};

interface PageProps {
    electionDate: Date;
    isFormValid: boolean;
    publicMeetingDate: Date;
    riskLimit: number;
    nextPage: OnClick;
    type: ElectionType;
    setElectionDate: (d: Date) => void;
    setPublicMeetingDate: (d: Date) => void;
    setRiskLimit: (l: number) => void;
    setType: (t: ElectionType) => void;
    setUploadedFiles: (fs: string[]) => void;
}

const AuditPage = (props: PageProps) => {
    const {
        electionDate,
        isFormValid,
        publicMeetingDate,
        riskLimit,
        type,
        nextPage,
        setElectionDate,
        setPublicMeetingDate,
        setRiskLimit,
        setType,
        setUploadedFiles,
    } = props;

    const disableButton = !isFormValid;

    return (
        <div>
            <Nav />
            <Breadcrumb />

            <h2>Administer an Audit</h2>

            <div className='pt-card'>
                <h3>Election Info</h3>
                <div>Enter the date the election will take place, and the type of election.</div>
                <ElectionDateForm onChange={ setElectionDate }
                                  initDate={ electionDate } />
                <ElectionTypeForm onChange={ setType }
                                  initType={ type } />
            </div>

            <div className='pt-card'>
                <h3>Public Meeting Date</h3>
                <div>Enter the date of the public meeting to establish the random seed.</div>
                <PublicMeetingDateForm onChange={ setPublicMeetingDate }
                                       initDate={ publicMeetingDate } />
            </div>

            <div className='pt-card'>
                <h3>Risk Limit</h3>
                <div>
                  <strong>Enter the risk limit for comparison audits as a percentage.</strong>
                </div>
                <RiskLimitForm onChange={ setRiskLimit }
                               riskLimit={ riskLimit } />

            </div>

            <div className='pt-card'>
                <h3>Contests</h3>
                <UploadFileButton onChange={ setUploadedFiles } />
            </div>

            <div className='control-buttons'>
              <SaveButton disabled={ disableButton }
                          nextPage={ nextPage } />
            </div>
        </div>
    );
};

export default AuditPage;
