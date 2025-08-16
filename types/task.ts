export interface Task {
  title: string;
  description: string;
  status: string;
  dueDate: string;
  usernameAssignee: string;
  storyPoints: number;
}

export interface TasksByStatus {
  [status: string]: Task[];
}
