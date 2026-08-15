import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SleepTimerOption, usePlayer } from "@/contexts/PlayerContext";

const SLEEP_TIMER_OPTIONS: { label: string; value: SleepTimerOption }[] = [
  { label: "Off", value: "off" },
  { label: "End of episode", value: "endOfEpisode" },
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "60 minutes", value: 60 },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function sleepTimerLabel(
  option: SleepTimerOption,
  remainingSeconds: number | null,
) {
  if (option === "off") return "Sleep timer";
  if (option === "endOfEpisode") return "Sleep: end of episode";
  if (remainingSeconds != null) return `Sleep: ${formatTime(remainingSeconds)}`;
  return "Sleep timer";
}

export default function PlayerScreen() {
  const router = useRouter();
  const {
    currentEpisode,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    togglePlayPause,
    seekTo,
    sleepTimerOption,
    sleepTimerRemainingSeconds,
    setSleepTimer,
  } = usePlayer();
  const [isSleepMenuVisible, setIsSleepMenuVisible] = useState(false);

  if (!currentEpisode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nothing is playing right now.</Text>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Pressable style={styles.dismiss} onPress={() => router.back()}>
            <Text style={styles.dismissText}>Close</Text>
          </Pressable>
          <Pressable
            style={[
              styles.sleepButton,
              sleepTimerOption !== "off" ? styles.sleepButtonActive : null,
            ]}
            onPress={() => setIsSleepMenuVisible(true)}
          >
            <Text
              style={[
                styles.sleepButtonText,
                sleepTimerOption !== "off"
                  ? styles.sleepButtonTextActive
                  : null,
              ]}
            >
              🌙 {sleepTimerLabel(sleepTimerOption, sleepTimerRemainingSeconds)}
            </Text>
          </Pressable>
        </View>

        <Image
          source={{ uri: currentEpisode.artworkUrl }}
          style={styles.artwork}
        />

        <Text numberOfLines={2} style={styles.title}>
          {currentEpisode.title}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {currentEpisode.podcastTitle}
        </Text>

        <View style={styles.sliderWrap}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration > 0 ? duration : 1}
            value={currentTime}
            minimumTrackTintColor="#5B4CF0"
            maximumTrackTintColor="#3A3F5C"
            thumbTintColor="#5B4CF0"
            onSlidingComplete={(value) => seekTo(value)}
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <Pressable
            style={styles.seekButton}
            onPress={() => seekTo(Math.max(currentTime - 15, 0))}
          >
            <Text style={styles.seekButtonText}>-15s</Text>
          </Pressable>
          <Pressable style={styles.playButton} onPress={togglePlayPause}>
            <Text style={styles.playButtonText}>
              {isBuffering ? "…" : isPlaying ? "❚❚" : "▶"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.seekButton}
            onPress={() => seekTo(currentTime + 15)}
          >
            <Text style={styles.seekButtonText}>+15s</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={isSleepMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSleepMenuVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsSleepMenuVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Sleep timer</Text>
            {SLEEP_TIMER_OPTIONS.map((option) => {
              const isSelected = option.value === sleepTimerOption;
              return (
                <Pressable
                  key={String(option.value)}
                  style={styles.modalOption}
                  onPress={() => {
                    setSleepTimer(option.value);
                    setIsSleepMenuVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected ? styles.modalOptionTextSelected : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected ? (
                    <Text style={styles.modalOptionCheck}>✓</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#161927",
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    gap: 16,
  },
  topRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dismiss: {
    alignSelf: "flex-start",
  },
  dismissText: {
    color: "#8B93A7",
    fontWeight: "600",
    fontSize: 15,
  },
  sleepButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#20243A",
  },
  sleepButtonActive: {
    backgroundColor: "#5B4CF0",
  },
  sleepButtonText: {
    color: "#8B93A7",
    fontWeight: "600",
    fontSize: 13,
  },
  sleepButtonTextActive: {
    color: "#FFFFFF",
  },
  artwork: {
    width: 260,
    height: 260,
    borderRadius: 20,
    backgroundColor: "#242841",
    marginTop: 20,
  },
  title: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 20,
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    color: "#9198B5",
    fontSize: 15,
    textAlign: "center",
  },
  sliderWrap: {
    width: "100%",
    marginTop: 16,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  timeText: {
    color: "#8B93A7",
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    marginTop: 12,
  },
  seekButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  seekButtonText: {
    color: "#C7CCE0",
    fontWeight: "700",
    fontSize: 14,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#5B4CF0",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  emptyText: {
    color: "#C7CCE0",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#5B4CF0",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#20243A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 36,
    paddingHorizontal: 20,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2C3150",
  },
  modalOptionText: {
    color: "#C7CCE0",
    fontSize: 15,
    fontWeight: "600",
  },
  modalOptionTextSelected: {
    color: "#FFFFFF",
  },
  modalOptionCheck: {
    color: "#5B4CF0",
    fontWeight: "800",
    fontSize: 16,
  },
});
