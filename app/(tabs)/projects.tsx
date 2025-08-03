import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Text } from '@/components/Themed';
import { Project } from '@/types/project';
import { projectService } from '@/services/project';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderProject = ({ item }: { item: Project }) => (
    <View style={styles.projectCard}>
      <Text style={styles.projectTitle}>{item.name}</Text>
      <Text style={styles.projectDescription}>{item.description}</Text>
      <Text style={styles.projectOwner}>
        Créé par: {item.owner.username}
      </Text>
      <Text style={styles.sprintCount}>
        Nombre de sprints: {item.sprints.length}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    gap: 16,
  },
  projectCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  projectOwner: {
    fontSize: 12,
    color: '#888',
  },
  sprintCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});
