import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useLibrary } from "@/contexts/LibraryContext";
import { fetchDiscoverPodcasts, searchPodcasts } from "@/services/podcastApi";
import { Podcast } from "@/types/podcast";

export default function DiscoverScreen() {
  const router = useRouter();
  const colors = Colors[useColorScheme()];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [query, setQuery] = useState("");
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { savedIds, toggleSaved, error: libraryError } = useLibrary();

  const loadDiscover = async () => {
    setIsLoading(true);
    try {
      const items = await fetchDiscoverPodcasts();
      setPodcasts(items);
      setError(null);
    } catch {
      setError("Could not load podcasts right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiscover();
  }, []);

  const runSearch = async () => {
    if (!query.trim()) {
      await loadDiscover();
      return;
    }

    setIsLoading(true);
    try {
      const items = await searchPodcasts(query);
      setPodcasts(items);
      setError(null);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const heading = useMemo(
    () =>
      query.trim()
        ? `Results for “${query.trim()}”`
        : "Discover fresh podcasts",
    [query],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={podcasts}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>
              Ad-free podcast listening with a clean, modern flow.
            </Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.input}
                placeholder="Search podcasts"
                placeholderTextColor={colors.subtext}
                returnKeyType="search"
                onSubmitEditing={runSearch}
                value={query}
                onChangeText={setQuery}
              />
              <Pressable onPress={runSearch} style={styles.searchButton}>
                <Text style={styles.searchButtonText}>Go</Text>
              </Pressable>
            </View>
            <Text style={styles.sectionTitle}>{heading}</Text>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>No podcasts found yet.</Text>
          ) : null
        }
        renderItem={({ item }) => {
          const isSaved = savedIds.has(item.id);

          return (
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
                  toggleSaved(item);
                }}
                style={[styles.saveButton, isSaved ? styles.savedButton : null]}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    isSaved ? styles.savedButtonText : null,
                  ]}
                >
                  {isSaved ? "Saved" : "Save"}
                </Text>
              </Pressable>
            </Pressable>
          );
        }}
      />
      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : null}
      {libraryError ? (
        <Text style={styles.errorText}>{libraryError}</Text>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
      gap: 12,
      marginBottom: 8,
    },
    logo: {
      width: "100%",
      height: 90,
      alignSelf: "center",
    },
    subtitle: {
      color: colors.subtext,
      fontSize: 15,
      textAlign: "center",
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    input: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
      borderColor: colors.border,
      borderWidth: 1,
    },
    searchButton: {
      backgroundColor: colors.tint,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 18,
    },
    searchButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    sectionTitle: {
      marginTop: 2,
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
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
    saveButton: {
      borderRadius: 12,
      backgroundColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    saveButtonText: {
      color: colors.tint,
      fontWeight: "700",
    },
    savedButton: {
      backgroundColor: colors.tint,
    },
    savedButtonText: {
      color: "#FFFFFF",
    },
    loadingOverlay: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    errorText: {
      color: colors.danger,
      textAlign: "center",
      paddingBottom: 20,
      fontWeight: "600",
    },
    emptyText: {
      color: colors.subtext,
      textAlign: "center",
      paddingVertical: 20,
    },
  });
}
