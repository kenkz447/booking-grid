import './TimelineGridRow.scss';

import * as classNames from 'classnames';
import { autobind } from 'core-decorators';
import * as Moment from 'moment';
import { DateRange, extendMoment } from 'moment-range';
import * as React from 'react';
import { DropTarget } from 'react-dnd';

import { AppointmentContent } from '@/Types';

import {
    CELL_HEIGHT,
    CELL_WIDTH,
    CELL_WIDTH_HEADER,
    MINUTES_PER_CELL
} from '../configs';
import { RowData } from '../TimelineGridBase';
import {
    DragableTimelineGridCard,
    TimelineGridCard,
    TimelineGridCardProps
} from './TimelineGridCard';
import { TimelineGridCell, TimelineGridCellProps } from './TimelineGridCell';

const moment = extendMoment(Moment)

interface TimelineGridRowProps {
    appmointmentContents?: Array<AppointmentContent>
    items?: Array<TimelineGridCellProps>
    className?: string
    children?: any
    dropAble?: boolean
    rowData?: RowData
    cellProps?: Array<TimelineGridCellProps>
    openTime?: {
        hours?: number
        minutes?: number
    },
    closeTime?: {
        hours?: number
        minutes?: number
    }
}

interface DropAbleTimelineRowProps extends TimelineGridRowProps {
    connectDropTarget?(element: JSX.Element): JSX.Element
    isOver?: boolean
    canDrop?: boolean
    curentItem?: TimelineGridCardProps
}

const boxTarget = {
    drop(props: TimelineGridCardProps, monitor, component: DropAbleTimelineGridRow) {
        return {
            target: props,
            canDrop: component.canDrop
        }
    }
}

@DropTarget('grid-row', boxTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
    curentItem: monitor.getItem()
}))
class DropAbleTimelineGridRow extends React.Component<DropAbleTimelineRowProps> {
    canDrop = true
    selfOver = false

    getAppointmentContentTimeRange(appmointmentContent) {
        const startAppmointmentContent = new Date()
        startAppmointmentContent.setHours(appmointmentContent.appointmentHour)
        startAppmointmentContent.setMinutes(appmointmentContent.appointmentMinute)

        const endAppmointmentContent = new Date(startAppmointmentContent)
        endAppmointmentContent.setMinutes(endAppmointmentContent.getMinutes() + appmointmentContent.serviceTime)

        const range = moment.range(startAppmointmentContent, endAppmointmentContent)

        return range
    }

    isOverlapsWithOrtherCard(draggingAppoinmentContentTimeRange: DateRange) {
        for (const appmointmentContent of this.props.appmointmentContents) {
            const appointmentStatus = appmointmentContent.appointment.appointmentStatus
            if (appointmentStatus === 'CHECKOUT' || appointmentStatus === 'CANCEL')
                continue

            const rowCardRange = this.getAppointmentContentTimeRange(appmointmentContent)

            const isOverlap = draggingAppoinmentContentTimeRange.overlaps(rowCardRange)
            if (isOverlap)
                return true
        }

        return false
    }

    isDragOverWorkingTime(draggingAppoinmentContentTimeRange: DateRange) {
        const workingTime = moment.range(this.props.rowData.fromDaytime, this.props.rowData.toDaytime)
        if (moment(draggingAppoinmentContentTimeRange.start).within(workingTime) &&
            moment(draggingAppoinmentContentTimeRange.end).within(workingTime)
        )
            return true

        if (this.props.rowData.isOT) {
            const OTTimeRange = moment.range(this.props.rowData.OTStartedDayTime, this.props.rowData.OTEndedDayTime)
            if (moment(draggingAppoinmentContentTimeRange.start).within(OTTimeRange) &&
                moment(draggingAppoinmentContentTimeRange.end).within(OTTimeRange)
            )
                return true
        }

        return false
    }

    componentWillReceiveProps(nextProps: DropAbleTimelineRowProps) {
        if (!nextProps.isOver)
            return

        const draggingAppoinmentContent = nextProps.curentItem.appointmentContent
        const draggingAppoinmentContentTimeRange = this.getAppointmentContentTimeRange(draggingAppoinmentContent)
        this.canDrop = true
        this.selfOver = false

        if (this.props.rowData.id === nextProps.curentItem.rowData.id) {
            this.selfOver = true
            this.canDrop = false
            return
        }

        const isDragOverWorkingTime = this.isDragOverWorkingTime(draggingAppoinmentContentTimeRange)
        if (!isDragOverWorkingTime) {
            this.canDrop = false
            return
        }

        const isOverlapsWithOrtherCard = this.isOverlapsWithOrtherCard(draggingAppoinmentContentTimeRange)
        if (isOverlapsWithOrtherCard) {
            this.canDrop = false
            return
        }

    }

    render() {
        const { connectDropTarget } = this.props
        if (connectDropTarget)
            return connectDropTarget(this.renderRow())

        return this.renderRow()
    }

    @autobind
    renderRow() {
        return (
            <div className={classNames('timeline-grid-row-dropfield',
                { 'is-over': this.props.isOver },
                { 'can-drop': this.canDrop == true },
                { 'self-over': this.selfOver == true }
            )}
            >
                {this.props.children}
            </div>
        )
    }
}

export class TimelineGridRow extends React.Component<TimelineGridRowProps> {
    static defaultProps: TimelineGridRowProps = {
        items: [],
        cellProps: [],
        appmointmentContents: []
    }
    row: HTMLDivElement
    cells: Array<TimelineGridCell> = []

    render() {
        return (
            <div ref={(element) => this.row = element}
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
        )
    }

    @autobind
    renderGridCard(appointmentContent: AppointmentContent) {
        const fixedPerMinute = (CELL_WIDTH / MINUTES_PER_CELL)

        const startMinutes = ((appointmentContent.appointmentHour - this.props.openTime.hours) * 60) + appointmentContent.appointmentMinute

        const left = (startMinutes * fixedPerMinute) + CELL_WIDTH_HEADER

        const height = CELL_HEIGHT - 2
        const width = (appointmentContent.serviceTime * fixedPerMinute) || 'auto'

        if (appointmentContent.appointmentState !== 'CHECKOUT')
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
            )

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
        )
    }

    setOffsetTop(top: number) {
        this.row.style.top = `${top}px`
    }
}