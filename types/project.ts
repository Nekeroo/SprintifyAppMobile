import { User } from "./auth";
import { Sprint } from "./sprint";

export interface ProjectOverview {
    name: string;
    usernameOwner: string,
    nbSprint: number
}