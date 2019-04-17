import * as React from 'react';

import { Button, Card, Intent } from '@blueprintjs/core';

import RoundContainer from './RoundContainer';

import fetchReport from 'corla/action/dos/fetchReport';

import { endpoint } from 'corla/config';

interface RiskLimitInfoProps {
    riskLimit: number;
}

const RiskLimitInfo = ({ riskLimit }: RiskLimitInfoProps) => {
    return (
        <Card>
            <strong>Target Risk Limit: </strong> { riskLimit * 100 } %
        </Card>
    );
};

interface SeedInfoProps {
    seed: string;
}

const SeedInfo = ({ seed }: SeedInfoProps) => {
    return (
        <Card>
            <strong>Seed: </strong> { seed }
        </Card>
    );
};

interface DefinitionProps {
    dosState: DOS.AppState;
}

const Definition = ({ dosState }: DefinitionProps) => {
    // We assume this component is only rendered if the audit is defined.
    // If the audit is defined, then we have a `seed`. The compiler can't infer this
    // yet, so we assert it for now.
    return (
        <div>
            <RiskLimitInfo riskLimit={ dosState.riskLimit! } />
            <SeedInfo seed={ dosState.seed! } />
        </div>
    );
};

const NotDefined = () => {
    return (
        <div><h3>The audit has not yet been defined.</h3></div>
    );
};


interface MainProps {
    auditDefined: boolean;
    canRenderReport: boolean;
    dosState: DOS.AppState;
}

const Main = (props: MainProps) => {
    const { auditDefined, canRenderReport, dosState } = props;

    const auditDefinition = auditDefined
                          ? <Definition dosState={ dosState } />
                          : <NotDefined />;

    if (!dosState.asm) {
        return null;
    }

    if (dosState.asm === 'DOS_AUDIT_COMPLETE') {
        return (
            <Card className='sos-notifications'>
                { auditDefinition }
                <Card>
                    <div className='pt-ui-text-large font-weight-bold'>Congratulations! The audit is complete.</div>
                </Card>
                <Card>
                    <div className='pt-ui-text-large font-weight-bold'>Download final audit report.</div>
                    <Button intent={ Intent.PRIMARY }
                            onClick={ fetchReport }>
                        Audit Report
                    </Button>
                </Card>
            </Card>
        );
    }

    return (
        <Card className='sos-notifications'>
            { auditDefinition }
            <RoundContainer />
            <Card>
                <div className='pt-ui-text-large font-weight-bold'>Download intermediate reports</div>
                <Button intent={ Intent.PRIMARY }
                        disabled={ !canRenderReport }
                        onClick={ fetchReport }>
                    Audit Report
                </Button>
            </Card>
        </Card>
    );
};


export default Main;
