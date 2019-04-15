import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import withDOSState from 'corla/component/withDOSState';
import withSync from 'corla/component/withSync';

import ContestDetailPage from './DetailPage';

interface MatchParams {
    /* it looks like RouteComponentProps forces this type */
    contestId: string | undefined;
}

interface OwnProps extends RouteComponentProps<MatchParams> {}

function mapStateToProps(state: DOS.AppState, ownProps: OwnProps) {
    const { contests } = state;
    const { contestId } = ownProps.match.params;
    let contest;

    if (contestId) {
        contest = contests[parseInt(contestId, 10)];
    } else {
        return {};
    }

    if (!contest) {
        return {};
    }

    return { contest };
}

export default withSync(
    withDOSState(ContestDetailPage),
    'DOS_CONTEST_DETAIL_SYNC',
    mapStateToProps,
);
