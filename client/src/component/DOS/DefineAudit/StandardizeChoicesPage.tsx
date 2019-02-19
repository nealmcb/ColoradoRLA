import * as React from 'react';

import * as _ from 'lodash';

import { MenuItem } from '@blueprintjs/core';
import { Select } from '@blueprintjs/labs';

import Nav from '../Nav';

import counties from 'corla/data/counties';

import { findBestMatch } from 'string-similarity';

/**
 * The maximum percentage match at or above which a contest will be assumed to
 * match a given canonical contest.
 *
 * The algorithm used is not defined, so this may need to change if the
 * algorithm is changed.
 */
const MIN_MATCH_THRESHOLD = 0.67;

/**
 * Returns the default selection for `name` given `canonicalNames` to choose
 * from.
 *
 * The default selection will be the empty string if there was not a better
 * choice in `canonicalNames` for the given choice name.
 */
const defaultCanonicalName = (
    name: string,
    canonicalNames: string[],
): string => {
    const loweredName = name.toLowerCase();
    const loweredCanonicals = _.map(canonicalNames, s => s.toLowerCase());

    const { bestMatch, bestMatchIndex } = findBestMatch(
        loweredName,
        loweredCanonicals,
    );

    if (bestMatch.rating < MIN_MATCH_THRESHOLD) {
        return '';
    }

    return canonicalNames[bestMatchIndex];
};

const Breadcrumb = () => (
    <ul className='pt-breadcrumbs'>
        <li>
            <a className='pt-breadcrumb' href='/sos'>SoS</a>
        </li>
        <li>
            <a className='pt-breadcrumb' href='/sos/audit'>Audit Admin</a>
        </li>
        <li>
            <a className='pt-breadcrumb pt-breadcrumb-current'>Standardize Choice Names</a>
        </li>
    </ul>
);

interface UpdateFormMessage {
    contestId: number;
    currentChoiceName: string;
    newChoiceName: string;
}

interface TableProps {
    contests: DOS.Contests;
    rows: DOS.Form.StandardizeChoices.Row[];
    updateFormData: (msg: UpdateFormMessage) => void;
}

const Table = (props: TableProps) => {
    const { contests, rows, updateFormData } = props;

    return (
        <table className='pt-table pt-striped'>
            <thead>
                <tr>
                    <th>County Name</th>
                    <th>Contest Name</th>
                    <th>Current Choice Name</th>
                    <th>Standardized Choice Name</th>
                </tr>
            </thead>
            <TableBody contests={ contests }
                       rows={ rows }
                       updateFormData={ updateFormData } />
        </table>
    );
};

interface TableBodyProps {
    contests: DOS.Contests;
    rows: DOS.Form.StandardizeChoices.Row[];
    updateFormData: (msg: UpdateFormMessage) => void;
}

const TableBody = (props: TableBodyProps) => {
    const { contests, rows, updateFormData } = props;

    const key = (row: DOS.Form.StandardizeChoices.Row) =>
        row.contestName + ',' + row.choiceName;

    return (
        <tbody>
        {
            _.map(rows, row =>
                <TableRow key={ key(row) }
                          row={ row }
                          updateFormData={ updateFormData} />)
        }
        </tbody>
    );
};

interface TableRowProps {
    row: DOS.Form.StandardizeChoices.Row;
    updateFormData: (msg: UpdateFormMessage) => void;
}

const TableRow = (props: TableRowProps) => {
    const { row, updateFormData } = props;

    const choices = row.choices;

    const defaultName = defaultCanonicalName(row.choiceName, choices);

    // Trigger an update when a default gets chosen
    if ('' !== defaultName) {
        updateFormData({
            contestId: row.contestId,
            currentChoiceName: row.choiceName,
            newChoiceName: defaultName,
        });
    }

    const changeHandler = (e: React.FormEvent<HTMLSelectElement>) => {
        const v = e.currentTarget.value;

        updateFormData({
            contestId: row.contestId,
            currentChoiceName: row.choiceName,
            newChoiceName: v,
        });
    };

    return (
        <tr>
            <td>{ row.countyName }</td>
            <td>{ row.contestName }</td>
            <td>{ row.choiceName }</td>
            <td>
                <form>
                    <select onChange={ changeHandler }
                            defaultValue={ defaultName }>
                        <option key='' value=''>-- No change --</option>
                        {
                          _.map(choices, (choice, idx) => {
                              return <option key={ idx } value={ choice }>{ choice }</option>;
                          })
                        }
                    </select>
                </form>
            </td>
        </tr>
    );
};

interface PageProps {
    areChoicesLoaded: boolean;
    contests: DOS.Contests;
    rows: DOS.Form.StandardizeChoices.Row[];
    forward: (x: DOS.Form.StandardizeChoices.FormData) => void;
    back: () => void;
}

class Page extends React.Component<PageProps> {
    public formData: DOS.Form.StandardizeChoices.FormData = {};

    public constructor(props: PageProps) {
        super(props);

        this.updateFormData = this.updateFormData.bind(this);
    }

    public render() {
        const {
            areChoicesLoaded,
            back,
            contests,
            rows,
            forward,
        } = this.props;

        if (areChoicesLoaded) {
            this.formData = {};

            return (
                <div>
                    <Nav />
                    <Breadcrumb />
                    <h2>Standardize Choice Names</h2>
                    <div className='pt-card'>
                        <p>
                            Choice names for each contest must be standardized
                            to group records correctly across jurisdictions.
                            Below is a list of choice names that do not match
                            the standardized names provided for that particular
                            contest by the state. For each of the choices
                            listed, please choose the appropriate standardized
                            version from the options provided, then save your
                            selections and move forward.
                        </p>

                        <Table contests={ contests }
                               rows={ rows }
                               updateFormData={ this.updateFormData } />
                    </div>
                    <div>
                        <button onClick={ back }
                                className='pt-button pt-breadcrumb'>
                            Back
                        </button>
                        <button onClick={ () => forward(this.formData) }
                                className='pt-button pt-intent-primary pt-breadcrumb'>
                            Save & Next
                        </button>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    <Nav />
                    <Breadcrumb />
                    <h2>Standardize Choice Names</h2>
                    <div className='pt-card'>
                        Waiting for counties to upload choice data.
                    </div>
                    <div>
                        <button onClick={ back }
                                className='pt-button pt-breadcrumb'>
                            Back
                        </button>
                        <button disabled
                                className='pt-button pt-intent-primary pt-breadcrumb'>
                            Save & Next
                        </button>
                    </div>
                </div>
            );
        }
    }

    private updateFormData(msg: UpdateFormMessage) {
        const { contestId, currentChoiceName, newChoiceName } = msg;

        if ('' === newChoiceName) {
            delete this.formData[contestId][currentChoiceName];

            if (_.isEmpty(this.formData[contestId])) {
                delete this.formData[contestId];
            }
        } else {
            _.merge(this.formData, {
                [contestId]: {
                    [currentChoiceName]: newChoiceName,
                },
            });
        }
    }
}

export default Page;
