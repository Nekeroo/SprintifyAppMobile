import { User } from "./auth";
import { Sprint } from "./sprint";

export interface Project {
    name: string;
    description: string;
    owner: User;
    sprints: Sprint[];
  }