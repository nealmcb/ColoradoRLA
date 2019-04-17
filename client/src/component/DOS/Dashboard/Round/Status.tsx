import * as React from 'react';

import { Card } from '@blueprintjs/core';

interface StatusProps {
    currentRound: number;
    finishedCountiesCount: number;
    totalCountiesCount: number;
}

const Status = (props: StatusProps) => {
    const { currentRound, finishedCountiesCount, totalCountiesCount } = props;

    return (
        <Card>
            <h4>Round status</h4>
            <div>
                Round { currentRound } in progress.
            </div>
            <div>
                { finishedCountiesCount } of { totalCountiesCount } Counties
                have finished this round.
            </div>
        </Card>
    );
};

export default Status;
