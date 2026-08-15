import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { usePodcastLibrary } from '@/hooks/usePodcastLibrary';
import { hasFirebaseConfig } from '@/lib/firebase';

export default function ProfileScreen() {
  const { user, isLoading, error, refreshSession } = useAuth();
  const { savedPodcasts } = usePodcastLibrary();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Simple auth and sync powered by Firebase.</Text>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Session</Text>
          <Text style={styles.panelValue}>{isLoading ? 'Connecting…' : user?.uid ?? 'Unavailable'}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Saved podcasts</Text>
          <Text style={styles.panelValue}>{savedPodcasts.length}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Firebase status</Text>
          <Text style={styles.panelValue}>{hasFirebaseConfig ? 'Configured' : 'Needs EXPO_PUBLIC keys'}</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.button} onPress={refreshSession}>
          <Text style={styles.buttonText}>Refresh guest session</Text>
        </Pressable>

        <Text style={styles.footerText}>
          Podcast discovery uses Apple iTunes Search API (free, no ads, no API key required).
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#20243A',
  },
  subtitle: {
    color: '#5A6280',
    fontSize: 15,
    marginBottom: 10,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  panelLabel: {
    color: '#6D7591',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  panelValue: {
    color: '#20243A',
    fontSize: 15,
    fontWeight: '700',
  },
  button: {
    marginTop: 4,
    backgroundColor: '#5B4CF0',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    color: '#B11839',
    fontWeight: '600',
  },
  footerText: {
    marginTop: 'auto',
    color: '#7C86A5',
    fontSize: 12,
    lineHeight: 18,
  },
});
