import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Themed';
import { globalStyles } from '@/styles/theme';

export default function ProfileScreen() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Profil</Text>
      <Text style={globalStyles.textSecondary}>Page en construction</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
