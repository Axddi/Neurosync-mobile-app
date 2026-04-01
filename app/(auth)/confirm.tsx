import 'react-native-get-random-values';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "ap-south-1_RhUmtCFhx",
  ClientId: "4qp727h14n606fb0thoikhb5oo",
};

const userPool = new CognitoUserPool(poolData);

export default function Confirm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const handleConfirm = () => {
    if (!code) {
      alert("Please enter the code");
      return;
    }
    setLoading(true);

    const cognitoUser = new CognitoUser({
      Username: email as string,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      setLoading(false);
      if (err) {
        console.log("CONFIRM ERROR:", JSON.stringify(err));
        alert(err.message || "Verification failed");
        return;
      }
      console.log("CONFIRM SUCCESS:", result);
      router.replace("/(auth)/login");
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>Code sent to {email}</Text>
      <TextInput
        placeholder="Enter 6-digit code"
        value={code}
        onChangeText={setCode}
        style={styles.input}
        keyboardType="number-pad"
      />
      <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleConfirm} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 24 },
  input: { borderWidth: 1, padding: 12, marginBottom: 20, borderRadius: 8, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  button: { backgroundColor: "#4A90E2", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
});