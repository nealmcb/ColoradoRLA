import * as React from 'react';

import * as _ from 'lodash';

import { Tooltip } from '@blueprintjs/core';

import DOSLayout from 'corla/component/DOSLayout';

import ContestUpdates from './ContestUpdates';
import CountyUpdates from './CountyUpdates';
import MainContainer from './MainContainer';

interface PageProps {
    auditStarted: boolean;
    contests: DOS.Contests;
    countyStatus: DOS.CountyStatuses;
    dosState: DOS.AppState;
    seed: string;
}

const DOSDashboardPage = (props: PageProps) => {
    const { auditStarted, contests, countyStatus, dosState, seed } = props;

    const main =
        <div className='sos-home'>
            <MainContainer />
            <div className='sos-info'>
                <CountyUpdates auditStarted={ auditStarted }
                               countyStatus={ countyStatus } />
                <ContestUpdates contests={ contests }
                                seed={ seed }
                                dosState={ dosState } />
            </div>
        </div>;

    return <DOSLayout main={ main } />;
};

export default DOSDashboardPage;
