import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { usePodcastLibrary } from '@/hooks/usePodcastLibrary';
import { fetchDiscoverPodcasts, searchPodcasts } from '@/services/podcastApi';
import { Podcast } from '@/types/podcast';

export default function DiscoverScreen() {
  const [query, setQuery] = useState('');
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { savedIds, toggleSaved } = usePodcastLibrary();

  const loadDiscover = async () => {
    setIsLoading(true);
    try {
      const items = await fetchDiscoverPodcasts();
      setPodcasts(items);
      setError(null);
    } catch {
      setError('Could not load podcasts right now.');
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
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const heading = useMemo(
    () => (query.trim() ? `Results for “${query.trim()}”` : 'Discover fresh podcasts'),
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
            <Text style={styles.title}>Voxly</Text>
            <Text style={styles.subtitle}>Ad-free podcast listening with a clean, modern flow.</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.input}
                placeholder="Search podcasts"
                placeholderTextColor="#8B93A7"
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
          !isLoading ? <Text style={styles.emptyText}>No podcasts found yet.</Text> : null
        }
        renderItem={({ item }) => {
          const isSaved = savedIds.has(item.id);

          return (
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
              <Pressable
                onPress={() => toggleSaved(item)}
                style={[styles.saveButton, isSaved ? styles.savedButton : null]}>
                <Text style={[styles.saveButtonText, isSaved ? styles.savedButtonText : null]}>
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              </Pressable>
            </View>
          );
        }}
      />
      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#5B4CF0" />
        </View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#20243A',
  },
  subtitle: {
    color: '#5A6280',
    fontSize: 15,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#20243A',
    borderColor: '#E4E8F3',
    borderWidth: 1,
  },
  searchButton: {
    backgroundColor: '#5B4CF0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
    color: '#343B56',
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
  saveButton: {
    borderRadius: 12,
    backgroundColor: '#E9EBFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: '#5B4CF0',
    fontWeight: '700',
  },
  savedButton: {
    backgroundColor: '#5B4CF0',
  },
  savedButtonText: {
    color: '#FFFFFF',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#B11839',
    textAlign: 'center',
    paddingBottom: 20,
    fontWeight: '600',
  },
  emptyText: {
    color: '#5A6280',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
