import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Modal } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { globalStyles, colors, spacing } from '@/styles/theme';
import { FontAwesome } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store';
import { getProjectDetails } from '@/store/projectSlice';
import { getSprints, deleteSprint } from '@/store/sprintSlice';

export default function ProjectDetailScreen() {
  const { project, reload } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { selectedProject: projectData, status: projectStatus, error: projectError } =
    useAppSelector((state) => state.project);

  const sprintState = useAppSelector((state) => state.sprint.byProject[project as string]);
  const sprintData = sprintState?.items || [];
  const sprintStatus = sprintState?.status;
  const sprintError = sprintState?.error;

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      dispatch(getProjectDetails(project as string));
    }
  }, [dispatch, project, reload]);

  const handleDeleteSprint = async () => {
    if (!sprintToDelete) return;
    try {
      await dispatch(deleteSprint({ projectName: project as string, sprintName: sprintToDelete })).unwrap();
      setDeleteModalVisible(false);
      setSprintToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du sprint:', error);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.backButton,
          pressed && globalStyles.buttonPressed,
        ]}
        onPress={() => router.back()}
      >
        <FontAwesome name="arrow-left" size={20} color={colors.text.primary} />
        <Text style={styles.backButtonText}>Retour</Text>
      </Pressable>

      <ScrollView style={globalStyles.container}>
        <View style={[globalStyles.card, styles.header]}>
          <Text style={globalStyles.title}>{projectData?.name}</Text>
          <Text style={globalStyles.textSecondary}>
            {projectData?.description}
          </Text>
          {projectData?.owner && (
            <Text style={globalStyles.textTertiary}>
              Créé par: {projectData.owner.username}
            </Text>
          )}
        </View>

        <View style={styles.sprintsSection}>
          <View style={styles.sprintsSectionHeader}>
            <Text style={globalStyles.subtitle}>Sprints</Text>
            <Pressable
              style={({ pressed }) => [
                styles.createButton,
                pressed && globalStyles.buttonPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: '/create-sprint',
                  params: { project },
                })
              }
            >
              <FontAwesome
                name="plus"
                size={16}
                color={colors.text.primary}
              />
              <Text style={styles.createButtonText}>Nouveau Sprint</Text>
            </Pressable>
          </View>

          {sprintStatus === 'loading' || projectStatus === 'loading' ? (
            <Text style={globalStyles.textSecondary}>
              Chargement des données...
            </Text>
          ) : projectError || sprintError ? (
            <Text style={[globalStyles.textSecondary, { color: colors.error }]}>
              {projectError || sprintError}
            </Text>
          ) : sprintData.length === 0 ? (
            <Text style={[globalStyles.textSecondary, styles.noSprintsText]}>
              Aucun sprint pour ce projet
            </Text>
          ) : (
            sprintData.map((sprint) => (
              <View key={sprint.name} style={[globalStyles.card, styles.sprintCard]}>
                <Pressable
                  style={styles.sprintContent}
                  onPress={() =>
                    router.push({
                      pathname: '/sprint-detail',
                      params: { 
                        sprintName: sprint.name,
                        project,
                      },
                    })
                  }
                >
                  <Text style={globalStyles.subtitle}>{sprint.name}</Text>
                  <Text style={globalStyles.textSecondary}>
                    Du {new Date(sprint.startDate).toLocaleDateString()} au{' '}
                    {new Date(sprint.endDate).toLocaleDateString()}
                  </Text>
                  <Text style={[globalStyles.textTertiary, styles.sprintDescription]}>
                    {sprint.description || 'Aucune description'}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.deleteButton, pressed && globalStyles.buttonPressed]}
                  onPress={() => {
                    setSprintToDelete(sprint.name);
                    setDeleteModalVisible(true);
                  }}
                >
                  <FontAwesome name="trash" size={16} color={colors.background} />
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={globalStyles.subtitle}>
              Supprimer le sprint "{sprintToDelete}" ?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={handleDeleteSprint}
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
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  sprintsSection: {
    padding: spacing.md,
  },
  sprintsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noSprintsText: {
    fontStyle: 'italic',
  },
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  createButtonText: {
    marginLeft: spacing.xs,
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  sprintDescription: {
    marginTop: spacing.sm,
  },
  sprintCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sprintContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.error,
    borderRadius: 6,
    marginLeft: spacing.sm,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    width: '80%',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.background,
    fontWeight: 'bold',
  },
});
