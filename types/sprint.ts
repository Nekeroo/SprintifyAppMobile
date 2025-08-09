import { ProjectOverview } from "./project";

export interface Sprint {
    project: ProjectOverview;
    name: string;
    startDate: Date;
    endDate: Date;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    description?: string;
}