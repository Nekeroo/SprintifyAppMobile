import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, TextInput } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { globalStyles, colors, spacing } from '@/styles/theme';
import { FontAwesome } from '@expo/vector-icons';
import { displayDateToApi, formatDate, isValidDate } from '@/services/dateUtils';
import { useAppDispatch } from '@/store';
import { createSprint } from '@/store/sprintSlice';

export default function CreateSprintScreen() {
  const { project } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const handleCreateSprint = async () => {
    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      setError('Format de date invalide (JJ/MM/AAAA)');
      return;
    }

    const startDateStr = displayDateToApi(startDate);
    const endDateStr = displayDateToApi(endDate);

    if (new Date(endDateStr) < new Date(startDateStr)) {
      setError('La date de fin doit être après la date de début');
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
        pathname: '/project-detail',
        params: { 
          project,
          reload: 'true'
        }
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du sprint');
    }
  };

  return (
    <View style={globalStyles.container}>
      <Pressable 
        style={({pressed}) => [
          styles.backButton,
          pressed && globalStyles.buttonPressed
        ]}
        onPress={() => router.back()}
      >
        <FontAwesome name="arrow-left" size={20} color={colors.text.primary} />
        <Text style={styles.backButtonText}>Retour</Text>
      </Pressable>

      <ScrollView style={globalStyles.container}>
        <View style={[globalStyles.card, styles.form]}>
          <Text style={globalStyles.title}>Nouveau Sprint</Text>

          <View style={styles.formField}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nom du sprint"
              placeholderTextColor={colors.text.secondary}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description du sprint"
              placeholderTextColor={colors.text.secondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Date de début (JJ/MM/AAAA)</Text>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={(text) => setStartDate(formatDate(text))}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Date de fin (JJ/MM/AAAA)</Text>
            <TextInput
              style={styles.input}
              value={endDate}
              onChangeText={(text) => setEndDate(formatDate(text))}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
              maxLength={10}
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
    </View>
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.error,
    marginBottom: spacing.md,
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
