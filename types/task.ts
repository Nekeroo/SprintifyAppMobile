export interface Task {
  title: string;
  description: string;
  status: string;
  dueDate: string;
  usernameAssignee: string;
  storyPoints: number;
}

// Types pour organiser les tâches par colonnes (statut)
export interface TasksByStatus {
  [status: string]: Task[];
}
