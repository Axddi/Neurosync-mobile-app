import 'react-native-get-random-values';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { useUI } from "../../src/context/UIContext";
import { LinearGradient } from "expo-linear-gradient";

const LG = (LinearGradient as unknown) as React.ComponentType<any>;

const poolData = {
  UserPoolId: "ap-south-1_RhUmtCFhx",
  ClientId: "4qp727h14n606fb0thoikhb5oo",
};

const userPool = new CognitoUserPool(poolData);

export default function Login() {
  const { lowStimulus, highContrast, reduceMotion, fontScale } = useUI();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }
    setLoading(true);

    const authDetails = new AuthenticationDetails({
      Username: email.trim().toLowerCase(),
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: email.trim().toLowerCase(),
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: () => {
        setLoading(false);
        router.replace("/(tabs)");
      },
      onFailure: (err) => {
        setLoading(false);
        console.log("LOGIN ERROR:", JSON.stringify(err));
        if (err.code === "UserNotConfirmedException") {
          router.push({ pathname: "/(auth)/confirm", params: { email } });
        } else {
          alert(err.message || "Login failed");
        }
      },
      newPasswordRequired: () => {
        setLoading(false);
        alert("Please reset your password");
      },
    });
  };

  const CONTENT = (
    <>
      <View style={styles.hero}>
        <Text style={[styles.logo, { fontSize: 32 * fontScale }]}>
          NeuroSync
        </Text>
        <Text style={[styles.tagline, { fontSize: 14 * fontScale }]}>
          Care. Connect. Understand.
        </Text>
      </View>
      <View style={[styles.card, highContrast && styles.hcBorder]}>
        <Text style={[styles.title, { fontSize: 20 * fontScale }]}>
          Welcome back
        </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          style={[
            styles.input,
            highContrast && styles.hcBorder,
            { fontSize: 14 * fontScale },
          ]}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#94A3B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={[
            styles.input,
            highContrast && styles.hcBorder,
            { fontSize: 14 * fontScale },
          ]}
        />

        <TouchableOpacity
          style={[
            styles.button,
            loading && { opacity: 0.6 },
          ]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={reduceMotion ? 1 : 0.7}
        >
          <Text style={[styles.buttonText, { fontSize: 14 * fontScale }]}>
            {loading ? "Signing in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          activeOpacity={reduceMotion ? 1 : 0.7}
        >
          <Text style={[styles.link, { fontSize: 13 * fontScale }]}>
            Don’t have an account? Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

return (
  <View style={{ flex: 1 }}>
    {lowStimulus ? (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#F0EDF7" }]} />
    ) : (
      <LG
        colors={["#4A90E2", "#7C5CBF", "#F5F7FA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    )}

    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {CONTENT}
    </KeyboardAvoidingView>
  </View>
);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  hero: {
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },

  tagline: {
    color: "#E2E8F0",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },

  title: {
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 16,
  },

  input: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#1E293B",
  },

  button: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  link: {
    marginTop: 16,
    textAlign: "center",
    color: "#4A90E2",
    fontWeight: "500",
  },

  hcBorder: {
    borderColor: "#1E293B",
    borderWidth: 1.5,
  },
});