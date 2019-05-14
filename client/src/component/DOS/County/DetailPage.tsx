import * as React from 'react';
import { Link } from 'react-router-dom';

import * as _ from 'lodash';

import { Breadcrumb } from '@blueprintjs/core';

import DOSLayout from 'corla/component/DOSLayout';
import FileDownloadButtons from 'corla/component/FileDownloadButtons';
import { formatCountyASMState } from 'corla/format';

interface BreadcrumbProps {
    county: CountyInfo;
}

const Breadcrumbs = ({ county }: BreadcrumbProps) => (
    <ul className='pt-breadcrumbs'>
        <li><Breadcrumb text='SoS' href='/sos' /></li>
        <li><Breadcrumb text='County' href='/sos/county' /></li>
        <li><Breadcrumb className='pt-breadcrumb-current' text={ county.name } /></li>
    </ul>
);

function formatMember(member: AuditBoardMember): string {
    const { firstName, lastName, party } = member;

    return `${firstName} ${lastName} (${party})`;
}

interface AuditBoardProps {
    auditBoard: AuditBoardStatus;
}

const AuditBoard = (props: AuditBoardProps) => {
    const { auditBoard } = props;

    return (
        <div className='mt-default'>
            <h3>Audit Board</h3>
            <table className='pt-html-table pt-html-table-striped rla-table'>
                <tbody>
                    <tr>
                        <td><strong>Board Member #1:</strong></td>
                        <td>{ formatMember(auditBoard.members[0]) }</td>
                    </tr>
                    <tr>
                        <td><strong>Board Member #2:</strong></td>
                        <td>{ formatMember(auditBoard.members[1]) }</td>
                    </tr>
                    <tr>
                        <td><strong>Sign-in Time:</strong></td>
                        <td>{ `${auditBoard.signIn}` }</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const NoAuditBoard = () => {
    return (
        <div className='mt-default'>
            <h3>Audit Board</h3>
            <p>Audit Board not signed in.</p>
        </div>
    );
};

interface DetailsProps {
    county: CountyInfo;
    status: DOS.CountyStatus;
}

const CountyDetails = (props: DetailsProps) => {
    const { county, status } = props;
    const { auditBoard } = status;

    const countyState = formatCountyASMState(status.asmState);
    const submitted = status.auditedBallotCount;

    const auditedCount = _.get(status, 'discrepancyCount.audited') || '—';
    const unauditedCount = _.get(status, 'discrepancyCount.unaudited') || '—';


    const auditBoardSection = auditBoard
                            ? <AuditBoard auditBoard={ auditBoard } />
                            : <NoAuditBoard />;

    return (
        <div>
            <table className='pt-html-table pt-html-table-striped rla-table'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Audited discrepancies</th>
                        <th>Non-audited discrepancies</th>
                        <th>Submitted</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='ellipsize'>{ county.name }</td>
                        <td className='ellipsize'>{ countyState }</td>
                        <td>{ auditedCount }</td>
                        <td>{ unauditedCount }</td>
                        <td>{ submitted }</td>
                    </tr>
                </tbody>
            </table>
            <FileDownloadButtons status={ status } />
            { auditBoardSection }
        </div>
    );
};

interface PageProps {
    county: CountyInfo;
    status: DOS.CountyStatus;
}

const CountyDetailPage = (props: PageProps) => {
    const { county, status } = props;

    const main =
        <div>
            <Breadcrumbs county={ county } />
            <h3 className='mt-default'>{ county.name } County Info</h3>
            <CountyDetails county={ county } status={ status } />
        </div>;

    return <DOSLayout main={ main } />;
};

export default CountyDetailPage;
