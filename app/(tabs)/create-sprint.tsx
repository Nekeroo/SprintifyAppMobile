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
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  });
  const [globalError, setGlobalError] = useState('');

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'name':
        if (!value.trim()) {
          return 'Le nom du sprint est requis';
        }
        if (value.length > MAX_NAME_LENGTH) {
          return `Le nom ne doit pas dépasser ${MAX_NAME_LENGTH} caractères`;
        }
        return '';
      case 'description':
        if (!value.trim()) {
          return 'La description est requise';
        }
        if (value.length > MAX_DESCRIPTION_LENGTH) {
          return `La description ne doit pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères`;
        }
        return '';
      case 'startDate':
        if (!value.trim()) {
          return 'La date de début est requise';
        }
        if (!isValidDate(value)) {
          return 'Format de date invalide (JJ/MM/AAAA)';
        }
        const startDateObj = new Date(displayDateToApi(value));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDateObj < today) {
          return 'La date de début ne peut pas être dans le passé';
        }
        return '';
      case 'endDate':
        if (!value.trim()) {
          return 'La date de fin est requise';
        }
        if (!isValidDate(value)) {
          return 'Format de date invalide (JJ/MM/AAAA)';
        }
        if (startDate && isValidDate(startDate)) {
          const startDateObj = new Date(displayDateToApi(startDate));
          const endDateObj = new Date(displayDateToApi(value));
          if (endDateObj < startDateObj) {
            return 'La date de fin doit être après la date de début';
          }
        }
        return '';
    }
    return '';
  };

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'name') {
      if (value.length <= MAX_NAME_LENGTH) {
        setName(value);
      }
    } else if (field === 'description') {
      if (value.length <= MAX_DESCRIPTION_LENGTH) {
        setDescription(value);
      }
    } else if (field === 'startDate') {
      setStartDate(formatDate(value));
      // Re-validate endDate when startDate changes
      if (endDate) {
        const endDateError = validateField('endDate', endDate);
        setErrors(prev => ({ ...prev, endDate: endDateError }));
      }
    } else if (field === 'endDate') {
      setEndDate(formatDate(value));
    }
    
    const error = validateField(field, field === 'startDate' || field === 'endDate' ? formatDate(value) : value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleNameChange = (text: string) => {
    handleFieldChange('name', text);
  };

  const handleDescriptionChange = (text: string) => {
    handleFieldChange('description', text);
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField('name', name),
      description: validateField('description', description),
      startDate: validateField('startDate', startDate),
      endDate: validateField('endDate', endDate)
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleCreateSprint = async () => {
    if (!validateForm()) return;

    try {
      setGlobalError('');
      const startDateStr = displayDateToApi(startDate);
      const endDateStr = displayDateToApi(endDate);
      
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
      setGlobalError(err.message || 'Erreur lors de la création du sprint');
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

          {globalError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{globalError}</Text>
            </View>
          )}

          <View style={styles.formField}>
            <Text style={styles.label}>Nom <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input, 
                  styles.inputWithCounter,
                  errors.name ? styles.inputError : null
                ]}
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
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input, 
                  styles.textArea, 
                  styles.inputWithCounter,
                  errors.description ? styles.inputError : null
                ]}
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
              {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Date de début (JJ/MM/AAAA) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[
                styles.input, 
                errors.startDate ? styles.inputError : null
              ]}
              value={startDate}
              onChangeText={(text) => handleFieldChange('startDate', text)}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
              maxLength={10}
              onFocus={() => scrollToInput(200)}
            />
            {errors.startDate ? <Text style={styles.errorText}>{errors.startDate}</Text> : null}
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Date de fin (JJ/MM/AAAA) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[
                styles.input, 
                errors.endDate ? styles.inputError : null
              ]}
              value={endDate}
              onChangeText={(text) => handleFieldChange('endDate', text)}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
              maxLength={10}
              onFocus={() => scrollToInput(300)}
            />
            {errors.endDate ? <Text style={styles.errorText}>{errors.endDate}</Text> : null}
          </View>


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
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
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
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 1,
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
