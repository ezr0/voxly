import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PodcastGridCard } from "@/components/PodcastGridCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useLibrary } from "@/contexts/LibraryContext";
import { useNewEpisodes } from "@/contexts/NewEpisodesContext";
import { fetchDiscoverPodcasts, searchPodcasts } from "@/services/podcastApi";
import { Podcast } from "@/types/podcast";

type GenreSection = { genre: string; data: Podcast[] };

function groupByGenre(podcasts: Podcast[]): GenreSection[] {
  const map = new Map<string, Podcast[]>();

  for (const podcast of podcasts) {
    const genre = podcast.genres[0] || "Podcasts";
    if (!map.has(genre)) map.set(genre, []);
    map.get(genre)!.push(podcast);
  }

  return Array.from(map.entries()).map(([genre, data]) => ({ genre, data }));
}

export default function DiscoverScreen() {
  const router = useRouter();
  const colors = Colors[useColorScheme()];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [query, setQuery] = useState("");
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { savedIds, toggleSaved, error: libraryError } = useLibrary();
  const { hasNewEpisode } = useNewEpisodes();

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

  const runSearch = async (text?: string) => {
    const term = (text ?? query).trim();
    if (!term) {
      await loadDiscover();
      return;
    }

    setIsLoading(true);
    try {
      const items = await searchPodcasts(term);
      setPodcasts(items);
      setError(null);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isSearching = query.trim().length > 0;
  const sections = useMemo(() => groupByGenre(podcasts), [podcasts]);

  const heading = useMemo(
    () =>
      isSearching ? `Results for “${query.trim()}”` : "Discover fresh podcasts",
    [isSearching, query],
  );

  const renderCard = (item: Podcast, width?: number | `${number}%`) => {
    const isSaved = savedIds.has(item.id);

    return (
      <PodcastGridCard
        key={item.id}
        podcast={item}
        colors={colors}
        width={width}
        onPress={() => router.push(`/podcast/${item.id}`)}
        showNewBadge={isSaved && hasNewEpisode(item.id)}
        actionLabel={isSaved ? "Saved" : "Save"}
        actionActive={isSaved}
        onAction={() => toggleSaved(item)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
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
              onSubmitEditing={() => runSearch()}
              value={query}
              onChangeText={setQuery}
            />
            <Pressable onPress={() => runSearch()} style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Go</Text>
            </Pressable>
          </View>
          <Text style={styles.sectionTitle}>{heading}</Text>
        </View>

        {!isLoading && podcasts.length === 0 ? (
          <Text style={styles.emptyText}>No podcasts found yet.</Text>
        ) : null}

        {isSearching ? (
          <View style={styles.grid}>
            {podcasts.map((item) => renderCard(item, "48%"))}
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.genre} style={styles.genreSection}>
              <Text style={styles.genreTitle}>{section.genre}</Text>
              <FlatList
                data={section.data}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.genreRow}
                renderItem={({ item }) => renderCard(item, 140)}
              />
            </View>
          ))
        )}
      </ScrollView>
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
      paddingBottom: 40,
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
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 14,
    },
    genreSection: {
      gap: 10,
      marginBottom: 8,
    },
    genreTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    genreRow: {
      gap: 12,
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
