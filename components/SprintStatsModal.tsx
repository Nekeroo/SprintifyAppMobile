import React, { useEffect } from "react";
import { Modal, View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useAppDispatch, useAppSelector } from "@/store";
import { getSprintStats } from "@/store/sprintSlice";
import { globalStyles, colors, spacing } from "@/styles/theme";

interface SprintStatsModalProps {
  visible: boolean;
  sprintName: string;
  onClose: () => void;
}

export default function SprintStatsModal({ visible, sprintName, onClose }: SprintStatsModalProps) {
  const dispatch = useAppDispatch();

  const statsState = useAppSelector((state) => {
    const name = sprintName as string | undefined;
    return name ? state.sprint?.statsBySprint?.[name] : undefined;
  });

  useEffect(() => {
    if (visible && sprintName) {
      dispatch(getSprintStats(sprintName));
    }
  }, [visible, sprintName, dispatch]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={globalStyles.title}>Statistiques</Text>

          {statsState?.status === "loading" && (
            <ActivityIndicator size="large" color={colors.primary} />
          )}

          {statsState?.status === "failed" && (
            <Text style={globalStyles.errorText}>
              {statsState.error || "Erreur lors du chargement des stats"}
            </Text>
          )}

          {statsState?.status === "succeeded" && statsState.data && (
            <>
              <Text style={styles.item}>Sprint : {statsState.data.name}</Text>
              <Text style={styles.item}>Nb tâches : {statsState.data.nbTask}</Text>
              <Text style={styles.item}>Tâches terminées : {statsState.data.nbTaskDone}</Text>
              <Text style={styles.item}>Tâches non terminées : {statsState.data.nbTaskNotDone}</Text>
              <Text style={styles.item}>Capacité : {statsState.data.capacity}</Text>
            </>
          )}

          <Pressable
            style={[globalStyles.button, { marginTop: spacing.md }]}
            onPress={onClose}
          >
            <Text style={globalStyles.buttonText}>Fermer</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  content: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    width: "80%",
    alignItems: "flex-start",
  },
  item: {
    fontSize: 16,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
});
