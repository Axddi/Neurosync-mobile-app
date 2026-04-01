import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Profile() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>

      <Text style={styles.text}>User ID: {id}</Text>

      <TouchableOpacity style={styles.btn}>
        <Text style={{ color: "#fff" }}>Request Session</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn2}>
        <Text style={{ color: "#fff" }}>Call</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1220",
    padding: 20,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  text: {
    color: "#aaa",
    marginBottom: 20,
  },

  btn: {
    backgroundColor: "#00bfa6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  btn2: {
    backgroundColor: "#6366f1",
    padding: 12,
    borderRadius: 10,
  },
});