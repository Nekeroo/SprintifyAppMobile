import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, TextInput } from 'react-native';
import { Text } from '@/components/Themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { globalStyles, colors, spacing } from '@/styles/theme';
import { FontAwesome } from '@expo/vector-icons';
import { sprintService } from '@/services/sprint';

export default function CreateSprintScreen() {
  const { projectName } = useLocalSearchParams();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const formatDate = (input: string): string => {
    // Enlever tous les caractères non numériques
    const numbers = input.replace(/\D/g, '');
    
    // Format JJ/MM/AAAA
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const isValidDate = (dateStr: string): boolean => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    return date.getDate() === day && 
           date.getMonth() === month && 
           date.getFullYear() === year;
  };

  const handleCreateSprint = async () => {
    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      setError('Format de date invalide (JJ/MM/AAAA)');
      return;
    }

    const [startDay, startMonth, startYear] = startDate.split('/');
    const [endDay, endMonth, endYear] = endDate.split('/');
    
    // Créer les dates sans conversion de timezone
    const startDateStr = `${startYear}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}T00:00:00.000Z`;
    const endDateStr = `${endYear}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}T00:00:00.000Z`;
    
    // Créer les objets Date pour la validation uniquement
    const startDateObj = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay));
    const endDateObj = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay));

    if (endDateObj < startDateObj) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    try {
      await sprintService.createSprint(projectName as string, {
        name,
        description,
        startDate: startDateStr,
        endDate: endDateStr,
      });
      router.back();
    } catch (err) {
      setError(err.message);
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
