import { Project } from "./project";

export interface Sprint {
    project: Project;
    name: string;
    startDate: Date;
    endDate: Date;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    description?: string;
}