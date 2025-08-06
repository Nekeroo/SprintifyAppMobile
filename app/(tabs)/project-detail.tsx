import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/Themed';
import { Project } from '@/types/project';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { globalStyles, colors, spacing } from '@/styles/theme';
import { FontAwesome } from '@expo/vector-icons';

export default function ProjectDetailScreen() {
  const { project } = useLocalSearchParams();
  const projectData: Project = JSON.parse(project as string);
  const router = useRouter();

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
          <Text style={globalStyles.textTertiary}>
            Créé par: {projectData.owner.username}
          </Text>
        </View>

        <View style={styles.sprintsSection}>
          <Text style={globalStyles.subtitle}>Sprints</Text>
          {projectData.sprints.length === 0 ? (
            <Text style={[globalStyles.textSecondary, styles.noSprintsText]}>
              Aucun sprint pour ce projet
            </Text>
          ) : (
            projectData.sprints.map((sprint) => (
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
});
