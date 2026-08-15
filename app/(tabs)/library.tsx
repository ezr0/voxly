import { useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PodcastGridCard } from "@/components/PodcastGridCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useLibrary } from "@/contexts/LibraryContext";
import { useNewEpisodes } from "@/contexts/NewEpisodesContext";

export default function LibraryScreen() {
  const router = useRouter();
  const colors = Colors[useColorScheme()];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isLoading, savedPodcasts, unsavePodcast, error } = useLibrary();
  const { hasNewEpisode } = useNewEpisodes();

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.row}
        data={savedPodcasts}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={styles.title}>Your Library</Text>
            <Text style={styles.subtitle}>
              Saved podcasts are synced with Firebase.
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isLoading
              ? "Loading library…"
              : "No saved podcasts yet. Add from Discover."}
          </Text>
        }
        renderItem={({ item }) => (
          <PodcastGridCard
            podcast={item}
            colors={colors}
            onPress={() => router.push(`/podcast/${item.id}`)}
            showNewBadge={hasNewEpisode(item.id)}
            actionLabel="Remove"
            onAction={() => unsavePodcast(item.id)}
          />
        )}
      />
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
      padding: 20,
      gap: 14,
    },
    row: {
      gap: 14,
    },
    headerWrap: {
      marginBottom: 4,
      gap: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
    },
    subtitle: {
      color: colors.subtext,
      fontSize: 15,
    },
    emptyText: {
      color: colors.subtext,
      textAlign: "center",
      paddingVertical: 30,
    },
    errorText: {
      color: colors.danger,
      fontWeight: "600",
    },
  });
}
