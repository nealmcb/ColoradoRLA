import * as React from 'react';

import * as _ from 'lodash';

import { Card } from '@blueprintjs/core';

import { Link } from 'react-router-dom';

import { endpoint } from 'corla/config';

import counties from 'corla/data/counties';

import Nav from '../Nav';

interface BreadcrumbProps {
    contest: Contest;
}

const Breadcrumb = ({ contest }: BreadcrumbProps) => (
    <ul className='pt-breadcrumbs'>
        <li>
            <Link to='/sos'>
                <div className='pt-breadcrumb pt-disabled'>
                    SoS
                </div>
            </Link>
        </li>
        <li>
            <Link to='/sos/contest'>
                <div className='pt-breadcrumb'>
                    Contest
                </div>
            </Link>
        </li>
        <li>
            <div className='pt-breadcrumb pt-breadcrumb-current'>
                { contest.name }
            </div>
        </li>
    </ul>
);

interface ChoicesProps {
    contest: Contest;
}

const ContestChoices = (props: ChoicesProps) => {
    const { contest } = props;

    const choiceItems = _.map(contest.choices, (c, k) => (
        <li key={ k }>{ c.name }</li>
    ));

    return (
        <Card>
            <h4>Choices:</h4>
            <ul>{ choiceItems }</ul>
        </Card>
    );
};

interface PageProps {
    contest?: Contest;
}

function activityReportUrl(contestName: string) {
    return endpoint('publish-audit-report')
        + '?contestName=' + encodeURIComponent(contestName)
         + '&reportType=activity'
         + '&contentType=xlsx';
}

const ContestDetailPage = (props: PageProps) => {
    const { contest } = props;

    if (!contest) {
        return <div />;
    }

    const row = (k: string, v: (number | string)) => (
        <tr key={ k } >
            <td><strong>{ k }</strong></td>
            <td>{ v }</td>
        </tr>
    );

    const county = counties[contest.countyId];

    return (
        <div>
            <Nav />
            <Breadcrumb contest={ contest } />
            <Card>
                <h2>Contest Report</h2>
                <p>
                    The contest report is a contest-centric report detailing
                    the ballots that have been audited
                    for <b>{ contest.name }</b>, including the county that
                    audited each ballot.
                </p>
                <a className='pt-button pt-large pt-intent-primary'
                   href={ activityReportUrl(contest.name) }>
                   Download Activity Report
                </a>
            </Card>
            <Card>
                <h2>Contest Data</h2>
                <h3>Contest Data</h3>
                <table className='pt-html-table pt-html-table-bordered pt-small'>
                    <tbody>
                        { row('County', county.name) }
                        { row('Name', contest.name) }
                        { row('Description', contest.description) }
                        { row('Vote For', contest.votesAllowed) }
                        { row('Ballot Manifest', 'Uploaded') }
                        { row('CVR Export', 'Uploaded') }
                    </tbody>
                </table>
            </Card>
            <ContestChoices contest={ contest } />
        </div>
    );
};

export default ContestDetailPage;
