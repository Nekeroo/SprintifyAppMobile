import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Pressable,
  Modal,
} from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { globalStyles, colors, spacing } from '@/styles/theme';

import { useAppDispatch, useAppSelector } from '@/store';
import { getProjects, deleteProject } from '@/store/projectSlice';
import { FontAwesome } from '@expo/vector-icons';

export default function ProjectsScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { items: projects, status, error } = useAppSelector(
    (state) => state.project
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      dispatch(getProjects());
    }, [dispatch])
  );

  const handleProjectPress = (projectName: string) => {
    router.push({
      pathname: '/(tabs)/project-detail',
      params: { project: projectName },
    });
  };

  const openDeleteModal = (projectName: string) => {
    setProjectToDelete(projectName);
    setModalVisible(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      dispatch(deleteProject(projectToDelete));
      setProjectToDelete(null);
      setModalVisible(false);
    }
  };

  const cancelDelete = () => {
    setProjectToDelete(null);
    setModalVisible(false);
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
    <View style={[globalStyles.card, styles.projectCard]}>
      <Pressable onPress={() => handleProjectPress(item.name)} style={{ flex: 1 }}>
        <Text style={globalStyles.subtitle}>{item.name}</Text>
        <Text style={globalStyles.textTertiary}>
          Créé par: {item.usernameOwner}
        </Text>
        <Text style={globalStyles.textTertiary}>
          Nombre de sprints: {item.nbSprint}
        </Text>
      </Pressable>
  
      {/* Bouton supprimer (cohérent avec Sprint/Task) */}
      <Pressable
        onPress={() => openDeleteModal(item.name)}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && globalStyles.buttonPressed,
        ]}
      >
        <FontAwesome name="trash" size={16} color={colors.background} />
      </Pressable>
    </View>
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

      {/* Modale de confirmation */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={globalStyles.subtitle}>
              Supprimer le projet "{projectToDelete}" ?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonText}>Supprimer</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={cancelDelete}
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
  listContainer: {
    gap: spacing.md,
  },
  projectCard: {
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.error,
    borderRadius: 6,
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
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
    elevation: 5,
  },
  createButtonText: {
    color: colors.background,
    fontSize: 24,
    fontWeight: 'bold',
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

