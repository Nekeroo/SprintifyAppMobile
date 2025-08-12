import React, { useEffect } from 'react';
import { StyleSheet, FlatList, View, Pressable } from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { globalStyles, colors, spacing } from '@/styles/theme';

import { useAppDispatch, useAppSelector } from '@/store';
import { getAllProjects } from '@/store/projectSlice';

export default function ProjectsScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { list: projects, listStatus: status, listError: error } = useAppSelector(
    (state) => state.project
  );

  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);

  const handleProjectPress = (projectName: string) => {
    router.push({
      pathname: '/(tabs)/project-detail',
      params: { project: projectName },
    });
  };

  if (status === 'loading') {
    return (
      <View style={globalStyles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={globalStyles.container}>
        <Text style={globalStyles.errorText}>
          {error || 'Erreur lors du chargement des projets'}
        </Text>
      </View>
    );
  }

  if (status === 'succeeded' && projects.length === 0) {
    return (
      <View style={globalStyles.container}>
        <Text>Aucun projet trouvé</Text>
      </View>
    );
  }

  const renderProject = ({ item }: { item: typeof projects[number] }) => (
    <Pressable onPress={() => handleProjectPress(item.name)}>
      <View style={[globalStyles.card, styles.projectCard]}>
        <Text style={globalStyles.subtitle}>{item.name}</Text>
        <Text style={globalStyles.textTertiary}>Créé par: {item.usernameOwner}</Text>
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
        style={({ pressed }) => [
          styles.createButton,
          pressed && globalStyles.buttonPressed,
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
    marginBottom: 0, 
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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  createButtonText: {
    color: colors.background,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
