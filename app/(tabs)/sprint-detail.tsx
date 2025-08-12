import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator, FlatList, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { globalStyles, colors, spacing } from '@/styles/theme';
import { FontAwesome } from '@expo/vector-icons';
import { sprintService } from '@/services/sprint';
import { Task, TasksByStatus } from '@/types/task';
import EditTaskModal from '@/components/EditTaskModal';
import CreateTaskModal from '@/components/CreateTaskModal';

import { DraxProvider, DraxView } from 'react-native-drax';

export default function SprintDetailScreen() {
  const { sprintName } = useLocalSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>({});
  const [statusColumns, setStatusColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [updateTaskError, setUpdateTaskError] = useState('');

  const [createTaskModalVisible, setCreateTaskModalVisible] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [createTaskError, setCreateTaskError] = useState('');

  useEffect(() => {
    loadTasks();
  }, [sprintName]);

  const loadTasks = async () => {
    if (!sprintName) return;
    try {
      setIsLoading(true);
      setError('');

      const sprintTasks = await sprintService.getTasks(sprintName as string);
      setTasks(sprintTasks);

      const organizedTasks = sprintService.organizeTasksByStatus(sprintTasks);
      setTasksByStatus(organizedTasks);
      setStatusColumns(Object.keys(organizedTasks));
    } catch (err) {
      setError('Erreur lors du chargement des tâches');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setTaskModalVisible(true);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!selectedTask || !sprintName) return;
    try {
      setIsUpdatingTask(true);
      setUpdateTaskError('');

      const taskUpdatePayload = {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        dueDate: updatedTask.dueDate,
        usernameAssignee: updatedTask.usernameAssignee,
        storyPoints: updatedTask.storyPoints,
      };

      await sprintService.updateTask(selectedTask.title, taskUpdatePayload);
      await loadTasks();
      setTaskModalVisible(false);
    } catch (err) {
      setUpdateTaskError('Erreur lors de la mise à jour de la tâche');
      console.error(err);
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleCreateTask = async (newTask: Omit<Task, 'id'>) => {
    if (!sprintName) return;
    try {
      setIsCreatingTask(true);
      setCreateTaskError('');

      const taskPayload = {
        name: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate || '',
        storyPoints: newTask.storyPoints,
        assignee: newTask.usernameAssignee,
      };

      await sprintService.createTask(sprintName as string, taskPayload);
      await loadTasks();
      setCreateTaskModalVisible(false);
    } catch (err) {
      setCreateTaskError('Erreur lors de la création de la tâche');
      console.error(err);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const onDropTaskToStatus = useCallback(
    async (taskTitle: string, targetStatus: string) => {
      try {
        setTasksByStatus((prev) => {
          const cloned: TasksByStatus = {};
          for (const k of Object.keys(prev)) cloned[k] = [...prev[k]];

          let movedTask: Task | undefined;
          for (const status of Object.keys(cloned)) {
            const idx = cloned[status].findIndex((t) => t.title === taskTitle);
            if (idx !== -1) {
              movedTask = { ...cloned[status][idx], status: targetStatus };
              cloned[status].splice(idx, 1);
              break;
            }
          }
          if (!movedTask) return prev;

          if (!cloned[targetStatus]) cloned[targetStatus] = [];
          cloned[targetStatus] = [movedTask, ...cloned[targetStatus]];

          return cloned;
        });

        await sprintService.updateTask(taskTitle, { status: targetStatus });
        await loadTasks();
      } catch (e) {
        console.error(e);
        await loadTasks();
      }
    },
    [loadTasks]
  );

  const renderTaskCard = ({ item }: { item: Task }) => {
    const content = (
      <Pressable
        style={({ pressed }) => [styles.taskCard, pressed && globalStyles.buttonPressed]}
        onPress={() => openTaskModal(item)}
      >
        <Text style={styles.taskTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.taskFooter}>
          {item.usernameAssignee ? (
            <Text style={styles.taskAssignee}>{item.usernameAssignee}</Text>
          ) : (
            <Text style={styles.taskUnassigned}>Non assigné</Text>
          )}
          {item.storyPoints > 0 && (
            <View style={styles.storyPoints}>
              <Text style={styles.storyPointsText}>{item.storyPoints}</Text>
            </View>
          )}
        </View>
      </Pressable>
    );

    return Platform.OS !== 'web' ? (
      <DraxView
        style={styles.draggableWrapper}
        draggingStyle={styles.dragging}
        dragReleasedStyle={styles.dragReleased}
        hoverDraggingStyle={styles.hoverDragging}
        dragPayload={item.title}
        longPressDelay={150}
      >
        {content}
      </DraxView>
    ) : (
      content
    );
  };

  const renderStatusColumn = (status: string) => {
    const statusTasks = tasksByStatus[status] || [];

    return Platform.OS !== 'web' ? (
      <DraxView
        key={status}
        receptive
        style={styles.statusColumn}
        onReceiveDragDrop={({ dragged }) => onDropTaskToStatus(String(dragged?.payload), status)}
      >
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>{status}</Text>
          <Text style={styles.statusCount}>{statusTasks.length}</Text>
        </View>
        <FlatList
          data={statusTasks}
          renderItem={renderTaskCard}
          keyExtractor={(item) => item.title}
          style={styles.taskList}
          showsVerticalScrollIndicator={false}
        />
      </DraxView>
    ) : (
      <View style={styles.statusColumn} key={status}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>{status}</Text>
          <Text style={styles.statusCount}>{statusTasks.length}</Text>
        </View>
        <FlatList
          data={statusTasks}
          renderItem={renderTaskCard}
          keyExtractor={(item) => item.title}
          style={styles.taskList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const ColumnsView = (
    <ScrollView
      horizontal
      style={styles.columnsContainer}
      contentContainerStyle={styles.columns}
      showsHorizontalScrollIndicator={false}
    >
      {statusColumns.map(renderStatusColumn)}
    </ScrollView>
  );

  return Platform.OS !== 'web' ? (
    <DraxProvider>
      <View style={styles.container}>
        <HeaderSection />
        {isLoading ? <LoadingSection /> : error ? <ErrorSection /> : ColumnsView}
        <ModalsSection />
      </View>
    </DraxProvider>
  ) : (
    <View style={styles.container}>
      <HeaderSection />
      {isLoading ? <LoadingSection /> : error ? <ErrorSection /> : ColumnsView}
      <ModalsSection />
    </View>
  );

  function HeaderSection() {
    return (
      <View style={styles.header}>
        <Text style={globalStyles.title}>{sprintName}</Text>
        <Pressable
          style={({ pressed }) => [styles.addTaskButton, pressed && globalStyles.buttonPressed]}
          onPress={() => setCreateTaskModalVisible(true)}
        >
          <FontAwesome name="plus" size={16} color={colors.text.onPrimary} />
          <Text style={styles.addTaskButtonText}>Nouvelle tâche</Text>
        </Pressable>
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
        <Text style={globalStyles.errorText}>{error}</Text>
        <Pressable
          style={({ pressed }) => [globalStyles.button, pressed && globalStyles.buttonPressed]}
          onPress={loadTasks}
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
            isUpdating={isUpdatingTask}
            updateError={updateTaskError}
          />
        )}
        <CreateTaskModal
          visible={createTaskModalVisible}
          onClose={() => setCreateTaskModalVisible(false)}
          onCreate={handleCreateTask}
          isCreating={isCreatingTask}
          createError={createTaskError}
          sprintName={sprintName as string}
        />
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
  columnsContainer: {
    flex: 1,
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
    maxHeight: '100%',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statusCount: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    color: colors.text.primary,
  },
  taskList: {
    flex: 1,
  },
  // --- Task card (draggable) ---
  draggableWrapper: {
    borderRadius: 8,
  },
  dragging: {
    opacity: 0.2,
  },
  dragReleased: {
    opacity: 1,
  },
  hoverDragging: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  taskCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    elevation: 1,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)'
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskAssignee: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  taskUnassigned: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  storyPoints: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyPointsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addTaskButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 4,
  },
  addTaskButtonText: {
    color: colors.text.onPrimary,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
});
