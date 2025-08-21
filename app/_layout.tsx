import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, Stack, useRootNavigation, useRootNavigationState, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { store, useAppDispatch, useAppSelector } from "@/store";
import { bootstrap } from "@/store/authSlice";
import { Provider } from "react-redux";

export { ErrorBoundary } from "expo-router";


SplashScreen.preventAutoHideAsync();

const useProtectedRoute = () => {
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(bootstrap());
  }, [dispatch]);

  useEffect(() => {
    if (!rootNavigationState?.key || status === "loading") {
      return;
    }

    const isAuthed = !!user;
    
    // Navigate immediately based on auth status
    setTimeout(() => {
      if (isAuthed) {
        router.replace("/(tabs)/projects");
      } else {
        router.replace("/(auth)");
      }
    }, 0);
  }, [user, status, router, rootNavigationState?.key]);

  // Only show content when auth status is determined and navigation is ready
  return rootNavigationState?.key && status !== "loading";
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const colorScheme = useColorScheme();

  useEffect(() => { if (error) throw error; }, [error]);

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <ProtectedApp colorScheme={colorScheme} />
    </Provider>
  );
}

function ProtectedApp({ colorScheme }: { colorScheme: string }) {
  const readyForNavigation = useProtectedRoute();

  useEffect(() => {
    if (readyForNavigation) {
      SplashScreen.hideAsync();
    }
    else {
      SplashScreen.preventAutoHideAsync();
    }
  }, [readyForNavigation]);

  if (!readyForNavigation) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Slot />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
