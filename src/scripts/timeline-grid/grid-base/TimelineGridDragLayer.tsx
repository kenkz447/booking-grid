
import './TimelineGridDragLayer.scss';

import * as React from 'react';
import { DragLayer, XYCoord } from 'react-dnd';

import { TimelineGridCard, TimelineGridCardProps } from './TimelineGridCard';

interface TimelineGridDragLayerProps {
    readonly item?: TimelineGridCardProps;
    readonly isDragging?: boolean;
    readonly initialOffset?: XYCoord;
    readonly currentOffset?: XYCoord;
}

const dragLayer = DragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
}));
    
export const TimelineGridDragLayer = dragLayer(class extends React.Component<TimelineGridDragLayerProps> {
    render() {
        const { item, isDragging } = this.props;

        if (!isDragging) {
            return null;
        }

        return (
            <div className="timeline-grid-drag-layer">
                <div style={this.getItemStyles(this.props)}>
                    <TimelineGridCard
                        left={item.left}
                        width={item.width}
                        height={item.height}
                        appointmentContent={item.appointmentContent}
                    />
                </div>
            </div>
        );
    }

    getItemStyles(props: TimelineGridDragLayerProps) {
        const { initialOffset, currentOffset } = props;

        if (!initialOffset || !currentOffset) {
            return {
                display: 'none'
            };
        }

        const baseTop = document.getElementById('baseGrid');

        // const y = currentOffset.y - 54 - 60 + baseTop.scrollTop;
        const y = currentOffset.y;
        const transform = `translateY(${y}px)`;

        return {
            transform: transform,
            WebkitTransform: transform
        };
    }
});