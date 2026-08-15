import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
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
import { useDownloads } from "@/contexts/DownloadContext";
import { useLibrary } from "@/contexts/LibraryContext";
import { useNewEpisodes } from "@/contexts/NewEpisodesContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { fetchPodcastDetails } from "@/services/podcastApi";
import { Episode, Podcast } from "@/types/podcast";

function formatDuration(millis: number) {
  if (!millis) return "";
  const totalSeconds = Math.floor(millis / 1000);
  const mins = Math.floor(totalSeconds / 60);
  return `${mins} min`;
}

export default function PodcastDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = Colors[useColorScheme()];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { savedIds, toggleSaved, error: libraryError } = useLibrary();
  const { currentEpisode, isPlaying, playEpisode, togglePlayPause } =
    usePlayer();
  const { getDownloadState, downloadEpisode, deleteDownload, getPlaybackUri } =
    useDownloads();
  const { markPodcastSeen } = useNewEpisodes();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const numericId = Number(id);
        const result = await fetchPodcastDetails(numericId);
        if (cancelled) return;
        setPodcast(result.podcast);
        setEpisodes(result.episodes);
        setError(null);

        const latest = [...result.episodes].sort(
          (a, b) =>
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime(),
        )[0];
        if (latest) markPodcastSeen(numericId, latest.id);
      } catch {
        if (!cancelled) setError("Could not load this podcast right now.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, markPodcastSeen]);

  const isSaved = podcast ? savedIds.has(podcast.id) : false;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={episodes}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          podcast ? (
            <View style={styles.headerWrap}>
              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>‹ Back</Text>
              </Pressable>
              <View style={styles.headerRow}>
                <Image
                  source={{ uri: podcast.artworkUrl }}
                  style={styles.artwork}
                />
                <View style={styles.headerInfo}>
                  <Text numberOfLines={3} style={styles.title}>
                    {podcast.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.author}>
                    {podcast.author}
                  </Text>
                  <Text numberOfLines={1} style={styles.genres}>
                    {podcast.genres.join(" · ") || "Podcast"}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => toggleSaved(podcast)}
                style={[styles.saveButton, isSaved ? styles.savedButton : null]}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    isSaved ? styles.savedButtonText : null,
                  ]}
                >
                  {isSaved ? "Saved to Library" : "Save to Library"}
                </Text>
              </Pressable>
              {libraryError ? (
                <Text style={styles.errorText}>{libraryError}</Text>
              ) : null}
              <Text style={styles.sectionTitle}>Episodes</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>
              No episodes found for this podcast.
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const isCurrent = currentEpisode?.id === item.id;
          const downloadState = getDownloadState(item);

          return (
            <View style={styles.episodeCard}>
              <View style={styles.episodeInfo}>
                <Text numberOfLines={2} style={styles.episodeTitle}>
                  {item.title}
                </Text>
                <Text numberOfLines={3} style={styles.episodeDescription}>
                  {item.description.replace(/<[^>]+>/g, "")}
                </Text>
                <Text style={styles.episodeMeta}>
                  {formatDuration(item.durationMillis)}
                  {downloadState.status === "downloaded" ? " · Downloaded" : ""}
                </Text>
              </View>
              <Pressable
                style={styles.downloadButton}
                onPress={() =>
                  downloadState.status === "downloaded"
                    ? deleteDownload(item)
                    : downloadEpisode(item)
                }
                disabled={downloadState.status === "downloading"}
              >
                <Text style={styles.downloadButtonText}>
                  {downloadState.status === "downloading"
                    ? `${Math.round(downloadState.progress * 100)}%`
                    : downloadState.status === "downloaded"
                      ? "⛔"
                      : "⬇"}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.episodePlayButton,
                  isCurrent && isPlaying
                    ? styles.episodePlayButtonActive
                    : null,
                ]}
                onPress={() =>
                  isCurrent
                    ? togglePlayPause()
                    : playEpisode({
                        ...item,
                        audioUrl: getPlaybackUri(item),
                      })
                }
              >
                <Text style={styles.episodePlayButtonText}>
                  {isCurrent && isPlaying ? "❚❚" : "▶"}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
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
      paddingBottom: 140,
      gap: 12,
    },
    headerWrap: {
      gap: 12,
      marginBottom: 8,
    },
    backButton: {
      alignSelf: "flex-start",
      paddingVertical: 4,
    },
    backButtonText: {
      color: colors.tint,
      fontWeight: "700",
      fontSize: 15,
    },
    headerRow: {
      flexDirection: "row",
      gap: 14,
      alignItems: "flex-start",
    },
    artwork: {
      width: 96,
      height: 96,
      borderRadius: 16,
      backgroundColor: colors.border,
    },
    headerInfo: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.text,
    },
    author: {
      color: colors.subtext,
      fontSize: 14,
    },
    genres: {
      color: colors.subtext,
      fontSize: 12,
    },
    saveButton: {
      borderRadius: 14,
      backgroundColor: colors.border,
      paddingVertical: 12,
      alignItems: "center",
    },
    savedButton: {
      backgroundColor: colors.tint,
    },
    saveButtonText: {
      color: colors.tint,
      fontWeight: "700",
    },
    savedButtonText: {
      color: "#FFFFFF",
    },
    sectionTitle: {
      marginTop: 4,
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
    },
    episodeCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
    },
    episodeInfo: {
      flex: 1,
      gap: 4,
    },
    episodeTitle: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 14,
    },
    episodeDescription: {
      color: colors.subtext,
      fontSize: 12,
    },
    episodeMeta: {
      color: colors.subtext,
      fontSize: 11,
    },
    downloadButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    downloadButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.tint,
    },
    episodePlayButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.tint,
      alignItems: "center",
      justifyContent: "center",
    },
    episodePlayButtonActive: {
      backgroundColor: colors.accent,
    },
    episodePlayButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
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
