import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { globalStyles, colors, spacing } from "@/styles/theme";
import { FontAwesome } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "@/store";
import { getSprintStats } from "@/store/sprintSlice";
import { getProjectDetails } from "@/store/projectSlice";
import {
  getTasks,
  updateTask,
  createTask,
  deleteTask,
} from "@/store/taskSlice";
import { Task, TasksByStatus, TaskCreationPayload } from "@/types/task";
import EditTaskModal from "@/components/EditTaskModal";
import CreateTaskModal from "@/components/CreateTaskModal";

export default function SprintDetailScreen() {
  const { sprintName, projectName } = useLocalSearchParams();
  const dispatch = useAppDispatch();

  const projectState = useAppSelector(
    (state) => state.project)
    
  const isLoadingProject = projectState?.status === "loading";
  const projectError = projectState?.error;

  const sprintState = useAppSelector(
    (state) => state.sprint.byProject[projectName as string]
  );
  const sprints = sprintState?.items || [];
  const currentSprint = sprints.find((sprint) => sprint.name === sprintName);
  const isLoadingSprints = sprintState?.status === "loading";
  const sprintError = sprintState?.error;

  const tasksState = useAppSelector((state) => state.task);
  const tasks = tasksState?.items || [];
  const isLoadingTasks = tasksState?.status === "loading";
  const tasksError = tasksState?.error;

  const statsState = useAppSelector((state) => {
    const root = state?.sprint;
    return root?.statsBySprint ? root.statsBySprint[sprintName as string] : undefined;
  });

  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>({});
  const [statusColumns, setStatusColumns] = useState<string[]>([]);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskModalVisible, setCreateTaskModalVisible] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const [statsModalVisible, setStatsModalVisible] = useState(false);

  useEffect(() => {
    if (tasks.length > 0) {
      const organizedTasks = tasks.reduce((acc: TasksByStatus, task) => {
        const status = task.status || "TODO";
        if (!acc[status]) acc[status] = [];
        acc[status].push(task);
        return acc;
      }, {});
      setTasksByStatus(organizedTasks);
      setStatusColumns(Object.keys(organizedTasks));
    }
  }, [tasks]);

  useFocusEffect(
    useCallback(() => {
      if (projectName) dispatch(getProjectDetails(projectName as string));
      if (sprintName) dispatch(getTasks(sprintName as string));
    }, [dispatch, projectName, sprintName])
  );

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!sprintName || !selectedTask) return;
    try {
      await dispatch(
        updateTask({ sprintName: sprintName as string, task: updatedTask })
      ).unwrap();
      setTaskModalVisible(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error);
    }
  };

  const handleCreateTask = async (task: TaskCreationPayload) => {
    try {
      await dispatch(createTask({ 
        sprintName: sprintName as string,
        task
      })).unwrap();
      await dispatch(getTasks(sprintName as string));
      setCreateTaskModalVisible(false);
    } catch (error: any) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!sprintName || !taskToDelete) return;
    try {
      await dispatch(
        deleteTask({
          sprintName: sprintName as string,
          taskTitle: taskToDelete.title,
        })
      ).unwrap();
      setDeleteModalVisible(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche:", error);
    }
  };

  const handleOpenStats = async () => {
    if (!sprintName) return;
    setStatsModalVisible(true);
    try {
      await dispatch(getSprintStats(sprintName as string)).unwrap();
    } catch (e) {
      console.error('[getSprintStats] error:', e);
    }
  };
  

  const renderTaskCard = ({ item, idx }: { item: Task, idx: number }) => (
    <View key={item.title+idx} style={styles.taskCard}>
      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          setSelectedTask(item);
          setTaskModalVisible(true);
        }}
      >
        <Text style={styles.taskTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.taskFooter}>
          <Text
            style={
              item.usernameAssignee
                ? styles.taskAssignee
                : styles.taskUnassigned
            }
          >
            {item.usernameAssignee || "Non assigné"}
          </Text>
          {item.storyPoints > 0 && (
            <View style={styles.storyPoints}>
              <Text style={styles.storyPointsText}>{item.storyPoints}</Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Bouton supprimer */}
      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && globalStyles.buttonPressed,
        ]}
        onPress={() => {
          setTaskToDelete(item);
          setDeleteModalVisible(true);
        }}
      >
        <FontAwesome name="trash" size={16} color={colors.background} />
      </Pressable>
    </View>
  );

  const renderStatusColumn = (status: string) => (
    <View key={status} style={styles.statusColumn}>
      <ColumnHeader
        status={status}
        count={tasksByStatus[status]?.length || 0}
      />
      <ScrollView>
        {tasksByStatus[status]?.map((task, idx) => renderTaskCard({ item: task, idx }))}
      </ScrollView>
    </View>
  );

  function ColumnHeader({ status, count }: { status: string; count: number }) {
    return (
      <View style={styles.statusHeader}>
        <Text style={styles.statusTitle}>{status}</Text>
        <Text style={styles.statusCount}>{count}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderSection />
      {isLoadingProject || isLoadingSprints || isLoadingTasks ? (
        <LoadingSection />
      ) : projectError || sprintError || tasksError ? (
        <ErrorSection />
      ) : (
        <ScrollView horizontal contentContainerStyle={styles.columns}>
          {statusColumns.map(renderStatusColumn)}
        </ScrollView>
      )}
      <ModalsSection />
    </View>
  );

  function HeaderSection() {
    return (
      <View style={styles.header}>
        <Text style={globalStyles.title}>
          {currentSprint?.name || sprintName}
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {/* Bouton stats */}
          <Pressable
            style={({ pressed }) => [
              styles.statsButton,
              pressed && globalStyles.buttonPressed,
            ]}
            onPress={handleOpenStats}
          >
            <FontAwesome name="bar-chart" size={16} color={colors.text.onSecondary} />
            <Text style={styles.statsButtonText}>Stats</Text>
          </Pressable>

          {/* Bouton nouvelle tâche */}
          <Pressable
            style={({ pressed }) => [
              styles.addTaskButton,
              pressed && globalStyles.buttonPressed,
            ]}
            onPress={() => setCreateTaskModalVisible(true)}
          >
            <FontAwesome name="plus" size={16} color={colors.text.primary} />
            <Text style={styles.addTaskButtonText}>Nouvelle tâche</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function LoadingSection() {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  function ErrorSection() {
    return (
      <View style={globalStyles.errorContainer}>
        <Text style={globalStyles.errorText}>{projectError || sprintError || tasksError}</Text>
        <Pressable
          style={({ pressed }) => [
            globalStyles.button,
            pressed && globalStyles.buttonPressed,
          ]}
          onPress={() => {
            if (projectName) dispatch(getProjectDetails(projectName as string));
            if (sprintName) dispatch(getTasks(sprintName as string));
          }}
        >
          <Text style={globalStyles.buttonText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  function ModalsSection() {
    return (
      <>
        {selectedTask && (
          <EditTaskModal
            visible={taskModalVisible}
            task={selectedTask}
            onClose={() => setTaskModalVisible(false)}
            onUpdate={handleUpdateTask}
            isUpdating={tasksState?.status === "loading"}
            updateError={tasksError}
          />
        )}
        <CreateTaskModal
          visible={createTaskModalVisible}
          onClose={() => setCreateTaskModalVisible(false)}
          onCreate={handleCreateTask}
          isCreating={tasksState?.status === "loading"}
          createError={tasksError}
          sprintName={sprintName as string}
        />

        {/* Modale suppression */}
        <Modal
          visible={deleteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={globalStyles.subtitle}>
                Supprimer la tâche "{taskToDelete?.title}" ?
              </Text>
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: colors.error }]}
                  onPress={handleDeleteTask}
                >
                  <Text style={styles.modalButtonText}>Supprimer</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Annuler</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modale stats */}
        <Modal
          visible={statsModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setStatsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={globalStyles.title}>Statistiques</Text>
              {statsState?.status === "loading" && (
                <ActivityIndicator size="large" color={colors.primary} />
              )}
              {statsState?.status === "failed" && (
                <Text style={globalStyles.errorText}>
                  {statsState.error || "Erreur lors du chargement des stats"}
                </Text>
              )}
              {statsState?.status === "succeeded" && statsState.data && (
                <>
                  <Text style={styles.statsItem}>Nb tâches : {statsState.data.nbTask}</Text>
                  <Text style={styles.statsItem}>Terminées : {statsState.data.nbTaskDone}</Text>
                  <Text style={styles.statsItem}>Non terminées : {statsState.data.nbTaskNotDone}</Text>
                  <Text style={styles.statsItem}>Capacité : {statsState.data.capacity}</Text>
                </>
              )}
              <Pressable
                style={[globalStyles.button, { marginTop: spacing.md }]}
                onPress={() => setStatsModalVisible(false)}
              >
                <Text style={globalStyles.buttonText}>Fermer</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background.primary,
  },
  columns: {
    paddingRight: spacing.lg,
  },
  statusColumn: {
    width: 280,
    marginRight: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  statusCount: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    fontSize: 12,
    color: colors.text.primary,
  },
  taskCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskAssignee: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  taskUnassigned: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  storyPoints: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  storyPointsText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  addTaskButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 4,
  },
  addTaskButtonText: {
    color: colors.text.onPrimary,
    fontWeight: "500",
    marginLeft: spacing.xs,
  },
  statsButton: {
    backgroundColor: colors.secondary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 4,
  },
  statsButtonText: {
    color: colors.text.onSecondary,
    fontWeight: "500",
    marginLeft: spacing.xs,
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.error,
    borderRadius: 6,
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    width: "80%",
    alignItems: "flex-start",
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: colors.background,
    fontWeight: "bold",
  },
  statsItem: {
    fontSize: 16,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
});
