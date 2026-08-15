import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/Colors";
import { Podcast } from "@/types/podcast";

type Props = {
  podcast: Podcast;
  onPress: () => void;
  actionLabel: string;
  actionActive?: boolean;
  onAction: () => void;
  showNewBadge?: boolean;
  colors: (typeof Colors)["light"];
  width?: number | `${number}%`;
};

export function PodcastGridCard({
  podcast,
  onPress,
  actionLabel,
  actionActive,
  onAction,
  showNewBadge,
  colors,
  width = "48%",
}: Props) {
  const styles = createStyles(colors);

  return (
    <Pressable style={[styles.card, { width }]} onPress={onPress}>
      <View style={styles.artworkWrap}>
        <Image source={{ uri: podcast.artworkUrl }} style={styles.artwork} />
        {showNewBadge ? <View style={styles.badge} /> : null}
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {podcast.title}
      </Text>
      <Text numberOfLines={1} style={styles.author}>
        {podcast.author}
      </Text>
      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          onAction();
        }}
        style={[styles.actionButton, actionActive ? styles.actionActive : null]}
      >
        <Text
          style={[
            styles.actionText,
            actionActive ? styles.actionTextActive : null,
          ]}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </Pressable>
  );
}

function createStyles(colors: (typeof Colors)["light"]) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 10,
      gap: 4,
    },
    artworkWrap: {
      position: "relative",
    },
    artwork: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    badge: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.danger,
      borderWidth: 2,
      borderColor: colors.card,
    },
    title: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 13,
      marginTop: 4,
    },
    author: {
      color: colors.subtext,
      fontSize: 11,
    },
    actionButton: {
      marginTop: 4,
      borderRadius: 10,
      backgroundColor: colors.border,
      paddingVertical: 7,
      alignItems: "center",
    },
    actionActive: {
      backgroundColor: colors.tint,
    },
    actionText: {
      color: colors.tint,
      fontWeight: "700",
      fontSize: 12,
    },
    actionTextActive: {
      color: "#FFFFFF",
    },
  });
}
