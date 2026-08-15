import {
    GoogleSignin,
    isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import {
    GoogleAuthProvider,
    User,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInAnonymously,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { auth, db, hasFirebaseConfig } from "@/lib/firebase";

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

if (googleWebClientId) {
  GoogleSignin.configure({ webClientId: googleWebClientId });
}

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      setError(
        "Firebase is not configured yet. Add EXPO_PUBLIC_FIREBASE_* env values.",
      );
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setError(null);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase is not configured.");
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (!auth) throw new Error("Firebase is not configured.");

      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const trimmedName = displayName.trim();

      if (trimmedName) {
        await updateProfile(credential.user, { displayName: trimmedName });
      }

      if (db) {
        await setDoc(doc(db, "users", credential.user.uid), {
          displayName: trimmedName,
          email: email.trim(),
          createdAt: Date.now(),
        });
      }
    },
    [],
  );

  const signInAsGuest = useCallback(async () => {
    if (!auth) throw new Error("Firebase is not configured.");
    await signInAnonymously(auth);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error("Firebase is not configured.");
    if (!googleWebClientId) {
      throw new Error(
        "Google Sign-In is not set up yet. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.",
      );
    }

    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response) || !response.data.idToken) {
      throw new Error("Google sign-in did not return an ID token.");
    }

    const credential = GoogleAuthProvider.credential(response.data.idToken);
    await signInWithCredential(auth, credential);
  }, []);

  const signOutUser = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      signIn,
      signUp,
      signInAsGuest,
      signInWithGoogle,
      signOutUser,
    }),
    [
      error,
      isLoading,
      signIn,
      signInAsGuest,
      signInWithGoogle,
      signOutUser,
      signUp,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
