import React from 'react';
import { StyleSheet, View, ActivityIndicator, Pressable } from 'react-native';
import { Text } from '@/components/Themed';
import { globalStyles, spacing, colors } from '@/styles/theme';
import { useAppDispatch, useAppSelector } from '@/store';
import { getRoleLabel } from '@/types/role';
import { logout } from '@/store/authSlice';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, status, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.replace('auth/index');
    } catch (e) {
      console.error('Logout error', e);
    }
  };

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
            <Text style={styles.value}>{getRoleLabel(user.roleName)}</Text>
          </View>

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </Pressable>
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
  logoutButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start', 
    backgroundColor: colors.error,
    paddingVertical: spacing.xs,  
    paddingHorizontal: spacing.md,
    borderRadius: 6,
  },
  logoutText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
});

