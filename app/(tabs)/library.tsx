import { FlatList, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { usePodcastLibrary } from '@/hooks/usePodcastLibrary';

export default function LibraryScreen() {
  const { isLoading, savedPodcasts } = usePodcastLibrary();

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.content}
        data={savedPodcasts}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={styles.title}>Your Library</Text>
            <Text style={styles.subtitle}>Saved podcasts are synced with Firebase.</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isLoading ? 'Loading library…' : 'No saved podcasts yet. Add from Discover.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.artworkUrl }} style={styles.artwork} />
            <View style={styles.cardBody}>
              <Text numberOfLines={2} style={styles.cardTitle}>
                {item.title}
              </Text>
              <Text numberOfLines={1} style={styles.cardAuthor}>
                {item.author}
              </Text>
              <Text numberOfLines={1} style={styles.cardMeta}>
                {item.genres.join(' · ') || 'Podcast'}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FF',
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
    fontWeight: '800',
    color: '#20243A',
  },
  subtitle: {
    color: '#5A6280',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  artwork: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#EEF0F9',
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    color: '#20243A',
    fontWeight: '700',
    fontSize: 15,
  },
  cardAuthor: {
    color: '#59617C',
    fontSize: 13,
  },
  cardMeta: {
    color: '#8790AB',
    fontSize: 12,
  },
  emptyText: {
    color: '#5A6280',
    textAlign: 'center',
    paddingVertical: 30,
  },
});
