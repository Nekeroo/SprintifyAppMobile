import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TaskCreationPayload
} from '@/types/task';
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

const MAX_TITLE_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (newTask: TaskCreationPayload) => Promise<void>;
  isCreating: boolean;
  sprintName: string;
}

const CreateTaskModal = ({
  visible,
  onClose,
  onCreate,
  isCreating,
  sprintName,
}: CreateTaskModalProps) => {
  const [newTask, setNewTask] = useState<TaskCreationPayload>({
    name: '',
    description: '',
    dueDate: '',
    storyPoints: 1,
    assignee: ''
  });

  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // --- États pour la recherche d'assigné ---
  const [selectedAssignee, setSelectedAssignee] = useState<User | null>(null);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [assigneeSuggestions, setAssigneeSuggestions] = useState<User[]>([]);

  const [error, setError] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);

  // Fonction pour scroller vers un élément
  const scrollToInput = (y: number) => {
    scrollViewRef.current?.scrollTo({ y: y, animated: true });
  };

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
    setNewTask({ ...newTask, assignee: user.username });
    setAssigneeSearch('');
    setAssigneeSuggestions([]);
  };

  // Reset form quand modal se ferme
  useEffect(() => {
    if (!visible) {
      setNewTask({
        name: '',
        description: '',
        dueDate: '',
        storyPoints: 1,
        assignee: ''
      });
      setSelectedAssignee(null);
      setAssigneeSearch('');
      setAssigneeSuggestions([]);
    }
  }, [visible]);

  const handleTitleChange = (text: string) => {
    if (text.length <= MAX_TITLE_LENGTH) {
      setNewTask({ ...newTask, name: text });
    }
  };

  const handleDescriptionChange = (text: string) => {
    if (text.length <= MAX_DESCRIPTION_LENGTH) {
      setNewTask({ ...newTask, description: text });
    }
  };

  const handleCreate = async () => {
    // Validation des champs requis
    if (!newTask.name.trim()) {
      setError('Le titre est requis');
      return;
    }

    if (newTask.storyPoints < 0) {
      setError('Les points de story doivent être positifs');
      return;
    }

    if (!newTask.dueDate) {
      setError('La date d\'échéance est requise');
      return;
    }

    if (newTask.name.length > MAX_TITLE_LENGTH) {
      setError('Le titre ne doit pas dépasser 50 caractères');
      return;
    }

    if (newTask.description.length > MAX_DESCRIPTION_LENGTH) {
      setError('La description ne doit pas dépasser 500 caractères');
      return;
    }

    try {
      await onCreate({
        ...newTask,
        assignee: selectedAssignee?.username || ''
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la tâche');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" || Platform.OS === "android" ? "padding" : "height"}
        style={styles.modalContainer}
      >
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

          <ScrollView 
            ref={scrollViewRef}
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Sprint */}
            <Text style={styles.inputLabel}>Sprint</Text>
            <View style={styles.sprintIndicator}>
              <Text>{sprintName}</Text>
            </View>

            {/* Titre */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Titre <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, styles.inputWithCounter]}
                value={newTask.name}
                onChangeText={handleTitleChange}
                placeholder="Titre de la tâche"
                placeholderTextColor={colors.text.secondary}
                onFocus={() => scrollToInput(0)}
              />
              <Text style={[
                styles.charCount,
                newTask.name.length > MAX_TITLE_LENGTH && styles.charCountLimit
              ]}>
                {newTask.name.length}/{MAX_TITLE_LENGTH}
              </Text>
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, styles.inputWithCounter]}
                value={newTask.description}
                onChangeText={handleDescriptionChange}
                placeholder="Description de la tâche"
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={4}
                onFocus={() => scrollToInput(100)}
              />
              <Text style={[
                styles.charCount,
                newTask.description.length > MAX_DESCRIPTION_LENGTH && styles.charCountLimit
              ]}>
                {newTask.description.length}/{MAX_DESCRIPTION_LENGTH}
              </Text>
            </View>

            {/* Assigné à */}
            <Text style={styles.inputLabel}>Assigné à</Text>
            {selectedAssignee ? (
              <View style={styles.selectedUserContainer}>
                <View style={styles.selectedUserInfo}>
                  <Text>{selectedAssignee.username}</Text>
                </View>
                <Pressable
                  onPress={() => {
                    setSelectedAssignee(null);
                    setNewTask({ ...newTask, assignee: '' });
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
                  style={styles.input}
                  value={assigneeSearch}
                  onChangeText={setAssigneeSearch}
                  placeholder="Rechercher un utilisateur..."
                  placeholderTextColor={colors.text.secondary}
                  editable={!isCreating}
                  onFocus={() => scrollToInput(200)}
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
                  disabled={isCreating}
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
            <Text style={styles.inputLabel}>Date d'échéance <Text style={styles.required}>*</Text></Text>
            <Pressable
              style={styles.datePickerButton}
              onPress={() => setShowDueDatePicker(true)}
              disabled={isCreating}
            >
              <Text>
                {newTask.dueDate ? isoToDisplayDate(newTask.dueDate) : "Sélectionner une date"}
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

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.requiredFieldNote}>* Champs requis</Text>

            <View style={styles.modalActions}>
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
                  (isCreating || !newTask.name.trim() || !newTask.dueDate || newTask.storyPoints < 0) && styles.createButtonDisabled,
                  pressed && globalStyles.buttonPressed,
                ]}
                onPress={handleCreate}
                disabled={isCreating || !newTask.name.trim() || !newTask.dueDate || newTask.storyPoints < 0}
              >
                <Text style={styles.createButtonText}>
                  {isCreating ? 'Création...' : 'Créer'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  },
  modalView: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
  inputContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  inputWithCounter: {
    marginBottom: spacing.xs,
  },
  charCount: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    position: 'absolute',
    right: 0,
    bottom: -20,
  },
  charCountLimit: {
    color: colors.error,
  },
  required: {
    color: colors.error,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background.primary,
  },
});

export default CreateTaskModal;
