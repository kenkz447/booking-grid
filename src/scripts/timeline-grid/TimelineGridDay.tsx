import './TimelineGridDay.scss';

import * as classNames from 'classnames';
import { autobind } from 'core-decorators';
import * as moment from 'moment';
import { extendMoment } from 'moment-range';
import * as React from 'react';

import { Facility, RowData } from '@/Types';
import { Label } from '@/ui-elements';

import { CELL_HEIGHT, CELL_WIDTH_HEADER } from './configs';
import {
    TimelineGridCell,
    TimelineGridRow,
    TimelineGridRowHeader
} from './grid-base';
import { TimelineGridBase } from './TimelineGridBase';

const groupby = require('lodash/groupBy');

const extendedMoment = extendMoment(moment);

export class TimelineGridDay extends TimelineGridBase {
    render() {
        const { GridBase } = this;

        const mainGridClassName = classNames(
            'timeline-grid-day'
        );

        const dataType = this.props.rowsData[0] && this.props.rowsData[0].dataType;
        return (
            <GridBase
                className={mainGridClassName}
            >
                <div className="timeline-grid-day-container">
                    <TimelineGridRowHeader
                        ref={element => this.timeRow = element}
                        spaBranchOpenHour={this.props.openTime.hours}
                        spaBranchOpenMinute={this.props.openTime.minutes}
                        spaBranchCloseTimeHour={this.props.closeTime.hours}
                        spaBranchCloseTimeMinute={this.props.closeTime.minutes}
                        dataType={dataType}
                    />
                    {this.props.rowsData.map(this.renderRow)}
                    {dataType === 'facility' && (
                        <div
                            ref={(element) => this.areaContainer = element}
                            className="timeline-grid-day-container-facility-areas"
                            style={{ top: CELL_HEIGHT }}
                        >
                            {this.renderAreas()}
                        </div>
                    )}
                </div>
            </GridBase>
        );
    }

    renderAreas() {
        const { rowsData } = this.props;
        const areas = groupby(rowsData, 'group');
        const elements = [];

        for (const areaKey in areas) {
            if (areas.hasOwnProperty(areaKey)) {
                const facilities = areas[areaKey] as Array<Facility>;
                const heigt = facilities.length * CELL_HEIGHT;
                elements.push(
                    <div
                        key={areaKey}
                        style={{ height: heigt }}
                        className="timeline-grid-day-container-facility-areas-item"
                    >
                        <Label
                            style={{ width: heigt }}
                            className="timeline-grid-day-container-facility-areas-item-label"
                            size="small"
                        >
                            {areaKey}
                        </Label>
                    </div>
                );
            }
        }

        return elements;
    }

    @autobind
    renderRow(data: RowData, columnIndex: number) {
        const cellsOfTime = this.getCellOfTime();
        const appointmentContents = this.getAppointmentContent();

        const workFromTime = moment(data.fromDaytime);
        const workToTime = moment(data.toDaytime);

        const wokingTimeRange = extendedMoment.range(data.fromDaytime, data.toDaytime);
        const OTTimeRange = data.isOT && extendedMoment.range(data.OTStartedDayTime, data.OTEndedDayTime);

        const cellEmements = cellsOfTime.map((time, i) => {
            const fromMinutes = time.from.getMinutes();
            const className = classNames(
                { 'timeline-grid-day-cell-border-style-dotted': fromMinutes !== 0 }
            );
            const cellTimeRange = extendedMoment.range(time.from, time.to);

            let isWokingTime = false;
            if (data.fromDaytime) {
                isWokingTime = cellTimeRange.overlaps(wokingTimeRange);
            }

            let isOT = false;
            if (OTTimeRange) {
                isOT = cellTimeRange.overlaps(OTTimeRange);
            }

            return (
                <TimelineGridCell
                    key={i}
                    className={className}
                    isValid={isWokingTime === true || isOT === true}
                    isOT={isOT}
                />
            );
        });

        return (
            <TimelineGridRow
                key={columnIndex}
                dropAble={true}
                appmointmentContents={appointmentContents}
                rowData={data}
                cellProps={cellsOfTime}
                openTime={this.props.openTime}
                closeTime={this.props.closeTime}
            >
                <TimelineGridCell
                    className={data.dataType}
                    width={CELL_WIDTH_HEADER}
                    ref={this.mapElementToRowHeaders}
                >
                    <div className="timeline-grid-day-cell-header">
                        <span className="timeline-grid-day-cell-header-name">{data.name}</span>
                        <span className="timeline-grid-day-cell-header-time">
                            {workFromTime.format('HH:mm')}-{workToTime.format('HH:mm')}
                        </span>
                    </div>
                </TimelineGridCell>
                {cellEmements}
            </TimelineGridRow>
        );
    }
}