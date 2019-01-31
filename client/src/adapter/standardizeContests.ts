import * as _ from 'lodash';

export function format(
    formData: DOS.Form.StandardizeContests.FormData,
): JSON.StandardizeContest[] {
    return _.map(formData, (datum, id) => {
        return {
            contest: id,
            name: datum.name,
        };
    });
}
