import './TimelineGridRowHeader.scss';

import * as moment from 'moment';
import * as React from 'react';
import { AppNavLink, createSearchParams, getUrlParam } from 'scripts/core';

import { Button, Popover, Text } from '@/ui-elements';

import { CELL_WIDTH, CELL_WIDTH_HEADER, MINUTES_PER_CELL } from '../configs';
import { TimelineGridCell } from './TimelineGridCell';
import { TimelineGridRow } from './TimelineGridRow';


interface TimelineGridRowHeaderProps {
    date?: Date
    spaBranchOpenHour: number
    spaBranchOpenMinute: number
    spaBranchCloseTimeHour: number
    spaBranchCloseTimeMinute: number
    dataType: string
}

export class TimelineGridRowHeader extends React.Component<TimelineGridRowHeaderProps> {
    refRow: TimelineGridRow
    refRowHeaderCell: TimelineGridCell
    render() {
        const { date, spaBranchOpenHour, spaBranchOpenMinute, spaBranchCloseTimeHour, spaBranchCloseTimeMinute, dataType } = this.props

        const startTimeMinutes = (spaBranchOpenHour * 60 + spaBranchOpenMinute)
        const endTimeMinutes = (spaBranchCloseTimeHour * 60 + spaBranchCloseTimeMinute)
        const spaBranchTotalOpenMinutes = endTimeMinutes - startTimeMinutes

        const minutePerHeaderCell = (MINUTES_PER_CELL * 4)
        const cellCounts = spaBranchTotalOpenMinutes / minutePerHeaderCell
        const cellWidth = CELL_WIDTH * 4

        let fromDateStr = date ? date.toDateString() : getUrlParam('from')
        if (!fromDateStr)
            fromDateStr = new Date().toDateString()

        const cellElements = []
        for (let index = 0; index < cellCounts; index++) {
            const cellStartTime = new Date(fromDateStr)
            cellStartTime.setHours(spaBranchOpenHour)
            cellStartTime.setMinutes(index * minutePerHeaderCell + spaBranchOpenMinute, 1)

            const cellStartTimeMoment = moment(cellStartTime)
            const cellLabel = cellStartTimeMoment.format('HH:mm')
            cellElements.push(<TimelineGridCell key={index} width={cellWidth}>{cellLabel}</TimelineGridCell>)
        }

        const sortByNameSearchParams = createSearchParams({ sortBy: 'name' }, location.search)
        const sortByWorkingSchedulerSearchParams = createSearchParams({ sortBy: 'working-scheduler' }, location.search)

        return (
            <TimelineGridRow className="timeline-grid-row-header" ref={element => this.refRow = element}>
                <TimelineGridCell width={CELL_WIDTH_HEADER} ref={element => this.refRowHeaderCell = element}>
                    <Text>{dataType === 'staff' ? 'Nhân viên' : 'Vị trí'}</Text>
                    {
                        dataType === 'staff' && (
                            <Popover
                                placement="bottom"
                                content={(
                                    <ul className="timeline-grid-row-header-sort-list">
                                        <li className="timeline-grid-row-header-sort-list-item">
                                            <AppNavLink to={`?${sortByWorkingSchedulerSearchParams.toString()}`}>Sắp xếp theo ca</AppNavLink>
                                        </li>
                                        <li className="timeline-grid-row-header-sort-list-item">
                                            <AppNavLink to={`?${sortByNameSearchParams.toString()}`}>Sắp xếp theo tên</AppNavLink>
                                        </li>
                                    </ul>
                                )}>
                                <Button className="float-right mr-2" icon="fa-sort" circle />
                            </Popover>
                        )
                    }
                </TimelineGridCell>
                {cellElements}
            </TimelineGridRow>
        )
    }
}