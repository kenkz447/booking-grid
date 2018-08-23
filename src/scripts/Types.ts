export interface Appointment {
    readonly appointmentContents: AppointmentContent[];
    readonly appointmentStatus: 'CHECKOUT' | 'CANCEL';
}

export interface AppointmentContent {
    readonly id: number;
    readonly appointmentHour: number;
    readonly appointmentMinute: number;
    readonly serviceTime: number;
    readonly serviceName: string;
    readonly appointmentStatus?: Appointment['appointmentStatus'];
}

export interface Facility {

}

export interface RowData {
    readonly id: number;
    readonly name: string;
    readonly fromDaytime: string;
    readonly toDaytime: string;
    readonly isOT: boolean;
    readonly OTStartedDayTime?: string;
    readonly OTEndedDayTime?: string;
    readonly group: string;
}

export interface DaytimeInfo {
    readonly hours: number;
    readonly minutes: number;
}