import './TimelineGridBase.scss';

import { autobind } from 'core-decorators';
import * as React from 'react';

import { Appointment, AppointmentContent, DaytimeInfo, RowData } from '@/Types';
import { Layout } from '@/ui-elements';

import { MINUTES_PER_CELL } from './configs';
import {
    TimelineGridCell,
    TimelineGridCellProps,
    TimelineGridDragLayer,
    TimelineGridLineOfTime,
    TimelineGridRowHeader
} from './grid-base';

export interface TimeLineGridBaseProps {
    readonly rowsData: Array<RowData>;
    readonly selectors: Array<{ readonly id?: number, readonly name?: string }>;
    readonly appointments: Array<Appointment>;
    readonly minutePerCell: number;
    readonly openTime: DaytimeInfo;
    readonly closeTime: DaytimeInfo;
}

export class TimelineGridBase extends React.Component<TimeLineGridBaseProps> {
    static readonly defaultProps: Partial<TimeLineGridBaseProps> = {
        selectors: [],
        rowsData: [],
        appointments: [],
        openTime: {
            hours: 6,
            minutes: 0
        },
        closeTime: {
            hours: 23,
            minutes: 59
        }
    };

    // tslint:disable-next-line:readonly-keyword
    timeRow?: TimelineGridRowHeader = null;
    // tslint:disable-next-line:readonly-keyword
    rowHeaders?: Array<TimelineGridCell> = [];
    // tslint:disable-next-line:readonly-keyword
    areaContainer?: HTMLDivElement;
    // tslint:disable-next-line:readonly-keyword
    gridWrapper: HTMLDivElement = null;
    // tslint:disable-next-line:readonly-keyword
    lineOfTime: TimelineGridLineOfTime = null;
    // tslint:disable-next-line:readonly-keyword
    isMouseDrag = false;
    // tslint:disable-next-line:readonly-keyword
    containerScrollLeft = 0;
    // tslint:disable-next-line:readonly-keyword
    containerOffsetX = 0;

    getAppointmentContent() {
        let appointmentContents: Array<AppointmentContent> = [];

        for (const appointment of this.props.appointments) {
            appointmentContents = appointmentContents.concat(appointment.appointmentContents);
        }

        return appointmentContents;
    }

    @autobind
    // tslint:disable-next-line:typedef
    GridBase(props) {
        return (
            <Layout>
                <div
                    id="baseGrid"
                    className="timeline-grid"
                    ref={element => this.gridWrapper = element}
                    onMouseDown={this.onMouseDown}
                    onMouseUp={this.onMouseUp}
                    onMouseMove={this.onMouseMove}
                    onScroll={this.onGridScroll}
                >
                    <TimelineGridLineOfTime
                        ref={element => this.lineOfTime = element}
                        spaBranchOpenHours={this.props.openTime.hours}
                        spaBranchOpenMinutes={this.props.openTime.minutes}
                    />
                    {props.children}
                    <TimelineGridDragLayer />
                </div>
            </Layout>
        );
    }

    @autobind
    onGridScroll(e: React.UIEvent<HTMLDivElement>) {
        const wrapperElement = e.currentTarget as HTMLDivElement;
        const offsetLeft = wrapperElement.scrollLeft;
        const offsetTop = wrapperElement.scrollTop;

        for (const rowHeader of this.rowHeaders) {
            rowHeader.setOffsetLeft(offsetLeft);
        }
 
        this.timeRow.refRowHeaderCell.setOffsetLeft(offsetLeft);
        this.timeRow.refRow.setOffsetTop(offsetTop);
        this.lineOfTime.setOffSetTop(offsetTop);

        if (this.areaContainer) {
            this.areaContainer.style.left = `${offsetLeft}px`;
        }
    }

    @autobind
    mapElementToRowHeaders(element: TimelineGridCell) {
        if (!element) {
            return;
        }

        this.rowHeaders.push(element);
    }

    getCellOfTime(date?: Date) {
        const startTimeMinute = (this.props.openTime.hours * 60 + this.props.openTime.minutes);
        const endTimeMinute = (this.props.closeTime.hours * 60 + this.props.closeTime.minutes);
        const spaBranchTotalOpenTimeInMinutes = endTimeMinute - startTimeMinute;
        const totalCell = spaBranchTotalOpenTimeInMinutes / MINUTES_PER_CELL;
        const cellProps: Array<TimelineGridCellProps> = [];

        const currentSearchParams = new URLSearchParams(location.search);
        let fromDateStr = date ? date.toDateString() : currentSearchParams.get('from');
        if (!fromDateStr) {
            fromDateStr = new Date().toDateString();
        }

        for (let i = 0; i < totalCell; i++) {
            const cellStartTime = new Date(fromDateStr);
            cellStartTime.setHours(this.props.openTime.hours);
            cellStartTime.setMinutes(i * MINUTES_PER_CELL, 1);

            const cellEndTime = new Date(cellStartTime);
            cellEndTime.setMinutes(cellStartTime.getMinutes() + MINUTES_PER_CELL, 0);

            cellProps.push({
                from: cellStartTime,
                to: cellEndTime
            });
        }

        return cellProps;
    }

    @autobind
    onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
        const target = e.target as HTMLDivElement;
        for (const classNameIndex in target.classList) {
            if (target.classList.hasOwnProperty(classNameIndex)) {
                const className = target.classList[classNameIndex];
                if (typeof className === 'string' && className.startsWith('timeline-grid-card')) {
                    return;
                }
            }
        }

        e.preventDefault();
        this.isMouseDrag = true;
        this.containerOffsetX = e.pageX;
        this.containerScrollLeft = this.gridWrapper.scrollLeft;
    }

    @autobind
    onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (this.isMouseDrag) {
            const newX = e.pageX;
            this.gridWrapper.scrollLeft = this.containerScrollLeft - newX + this.containerOffsetX;
        }
    }

    @autobind
    onMouseUp(e: React.MouseEvent<HTMLDivElement>) {
        this.isMouseDrag = false;
    }
}