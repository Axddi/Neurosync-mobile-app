import 'react-native-get-random-values';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { CognitoUserPool, CognitoUserAttribute } from "amazon-cognito-identity-js";
import { useUI } from "../../src/context/UIContext";
import { LinearGradient } from "expo-linear-gradient";

const LG = (LinearGradient as unknown) as React.ComponentType<any>;

const poolData = {
  UserPoolId: "ap-south-1_RhUmtCFhx",
  ClientId: "4qp727h14n606fb0thoikhb5oo",
};

const userPool = new CognitoUserPool(poolData);

export default function Signup() {
  const { lowStimulus, highContrast, reduceMotion, fontScale } = useUI();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"caregiver" | "doctor">("caregiver");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = () => {
    if (!email || !password || !username.trim()) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);

    const attributeList = [
      new CognitoUserAttribute({ Name: "email", Value: email.trim().toLowerCase() }),
      new CognitoUserAttribute({ Name: "preferred_username", Value: username.trim() }),
      new CognitoUserAttribute({ Name: "custom:role", Value: role }),
    ];

    userPool.signUp(
      email.trim().toLowerCase(),
      password,
      attributeList,
      [],
      (err, result) => {
        setLoading(false);
        if (err) {
          console.log("SIGNUP ERROR:", JSON.stringify(err));
          alert(err.message || "Signup failed");
          return;
        }
        router.push({ pathname: "/(auth)/confirm", params: { email } });
      }
    );
  };

  const CONTENT = (
    <>
      <View style={styles.hero}>
        <Text style={[styles.logo, { fontSize: 30 * fontScale }]}>
          NeuroSync
        </Text>
        <Text style={[styles.tagline, { fontSize: 14 * fontScale }]}>
          Create your account
        </Text>
      </View>

      <View style={[styles.card, highContrast && styles.hcBorder]}>
        <Text style={[styles.title, { fontSize: 20 * fontScale }]}>
          Sign Up
        </Text>

        <TextInput
          placeholder="Username"
          placeholderTextColor="#94A3B8"
          value={username}
          onChangeText={setUsername}
          style={[
            styles.input,
            highContrast && styles.hcBorder,
            { fontSize: 14 * fontScale },
          ]}
        />

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

        <Text style={[styles.label, { fontSize: 12 * fontScale }]}>
          Select Role
        </Text>

        <View style={styles.roleContainer}>
          {["caregiver", "doctor"].map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRole(r as any)}
              style={[
                styles.roleButton,
                role === r && styles.selectedRole,
              ]}
              activeOpacity={reduceMotion ? 1 : 0.7}
            >
              <Text
                style={[
                  styles.roleText,
                  { fontSize: 12 * fontScale },
                  role === r && styles.selectedRoleText,
                ]}
              >
                {r.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={reduceMotion ? 1 : 0.7}
        >
          <Text style={[styles.buttonText, { fontSize: 14 * fontScale }]}>
            {loading ? "Creating..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          activeOpacity={reduceMotion ? 1 : 0.7}
        >
          <Text style={[styles.link, { fontSize: 13 * fontScale }]}>
            Back to Login
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

  label: {
    color: "#64748B",
    marginBottom: 6,
  },

  roleContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 10,
  },

  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },

  selectedRole: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },

  roleText: {
    color: "#334155",
    fontWeight: "600",
  },

  selectedRoleText: {
    color: "#FFFFFF",
  },

  button: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
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