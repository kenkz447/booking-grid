export interface Appointment {

}

export interface AppointmentContent {

}

export interface Facility {

}

export interface RowData {
    readonly id: number;
    readonly name: string;
    readonly fromDaytime: string;
    readonly toDaytime: string;
    readonly isOT: string
}

export interface DaytimeInfo {
    readonly hours: number;
    readonly minutes: number;
}