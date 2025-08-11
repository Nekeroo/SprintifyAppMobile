import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { globalStyles, colors, spacing } from '@/styles/theme';
import { FontAwesome } from '@expo/vector-icons';
import { sprintService } from '@/services/sprint';
import { Task, TasksByStatus } from './../../types/task';

export default function SprintDetailScreen() {
  const { sprintName } = useLocalSearchParams();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>({});
  const [statusColumns, setStatusColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      
      // Organiser les tâches par statut
      const organizedTasks = sprintService.organizeTasksByStatus(sprintTasks);
      setTasksByStatus(organizedTasks);
      
      // Récupérer les colonnes de statut
      setStatusColumns(Object.keys(organizedTasks));
      
    } catch (err) {
      setError('Erreur lors du chargement des tâches');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTaskCard = ({ item }: { item: Task }) => {
    return (
      <View style={styles.taskCard}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.taskFooter}>
          <View style={styles.taskAssignee}>
            <FontAwesome name="user" size={12} color={colors.text.secondary} />
            <Text style={styles.taskAssigneeText}>{item.usernameAssignee || 'Non assigné'}</Text>
          </View>
          <View style={styles.taskPoints}>
            <Text style={styles.taskPointsText}>{item.storyPoints} pt</Text>
          </View>
        </View>
        <Text style={styles.taskDueDate}>
          Échéance: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Non définie'}
        </Text>
      </View>
    );
  };

  const renderStatusColumn = (status: string) => {
    return (
      <View key={status} style={styles.column}>
        <View style={styles.columnHeader}>
          <Text style={styles.columnTitle}>{status}</Text>
          <Text style={styles.taskCount}>{tasksByStatus[status]?.length || 0}</Text>
        </View>
        <FlatList
          data={tasksByStatus[status] || []}
          renderItem={renderTaskCard}
          keyExtractor={item => item.title}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.columnContent}
        />
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      <Pressable 
        style={({pressed}) => [
          styles.backButton,
          pressed && globalStyles.buttonPressed
        ]}
        onPress={() => router.back()}
      >
        <FontAwesome name="arrow-left" size={20} color={colors.text.primary} />
        <Text style={styles.backButtonText}>Retour</Text>
      </Pressable>

      <Text style={globalStyles.title}>Sprint: {sprintName}</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des tâches...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={loadTasks}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune tâche pour ce sprint</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          contentContainerStyle={styles.columnsContainer}
          showsHorizontalScrollIndicator={false}
        >
          {statusColumns.map(status => renderStatusColumn(status))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  backButtonText: {
    marginLeft: spacing.xs,
    color: colors.text.primary,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.onPrimary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  columnsContainer: {
    paddingHorizontal: spacing.md,
  },
  column: {
    width: 280,
    marginRight: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
    maxHeight: '100%',
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  taskCount: {
    fontSize: 14,
    color: colors.text.secondary,
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  columnContent: {
    paddingBottom: spacing.md,
  },
  taskCard: {
    backgroundColor: colors.background.primary,
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
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
    marginBottom: spacing.xs,
  },
  taskAssignee: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskAssigneeText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  taskPoints: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  taskPointsText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  taskDueDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
});
