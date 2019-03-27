import * as moment from 'moment';

export function format(dob: Date): string {
    return moment.utc(dob).format('M/D/YYYY');
}

export function parse(ds: string): Date {
    return moment.utc(ds).toDate();
}

export default { format, parse };
