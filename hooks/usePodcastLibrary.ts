import { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { Podcast } from '@/types/podcast';

export function usePodcastLibrary() {
  const { user } = useAuth();
  const [savedPodcasts, setSavedPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !user) {
      setSavedPodcasts([]);
      setIsLoading(false);
      return;
    }

    const ref = collection(db, 'users', user.uid, 'library');
    const unsubscribe = onSnapshot(query(ref, orderBy('savedAt', 'desc')), (snapshot) => {
      setSavedPodcasts(
        snapshot.docs.map((item) => {
          const data = item.data() as Podcast;
          return {
            ...data,
          };
        }),
      );
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const savedIds = useMemo(() => new Set(savedPodcasts.map((podcast) => podcast.id)), [savedPodcasts]);

  const savePodcast = async (podcast: Podcast) => {
    if (!db || !user) return;

    const ref = doc(db, 'users', user.uid, 'library', String(podcast.id));
    await setDoc(ref, {
      ...podcast,
      savedAt: Date.now(),
    });
  };

  const unsavePodcast = async (podcastId: number) => {
    if (!db || !user) return;

    await deleteDoc(doc(db, 'users', user.uid, 'library', String(podcastId)));
  };

  const toggleSaved = async (podcast: Podcast) => {
    if (savedIds.has(podcast.id)) {
      await unsavePodcast(podcast.id);
      return;
    }

    await savePodcast(podcast);
  };

  return {
    savedPodcasts,
    savedIds,
    isLoading,
    savePodcast,
    unsavePodcast,
    toggleSaved,
  };
}
