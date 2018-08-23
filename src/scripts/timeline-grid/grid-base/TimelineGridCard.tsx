import './TimelineGridCard.scss';

import * as classNames from 'classnames';
import { autobind } from 'core-decorators';
import { DragDropMonitor } from 'dnd-core';
import * as React from 'react';
import {
    ConnectDragSource,
    DragSource,
    DragSourceConnector,
    DragSourceSpec
} from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import { AppointmentContent, RowData } from '@/Types';

export interface TimelineGridCardProps {
    readonly label?: string;
    readonly duration?: number;
    readonly fixedPerMinute?: number;
    readonly left?: number;
    readonly height?: number;
    readonly width?: React.CSSProperties['width'];
    readonly style?: React.CSSProperties;
    readonly appointmentContent?: AppointmentContent;
    readonly appointmentContents?: AppointmentContent[];
    readonly rowData?: RowData;
}

interface DropResult {
    readonly target: TimelineGridCardProps;
    readonly canDrop: boolean;
}

const boxSource: DragSourceSpec<TimelineGridCardProps, {}> = {
    beginDrag: (props) => props,
    endDrag(
        props: TimelineGridCardProps,
        monitor: DragDropMonitor,
        // tslint:disable-next-line:no-any
        component: any) {
        // ...
    }
};

function dragCollect(connect: DragSourceConnector, monitor: DragDropMonitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    };
}

interface DropableTimelineGridCardProps extends TimelineGridCardProps {
    readonly connectDragSource?: ConnectDragSource;
    readonly isDragging?: boolean;
    readonly dropResult?: DropResult;
    readonly currentOverAppointmentContent?: AppointmentContent;
    readonly connectDragPreview?: (img: HTMLImageElement) => void;
}

export class TimelineGridCard extends React.Component<DropableTimelineGridCardProps> {
    readonly cardElement: HTMLDivElement;

    componentDidMount() {
        if (this.props.connectDragPreview) {
            const emptyImage = getEmptyImage();
            this.props.connectDragPreview(emptyImage);
        }
    }

    render() {
        const { connectDragSource } = this.props;

        const cardElement = this.renderCard();

        if (connectDragSource) {
            return connectDragSource(cardElement);
        }

        return cardElement;
    }

    @autobind
    renderCard() {
        const { appointmentContent } = this.props;

        if (!appointmentContent) {
            return null;
        }

        const customerName = 'Khách hàng';

        const wrapperStyle = this.getStyle();
        const className = classNames(
            'timeline-grid-card',
            { 'dragging': this.props.isDragging === true }
        );

        return (
            <div
                className={className}
                data-id={appointmentContent.id}
                style={wrapperStyle}
                title={`${appointmentContent.serviceName} - ${appointmentContent.serviceTime}`}
            >
                <div className="timeline-grid-card-content">
                    <label className="timeline-grid-card-content-label">{customerName}</label>
                </div>
            </div>
        );
    }

    getStyle() {
        const cardColor = 'red';

        return {
            left: this.props.left,
            height: this.props.height,
            width: this.props.width,
            background: cardColor
        };
    }
}

export const DragableTimelineGridCard =
    DragSource('grid-row', boxSource, dragCollect)(TimelineGridCard) as typeof TimelineGridCard;