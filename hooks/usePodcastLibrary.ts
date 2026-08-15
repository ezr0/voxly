import { useLibrary } from '@/contexts/LibraryContext';

export function usePodcastLibrary() {
  return useLibrary();
}
