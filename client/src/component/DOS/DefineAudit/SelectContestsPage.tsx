import * as React from 'react';

import * as _ from 'lodash';

import { Button, Card, Intent } from '@blueprintjs/core';

import Nav from '../Nav';

import SelectContestsForm from './SelectContestsForm';


const Breadcrumb = () => (
    <ul className='pt-breadcrumbs'>
        <li>
            <a className='pt-breadcrumb' href='/sos'>
                SoS
            </a>
        </li>
        <li>
            <a className='pt-breadcrumb' href='/sos/audit'>
                Audit Admin
            </a>
        </li>
        <li>
            <a className='pt-breadcrumb pt-breadcrumb-current'>
                Select Contests
            </a>
        </li>
    </ul>
);

interface WaitingPageProps {
    back: OnClick;
}

const WaitingForContestsPage = ({ back }: WaitingPageProps) => {
    return (
        <div>
            <Nav />
            <Breadcrumb />
            <Card>
                Waiting for counties to upload contest data.
            </Card>
            <Button onClick={ back }
                    className='pt-breadcrumb'>
                Back
            </Button>
            <Button disabled
                    intent={ Intent.PRIMARY }
                    className='pt-breadcrumb'>
                Save & Next
            </Button>
        </div>
    );
};

interface PageProps {
    auditedContests: DOS.AuditedContests;
    back: OnClick;
    contests: DOS.Contests;
    isAuditable: OnClick;
    nextPage: OnClick;
    selectContestsForAudit: OnClick;
}

const SelectContestsPage = (props: PageProps) => {
    const {
        auditedContests,
        back,
        contests,
        isAuditable,
        nextPage,
        selectContestsForAudit,
    } = props;

    if (_.isEmpty(contests)) {
        return <WaitingForContestsPage back={ back } />;
    }

    const forms: DOS.Form.SelectContests.Ref = {};

    const haveSelectedContests = !_.isEmpty(auditedContests);

    const onSaveAndNext = () => {
        selectContestsForAudit(forms.selectContestsForm);
        nextPage();
    };

    return (
        <div>
            <Nav />
            <Breadcrumb />
            <SelectContestsForm forms={ forms }
                                contests={ contests }
                                auditedContests={auditedContests}
                                isAuditable={ isAuditable } />

            <Button onClick={ back }
                    className='pt-breadcrumb'>
                Back
            </Button>
            <Button onClick={ onSaveAndNext }
                    intent={ Intent.PRIMARY }
                    className='pt-breadcrumb'>
                Save & Next
            </Button>
        </div>
    );
};


export default SelectContestsPage;
