import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, Pressable, Text } from 'react-native';
import { projectService } from '@/services/project';
import { userService } from '@/services/user';
import { useRouter } from 'expo-router';
import { User } from '@/types/user';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/base/Card';

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;

export default function CreateProjectScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
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
  };

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

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !selectedUser) {
      setError('Le nom, la description et le propriétaire sont requis');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await projectService.createProject({
        name: name.trim(),
        description: description.trim(),
        owner: selectedUser
      });
      
      // Retourner à la liste des projets et forcer un rafraîchissement
      router.replace('/(tabs)');
    } catch (err) {
      setError('Erreur lors de la création du projet');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const theme = useTheme();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={theme.components.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={theme.components.text.h1}>Créer un nouveau projet</Text>

          {error && (
            <Text style={[theme.components.text.caption, { color: theme.colors.status.error }]}>{error}</Text>
          )}

          <View style={styles.inputContainer}>
            <Input
              label="Nom du projet"
              value={name}
              onChangeText={handleNameChange}
              editable={!isSubmitting}
              maxLength={MAX_NAME_LENGTH}
              error={name.length === MAX_NAME_LENGTH ? 'Longueur maximale atteinte' : undefined}
            />
            <Text style={[
              theme.components.text.caption,
              styles.charCounter,
              name.length === MAX_NAME_LENGTH && { color: theme.colors.status.error }
            ]}>
              {name.length}/{MAX_NAME_LENGTH}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Input
              label="Description du projet"
              value={description}
              onChangeText={handleDescriptionChange}
              multiline
              numberOfLines={4}
              editable={!isSubmitting}
              maxLength={MAX_DESCRIPTION_LENGTH}
              style={styles.textArea}
              error={description.length === MAX_DESCRIPTION_LENGTH ? 'Longueur maximale atteinte' : undefined}
            />
            <Text style={[
              theme.components.text.caption,
              styles.charCounter,
              description.length === MAX_DESCRIPTION_LENGTH && { color: theme.colors.status.error }
            ]}>
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </Text>
          </View>

          <View style={styles.userSearchContainer}>
            <Text style={[theme.components.text.h3, styles.sectionTitle]}>
              Propriétaire du projet
            </Text>
            {selectedUser ? (
              <View style={styles.selectedUserContainer}>
                <View style={styles.selectedUserInfo}>
                  <Text style={theme.components.text.body1}>{selectedUser.username}</Text>
                  {selectedUser.email && (
                    <Text style={theme.components.text.body2}>{selectedUser.email}</Text>
                  )}
                </View>
                <Button
                  variant="outline"
                  onPress={() => setSelectedUser(null)}
                  leftIcon={<FontAwesome name="times" size={16} color={theme.colors.text.secondary} />}
                >
                  Supprimer
                </Button>
              </View>
            ) : (
              <>
                <Input
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
                      <Button
                        key={user.username}
                        variant="outline"
                        onPress={() => handleSelectUser(user)}
                        style={{ marginBottom: 8 }}
                      >
                        {`${user.username}${user.email ? ` (${user.email})` : ''}`}
                      </Button>
                    ))}
                  </ScrollView>
                )}
              </>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.submitButton}
          >
            {isSubmitting ? 'Création...' : 'Créer le projet'}
          </Button>
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
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  charCounter: {
    textAlign: 'right',
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  userSearchContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  suggestionsContainer: {
    maxHeight: 200,
    borderRadius: 8,
    padding: 8,
  },
  selectedUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  selectedUserInfo: {
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
  },
  submitButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 500,
  }
});
