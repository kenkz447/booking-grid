import * as React from 'react';
import { render } from 'react-dom';

import { TimelineGridDay } from './timeline-grid';

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const endOfToday = new Date();
endOfToday.setHours(23, 59, 59, 0);

const fromDaytime = startOfToday.toISOString();
const toDaytime = endOfToday.toISOString();

const testComponent = (
    <TimelineGridDay
        rowsData={[{
            fromDaytime: fromDaytime,
            toDaytime: toDaytime,
            id: 1,
            isOT: false,
            name: 'Test data',
            group: 'TEST'
        }, {
            fromDaytime: fromDaytime,
            toDaytime: toDaytime,
            id: 2,
            isOT: false,
            name: 'Test data',
            group: 'TEST'
        }]}
        appointments={[{
            appointmentStatus: 'CHECKOUT',
            appointmentContents: [{
                id: 1,
                appointmentHour: 12,
                appointmentMinute: 12,
                appointmentStatus: 'CANCEL',
                serviceName: 'Test',
                serviceTime: 60
            }]
        }]}
        openTime={{
            hours: 6,
            minutes: 0
        }}
        closeTime={{
            hours: 23,
            minutes: 59
        }}
        minutePerCell={15}
    />
);

export function startup() {
    render(testComponent, document.getElementById('root'));
}