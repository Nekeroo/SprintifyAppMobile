import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { globalStyles, colors, spacing } from '@/styles/theme';
import { displayDateToApi, formatDate, isValidDate } from '@/services/dateUtils';
import { useAppDispatch } from '@/store';
import { createSprint } from '@/store/sprintSlice';

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;

export default function CreateSprintScreen() {
  const { project } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const scrollViewRef = useRef<ScrollView>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const handleNameChange = (text: string) => {
    if (text.length <= MAX_NAME_LENGTH) {
      setName(text);
    }
  };

  const handleDescriptionChange = (text: string) => {
    if (text.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(text);
    }
  };

  const handleCreateSprint = async () => {
    if (!name.trim() || !description.trim() || !startDate.trim() || !endDate.trim()) {
      setError('Tous les champs sont requis');
      return;
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      setError('Format de date invalide (JJ/MM/AAAA)');
      return;
    }

    const startDateStr = displayDateToApi(startDate);
    const endDateStr = displayDateToApi(endDate);

    const startDateObj = new Date(startDateStr);
    const endDateObj = new Date(endDateStr);

    if (endDateObj < startDateObj) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDateObj < today) {
      setError('La date de début ne peut pas être dans le passé');
      return;
    }

    try {
      await dispatch(createSprint({
        projectName: project as string,
        data: {
          name,
          description,
          startDate: startDateStr,
          endDate: endDateStr,
        }
      })).unwrap();

      router.replace({
        pathname: '/(tabs)/project-detail',
        params: {
          project,
          reload: 'true'
        }
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du sprint');
    }
  };

  const scrollToInput = (y: number) => {
    scrollViewRef.current?.scrollTo({ y: y, animated: true });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={globalStyles.container}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={globalStyles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[globalStyles.card, styles.form]}>
          <Text style={globalStyles.title}>Nouveau Sprint</Text>

          <View style={styles.formField}>
            <Text style={styles.label}>Nom <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.inputWithCounter]}
                value={name}
                onChangeText={handleNameChange}
                placeholder="Nom du sprint"
                placeholderTextColor={colors.text.secondary}
                onFocus={() => scrollToInput(0)}
              />
              <Text style={[
                styles.charCount,
                name.length === MAX_NAME_LENGTH && styles.charCountLimit
              ]}>
                {name.length}/{MAX_NAME_LENGTH}
              </Text>
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea, styles.inputWithCounter]}
                value={description}
                onChangeText={handleDescriptionChange}
                placeholder="Description du sprint"
                placeholderTextColor={colors.text.secondary}
                multiline
                numberOfLines={4}
                onFocus={() => scrollToInput(100)}
              />
              <Text style={[
                styles.charCount,
                description.length === MAX_DESCRIPTION_LENGTH && styles.charCountLimit
              ]}>
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </Text>
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Date de début (JJ/MM/AAAA) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, !isValidDate(startDate) && startDate.length > 0 && styles.inputError]}
              value={startDate}
              onChangeText={(text) => setStartDate(formatDate(text))}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
              maxLength={10}
              onFocus={() => scrollToInput(200)}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Date de fin (JJ/MM/AAAA) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, !isValidDate(endDate) && endDate.length > 0 && styles.inputError]}
              value={endDate}
              onChangeText={(text) => setEndDate(formatDate(text))}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
              maxLength={10}
              onFocus={() => scrollToInput(300)}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={({pressed}) => [
              styles.createButton,
              pressed && globalStyles.buttonPressed
            ]}
            onPress={handleCreateSprint}
          >
            <Text style={styles.createButtonText}>Créer le Sprint</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: spacing.md,
  },
  formField: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text.primary,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: spacing.sm,
  },
  inputWithCounter: {
    marginBottom: spacing.xs,
  },
  charCount: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  charCountLimit: {
    color: colors.error,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.error,
    marginBottom: spacing.md,
  },
  required: {
    color: colors.error,
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
  createButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: colors.text.onPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
});
