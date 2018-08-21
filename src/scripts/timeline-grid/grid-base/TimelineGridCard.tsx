import './TimelineGridCard.scss';

import * as classNames from 'classnames';
import { autobind } from 'core-decorators';
import * as React from 'react';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import {
    DbStateEntry,
    getUrlParam,
    getUrlParams,
    redirectToSearchParams,
    SetTempValueBind,
    withTempValues
} from 'scripts/core';
import { ShowNotificationBind } from 'scripts/services/antd-notification';
import { ShowPopupBind } from 'scripts/services/antd-popup';

import { AppointmentContent, AppointmentContentModel } from '@/Types';

import { RowData } from '../TimelineGridBase';

export interface TimelineGridCardProps {
    label?: string;
    duration?: number;
    fixedPerMinute?: number;
    left?: number;
    height?: number;
    width?: number;
    style?: React.CSSProperties;
    appointmentContent?: AppointmentContent;
    appointmentContents?: AppointmentContent[];
    rowData?: RowData;
}

interface DropResult {
    target: TimelineGridCardProps
    canDrop: boolean
}

const boxSource = {
    beginDrag: (props) => props,
    endDrag(props, monitor, component) {
        const dropResult: DropResult = monitor.getDropResult()

        if (!dropResult)
            return

        const { target, canDrop } = dropResult

        if (!canDrop)
            return

        const isDataTypeStaff = target.rowData.dataType === 'staff'

        ShowPopupBind({
            popupType: 'confirm',
            title: 'Cập nhật thông tin?',
            content: isDataTypeStaff ? 'Đổi đổi nhân viên?' : 'thay đổi vị trí?',
            onOk: async function () {
                const newValue: AppointmentContent = {
                    ...props.appointmentContent,
                    facilityName: props.appointmentContent.facility && props.appointmentContent.facility.name,
                    staffName: props.appointmentContent.staff && props.appointmentContent.staff.name
                }

                newValue.appointment = null

                if (isDataTypeStaff) {
                    newValue.staff.id = target.rowData.id
                    newValue.staff.name = target.rowData.name
                } else {
                    newValue.facility.id = target.rowData.id
                    newValue.facility.name = target.rowData.name
                }

                const entry = new DbStateEntry({ modelName: AppointmentContentModel.modelName })

                try {
                    await entry.do({
                        actionName: nameof(AppointmentContentModel.apiSet.update),
                        actionPayload: newValue
                    })
                } catch (result /*FetchResult*/) {
                    ShowNotificationBind({
                        notifyType: 'error',
                        message: 'Cập nhật thất bại',
                        description: result
                    })
                }
            }
        })
    }
}

function dragCollect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
}

interface DropableTimelineGridCardProps extends TimelineGridCardProps {
    connectDragSource?: any
    isDragging?: boolean
    connectDragPreview?(img, option?): void
    dropResult?: DropResult
    currentOverAppointmentContent?: AppointmentContent
}

let mouseOverTimeout
let mouseLeaveTimeout

@withTempValues(nameof<DropableTimelineGridCardProps>(o => o.currentOverAppointmentContent))
export class TimelineGridCard extends React.Component<DropableTimelineGridCardProps> {
    cardElement: HTMLDivElement

    componentDidMount() {
        if (this.props.connectDragPreview)
            this.props.connectDragPreview(getEmptyImage())
    }

    render() {
        const { connectDragSource } = this.props

        const cardElement = this.renderCard()

        if (connectDragSource)
            return connectDragSource(cardElement)

        return cardElement
    }

    @autobind
    renderCard() {
        const { appointmentContent, currentOverAppointmentContent } = this.props

        if (!appointmentContent)
            return null

        const customerName = appointmentContent.appointment.booking ? appointmentContent.appointment.booking.name : appointmentContent.customerName
        const facilityName = appointmentContent.facilityName

        const wrapperStyle = this.getStyle()
        const isDisabled = this.isDisabled()
        const isCardover = this.isAppointmentOver()

        const className = classNames(
            'timeline-grid-card',
            { 'canClick': this.canClick() },
            { 'dragging': this.props.isDragging === true },
            { 'disabled': isDisabled === true || isCardover == false },
            {
                'hide': (isDisabled === true && (+getUrlParams('subBookingId') !== appointmentContent.bookingId) ||
                    (currentOverAppointmentContent && currentOverAppointmentContent.appointment.booking.id !== appointmentContent.appointment.booking.id))
            },
            `status-${appointmentContent.appointment.appointmentStatus}`
        )

        return (
            <div
                className={className}
                onClick={this.onCardClick}
                onMouseEnter={this.onCardMouseEnter}
                onMouseLeave={this.onCardMouseLeave}
                data-id={appointmentContent.id}
                style={wrapperStyle}
                title={`${appointmentContent.serviceName} - ${appointmentContent.serviceTime}`}
            >
                <div className="timeline-grid-card-content">
                    <label className="timeline-grid-card-content-label">{customerName}</label>
                    <span className="timeline-grid-card-content-details">{facilityName}</span>
                </div>
            </div>
        )
    }

    @autobind
    onCardClick(e) {
        if (!this.canClick())
            return

        const currentSearch = new URLSearchParams(location.search)
        currentSearch.set('appointmentId', String(this.props.appointmentContent.appointmentId))
        currentSearch.set('subBookingId', String(this.props.appointmentContent.bookingId))

        redirectToSearchParams(currentSearch)

        // const currentTarget: HTMLDivElement = e.currentTarget
        // setTimeout(() => {
        //     currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center' })
        // }, 1500)
    }

    canClick() {
        return getUrlParam('action') !== 'edit'
    }

    isDisabled() {
        const currentSelectAppointmentId = +getUrlParam('appointmentId')
        return currentSelectAppointmentId ? currentSelectAppointmentId !== this.props.appointmentContent.appointment.id : false
    }

    isAppointmentOver() {
        return (this.props.currentOverAppointmentContent &&
            this.props.currentOverAppointmentContent.appointment.id === this.props.appointmentContent.appointment.id)
    }

    getStyle() {
        const cardColor = this.props.appointmentContent.appointment.appointmentColor

        return {
            left: this.props.left,
            height: this.props.height,
            width: this.props.width,
            background: cardColor
        }
    }

    @autobind
    onCardMouseEnter() {
        if (this.isDisabled())
            return

        if (this.isAppointmentOver())
            clearTimeout(mouseLeaveTimeout)

        if (mouseOverTimeout)
            clearTimeout(mouseOverTimeout)

        const { appointmentContent } = this.props
        mouseOverTimeout = setTimeout(() => {
            SetTempValueBind(nameof<DropableTimelineGridCardProps>(o => o.currentOverAppointmentContent), appointmentContent)
        }, 300)
    }

    @autobind
    onCardMouseLeave() {
        if (mouseLeaveTimeout)
            clearTimeout(mouseLeaveTimeout)

        clearTimeout(mouseOverTimeout)
        mouseLeaveTimeout = setTimeout(() => {
            SetTempValueBind(nameof<DropableTimelineGridCardProps>(o => o.currentOverAppointmentContent), null)
        }, 300)
    }
}

export const DragableTimelineGridCard = DragSource('grid-row', boxSource, dragCollect)(TimelineGridCard)