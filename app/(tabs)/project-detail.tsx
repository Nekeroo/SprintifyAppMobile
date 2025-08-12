import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { globalStyles, colors, spacing } from '@/styles/theme';
import { FontAwesome } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store';
import { getProjectDetails } from '@/store/projectSlice';
import { getSprints } from '@/store/sprintSlice';

export default function ProjectDetailScreen() {
  const { project, reload } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const projectData = useAppSelector(
    (state) => state.project.detailsByName[project as string]
  );
  const projectStatus = useAppSelector(
    (state) => state.project.detailsStatusByName[project as string]
  );
  const projectError = useAppSelector(
    (state) => state.project.detailsErrorByName[project as string]
  );

  const sprintData = useAppSelector(
    (state) => state.sprint.byProject[project as string]?.items || []
  );
  const sprintStatus = useAppSelector(
    (state) => state.sprint.byProject[project as string]?.status
  );
  const sprintError = useAppSelector(
    (state) => state.sprint.byProject[project as string]?.error
  );

  useEffect(() => {
    if (project) {
      dispatch(getProjectDetails({ name: project as string }));
      dispatch(getSprints({ projectName: project as string }));
    }
  }, [dispatch, project, reload]);

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
                  params: {
                    projectName: projectData?.name,
                    project: JSON.stringify(projectData),
                  },
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
            <Text
              style={[globalStyles.textSecondary, { color: colors.error }]}
            >
              {projectError || sprintError}
            </Text>
          ) : sprintData.length === 0 ? (
            <Text
              style={[globalStyles.textSecondary, styles.noSprintsText]}
            >
              Aucun sprint pour ce projet
            </Text>
          ) : (
            sprintData.map((sprint) => (
              <Pressable
                key={sprint.name}
                style={({ pressed }) => [
                  globalStyles.card,
                  pressed && globalStyles.buttonPressed,
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/sprint-detail',
                    params: { sprintName: sprint.name },
                  })
                }
              >
                <Text style={globalStyles.subtitle}>{sprint.name}</Text>
                <Text style={globalStyles.textSecondary}>
                  Du {new Date(sprint.startDate).toLocaleDateString()} au{' '}
                  {new Date(sprint.endDate).toLocaleDateString()}
                </Text>
                <Text
                  style={[
                    globalStyles.textTertiary,
                    styles.sprintDescription,
                  ]}
                >
                  {sprint.description || 'Aucune description'}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
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
});
