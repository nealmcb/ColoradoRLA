import * as React from 'react';
import { Link } from 'react-router-dom';

import { History } from 'history';

import LicenseFooter from 'corla/component/LicenseFooter';

import CountyNav from '../Nav';

import Main from './Main';

interface PageProps {
    auditComplete: boolean;
    auditStarted: boolean;
    canAudit: boolean;
    canRenderReport: boolean;
    canSignIn: boolean;
    countyInfo: CountyInfo;
    countyState: County.AppState;
    currentRoundNumber: number;
    history: History;
}

const CountyDashboardPage = (props: PageProps) => {
    const {
        auditComplete,
        auditStarted,
        canAudit,
        canRenderReport,
        canSignIn,
        countyInfo,
        countyState,
        currentRoundNumber,
        history,
    } = props;

    const auditBoardButtonDisabled = !canSignIn;

    return (
        <div>
            <div className='county-root'>
                <CountyNav />
                <div>
                    <Main auditComplete={ auditComplete }
                          auditStarted={ auditStarted }
                          canRenderReport={ canRenderReport }
                          countyState={ countyState }
                          currentRoundNumber={ currentRoundNumber }
                          history={ history }
                          name={ countyInfo.name }
                          auditBoardButtonDisabled={ auditBoardButtonDisabled } />
                </div>
            </div>
            <LicenseFooter />
        </div>
    );
};

export default CountyDashboardPage;
