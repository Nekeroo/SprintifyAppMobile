import React, { useCallback, useState, useMemo } from 'react';
import { StyleSheet, FlatList, View, Pressable, Modal } from 'react-native';
import { Text } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/hooks/useTheme';

import { useAppDispatch, useAppSelector } from '@/store';
import { getProjects, deleteProject } from '@/store/projectSlice';
import { FontAwesome } from '@expo/vector-icons';

export default function ProjectsScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // <-- nouveau thème
  const { components: styles, colors } = useTheme();

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

  // Styles locaux uniquement pour le layout/positionnement
  const local = useMemo(() => localStyles(colors), [colors]);

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <Text style={styles.text.body1}>Chargement...</Text>
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={styles.container}>
        <Text style={styles.text.body1}>
          {error || 'Erreur lors du chargement des projets'}
        </Text>
      </View>
    );
  }

  if (status === 'succeeded' && projects.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text.body1}>Aucun projet trouvé</Text>
      </View>
    );
  }

  const renderProject = ({ item }: { item: typeof projects[number] }) => {
    return (
      <View style={[styles.card, local.projectCard]}>
        <Pressable onPress={() => handleProjectPress(item.name)} style={{ flex: 1 }}>
          <Text style={styles.text.h2}>{item.name}</Text>
          <Text style={styles.text.body2}>Créé par: {item.usernameOwner}</Text>
          <Text style={styles.text.body2}>Nombre de sprints: {item.nbSprint}</Text>
        </Pressable>

        {/* Bouton supprimer (destructif) */}
        <Pressable
          onPress={() => openDeleteModal(item.name)}
          style={({ pressed }) => [
            styles.button.primary,
            local.deleteButton,
            { backgroundColor: colors.status.error },
            pressed && { opacity: 0.85 },
          ]}
        >
          <FontAwesome name="trash" size={16} color={colors.background.default} />
        </Pressable>
      </View>
    );
  };

  const handleProjectPress = (projectName: string) => {
    router.push({
      pathname: '/(tabs)/project-detail',
      params: { project: projectName },
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.name}
        contentContainerStyle={local.listContainer}
      />

      {/* FAB créer */}
      <Pressable
        style={({ pressed }) => [
          styles.button.primary,
          local.createButton,
          pressed && { opacity: 0.9 },
        ]}
        onPress={() => router.push('/(tabs)/create-project')}
        accessibilityRole="button"
        accessibilityLabel="Créer un projet"
      >
        <Text style={styles.buttonText.primary}>+</Text>
      </Pressable>

      {/* Modale de confirmation */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={local.modalOverlay}>
          <View style={[styles.card, local.modalContent]}>
            <Text style={styles.text.h2}>
              Supprimer le projet « {projectToDelete} » ?
            </Text>
            <View style={local.modalActions}>
              <Pressable
                style={[
                  styles.button.primary,
                  local.modalButton,
                  { backgroundColor: colors.status.error },
                ]}
                onPress={confirmDelete}
              >
                <Text style={styles.buttonText.primary}>Supprimer</Text>
              </Pressable>

              <Pressable
                style={[styles.button.primary, local.modalButton]}
                onPress={cancelDelete}
              >
                <Text style={styles.buttonText.primary}>Annuler</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const localStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    listContainer: {
      paddingBottom: 24,
      rowGap: 16 as any, // si RN < 0.73 n'a pas "gap", ça sera ignoré
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
      borderRadius: 6,
      marginLeft: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    createButton: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      // l'ombre provient déjà de styles.button.primary (shadowStyle.sm)
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalContent: {
      borderRadius: 12,
      padding: 24,
      width: '80%',
      alignItems: 'center',
      rowGap: 16 as any,
      backgroundColor: colors.background.card,
    },
    modalActions: {
      flexDirection: 'row',
      columnGap: 16 as any,
      width: '100%',
    },
    modalButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
  });
