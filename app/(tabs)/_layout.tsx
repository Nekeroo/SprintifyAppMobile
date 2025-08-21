import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
  screenOptions={{
    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
    headerShown: useClientOnlyValue(false, true),
    headerTitle: 'Sprintify',
  }}
>
  {/* Onglets visibles */}
  <Tabs.Screen
    name="projects"
    options={{ title: 'Projets', tabBarIcon: ({ color }) => <TabBarIcon name="folder" color={color} /> }}
  />
  <Tabs.Screen
    name="profile"
    options={{ title: 'Profil', tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} /> }}
  />

  {/* Fichiers à masquer dans (tabs) */}
  <Tabs.Screen name="index" options={{ href: null }} />
  <Tabs.Screen name="create-sprint" options={{ href: null }} />

  {/* Tes écrans déjà masqués */}
  <Tabs.Screen name="project-detail" options={{ href: null }} />
  <Tabs.Screen name="create-project" options={{ href: null }} />
  <Tabs.Screen name="sprint-detail" options={{ href: null }} />
</Tabs>
  );
}
