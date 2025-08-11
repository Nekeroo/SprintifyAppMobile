import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Task } from '@/types/task';
import { FontAwesome } from '@expo/vector-icons';
import { colors, spacing, globalStyles } from '@/styles/theme';
import {
  getTodayString,
  getTomorrowString,
  getNextWeekString,
  displayDateToApi,
  isoToDisplayDate,
} from '@/services/dateUtils';
import { User } from '@/types/auth';
import { userService } from '@/services/user';

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (newTask: Omit<Task, 'id'>) => Promise<void>;
  isCreating: boolean;
  createError: string;
  sprintName: string;
}

const CreateTaskModal = ({
  visible,
  onClose,
  onCreate,
  isCreating,
  createError,
  sprintName,
}: CreateTaskModalProps) => {
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    status: 'TODO',
    dueDate: '',
    usernameAssignee: '',
    storyPoints: 1,
  });

  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // --- États pour la recherche d'assigné ---
  const [selectedAssignee, setSelectedAssignee] = useState<User | null>(null);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [assigneeSuggestions, setAssigneeSuggestions] = useState<User[]>([]);

  // Recherche des assignés avec debounce
  useEffect(() => {
    const searchAssignees = async () => {
      if (assigneeSearch.length >= 3) {
        try {
          const users = await userService.searchUsers(assigneeSearch);
          setAssigneeSuggestions(users);
        } catch (err) {
          console.error("Erreur lors de la recherche d'assignés:", err);
          setAssigneeSuggestions([]);
        }
      } else {
        setAssigneeSuggestions([]);
      }
    };

    const debounceTimeout = setTimeout(searchAssignees, 300);
    return () => clearTimeout(debounceTimeout);
  }, [assigneeSearch]);

  const handleSelectAssignee = (user: User) => {
    setSelectedAssignee(user);
    setNewTask({ ...newTask, usernameAssignee: user.username });
    setAssigneeSearch('');
    setAssigneeSuggestions([]);
  };

  // Reset form quand modal se ferme
  useEffect(() => {
    if (!visible) {
      setNewTask({
        title: '',
        description: '',
        status: 'TODO',
        dueDate: '',
        usernameAssignee: '',
        storyPoints: 1,
      });
      setSelectedAssignee(null);
      setAssigneeSearch('');
      setAssigneeSuggestions([]);
    }
  }, [visible]);

  const handleCreate = async () => {
    await onCreate(newTask);
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvelle tâche</Text>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && globalStyles.buttonPressed,
              ]}
              onPress={onClose}
            >
              <FontAwesome name="times" size={24} color={colors.text.secondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Sprint */}
            <Text style={styles.inputLabel}>Sprint</Text>
            <View style={styles.sprintIndicator}>
              <Text>{sprintName}</Text>
            </View>

            {/* Titre */}
            <Text style={styles.inputLabel}>Titre *</Text>
            <TextInput
              style={styles.input}
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
              placeholder="Titre de la tâche"
            />

            {/* Description */}
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newTask.description}
              onChangeText={(text) => setNewTask({ ...newTask, description: text })}
              placeholder="Description de la tâche"
              multiline
              numberOfLines={4}
            />

            {/* Assigné à */}
            <Text style={styles.inputLabel}>Assigné à</Text>
            {selectedAssignee ? (
              <View style={styles.selectedUserContainer}>
                <View style={styles.selectedUserInfo}>
                  <Text style={globalStyles.textBody}>{selectedAssignee.username}</Text>
                  {selectedAssignee.email && (
                    <Text style={globalStyles.textTertiary}>{selectedAssignee.email}</Text>
                  )}
                </View>
                <Pressable
                  onPress={() => {
                    setSelectedAssignee(null);
                    setNewTask({ ...newTask, usernameAssignee: '' });
                  }}
                  style={({ pressed }) => [
                    styles.clearButton,
                    pressed && globalStyles.buttonPressed,
                  ]}
                >
                  <FontAwesome name="times" size={16} color={colors.text.secondary} />
                </Pressable>
              </View>
            ) : (
              <>
                <TextInput
                  style={globalStyles.input}
                  placeholder="Rechercher un utilisateur"
                  value={assigneeSearch}
                  onChangeText={setAssigneeSearch}
                  editable={!isCreating}
                />
                {assigneeSuggestions.length > 0 && (
                  <ScrollView
                    style={styles.suggestionsContainer}
                    keyboardShouldPersistTaps="handled"
                  >
                    {assigneeSuggestions.map((user) => (
                      <Pressable
                        key={user.username}
                        style={({ pressed }) => [
                          styles.suggestionItem,
                          pressed && globalStyles.buttonPressed,
                        ]}
                        onPress={() => handleSelectAssignee(user)}
                      >
                        <Text style={globalStyles.textBody}>{user.username}</Text>
                        {user.email && (
                          <Text style={globalStyles.textTertiary}>{user.email}</Text>
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </>
            )}

            {/* Points de story */}
            <Text style={styles.inputLabel}>Points de story</Text>
            <View style={styles.pointsSelector}>
              {[1, 2, 3, 5, 8, 13].map((points) => (
                <Pressable
                  key={points}
                  style={({ pressed }) => [
                    styles.pointsOption,
                    newTask.storyPoints === points && styles.selectedPoints,
                    pressed && globalStyles.buttonPressed,
                  ]}
                  onPress={() => setNewTask({ ...newTask, storyPoints: points })}
                >
                  <Text
                    style={[
                      styles.pointsText,
                      newTask.storyPoints === points && styles.selectedPointsText,
                    ]}
                  >
                    {points}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Date d'échéance */}
            <Text style={styles.inputLabel}>Date d'échéance</Text>
            <Pressable
              style={styles.datePickerButton}
              onPress={() => setShowDueDatePicker(!showDueDatePicker)}
            >
              <Text>
                {newTask.dueDate
                  ? isoToDisplayDate(newTask.dueDate)
                  : 'Aucune date définie'}
              </Text>
              <FontAwesome name="calendar" size={16} color={colors.text.secondary} />
            </Pressable>

            {showDueDatePicker && (
              <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerTitle}>Sélectionner une date</Text>
                <View style={styles.dateOptions}>
                  <DateOption
                    label="Aujourd'hui"
                    onPress={() => {
                      setNewTask({
                        ...newTask,
                        dueDate: displayDateToApi(getTodayString()),
                      });
                      setShowDueDatePicker(false);
                    }}
                  />
                  <DateOption
                    label="Demain"
                    onPress={() => {
                      setNewTask({
                        ...newTask,
                        dueDate: displayDateToApi(getTomorrowString()),
                      });
                      setShowDueDatePicker(false);
                    }}
                  />
                  <DateOption
                    label="Dans 1 semaine"
                    onPress={() => {
                      setNewTask({
                        ...newTask,
                        dueDate: displayDateToApi(getNextWeekString()),
                      });
                      setShowDueDatePicker(false);
                    }}
                  />
                  <DateOption
                    label="Aucune"
                    onPress={() => {
                      setNewTask({ ...newTask, dueDate: '' });
                      setShowDueDatePicker(false);
                    }}
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelDateButton,
                    pressed && globalStyles.buttonPressed,
                  ]}
                  onPress={() => setShowDueDatePicker(false)}
                >
                  <Text style={styles.cancelDateButtonText}>Fermer</Text>
                </Pressable>
              </View>
            )}

            {createError ? (
              <Text style={styles.errorText}>{createError}</Text>
            ) : null}

            <Text style={styles.requiredFieldNote}>* Champ obligatoire</Text>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && globalStyles.buttonPressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.createButton,
                (!newTask.title || isCreating) && styles.createButtonDisabled,
                pressed && newTask.title && !isCreating && globalStyles.buttonPressed,
              ]}
              onPress={handleCreate}
              disabled={!newTask.title || isCreating}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color={colors.text.primary} />
              ) : (
                <Text style={styles.createButtonText}>Créer</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Petit composant interne pour éviter de répéter du code pour les options de date
const DateOption = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable
    style={({ pressed }) => [
      styles.dateOption,
      pressed && globalStyles.buttonPressed,
    ]}
    onPress={onPress}
  >
    <Text style={styles.dateOptionText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalView: {
    flex: 1,
    backgroundColor: colors.background.primary,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background.primary,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
    padding: spacing.sm,
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sprintIndicator: {
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  datePickerButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
    padding: spacing.sm,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.md,
  },
  requiredFieldNote: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: colors.text.primary,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: colors.text.primary,
  },
  pointsSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  pointsOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedPoints: {
    backgroundColor: colors.primary,
  },
  pointsText: {
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  selectedPointsText: {
    color: colors.text.primary,
  },
  datePickerContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.md,
    color: colors.text.primary,
    textAlign: 'center',
  },
  dateOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dateOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    margin: spacing.xs,
    minWidth: 110,
    alignItems: 'center',
  },
  dateOptionText: {
    color: colors.text.primary,
    fontWeight: '500',
  },
  cancelDateButton: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 4,
  },
  cancelDateButtonText: {
    color: colors.text.primary,
    fontWeight: '500',
  },
  selectedUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  selectedUserInfo: {
    flex: 1,
  },
  clearButton: {
    padding: spacing.xs,
  },
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  suggestionItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});

export default CreateTaskModal;
