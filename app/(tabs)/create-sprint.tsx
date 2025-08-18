import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/base/Card';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/Themed';
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

  const theme = useTheme();

  return (
    <View style={theme.components.container}>
      <Button
        variant="outline"
        onPress={() => router.back()}
        leftIcon={<FontAwesome name="arrow-left" size={20} color={theme.colors.text.primary} />}
      >
        Retour
      </Button>

      <ScrollView style={theme.components.container}>
        <Card style={{ padding: theme.spacing.md }}>
          <Text style={theme.components.title}>Nouveau Sprint</Text>

          <Input
            label="Nom"
            value={name}
            onChangeText={setName}
            placeholder="Nom du sprint"
            error={error && !name.trim() ? 'Le nom est requis' : ''}
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Description du sprint"
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          <Input
            label="Date de début (JJ/MM/AAAA)"
            value={startDate}
            onChangeText={(text) => setStartDate(formatDate(text))}
            placeholder="JJ/MM/AAAA"
            keyboardType="numeric"
            maxLength={10}
            error={error && !isValidDate(startDate) ? 'Format de date invalide' : ''}
          />

          <Input
            label="Date de fin (JJ/MM/AAAA)"
            value={endDate}
            onChangeText={(text) => setEndDate(formatDate(text))}
            placeholder="JJ/MM/AAAA"
            keyboardType="numeric"
            maxLength={10}
            error={error && !isValidDate(endDate) ? 'Format de date invalide' : ''}
          />

          {error && !error.includes('requis') && !error.includes('invalide') && (
            <Text style={{ color: theme.colors.error, marginBottom: theme.spacing.md }}>{error}</Text>
          )}

          <Button
            variant="primary"
            onPress={handleCreateSprint}
          >
            Créer le Sprint
          </Button>
        </Card>
      </ScrollView>
    </View>
  );
}

