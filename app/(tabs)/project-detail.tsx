import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/Themed';
import { Project } from '@/types/project';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { globalStyles, colors, spacing } from '@/styles/theme';
import { FontAwesome } from '@expo/vector-icons';
import { sprintService } from '@/services/sprint';
import { projectService } from '@/services/project';

export default function ProjectDetailScreen() {
  const { project, reload } = useLocalSearchParams();
  const initialProjectData: Project = JSON.parse(project as string);
  const router = useRouter();
  const [projectData, setProjectData] = useState(initialProjectData);
  const [sprints, setSprints] = useState(initialProjectData.sprints);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProjectAndSprints = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Charger les données à jour du projet
      const updatedProject = await projectService.getProjectDetails(initialProjectData.name);
      setProjectData(updatedProject);
      
      // Charger les sprints à jour
      const updatedSprints = await sprintService.getSprints(initialProjectData.name);
      setSprints(updatedSprints);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Recharger les données quand le projet change ou quand reload est true
    loadProjectAndSprints();
  }, [project, reload]);

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

      <ScrollView style={globalStyles.container}>
        <View style={[globalStyles.card, styles.header]}>
          <Text style={globalStyles.title}>{projectData.name}</Text>
          <Text style={globalStyles.textSecondary}>{projectData.description}</Text>
          {projectData.owner && (
            <Text style={globalStyles.textTertiary}>
              Créé par: {projectData.owner.username}
            </Text>
          )}
        </View>

        <View style={styles.sprintsSection}>
          <View style={styles.sprintsSectionHeader}>
            <Text style={globalStyles.subtitle}>Sprints</Text>
            <Pressable
              style={({pressed}) => [
                styles.createButton,
                pressed && globalStyles.buttonPressed
              ]}
              onPress={() => router.push({
                pathname: '/create-sprint',
                params: { 
                  projectName: projectData.name,
                  project: JSON.stringify(projectData)
                }
              })}
            >
              <FontAwesome name="plus" size={16} color={colors.text.primary} />
              <Text style={styles.createButtonText}>Nouveau Sprint</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <Text style={globalStyles.textSecondary}>Chargement des données...</Text>
          ) : error ? (
            <Text style={[globalStyles.textSecondary, { color: colors.error }]}>{error}</Text>
          ) : sprints.length === 0 ? (
            <Text style={[globalStyles.textSecondary, styles.noSprintsText]}>
              Aucun sprint pour ce projet
            </Text>
          ) : (
            sprints.map((sprint) => (
              <View key={sprint.name} style={globalStyles.card}>
                <Text style={globalStyles.subtitle}>{sprint.name}</Text>
                <Text style={globalStyles.textSecondary}>
                  Du {new Date(sprint.startDate).toLocaleDateString()} au{' '}
                  {new Date(sprint.endDate).toLocaleDateString()}
                </Text>
                <Text style={globalStyles.textTertiary}>
                  Statut: {sprint.status}
                </Text>
              </View>
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
    color: colors.text.onPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
});
