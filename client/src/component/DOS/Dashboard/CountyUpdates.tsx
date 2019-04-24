import * as React from 'react';
import { Link } from 'react-router-dom';

import * as _ from 'lodash';

import { Icon, InputGroup } from '@blueprintjs/core';

import counties from 'corla/data/counties';

import {
    formatCountyAndBoardASMState,
    formatCountyAndBoardASMStateIndicator,
} from 'corla/format';

import { naturalSortBy } from 'corla/util';

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
    statusIndicator: string;
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

const linkToCountyDetail = (row: RowData) => {
    return (
        <Link to={ `/sos/county/${row.id}` }>{ row.name }</Link>
    );
};

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
            const statusIndicator = formatCountyAndBoardASMStateIndicator(c.asmState, c.auditBoardASMState);

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
                    statusIndicator: '',
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
                statusIndicator,
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
                    <td className={ this.sortClassForCol('name')  + ' ellipsize' }>{ linkToCountyDetail(row) }</td>
                    <td className={ this.sortClassForCol('status') + ' ellipsize' }>
                        <div className='status-indicator-group'>
                            { row.statusIndicator && <span className={ `status-indicator ${row.statusIndicator}` } /> }
                            <span className='status-indicator-text'>{ row.status }</span>
                        </div>
                    </td>
                    <td className={ this.sortClassForCol('auditedDisc') }>{ row.auditedDisc }</td>
                    <td className={ this.sortClassForCol('oppDisc') }>{ row.oppDisc }</td>
                    <td className={ this.sortClassForCol('disagreements') }>{ row.disagreements }</td>
                    <td className={ this.sortClassForCol('submitted') }>{ row.submitted }</td>
                    <td className={ this.sortClassForCol('remRound') }>{ row.remRound }</td>
                </tr>
            );
        });

        return (
            <div>
                <div className='state-dashboard-updates-preface'>
                    <div className='state-dashboard-updates-preface-description'>
                        <h3>County Updates</h3>
                        <p>
                            Click on a column name to sort by that column’s data. To
                            reverse sort, click on the column name again.
                        </p>
                    </div>
                    <div className='state-dashboard-updates-preface-search'>
                        <InputGroup leftIcon='search'
                                    type='search'
                                    placeholder='Filter by county name'
                                    value={ this.state.filter }
                                    onChange={ this.onFilterChange } />
                    </div>
                </div>
                <table className='pt-html-table pt-html-table-striped rla-table mt-default'>
                    <thead>
                        <tr>
                            <th className={ this.sortClassForCol('name') }
                                onClick={ this.sortBy('name') }>
                                County Name
                                { this.sortIconForCol('name') }
                            </th>
                            <th className={ this.sortClassForCol('status') }
                                onClick={ this.sortBy('status') }
                                style={ { width: '25%' } }>
                                Status
                                { this.sortIconForCol('status') }
                            </th>
                            <th className={ this.sortClassForCol('auditedDisc') }
                                onClick={ this.sortBy('auditedDisc') }>
                                Audited Discrepancies
                                { this.sortIconForCol('auditedDisc') }
                            </th>
                            <th className={ this.sortClassForCol('oppDisc') }
                                onClick={ this.sortBy('oppDisc') }>
                                Non-audited Discrepancies
                                { this.sortIconForCol('oppDisc') }
                            </th>
                            <th className={ this.sortClassForCol('disagreements') }
                                onClick={ this.sortBy('disagreements') }>
                                Disagreements
                                { this.sortIconForCol('disagreements') }
                            </th>
                            <th className={ this.sortClassForCol('submitted') }
                                onClick={ this.sortBy('submitted') }>
                                Submitted
                                { this.sortIconForCol('submitted') }
                            </th>
                            <th className={ this.sortClassForCol('remRound') }
                                onClick={ this.sortBy('remRound') }>
                                Remaining in Round
                                { this.sortIconForCol('remRound') }
                            </th>
                        </tr>
                    </thead>
                    <tbody>{ ...countyStatusRows }</tbody>
                </table>
            </div>
        );
    }

    private sortClassForCol = (col: string) => {
        return col === this.state.sort ? 'is-sorted' : '';
    }

    private sortIconForCol = (col: string) => {
        if (col !== this.state.sort) {
            return null;
        }

        return this.state.order === 'asc'
             ? <Icon icon='symbol-triangle-down' />
             : <Icon icon='symbol-triangle-up' />;
    }

    private onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ filter: e.target.value });
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
