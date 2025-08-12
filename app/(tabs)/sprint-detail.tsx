import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles, colors, spacing } from '@/styles/theme';
import { FontAwesome } from '@expo/vector-icons';
import { sprintService } from '@/services/sprint';
import { Task, TasksByStatus } from '@/types/task';
import EditTaskModal from '@/components/EditTaskModal';
import CreateTaskModal from '@/components/CreateTaskModal';

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

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [sprintName])
  );

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setTaskModalVisible(true);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!selectedTask) return;
    try {
      setIsUpdatingTask(true);
      setUpdateTaskError('');
      await sprintService.updateTask(selectedTask.title, {
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        dueDate: updatedTask.dueDate,
        usernameAssignee: updatedTask.usernameAssignee,
        storyPoints: updatedTask.storyPoints,
      });
      await loadTasks();
      setTaskModalVisible(false);
    } catch {
      setUpdateTaskError('Erreur lors de la mise à jour de la tâche');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleCreateTask = async (newTask: Omit<Task, 'id'>) => {
    if (!sprintName) return;
    try {
      setIsCreatingTask(true);
      setCreateTaskError('');
      await sprintService.createTask(sprintName as string, {
        name: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate || '',
        storyPoints: newTask.storyPoints,
        assignee: newTask.usernameAssignee,
      });
      await loadTasks();
      setCreateTaskModalVisible(false);
    } catch {
      setCreateTaskError('Erreur lors de la création de la tâche');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const renderTaskCard = ({ item }: { item: Task }) => (
    <Pressable
      style={({ pressed }) => [styles.taskCard, pressed && globalStyles.buttonPressed]}
      onPress={() => openTaskModal(item)}
    >
      <Text style={styles.taskTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.taskDescription} numberOfLines={2}>{item.description}</Text>
      <View style={styles.taskFooter}>
        <Text style={item.usernameAssignee ? styles.taskAssignee : styles.taskUnassigned}>
          {item.usernameAssignee || 'Non assigné'}
        </Text>
        {item.storyPoints > 0 && (
          <View style={styles.storyPoints}>
            <Text style={styles.storyPointsText}>{item.storyPoints}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  const renderStatusColumn = (status: string) => {
    const statusTasks = tasksByStatus[status] || [];
    return (
      <View style={styles.statusColumn} key={status}>
        <ColumnHeader status={status} count={statusTasks.length} />
        <FlatList data={statusTasks} renderItem={renderTaskCard} keyExtractor={(item) => item.title} />
      </View>
    );
  };

  const ColumnHeader = ({ status, count }: { status: string, count: number }) => (
    <View style={styles.statusHeader}>
      <Text style={styles.statusTitle}>{status}</Text>
      <Text style={styles.statusCount}>{count}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <HeaderSection />
      {isLoading ? <LoadingSection /> : error ? <ErrorSection /> : (
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
        <Text style={globalStyles.title}>{sprintName}</Text>
        <Pressable style={({ pressed }) => [styles.addTaskButton, pressed && globalStyles.buttonPressed]} onPress={() => setCreateTaskModalVisible(true)}>
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
        <Pressable style={({ pressed }) => [globalStyles.button, pressed && globalStyles.buttonPressed]} onPress={loadTasks}>
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
  container: { flex: 1, padding: spacing.md, backgroundColor: colors.background.primary },
  columns: { paddingRight: spacing.lg },
  statusColumn: { width: 280, marginRight: spacing.md, backgroundColor: colors.background.secondary, borderRadius: 8, padding: spacing.sm },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  statusTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text.primary },
  statusCount: { backgroundColor: colors.background.tertiary, paddingHorizontal: spacing.sm, borderRadius: 12, fontSize: 12, color: colors.text.primary },
  taskCard: { backgroundColor: colors.background.primary, borderRadius: 8, padding: spacing.sm, marginBottom: spacing.sm, elevation: 1 },
  taskTitle: { fontSize: 16, fontWeight: '500', marginBottom: spacing.xs, color: colors.text.primary },
  taskDescription: { fontSize: 14, color: colors.text.secondary, marginBottom: spacing.sm },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskAssignee: { fontSize: 12, color: colors.text.secondary },
  taskUnassigned: { fontSize: 12, color: colors.text.secondary, fontStyle: 'italic' },
  storyPoints: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.background.secondary, justifyContent: 'center', alignItems: 'center' },
  storyPointsText: { fontSize: 10, fontWeight: 'bold', color: colors.text.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  addTaskButton: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 4 },
  addTaskButtonText: { color: colors.text.onPrimary, fontWeight: '500', marginLeft: spacing.xs },
});
