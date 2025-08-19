import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { store, useAppDispatch, useAppSelector } from "@/store";
import { bootstrap } from "@/store/authSlice";
import { Provider } from "react-redux";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

SplashScreen.preventAutoHideAsync();

const useProtectedRoute = () => {
  const segments = useSegments();
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(bootstrap());
  }, [dispatch]);

  useEffect(() => {
    if (status === "loading") return;

    const isAuthed = !!user;
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthed && !inAuthGroup) {
      router.replace("/(auth)");
    } else if (isAuthed && inAuthGroup) {
      router.replace("/(tabs)/projects");
    }
  }, [user, status, segments, router]);

  return status !== "loading";
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
  }, [readyForNavigation]);

  if (!readyForNavigation) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
