import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { ThemePreference, useAppTheme } from "@/contexts/ThemeContext";
import { hasFirebaseConfig } from "@/lib/firebase";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export default function ProfileScreen() {
  const colors = Colors[useColorScheme()];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, isLoading, signOutUser } = useAuth();
  const { savedPodcasts } = useLibrary();
  const { preference, setPreference } = useAppTheme();

  const isGuest = user?.isAnonymous ?? false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Simple auth and sync powered by Firebase.
        </Text>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Name</Text>
          <Text style={styles.panelValue}>
            {isLoading
              ? "Connecting…"
              : isGuest
                ? "Guest"
                : (user?.displayName ?? "Voxly listener")}
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Email</Text>
          <Text style={styles.panelValue}>
            {isGuest ? "Guest session" : (user?.email ?? "Unavailable")}
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Saved podcasts</Text>
          <Text style={styles.panelValue}>{savedPodcasts.length}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Firebase status</Text>
          <Text style={styles.panelValue}>
            {hasFirebaseConfig ? "Configured" : "Needs EXPO_PUBLIC keys"}
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Appearance</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((option) => {
              const isActive = preference === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setPreference(option.value)}
                  style={[
                    styles.themeOption,
                    isActive ? styles.themeOptionActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      isActive ? styles.themeOptionTextActive : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable style={styles.button} onPress={signOutUser}>
          <Text style={styles.buttonText}>Sign out</Text>
        </Pressable>

        <Text style={styles.footerText}>
          Podcast discovery uses Apple iTunes Search API (free, no ads, no API
          key required).
        </Text>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: (typeof Colors)["light"]) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
      gap: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
    },
    subtitle: {
      color: colors.subtext,
      fontSize: 15,
      marginBottom: 10,
    },
    panel: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      gap: 4,
    },
    panelLabel: {
      color: colors.subtext,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    panelValue: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
    },
    themeRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 6,
    },
    themeOption: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeOptionActive: {
      backgroundColor: colors.tint,
      borderColor: colors.tint,
    },
    themeOptionText: {
      color: colors.subtext,
      fontWeight: "700",
      fontSize: 13,
    },
    themeOptionTextActive: {
      color: "#FFFFFF",
    },
    button: {
      marginTop: 4,
      backgroundColor: colors.danger,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: "center",
    },
    buttonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 15,
    },
    footerText: {
      marginTop: "auto",
      color: colors.subtext,
      fontSize: 12,
      lineHeight: 18,
    },
  });
}
