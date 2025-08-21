import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Task } from '@/types/task';
import { FontAwesome } from '@expo/vector-icons';
import { colors, spacing, globalStyles } from '@/styles/theme';
import { getTodayString, getTomorrowString, getNextWeekString, dateToString, displayDateToApi, isoToDisplayDate } from '@/services/dateUtils';

interface EditTaskModalProps {
  visible: boolean;
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => Promise<void>;
  isUpdating: boolean;
  updateError: string;
}

const EditTaskModal = ({ 
  visible, 
  task, 
  onClose, 
  onUpdate, 
  isUpdating, 
  updateError
}: EditTaskModalProps) => {
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  
  // Statuts disponibles pour les tâches
  const availableStatuses = ['TODO', 'IN_PROGRESS', 'IN_TEST', 'DONE'];

  // Reset edited task when the modal opens with a new task
  React.useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleSave = async () => {
    await onUpdate(editedTask);
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
            <Text style={styles.modalTitle}>Détails de la tâche</Text>
            <Pressable
              style={({pressed}) => [
                styles.closeButton,
                pressed && globalStyles.buttonPressed
              ]}
              onPress={onClose}
            >
              <FontAwesome name="times" size={24} color={colors.text.secondary} />
            </Pressable>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Titre</Text>
            <TextInput
              style={styles.input}
              value={editedTask.title}
              onChangeText={(text) => setEditedTask({...editedTask, title: text})}
              placeholder="Titre de la tâche"
            />
            
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedTask.description}
              onChangeText={(text) => setEditedTask({...editedTask, description: text})}
              placeholder="Description de la tâche"
              multiline
              numberOfLines={4}
            />
            
            <Text style={styles.inputLabel}>Statut</Text>
            <View style={styles.statusSelector}>
              {availableStatuses.map((status) => (
                <Pressable
                  key={status}
                  style={({pressed}) => [
                    styles.statusOption,
                    editedTask.status === status && styles.selectedStatus,
                    pressed && globalStyles.buttonPressed
                  ]}
                  onPress={() => setEditedTask({...editedTask, status: status})}
                >
                  <Text
                    style={[
                      styles.statusText,
                      editedTask.status === status && styles.selectedStatusText
                    ]}
                  >
                    {status}
                  </Text>
                </Pressable>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Assigné à</Text>
            <TextInput
              style={styles.input}
              value={editedTask.usernameAssignee}
              onChangeText={(text) => setEditedTask({...editedTask, usernameAssignee: text})}
              placeholder="Username de l'assigné"
            />
            
            <Text style={styles.inputLabel}>Points de story</Text>
            <View style={styles.pointsSelector}>
              {[1, 2, 3, 5, 8, 13].map((points) => (
                <Pressable
                  key={points}
                  style={({pressed}) => [
                    styles.pointsOption,
                    editedTask.storyPoints === points && styles.selectedPoints,
                    pressed && globalStyles.buttonPressed
                  ]}
                  onPress={() => setEditedTask({...editedTask, storyPoints: points})}
                >
                  <Text
                    style={[
                      styles.pointsText,
                      editedTask.storyPoints === points && styles.selectedPointsText
                    ]}
                  >
                    {points}
                  </Text>
                </Pressable>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Date d'échéance</Text>
            <Pressable
              style={styles.datePickerButton}
              onPress={() => setShowDueDatePicker(!showDueDatePicker)}
            >
              <Text>
                {editedTask.dueDate 
                  ? isoToDisplayDate(editedTask.dueDate) 
                  : 'Aucune date définie'}
              </Text>
              <FontAwesome name="calendar" size={16} color={colors.text.secondary} />
            </Pressable>
            
            {showDueDatePicker && (
              <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerTitle}>Sélectionner une date</Text>
                
                <View style={styles.dateOptions}>
                  <Pressable
                    style={({pressed}) => [
                      styles.dateOption,
                      pressed && globalStyles.buttonPressed
                    ]}
                    onPress={() => {
                      const todayIso = displayDateToApi(getTodayString());
                      setEditedTask({...editedTask, dueDate: todayIso});
                      setShowDueDatePicker(false);
                    }}
                  >
                    <Text style={styles.dateOptionText}>Aujourd'hui</Text>
                  </Pressable>
                  
                  <Pressable
                    style={({pressed}) => [
                      styles.dateOption,
                      pressed && globalStyles.buttonPressed
                    ]}
                    onPress={() => {
                      const tomorrowIso = displayDateToApi(getTomorrowString());
                      setEditedTask({...editedTask, dueDate: tomorrowIso});
                      setShowDueDatePicker(false);
                    }}
                  >
                    <Text style={styles.dateOptionText}>Demain</Text>
                  </Pressable>
                  
                  <Pressable
                    style={({pressed}) => [
                      styles.dateOption,
                      pressed && globalStyles.buttonPressed
                    ]}
                    onPress={() => {
                      const nextWeekIso = displayDateToApi(getNextWeekString());
                      setEditedTask({...editedTask, dueDate: nextWeekIso});
                      setShowDueDatePicker(false);
                    }}
                  >
                    <Text style={styles.dateOptionText}>Dans 1 semaine</Text>
                  </Pressable>
                  
                  <Pressable
                    style={({pressed}) => [
                      styles.dateOption,
                      pressed && globalStyles.buttonPressed
                    ]}
                    onPress={() => {
                      setEditedTask({...editedTask, dueDate: ''});
                      setShowDueDatePicker(false);
                    }}
                  >
                    <Text style={styles.dateOptionText}>Aucune</Text>
                  </Pressable>
                </View>
                
                <Pressable
                  style={({pressed}) => [
                    styles.cancelDateButton,
                    pressed && globalStyles.buttonPressed
                  ]}
                  onPress={() => setShowDueDatePicker(false)}
                >
                  <Text style={styles.cancelDateButtonText}>Fermer</Text>
                </Pressable>
              </View>
            )}
            
            {updateError ? (
              <Text style={styles.errorText}>{updateError}</Text>
            ) : null}
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <Pressable
              style={({pressed}) => [
                styles.cancelButton,
                pressed && globalStyles.buttonPressed
              ]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </Pressable>
            
            <Pressable
              style={({pressed}) => [
                styles.saveButton,
                isUpdating && styles.saveButtonDisabled,
                pressed && !isUpdating && globalStyles.buttonPressed
              ]}
              onPress={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color={colors.text.onPrimary} />
              ) : (
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
    color: colors.text.onPrimary,
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
    color: colors.text.onPrimary,
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
    color: colors.text.onPrimary,
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
    color: colors.text.onPrimary,
    fontWeight: '500',
  },
});

export default EditTaskModal;
