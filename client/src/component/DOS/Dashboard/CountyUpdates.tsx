import * as React from 'react';

import * as _ from 'lodash';

import { EditableText, Icon, Tooltip } from '@blueprintjs/core';

import counties from 'corla/data/counties';

import { formatCountyAndBoardASMState } from 'corla/format';

import { naturalSortBy } from 'corla/util';

const RemainingInRoundHeader = () => {
    const content =
        'Number of ballots remaining to audit in the current round.';

    return (
        <Tooltip
            className='pt-tooltip-indicator'
            content={ content }>
            <div>
                <span>Remaining in Round</span>
                <span> </span>
                <Icon icon='help' />
            </div>
        </Tooltip>
    );
};

type SortKey = 'name'
             | 'status'
             | 'submitted'
             | 'auditedDisc'
             | 'oppDisc'
             | 'disagreements'
             | 'remRound'
             | 'remTotal';

type SortOrder = 'asc' | 'desc';

interface RowData {
    id: number;
    name: string;
    status: string;
    submitted: number | string;
    auditedDisc: number | string;
    oppDisc: number | string;
    disagreements: number | string;
    remRound: number | string;
    remTotal: number | string;
}

interface UpdatesProps {
    auditStarted: boolean;
    countyStatus: DOS.CountyStatuses;
}

interface UpdatesState {
    filter: string;
    order: SortOrder;
    sort: SortKey;
}

class CountyUpdates extends React.Component<UpdatesProps, UpdatesState> {
    public state: UpdatesState = {
        filter: '',
        order: 'asc',
        sort: 'name',
    };

    public render() {
        const { auditStarted, countyStatus } = this.props;

        const countyData: RowData[] = _.map(countyStatus, (c): RowData => {
            const county = counties[c.id];
            const missedDeadline = c.asmState === 'DEADLINE_MISSED';
            const status = formatCountyAndBoardASMState(c.asmState, c.auditBoardASMState);

            if (!auditStarted || (auditStarted && missedDeadline)) {
                return {
                    auditedDisc: '—',
                    disagreements: '—',
                    id: c.id,
                    name: county.name,
                    oppDisc: '—',
                    remRound: '—',
                    remTotal: '—',
                    status,
                    submitted: '—',
                };
            }

            const auditedDiscrepancyCount = c.discrepancyCount
                                          ? c.discrepancyCount.audited || 0
                                          : 0;
            const unauditedDiscrepancyCount = c.discrepancyCount
                                            ? c.discrepancyCount.unaudited || 0
                                            : 0;
            const disagreementCount = c.disagreementCount || 0;

            return {
                auditedDisc: auditedDiscrepancyCount,
                disagreements: disagreementCount,
                id: c.id,
                name: county.name,
                oppDisc: unauditedDiscrepancyCount,
                remRound: c.ballotsRemainingInRound,
                remTotal: Math.max(0, c.estimatedBallotsToAudit),
                status,
                submitted: c.auditedBallotCount || 0,
            };
        });

        const selector = (row: RowData) => {
            const countyName = row.name;
            const sortVal = row[this.state.sort];

            if (sortVal === '—') {
                // There are numeric and non-numeric columns. If the audit has not
                // started, all numeric columns will have the value '—', so it doesn't
                // matter what the _sort_ value is. If the audit has started, some
                // counties will have missed the file upload deadline. Their numeric
                // columns will display '—', but participating counties will have numeric
                // values. What we would like is for non-participating counties to appear
                // _after_ participating counties when sorting by a numeric column from
                // greatest to least. By treating '—' as -Infinity for sort purposes,
                // we guarantee it will be smaller than any participant numeric value.
                return [-Infinity, countyName];
            } else {
                return [sortVal, countyName];
            }
        };

        const sortedCountyData = naturalSortBy(countyData, selector);

        if (this.state.order === 'desc') {
            _.reverse(sortedCountyData);
        }

        const filterName = (row: RowData) => {
            const name = row.name.toLowerCase();
            const s = this.state.filter.toLowerCase();

            return name.includes(s);
        };
        const filteredCountyData = _.filter(sortedCountyData, filterName);

        const countyStatusRows = _.map(filteredCountyData, (row: RowData) => {
            return (
                <tr key={ row.id }>
                    <td>{ row.name }</td>
                    <td>{ row.status }</td>
                    <td>{ row.submitted }</td>
                    <td>{ row.auditedDisc }</td>
                    <td>{ row.oppDisc }</td>
                    <td>{ row.disagreements }</td>
                    <td>{ row.remRound }</td>
                </tr>
            );
        });

        return (
            <div className='pt-card'>
                <h3>County Updates</h3>
                <div className='pt-card'>
                    <strong>Filter by County Name:</strong>
                    <span> </span>
                    <EditableText
                        className='pt-input'
                        minWidth={ 200 }
                        value={ this.state.filter }
                        onChange={ this.onFilterChange } />
                </div>
                <div className='pt-card' >
                    <strong>Click on a column name to sort by that column's data.
                    To reverse sort, click on the column name again.</strong>
                </div>
                <div className='pt-card'>
                    <table className='pt-html-table pt-html-table-bordered pt-small'>
                        <thead>
                            <tr>
                                <th onClick={ this.sortBy('name') }>
                                    Name
                                    <span> </span>
                                    { this.sortIconForCol('name') }
                                </th>
                                <th onClick={ this.sortBy('status') }>
                                    Status
                                    <span> </span>
                                    { this.sortIconForCol('status') }
                                </th>
                                <th onClick={ this.sortBy('submitted') }>
                                    Submitted
                                    <span> </span>
                                    { this.sortIconForCol('submitted') }
                                </th>
                                <th onClick={ this.sortBy('auditedDisc') }>
                                    Audited Contest Discrepancies
                                    <span> </span>
                                    { this.sortIconForCol('auditedDisc') }
                                </th>
                                <th onClick={ this.sortBy('oppDisc') }>
                                    Non-audited Contest Discrepancies
                                    <span> </span>
                                    { this.sortIconForCol('oppDisc') }
                                </th>
                                <th onClick={ this.sortBy('disagreements') }>
                                    Disagreements
                                    <span> </span>
                                    { this.sortIconForCol('disagreements') }
                                </th>
                                <th onClick={ this.sortBy('remRound') }>
                                    <RemainingInRoundHeader />
                                    <span> </span>
                                    { this.sortIconForCol('remRound') }
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            { ...countyStatusRows }
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
             ? <Icon icon='sort-asc' />
             : <Icon icon='sort-desc' />;
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
        this.setState({order: this.state.order === 'asc' ? 'desc' : 'asc'});
    }
}


export default CountyUpdates;
