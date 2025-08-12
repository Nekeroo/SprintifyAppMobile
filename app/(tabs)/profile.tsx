import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Themed';
import { globalStyles, spacing, colors } from '@/styles/theme';
import { useAppSelector } from '@/store';

export default function ProfileScreen() {
  const { user, status, error } = useAppSelector((state) => state.auth);

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Profil</Text>

      {status === 'loading' && (
        <ActivityIndicator size="large" color={colors.primary} />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {user && status !== 'loading' && (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Nom d'utilisateur :</Text>
            <Text style={styles.value}>{user.username}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Email :</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.label}>Rôle :</Text>
            <Text style={styles.value}>{user.role}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    marginBottom: spacing.md,
    backgroundColor: colors.background.secondary,
    padding: spacing.sm,
    borderRadius: 6,
  },
  label: {
    fontWeight: 'bold',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: colors.text.primary,
  },
  error: {
    color: colors.error,
    marginVertical: spacing.md,
  },
});
