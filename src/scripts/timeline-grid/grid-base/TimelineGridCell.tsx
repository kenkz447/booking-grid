import './TimelineGridCell.scss'
import * as React from 'react'

import { CELL_HEIGHT, CELL_WIDTH } from '../configs'
import * as classNames from 'classnames'

export interface TimelineGridCellProps {
    width?: number
    height?: number
    className?: string
    from?: Date
    to?: Date
    isValid?: boolean
    isOT?: boolean
}

export class TimelineGridCell extends React.Component<TimelineGridCellProps> {
    cellNode: HTMLDivElement
    static defaultProps: TimelineGridCellProps = {
        width: CELL_WIDTH,
        height: CELL_HEIGHT
    }

    render() {
        const className = classNames(
            'timeline-grid-cell',
            this.props.className,
            this.props.from != undefined && `minute-${this.props.from.getMinutes()}`,
            { disabled: this.props.isValid === false },
            { OT: this.props.isOT === true}
        )

        return (
            <div className={className}
                ref={(element) => this.cellNode = element}
                style={{ height: this.props.height, width: this.props.width }}
            >
                {this.props.children}
            </div>
        )
    }

    setOffsetLeft(left: number) {
        if (!this.cellNode)
            return    
        this.cellNode.style.left = `${left}px`
    }
}