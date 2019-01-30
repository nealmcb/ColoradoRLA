import * as React from 'react';

import * as _ from 'lodash';

import { EditableText, Tooltip } from '@blueprintjs/core';

import setHandCount from 'corla/action/dos/setHandCount';

import counties from 'corla/data/counties';

import { naturalSortBy } from 'corla/util';


const RemainingToAuditHeader = () => {
    const content =
        'Estimated number of ballots to audit to meet risk limit.';

    return (
        <Tooltip
            className='pt-tooltip-indicator'
            content={ content }>
            <div>
                <span>Remaining to Audit </span>
                <span className='pt-icon-standard pt-icon-help' />
            </div>
        </Tooltip>
    );
};

interface ButtonProps {
    contest: Contest;
}

const HandCountButton = (props: ButtonProps) => {
    const { contest } = props;

    const onClick = () => {
        const msg = `You have selected "${contest.name}" to hand count - are you sure you want to proceed? This action cannot be undone if you choose to hand count "${contest.name}."`;

        if (confirm(msg)) {
            setHandCount(contest.id);
        }
    };

    return (
        <button className='pt-button pt-intent-primary' onClick={ onClick }>
            <span className='pt-icon pt-icon-hand-up' />
        </button>
    );
};

type SortKey = 'name'
             | 'discrepancyCount'
             | 'estimatedBallotsToAudit';

type SortOrder = 'asc' | 'desc';

interface RowData {
    name: string;
    discrepancyCount: number;
    estimatedBallotsToAudit: number;
    contest: Contest;
}

interface UpdatesProps {
    contests: DOS.Contests;
    seed: string;
    dosState: DOS.AppState;
}

interface UpdatesState {
    filter: string;
    order: SortOrder;
    sort: SortKey;
}

class ContestUpdates extends React.Component<UpdatesProps, UpdatesState> {
    public constructor(props: UpdatesProps) {
        super(props);

        this.state = {
            filter: '',
            order: 'asc',
            sort: 'name',
        };
    }

    public render() {
        const { contests, dosState, seed } = this.props;

        const selectedContests: DOS.Contests =
            _.values(_.pick(contests, _.keys(dosState.auditedContests)));

        const rowData: RowData[] = _.map(selectedContests, (c): RowData => {
            const discrepancyCount: number = _.sum(_.values(dosState.discrepancyCounts![c.id]));
            const estimatedBallotsToAudit = dosState.estimatedBallotsToAudit![c.id];

            return {
                contest: c,
                discrepancyCount,
                estimatedBallotsToAudit,
                name: c.name,
            };
        });

        const selector = (row: RowData) => row[this.state.sort];

        const sortedData = naturalSortBy(rowData, selector);

        if (this.state.order === 'desc') {
            _.reverse(sortedData);
        }

        const filterName = (row: RowData) => {
            const contestName = row.name.toLowerCase();
            const s = this.state.filter.toLowerCase();

            return contestName.includes(s);
        };

        const filteredData = _.filter(sortedData, filterName);

        const contestStatuses = _.map(filteredData, row => {
            const {
                name,
                discrepancyCount,
                estimatedBallotsToAudit,
                contest,
            } = row;

            return (
                <tr key={ contest.id }>
                    <td>
                        <HandCountButton contest={ contest } />
                    </td>
                    <td>{ name }</td>
                    <td>{ discrepancyCount }</td>
                    <td>{ estimatedBallotsToAudit }</td>
                </tr>
            );
        });

        return (
            <div className='pt-card'>
                <h3>Contest Updates</h3>
                <div className='pt-card'>
                    <strong>Filter by County or Contest Name:</strong>
                    <span> </span>
                    <EditableText
                        className='pt-input'
                        minWidth={ 200 }
                        value={ this.state.filter }
                        onChange={ this.onFilterChange } />
                </div>
                <div className='pt-card'>
                    <table className='pt-table'>
                        <thead>
                            <tr>
                                <th>Hand Count</th>
                                <th onClick={ this.sortBy('name') }>
                                    Name
                                    <span> </span>
                                    { this.sortIconForCol('name') }
                                </th>
                                <th onClick={ this.sortBy('discrepancyCount') }>
                                    Discrepancies
                                    <span> </span>
                                    { this.sortIconForCol('discrepancyCount') }
                                </th>
                                <th onClick={ this.sortBy('estimatedBallotsToAudit') }>
                                    Est. Ballots to Audit
                                    <span> </span>
                                   { this.sortIconForCol('estimatedBallotsToAudit') }
                                </th>

                            </tr>
                        </thead>
                        <tbody>
                            { ...contestStatuses }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    private sortIconForCol = (col: string) => {
        if (col !== this.state.sort) {
            return null;
        }

        return this.state.order === 'asc'
             ? <span className='pt-icon-standard pt-icon-sort-asc' />
             : <span className='pt-icon-standard pt-icon-sort-desc' />;
    }

    private onFilterChange = (filter: string) => {
        this.setState({ filter });
    }

    private sortBy(sort: SortKey) {
        return () => {
            if (this.state.sort === sort) {
                this.reverseOrder();
            } else {
                const order = 'asc';
                this.setState({ sort, order });
            }
        };
    }

    private reverseOrder() {
        this.setState({ order: this.state.order === 'asc' ? 'desc' : 'asc' });
    }
}


export default ContestUpdates;
