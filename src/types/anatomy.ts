export interface MuscleGroup {
    name: string;
    description: string;
    muscles: Muscle[]; // hydrated with muscle data
}

export interface Muscle {
    name: string;
    description: string;
    group: MuscleGroup; // hydrated with muscle group data
}

interface Measurement {
    name: string;
    description: string;
    value: number;
    unit: string;
    method?: string;
    site: MeasurementSite; // hydrated with measurement site data
}

interface MeasurementSite {
    name: string;
    description: string;
    measurements: Measurement[]; // hydrated with measurement data
}

interface MeasurementInstance {
    measurement: Measurement; // hydrated with measurement data
    date: Date;
}

export interface MeasurementLog {
    measurements: MeasurementInstance[]; // hydrated with measurement data
}