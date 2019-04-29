import * as React from 'react';

import { Breadcrumb, Card } from '@blueprintjs/core';

import DOSLayout from 'corla/component/DOSLayout';

import SeedForm from './SeedForm';

const Breadcrumbs = () => (
    <ul className='pt-breadcrumbs'>
        <li><Breadcrumb href='/sos' text='SoS' />></li>
        <li><Breadcrumb href='/sos/audit' text='Audit Admin' /></li>
        <li><Breadcrumb className='pt-breadcrumb-current' text='Seed' /></li>
    </ul>
);

interface PageProps {
    back: OnClick;
    nextPage: OnClick;
    formattedPublicMeetingDate: string;
    seed: string;
    uploadRandomSeed: OnClick;
}

class AuditSeedPage extends React.Component<PageProps> {
    public state: any;

    constructor(props: PageProps) {
        super(props);

        this.state = {
            form: { seed: props.seed },
            formValid: false,
        };
    }

    public setValid(valid: boolean)  {
        this.setState({ formValid: valid });
    }

    public render() {
        const main =
            <div>
                <Breadcrumbs />
                <Card>
                    <h3>Audit Definition - Enter Random Seed</h3>
                    <Card>
                        Enter the random seed generated from the public meeting
                        on { this.props.formattedPublicMeetingDate }.
                    </Card>
                    <Card>
                        <SeedForm initSeed={ this.state.form.seed }
                                  updateForm={ (seed: string) => { this.state.form.seed = seed; } }
                                  setValid={ (v: boolean) => { this.setValid(v); } } />
                    </Card>
                </Card>
                <div>
                    <button className='pt-button pt-breadcrumb'
                            onClick={ this.props.back }>
                        Back
                    </button>
                    <button className='pt-button pt-intent-primary pt-breadcrumb'
                            disabled={!this.state.formValid}
                            onClick={ this.onSaveAndNext }>
                        Save & Next
                    </button>
                </div>
            </div>;

        return <DOSLayout main={ main } />;
    }

    private onSaveAndNext = () => {
        this.props.uploadRandomSeed(this.state.form.seed);
        this.props.nextPage();
    }
}

export default AuditSeedPage;
