import './TimelineGridRowHeader.scss';

import * as moment from 'moment';
import * as React from 'react';

import { CELL_WIDTH, CELL_WIDTH_HEADER } from '../configs';
import { TimelineGridCell } from './TimelineGridCell';
import { TimelineGridRow } from './TimelineGridRow';

interface TimelineGridRowHeaderProps {
    readonly date?: Date;
    readonly spaBranchOpenHour: number;
    readonly spaBranchOpenMinute: number;
    readonly spaBranchCloseTimeHour: number;
    readonly spaBranchCloseTimeMinute: number;
    readonly minutesPerCell: number;
}

export class TimelineGridRowHeader extends React.Component<TimelineGridRowHeaderProps> {
    // tslint:disable-next-line:readonly-keyword
    refRow: TimelineGridRow;
    // tslint:disable-next-line:readonly-keyword
    refRowHeaderCell: TimelineGridCell;

    render() {
        const {
            date,
            spaBranchOpenHour,
            spaBranchOpenMinute,
            spaBranchCloseTimeHour,
            spaBranchCloseTimeMinute,
            minutesPerCell,
        } = this.props;

        const startTimeMinutes = (spaBranchOpenHour * 60 + spaBranchOpenMinute);
        const endTimeMinutes = (spaBranchCloseTimeHour * 60 + spaBranchCloseTimeMinute);
        const spaBranchTotalOpenMinutes = endTimeMinutes - startTimeMinutes;

        const minutePerHeaderCell = (minutesPerCell * 4);
        const cellCounts = spaBranchTotalOpenMinutes / minutePerHeaderCell;
        const cellWidth = CELL_WIDTH * 4;

        let fromDateStr = date && date.toDateString();
        if (!fromDateStr) {
            fromDateStr = new Date().toDateString();
        }

        const cellElements = [];
        for (let index = 0; index < cellCounts; index++) {
            const cellStartTime = new Date(fromDateStr);
            cellStartTime.setHours(spaBranchOpenHour);
            cellStartTime.setMinutes(index * minutePerHeaderCell + spaBranchOpenMinute, 1);

            const cellStartTimeMoment = moment(cellStartTime);
            const cellLabel = cellStartTimeMoment.format('HH:mm');
            cellElements.push(
                <TimelineGridCell
                    key={index}
                    width={cellWidth + 3}
                >
                    {cellLabel}
                </TimelineGridCell>
            );
        }

        return (
            <TimelineGridRow
                className="timeline-grid-row-header"
                ref={element => this.refRow = element}
            >
                <TimelineGridCell
                    width={CELL_WIDTH_HEADER}
                    ref={element => this.refRowHeaderCell = element}
                />
                {cellElements}
            </TimelineGridRow>
        );
    }
}