import * as classNames from 'classnames';
import { autobind } from 'core-decorators';
import * as Moment from 'moment';
import { DateRange, extendMoment } from 'moment-range';
import * as React from 'react';
import { DropTarget, DropTargetMonitor } from 'react-dnd';

import { AppointmentContent, RowData, DaytimeInfo } from '@/Types';

import {
    CELL_HEIGHT,
    CELL_WIDTH,
    CELL_WIDTH_HEADER,
    MINUTES_PER_CELL
} from '@/timeline-grid/configs';

import {
    DragableTimelineGridCard,
    TimelineGridCard,
    TimelineGridCardProps
} from '../TimelineGridCard';

import { TimelineGridCell, TimelineGridCellProps } from '../TimelineGridCell';

const moment = extendMoment(Moment);

interface TimelineGridRowProps {
    readonly appmointmentContents?: Array<AppointmentContent>;
    readonly items?: Array<TimelineGridCellProps>;
    readonly className?: string;
    readonly children?: JSX.Element | JSX.Element[];
    readonly dropAble?: boolean;
    readonly rowData?: RowData;
    readonly cellProps?: Array<TimelineGridCellProps>;
    readonly openTime?: DaytimeInfo;
    readonly closeTime?: DaytimeInfo;
}

interface DropAbleTimelineRowProps extends TimelineGridRowProps {
    readonly isOver?: boolean;
    readonly canDrop?: boolean;
    readonly curentItem?: TimelineGridCardProps;
    readonly connectDropTarget?: (element: JSX.Element) => JSX.Element;
}

const boxTarget = {
    drop(
        props: TimelineGridCardProps,
        monitor: DropTargetMonitor,
        component: DropAbleTimelineGridRow
    ) {
        return {
            target: props,
            canDrop: component.canDrop
        };
    }
};

@DropTarget('grid-row', boxTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
    curentItem: monitor.getItem()
}))
export class DropAbleTimelineGridRow extends React.Component<DropAbleTimelineRowProps> {
    // tslint:disable-next-line:readonly-keyword
    canDrop = true;
    // tslint:disable-next-line:readonly-keyword
    selfOver = false;

    getAppointmentContentTimeRange(appmointmentContent: AppointmentContent) {
        const startAppmointmentContent = new Date();
        startAppmointmentContent.setHours(appmointmentContent.appointmentHour);
        startAppmointmentContent.setMinutes(appmointmentContent.appointmentMinute);

        const endAppmointmentContent = new Date(startAppmointmentContent);
        endAppmointmentContent.setMinutes(endAppmointmentContent.getMinutes() + appmointmentContent.serviceTime);

        const range = moment.range(startAppmointmentContent, endAppmointmentContent);

        return range;
    }

    isOverlapsWithOrtherCard(draggingAppoinmentContentTimeRange: DateRange) {
        for (const appmointmentContent of this.props.appmointmentContents) {
            if (
                appmointmentContent.appointmentStatus === 'CHECKOUT' ||
                appmointmentContent.appointmentStatus === 'CANCEL') {
                continue;
            }

            const rowCardRange = this.getAppointmentContentTimeRange(appmointmentContent);

            const isOverlap = draggingAppoinmentContentTimeRange.overlaps(rowCardRange);
            if (isOverlap) {
                return true;
            }
        }

        return false;
    }

    isDragOverWorkingTime(draggingAppoinmentContentTimeRange: DateRange) {
        const { rowData } = this.props;

        const workingTime = moment.range(
            moment(rowData.fromDaytime),
            moment(rowData.toDaytime)
        );

        const draggingItemStart = moment(draggingAppoinmentContentTimeRange.start);
        const draggingItemEnd = moment(draggingAppoinmentContentTimeRange.end);
        if (
            draggingItemStart.within(workingTime) &&
            draggingItemEnd.within(workingTime)
        ) {
            return true;
        }

        if (this.props.rowData.isOT) {
            const OTTimeRange = moment.range(
                moment(rowData.OTStartedDayTime),
                moment(this.props.rowData.OTEndedDayTime)
            );

            if (draggingItemStart.within(OTTimeRange) &&
                draggingItemEnd.within(OTTimeRange)
            ) {
                return true;
            }
        }

        return false;
    }

    componentWillReceiveProps(nextProps: DropAbleTimelineRowProps) {
        if (!nextProps.isOver) {
            return;
        }

        const draggingAppoinmentContent = nextProps.curentItem.appointmentContent;
        const draggingAppoinmentContentTimeRange = this.getAppointmentContentTimeRange(draggingAppoinmentContent);

        this.canDrop = true;
        this.selfOver = false;

        if (this.props.rowData.id === nextProps.curentItem.rowData.id) {
            this.selfOver = true;
            this.canDrop = false;
            return;
        }

        const isDragOverWorkingTime = this.isDragOverWorkingTime(draggingAppoinmentContentTimeRange);
        if (!isDragOverWorkingTime) {
            this.canDrop = false;
            return;
        }

        const isOverlapsWithOrtherCard = this.isOverlapsWithOrtherCard(draggingAppoinmentContentTimeRange);
        if (isOverlapsWithOrtherCard) {
            this.canDrop = false;
            return;
        }

    }

    render() {
        const { connectDropTarget } = this.props;
        const renderedRow = this.renderRow();

        if (connectDropTarget) {
            return connectDropTarget(renderedRow);
        }

        return renderedRow;
    }

    @autobind
    renderRow() {
        return (
            <div
                className={
                    classNames(
                        'timeline-grid-row-dropfield',
                        { 'is-over': this.props.isOver },
                        { 'can-drop': this.canDrop === true },
                        { 'self-over': this.selfOver === true }
                    )
                }
            >
                {this.props.children}
            </div>
        );
    }
}