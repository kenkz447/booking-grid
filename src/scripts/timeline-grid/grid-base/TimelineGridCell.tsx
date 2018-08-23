import './TimelineGridCell.scss';

import * as classNames from 'classnames';
import * as React from 'react';

import { CELL_HEIGHT, CELL_WIDTH } from '../configs';

export interface TimelineGridCellProps {
    readonly width?: number;
    readonly height?: number;
    readonly className?: string;
    readonly from?: Date;
    readonly to?: Date;
    readonly isValid?: boolean;
    readonly isOT?: boolean;
}

export class TimelineGridCell extends
    React.Component<TimelineGridCellProps> {
    static readonly defaultProps: TimelineGridCellProps = {
        width: CELL_WIDTH,
        height: CELL_HEIGHT
    };

    // tslint:disable-next-line:readonly-keyword
    cellNode: HTMLDivElement;

    render() {
        const className = classNames(
            'timeline-grid-cell',
            this.props.className,
            this.props.from !== undefined && `minute-${this.props.from.getMinutes()}`,
            { disabled: this.props.isValid === false },
            { OT: this.props.isOT === true }
        );

        return (
            <div
                className={className}
                ref={(element) => this.cellNode = element}
                style={{ height: this.props.height, width: this.props.width }}
            >
                {this.props.children}
            </div>
        );
    }

    setOffsetLeft(left: number) {
        if (!this.cellNode) {
            return;
        }

        this.cellNode.style.left = `${left}px`;
    }
}