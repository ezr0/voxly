import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useLibrary } from "@/contexts/LibraryContext";

export default function LibraryScreen() {
  const router = useRouter();
  const colors = Colors[useColorScheme()];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isLoading, savedPodcasts, unsavePodcast, error } = useLibrary();

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={savedPodcasts}
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
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/podcast/${item.id}`)}
          >
            <Image source={{ uri: item.artworkUrl }} style={styles.artwork} />
            <View style={styles.cardBody}>
              <Text numberOfLines={2} style={styles.cardTitle}>
                {item.title}
              </Text>
              <Text numberOfLines={1} style={styles.cardAuthor}>
                {item.author}
              </Text>
              <Text numberOfLines={1} style={styles.cardMeta}>
                {item.genres.join(" · ") || "Podcast"}
              </Text>
            </View>
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                unsavePodcast(item.id);
              }}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </Pressable>
          </Pressable>
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
      gap: 12,
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
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 12,
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
    },
    artwork: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    cardBody: {
      flex: 1,
      gap: 3,
    },
    cardTitle: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 15,
    },
    cardAuthor: {
      color: colors.subtext,
      fontSize: 13,
    },
    cardMeta: {
      color: colors.subtext,
      fontSize: 12,
    },
    removeButton: {
      borderRadius: 12,
      backgroundColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    removeButtonText: {
      color: colors.danger,
      fontWeight: "700",
      fontSize: 12,
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
