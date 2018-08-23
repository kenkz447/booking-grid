import './TimelineGridRow.scss';

import * as classNames from 'classnames';
import { autobind } from 'core-decorators';
import * as React from 'react';

import { AppointmentContent, RowData, DaytimeInfo } from '@/Types';

import {
    CELL_HEIGHT,
    CELL_WIDTH,
    CELL_WIDTH_HEADER,
    MINUTES_PER_CELL
} from '../configs';

import {
    DragableTimelineGridCard,
    TimelineGridCard
} from './TimelineGridCard';

import { TimelineGridCell, TimelineGridCellProps } from './TimelineGridCell';
import { DropAbleTimelineGridRow } from './timeline-grid-row';

interface TimelineGridRowProps {
    readonly appmointmentContents?: Array<AppointmentContent>;
    readonly items?: Array<TimelineGridCellProps>;
    readonly className?: string;
    // tslint:disable-next-line:no-any
    readonly children?: any;
    readonly dropAble?: boolean;
    readonly rowData?: RowData;
    readonly cellProps?: Array<TimelineGridCellProps>;
    readonly openTime?: DaytimeInfo;
    readonly closeTime?: DaytimeInfo;
}

export class TimelineGridRow extends React.Component<TimelineGridRowProps> {
    static readonly defaultProps: TimelineGridRowProps = {
        items: [],
        cellProps: [],
        appmointmentContents: []
    };

    // tslint:disable-next-line:readonly-keyword
    row: HTMLDivElement;
    readonly cells: Array<TimelineGridCell> = [];

    render() {
        return (
            <div
                ref={(element) => this.row = element}
                className={classNames('timeline-grid-row', this.props.className)}
                style={{ height: CELL_HEIGHT }}
            >
                {this.props.children}
                {
                    this.props.dropAble &&
                    <DropAbleTimelineGridRow
                        rowData={this.props.rowData}
                        appmointmentContents={this.props.appmointmentContents}
                    >
                        {this.props.appmointmentContents.map(this.renderGridCard)}
                    </DropAbleTimelineGridRow>
                }
            </div>
        );
    }

    @autobind
    renderGridCard(appointmentContent: AppointmentContent) {
        const fixedPerMinute = (CELL_WIDTH / MINUTES_PER_CELL);
        const minuteOfCurrentHours = (appointmentContent.appointmentHour - this.props.openTime.hours) * 60;
        const startMinutes =
            minuteOfCurrentHours + appointmentContent.appointmentMinute;

        const left = (startMinutes * fixedPerMinute) + CELL_WIDTH_HEADER;

        const height = CELL_HEIGHT - 2;
        const width = (appointmentContent.serviceTime * fixedPerMinute) || 'auto';

        if (appointmentContent.appointmentStatus !== 'CHECKOUT') {
            return (
                <DragableTimelineGridCard
                    key={appointmentContent.id}
                    left={left}
                    height={height}
                    width={width}
                    fixedPerMinute={fixedPerMinute}
                    duration={appointmentContent.serviceTime}
                    label={appointmentContent.serviceName}
                    appointmentContent={appointmentContent}
                    rowData={this.props.rowData}
                />
            );
        }

        return (
            <TimelineGridCard
                key={appointmentContent.id}
                left={left}
                height={height}
                width={width}
                fixedPerMinute={fixedPerMinute}
                duration={appointmentContent.serviceTime}
                label={appointmentContent.serviceName}
                appointmentContent={appointmentContent}
                rowData={this.props.rowData}
            />
        );
    }

    setOffsetTop(top: number) {
        this.row.style.top = `${top}px`;
    }
}