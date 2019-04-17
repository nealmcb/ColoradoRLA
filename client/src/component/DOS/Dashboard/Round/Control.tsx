import * as React from 'react';

import { Card } from '@blueprintjs/core';

import startNextRound from 'corla/action/dos/startNextRound';

interface  ControlProps {
    canStartNextRound: boolean;
    currentRound: number;
}

const Control = (props: ControlProps) => {
    const { canStartNextRound, currentRound } = props;

    const buttonDisabled = !canStartNextRound;

    return (
        <Card>
            <h4>Start next round</h4>
            <Card>
                Round { currentRound } completed.
            </Card>
            <Card>
                <div>
                    Start Round { currentRound + 1 }?
                </div>
                <div>
                    <button
                        className='pt-button pt-intent-primary'
                        disabled={ buttonDisabled }
                        onClick={ startNextRound }>
                        Start Round
                    </button>
                </div>
            </Card>
        </Card>
    );
};

export default Control;
