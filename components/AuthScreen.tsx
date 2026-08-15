import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";

function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";

  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/email-already-in-use":
      return "An account already exists for that email. Try signing in instead.";
    case "auth/weak-password":
      return "Choose a password with at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/operation-not-allowed":
    case "auth/admin-restricted-operation":
      return "Guest sign-in isn't enabled for this project yet.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function AuthScreen() {
  const colors = Colors[useColorScheme()];
  const { signIn, signUp, signInAsGuest, error: authError } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const isSignUp = mode === "signup";

  const submit = async () => {
    if (!email.trim() || !password) {
      setFormError("Enter an email and password to continue.");
      return;
    }

    if (isSignUp && !displayName.trim()) {
      setFormError("Enter a name so people know it's you.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setFormError(friendlyAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const continueAsGuest = async () => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await signInAsGuest();
    } catch (err) {
      console.error("Failed to start guest session", err);
      setFormError(friendlyAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tab, !isSignUp ? styles.tabActive : null]}
              onPress={() => setMode("signin")}
            >
              <Text
                style={[
                  styles.tabText,
                  !isSignUp ? styles.tabTextActive : null,
                ]}
              >
                Sign In
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, isSignUp ? styles.tabActive : null]}
              onPress={() => setMode("signup")}
            >
              <Text
                style={[styles.tabText, isSignUp ? styles.tabTextActive : null]}
              >
                Sign Up
              </Text>
            </Pressable>
          </View>

          {isSignUp ? (
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={colors.subtext}
              autoCapitalize="words"
              value={displayName}
              onChangeText={setDisplayName}
            />
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.subtext}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.subtext}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {formError || authError ? (
            <Text style={styles.errorText}>{formError ?? authError}</Text>
          ) : null}

          <Pressable
            style={styles.submitButton}
            onPress={submit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isSignUp ? "Create account" : "Sign in"}
              </Text>
            )}
          </Pressable>

          <Pressable onPress={continueAsGuest} disabled={isSubmitting}>
            <Text style={styles.guestText}>Continue as guest</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: (typeof Colors)["light"]) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      padding: 24,
      justifyContent: "center",
      gap: 12,
    },
    logo: {
      width: "100%",
      height: 140,
      alignSelf: "center",
      marginBottom: 12,
    },
    tabRow: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 4,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
    },
    tabActive: {
      backgroundColor: colors.tint,
    },
    tabText: {
      color: colors.subtext,
      fontWeight: "700",
    },
    tabTextActive: {
      color: "#FFFFFF",
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 15,
      color: colors.text,
      borderColor: colors.border,
      borderWidth: 1,
    },
    errorText: {
      color: colors.danger,
      fontWeight: "600",
      textAlign: "center",
    },
    submitButton: {
      backgroundColor: colors.tint,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 4,
    },
    submitButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 15,
    },
    guestText: {
      textAlign: "center",
      color: colors.subtext,
      fontWeight: "600",
      marginTop: 8,
      padding: 8,
    },
  });
}
