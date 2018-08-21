import './TimelineGridLineOfTime.scss'

import * as React from 'react'
import * as moment from 'moment'
import { autobind } from 'core-decorators'
import { CELL_WIDTH, MINUTES_PER_CELL, CELL_WIDTH_HEADER } from '../configs'

interface TimelineGridLineOfTimeProps {
    spaBranchOpenHours: number
    spaBranchOpenMinutes: number
}

const baseTop = 0

export class TimelineGridLineOfTime extends React.Component<TimelineGridLineOfTimeProps> {
    state = {
        currentTime: '',
        offsetLeft: 0,
        offsetTop: baseTop,
    }

    lineOfTime: HTMLDivElement
    changeTimeLinePositionInterval
    componentDidMount() {
        // Initial change position
        this.changeTimeLinePosition()
        this.changeTimeLinePositionInterval = setInterval(this.changeTimeLinePosition, 60000)

        this.scrollintoview()
    }

    componentWillUnmount() {
        clearInterval(this.changeTimeLinePositionInterval)
    }

    render() {
        return (
            <div
                ref={(element) => this.lineOfTime = element}
                className="timeline-grid-line-of-time"
                style={{ left: this.state.offsetLeft, top: this.state.offsetTop }}
                data-time={this.state.currentTime}
            />
        )
    }

    @autobind
    scrollintoview(callback?) {
        setTimeout(() => {
            this.lineOfTime &&
                this.lineOfTime.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'center' })
        }, 500)
    }

    @autobind
    changeTimeLinePosition() {
        const fixedPerMinute = (CELL_WIDTH / MINUTES_PER_CELL)

        const currentDateTime = new Date()
        const currentHours = currentDateTime.getHours()
        const currenMinutes = currentDateTime.getMinutes()

        if (currentHours < this.props.spaBranchOpenHours)
            return

        const recentMinute = (currentHours * 60 + currenMinutes) - (this.props.spaBranchOpenHours * 60 + this.props.spaBranchOpenMinutes)
        const left = recentMinute * fixedPerMinute + CELL_WIDTH_HEADER

        this.setOffSetLeft(left)
    }

    setOffSetLeft(left) {
        const currentDateTime = new Date()
        const currentDateTimeMoment = moment(currentDateTime)
        this.setState({
            currentTime: currentDateTimeMoment.format('HH:mm'),
            offsetLeft: left
        })
    }

    setOffSetTop(top) {
        this.setState({
            offsetTop: top + baseTop
        })
    }
}