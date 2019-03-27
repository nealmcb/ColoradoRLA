import * as React from 'react';

import * as moment from 'moment';

import { DateInput, IDateFormatProps } from '@blueprintjs/datetime';

function momentFormatter(format: string): IDateFormatProps {
    return {
        formatDate: date => {
            if (date) {
                return moment.utc(date).format(format);
            } else {
                return moment.utc().format(format);
            }
        },
        parseDate: str => moment(str).toDate(),
        placeholder: format,
    };
}

interface FormProps {
    forms: DOS.Form.AuditDef.Forms;
    initDate: Date;
}

interface FormState {
    date: string;
}

class ElectionDateForm extends React.Component<FormProps, FormState> {
    constructor(props: FormProps) {
        super(props);

        this.state = {
            date: moment.utc(props.initDate).format('YYYY-MM-DD'),
        };
    }

    public render() {
        return (
            <div className='pt-card'>
                <div>Election Date</div>
                <DateInput { ...momentFormatter('YYYY-MM-DD') }
                           onChange={ this.onDateChange }
                           value={ moment.utc(this.state.date).toDate() } />
            </div>
        );
    }

    private onDateChange = (selectedDate: Date) => {
        const isoString = moment.utc(selectedDate).format('YYYY-MM-DD');

        this.setState({
            date: isoString,
        });

        this.props.forms.electionDateForm = this.state;
    }
}

export default ElectionDateForm;
