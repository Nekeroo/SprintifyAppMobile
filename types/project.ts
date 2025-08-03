import { User } from "./auth";
import { Sprint } from "./sprint";

export interface Project {
    id: number;
    name: string;
    description: string;
    owner: User;
    sprints: Sprint[];
  }