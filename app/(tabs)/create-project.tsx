import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import { projectService } from '@/services/project';
import { userService } from '@/services/user';
import { useRouter } from 'expo-router';
import { User } from '@/types/auth';
import { globalStyles, colors, spacing } from '@/styles/theme';
import { FontAwesome } from '@expo/vector-icons';

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;

export default function CreateProjectScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    owner: ''
  });
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const searchUsers = async () => {
      if (userSearch.length >= 3) {
        try {
          const users = await userService.searchUsers(userSearch);
          setUserSuggestions(users);
        } catch (err) {
          console.error('Erreur lors de la recherche d\'utilisateurs:', err);
          setUserSuggestions([]);
        }
      } else {
        setUserSuggestions([]);
      }
    };

    const debounceTimeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [userSearch]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setUserSearch(user.username);
    setUserSuggestions([]);
    const error = validateField('owner', '');
    setErrors(prev => ({ ...prev, owner: error }));
  };

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'name':
        if (!value.trim()) {
          return 'Le nom du projet est requis';
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
      case 'owner':
        if (!selectedUser) {
          return 'Le propriétaire est requis';
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
    }
    
    const error = validateField(field, value);
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
      owner: validateField('owner', '')
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setGlobalError(null);
      await projectService.createProject({
        name: name.trim(),
        description: description.trim(),
        owner: selectedUser
      });

      // Retourner à la liste des projets et forcer un rafraîchissement
      router.replace('/(tabs)/projects');
    } catch (err) {
      setGlobalError('Erreur lors de la création du projet');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={globalStyles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={globalStyles.title}>Créer un nouveau projet</Text>

            {globalError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorMessage}>{globalError}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                  style={[
                    globalStyles.input, 
                    styles.inputWithCounter,
                    errors.name ? styles.inputError : null
                  ]}
                  placeholder="Nom du projet"
                  value={name}
                  onChangeText={handleNameChange}
                  editable={!isSubmitting}
                  maxLength={MAX_NAME_LENGTH}
              />
              <Text style={[
                globalStyles.textTertiary,
                styles.charCounter,
                name.length === MAX_NAME_LENGTH && styles.charCounterLimit
              ]}>
                {name.length}/{MAX_NAME_LENGTH}
              </Text>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                  style={[
                    globalStyles.input, 
                    styles.textArea, 
                    styles.inputWithCounter,
                    errors.description ? styles.inputError : null
                  ]}
                  placeholder="Description du projet"
                  value={description}
                  onChangeText={handleDescriptionChange}
                  multiline
                  numberOfLines={4}
                  editable={!isSubmitting}
                  maxLength={MAX_DESCRIPTION_LENGTH}
              />
              <Text style={[
                globalStyles.textTertiary,
                styles.charCounter,
                description.length === MAX_DESCRIPTION_LENGTH && styles.charCounterLimit
              ]}>
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </Text>
              {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
            </View>

            <View style={styles.userSearchContainer}>
              <Text style={[globalStyles.subtitle, styles.sectionTitle]}>
                Propriétaire du projet <Text style={styles.required}>*</Text>
              </Text>
              {selectedUser ? (
                  <View style={styles.selectedUserContainer}>
                    <View style={styles.selectedUserInfo}>
                      <Text style={globalStyles.textBody}>{selectedUser.username}</Text>
                      {selectedUser.email && (
                          <Text style={globalStyles.textTertiary}>{selectedUser.email}</Text>
                      )}
                    </View>
                    <Pressable
                        onPress={() => setSelectedUser(null)}
                        style={({pressed}) => [
                          styles.clearButton,
                          pressed && globalStyles.buttonPressed
                        ]}
                    >
                      <FontAwesome name="times" size={16} color={colors.text.secondary} />
                    </Pressable>
                  </View>
              ) : (
                  <>
                    <TextInput
                        style={[
                          globalStyles.input,
                          errors.owner ? styles.inputError : null
                        ]}
                        placeholder="Rechercher un propriétaire"
                        value={userSearch}
                        onChangeText={setUserSearch}
                        editable={!isSubmitting}
                    />
                    {userSuggestions.length > 0 && (
                        <ScrollView
                            style={styles.suggestionsContainer}
                            keyboardShouldPersistTaps="handled"
                        >
                          {userSuggestions.map((user) => (
                              <Pressable
                                  key={user.username}
                                  style={({pressed}) => [
                                    styles.suggestionItem,
                                    pressed && globalStyles.buttonPressed
                                  ]}
                                  onPress={() => handleSelectUser(user)}
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
              {errors.owner ? <Text style={styles.errorText}>{errors.owner}</Text> : null}
            </View>
            
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
                style={({pressed}) => [
                  globalStyles.button,
                  styles.submitButton,
                  pressed && globalStyles.buttonPressed,
                  isSubmitting && globalStyles.buttonDisabled
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
            >
              <Text style={globalStyles.buttonText}>
                {isSubmitting ? 'Création...' : 'Créer le projet'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  formContainer: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 500,
    padding: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputWithCounter: {
    marginBottom: spacing.xs,
  },
  charCounter: {
    textAlign: 'right',
    fontSize: 12,
  },
  charCounterLimit: {
    color: colors.error,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  userSearchContainer: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedUserInfo: {
    flex: 1,
  },
  clearButton: {
    padding: spacing.xs,
  },
  buttonContainer: {
    padding: spacing.md,
  },
  submitButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 500,
  },
  required: {
    color: colors.error,
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 1,
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
});
