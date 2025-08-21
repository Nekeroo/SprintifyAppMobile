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
import { taskService } from '@/services/task';

const MAX_TITLE_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;

interface EditTaskModalProps {
  visible: boolean;
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => Promise<void>;
  isUpdating?: boolean;
  updateError?: string | null;
}

const EditTaskModal = ({
  visible,
  task,
  onClose,
  onUpdate,
  isUpdating = false,
  updateError,
}: EditTaskModalProps) => {
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // --- États pour la recherche d'assigné ---
  const [selectedAssignee, setSelectedAssignee] = useState<User | null>(null);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [assigneeSuggestions, setAssigneeSuggestions] = useState<User[]>([]);

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    assignee: '',
    storyPoints: '',
    dueDate: ''
  });
  const [globalError, setGlobalError] = useState('');

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
    setEditedTask({ ...editedTask, usernameAssignee: user.username });
    setAssigneeSearch('');
    setAssigneeSuggestions([]);
    const error = validateField('assignee', user);
    setErrors(prev => ({ ...prev, assignee: error }));
  };

  // Reset form when task changes
  useEffect(() => {
    setEditedTask(task);
    setAssigneeSearch('');
    setAssigneeSuggestions([]);
    setErrors({
      name: '',
      description: '',
      assignee: '',
      storyPoints: '',
      dueDate: ''
    });
    setGlobalError('');
    
    // Find and set the current assignee
    if (task.usernameAssignee) {
      userService.searchUsers(task.usernameAssignee).then(users => {
        const assignee = users.find(u => u.username === task.usernameAssignee);
        if (assignee) {
          setSelectedAssignee(assignee);
        }
      }).catch(() => {});
    } else {
      setSelectedAssignee(null);
    }
  }, [task]);

  const validateField = (field: string, value: any) => {
    switch (field) {
      case 'name':
      case 'title':
        if (!value || !value.trim()) {
          return 'Le titre est requis';
        }
        if (value.length > MAX_TITLE_LENGTH) {
          return `Le titre ne doit pas dépasser ${MAX_TITLE_LENGTH} caractères`;
        }
        return '';
      case 'description':
        if (!value || !value.trim()) {
          return 'La description est requise';
        }
        if (value.length > MAX_DESCRIPTION_LENGTH) {
          return `La description ne doit pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères`;
        }
        return '';
      case 'assignee':
        if (!selectedAssignee) {
          return 'L\'assignation à un utilisateur est requise';
        }
        return '';
      case 'storyPoints':
        if (!value || value < 0) {
          return 'Les points de story doivent être positifs';
        }
        if (!value) {
          return 'Les points de story sont requis';
        }
        return '';
      case 'dueDate':
        if (!value) {
          return 'La date d\'échéance est requise';
        }
        return '';
    }
    return '';
  };

  const handleFieldChange = (field: string, value: any) => {
    if (field === 'title') {
      if (value.length <= MAX_TITLE_LENGTH) {
        setEditedTask({ ...editedTask, title: value });
      }
    } else if (field === 'description') {
      if (value.length <= MAX_DESCRIPTION_LENGTH) {
        setEditedTask({ ...editedTask, description: value });
      }
    } else if (field === 'storyPoints') {
      setEditedTask({ ...editedTask, storyPoints: value });
    } else if (field === 'dueDate') {
      setEditedTask({ ...editedTask, dueDate: value });
    } else if (field === 'status') {
      setEditedTask({ ...editedTask, status: value });
    }
    
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleTitleChange = (text: string) => {
    handleFieldChange('title', text);
  };

  const handleDescriptionChange = (text: string) => {
    handleFieldChange('description', text);
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField('name', editedTask.title),
      description: validateField('description', editedTask.description),
      assignee: validateField('assignee', selectedAssignee),
      storyPoints: validateField('storyPoints', editedTask.storyPoints),
      dueDate: validateField('dueDate', editedTask.dueDate)
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setGlobalError('');
      const taskToUpdate = {
        ...editedTask,
        usernameAssignee: selectedAssignee?.username || editedTask.usernameAssignee
      };
      await onUpdate(taskToUpdate);
      onClose();
    } catch (err: any) {
      if (err.message.includes('authentification')) {
        setGlobalError('Erreur d\'authentification. Veuillez vous reconnecter.');
      } else {
        setGlobalError(err.message || 'Erreur lors de la mise à jour de la tâche');
      }
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
            <Text style={styles.modalTitle}>Modifier la tâche</Text>
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

          {globalError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{globalError}</Text>
            </View>
          )}

          <ScrollView 
            ref={scrollViewRef}
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Statut */}
            <Text style={styles.inputLabel}>Statut</Text>
            <View style={styles.statusSelector}>
              {['TODO', 'IN_PROGRESS', 'IN_TEST', 'DONE'].map((status) => (
                <Pressable
                  key={status}
                  style={({ pressed }) => [
                    styles.statusOption,
                    editedTask.status === status && styles.selectedStatus,
                    pressed && globalStyles.buttonPressed,
                  ]}
                  onPress={() => {
                    handleFieldChange('status', status);
                    scrollToInput(0);
                  }}
                  disabled={isUpdating}
                >
                  <Text
                    style={[
                      styles.statusText,
                      editedTask.status === status && styles.selectedStatusText,
                    ]}
                  >
                    {status}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Titre */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Titre <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[
                  styles.input, 
                  styles.inputWithCounter,
                  errors.name ? styles.inputError : null
                ]}
                value={editedTask.title}
                onChangeText={handleTitleChange}
                placeholder="Titre de la tâche"
                placeholderTextColor={colors.text.secondary}
                onFocus={() => scrollToInput(100)}
              />
              <Text style={[
                styles.charCount,
                editedTask.title.length > MAX_TITLE_LENGTH && styles.charCountLimit
              ]}>
                {editedTask.title.length}/{MAX_TITLE_LENGTH}
              </Text>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[
                  styles.input, 
                  styles.textArea, 
                  styles.inputWithCounter,
                  errors.description ? styles.inputError : null
                ]}
                value={editedTask.description}
                onChangeText={handleDescriptionChange}
                placeholder="Description de la tâche"
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={4}
                onFocus={() => scrollToInput(200)}
              />
              <Text style={[
                styles.charCount,
                editedTask.description.length > MAX_DESCRIPTION_LENGTH && styles.charCountLimit
              ]}>
                {editedTask.description.length}/{MAX_DESCRIPTION_LENGTH}
              </Text>
              {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
            </View>

            {/* Assigné à */}
            <Text style={styles.inputLabel}>Assigné à <Text style={styles.required}>*</Text></Text>
            {selectedAssignee ? (
              <View style={styles.selectedUserContainer}>
                <View style={styles.selectedUserInfo}>
                  <Text>{selectedAssignee.username}</Text>
                </View>
                <Pressable
                  onPress={() => {
                    setSelectedAssignee(null);
                    setEditedTask({ ...editedTask, usernameAssignee: '' });
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
                  style={[
                    styles.input,
                    errors.assignee ? styles.inputError : null
                  ]}
                  value={assigneeSearch}
                  onChangeText={setAssigneeSearch}
                  placeholder="Rechercher un utilisateur..."
                  placeholderTextColor={colors.text.secondary}
                  editable={!isUpdating}
                  onFocus={() => scrollToInput(300)}
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
            {errors.assignee ? <Text style={styles.errorText}>{errors.assignee}</Text> : null}

            {/* Points de story */}
            <Text style={styles.inputLabel}>Points de story <Text style={styles.required}>*</Text></Text>
            <View style={styles.pointsSelector}>
              {[1, 2, 3, 5, 8, 13].map((points) => (
                <Pressable
                  key={points}
                  style={({ pressed }) => [
                    styles.pointsOption,
                    editedTask.storyPoints === points && styles.selectedPoints,
                    pressed && globalStyles.buttonPressed,
                  ]}
                  onPress={() => {
                    handleFieldChange('storyPoints', points);
                    scrollToInput(400);
                  }}
                  disabled={isUpdating}
                >
                  <Text
                    style={[
                      styles.pointsText,
                      editedTask.storyPoints === points && styles.selectedPointsText,
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
              onPress={() => {
                setShowDueDatePicker(true);
                scrollToInput(500);
              }}
              disabled={isUpdating}
            >
              <Text>
                {editedTask.dueDate ? isoToDisplayDate(editedTask.dueDate) : "Sélectionner une date"}
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
                      const todayDate = displayDateToApi(getTodayString());
                      setEditedTask({
                        ...editedTask,
                        dueDate: todayDate,
                      });
                      handleFieldChange('dueDate', todayDate);
                      setShowDueDatePicker(false);
                    }}
                  />
                  <DateOption
                    label="Demain"
                    onPress={() => {
                      const tomorrowDate = displayDateToApi(getTomorrowString());
                      setEditedTask({
                        ...editedTask,
                        dueDate: tomorrowDate,
                      });
                      handleFieldChange('dueDate', tomorrowDate);
                      setShowDueDatePicker(false);
                    }}
                  />
                  <DateOption
                    label="Dans 1 semaine"
                    onPress={() => {
                      const nextWeekDate = displayDateToApi(getNextWeekString());
                      setEditedTask({
                        ...editedTask,
                        dueDate: nextWeekDate,
                      });
                      handleFieldChange('dueDate', nextWeekDate);
                      setShowDueDatePicker(false);
                    }}
                  />
                  <DateOption
                    label="Aucune"
                    onPress={() => {
                      setEditedTask({ ...editedTask, dueDate: '' });
                      handleFieldChange('dueDate', '');
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
            {errors.dueDate ? <Text style={styles.errorText}>{errors.dueDate}</Text> : null}

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
                  styles.saveButton,
                  isUpdating && styles.saveButtonDisabled,
                  pressed && globalStyles.buttonPressed,
                ]}
                onPress={handleSave}
                disabled={isUpdating}
              >
                <Text style={styles.saveButtonText}>
                  {isUpdating ? 'Mise à jour...' : 'Sauvegarder'}
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
  datePickerButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
    padding: spacing.sm,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  errorMessage: {
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 1,
  },
  requiredFieldNote: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
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
  statusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  statusOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: 4,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedStatus: {
    backgroundColor: colors.primary,
  },
  statusText: {
    color: colors.text.primary,
  },
  selectedStatusText: {
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

export default EditTaskModal;
