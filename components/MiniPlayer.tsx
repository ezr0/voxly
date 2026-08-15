import { usePathname, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { usePlayer } from "@/contexts/PlayerContext";

export function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentEpisode,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    togglePlayPause,
  } = usePlayer();

  if (!currentEpisode || pathname === "/player") return null;

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  return (
    <Pressable style={styles.container} onPress={() => router.push("/player")}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.row}>
        <Image
          source={{ uri: currentEpisode.artworkUrl }}
          style={styles.artwork}
        />
        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.title}>
            {currentEpisode.title}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {currentEpisode.podcastTitle}
          </Text>
        </View>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            togglePlayPause();
          }}
          style={styles.playButton}
        >
          <Text style={styles.playButtonText}>
            {isBuffering ? "…" : isPlaying ? "❚❚" : "▶"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 96,
    backgroundColor: "#20243A",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  progressFill: {
    height: 3,
    backgroundColor: "#6C4CF0",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#343B56",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  subtitle: {
    color: "#AEB4C9",
    fontSize: 12,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#6C4CF0",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
