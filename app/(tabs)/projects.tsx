import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, Pressable } from 'react-native';
import { Text } from '@/components/Themed';
import { ProjectOverview } from '@/types/project';
import { projectService } from '@/services/project';
import { useRouter } from 'expo-router';
import { globalStyles, colors, spacing } from '@/styles/theme';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<ProjectOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (err) {
      setError('Erreur lors du chargement des projets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectPress = (project: ProjectOverview) => {
    router.push({
      pathname: '/(tabs)/project-detail',
      params: {
        project: project.name
      }
    });
  };

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!loading && projects.length === 0) {
    return (
      <View style={globalStyles.container}>
        <Text>Aucun projet trouvé</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.container}>
        <Text style={globalStyles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderProject = ({ item }: { item: ProjectOverview }) => (
    <Pressable onPress={() => handleProjectPress(item)}>
      <View style={[globalStyles.card, styles.projectCard]}>
        <Text style={globalStyles.subtitle}>{item.name}</Text>
        <Text style={globalStyles.textTertiary}>
          Créé par: {item.usernameOwner}
        </Text>
        <Text style={globalStyles.textTertiary}>
          Nombre de sprints: {item.nbSprint}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContainer}
      />
      <Pressable 
        style={({pressed}) => [
          styles.createButton,
          pressed && globalStyles.buttonPressed
        ]}
        onPress={() => router.push('/(tabs)/create-project')}
      >
        <Text style={styles.createButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    gap: spacing.md,
  },
  projectCard: {
    marginBottom: 0, // Override globalStyles.card marginBottom
  },
  createButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  createButtonText: {
    color: colors.background,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
