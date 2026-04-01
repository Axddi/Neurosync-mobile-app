import 'react-native-get-random-values';
import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, StyleSheet
} from "react-native";
import { getCurrentSession } from "../../src/services/cognitoClient";
import { useRouter } from "expo-router";
import { useUI } from "../../src/context/UIContext";

type User = { id: string; name: string; email: string; role: string; };

const API_URL = "https://jjcesnuis1.execute-api.ap-south-1.amazonaws.com/default/community/users";

export default function CommunityScreen() {
  const router = useRouter();
  const { lowStimulus, highContrast, reduceMotion, fontScale } = useUI();

  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "doctor" | "caregiver">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await getCurrentSession();
        const res = await fetch(API_URL);
        const data = await res.json();
        setUsers(data);
        setLoading(false);
      } catch {
        router.replace("/(auth)/login");
      }
    };
    init();
  }, []);

  useEffect(() => {
    let data = [...users];
    if (tab !== "all") data = data.filter((u) => u.role === tab);
    if (search) data = data.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
  }, [users, search, tab]);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={[styles.loadingText, { fontSize: 13 * fontScale }]}>
          Loading community...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: lowStimulus ? "#F0EDF7" : "#F5F7FA" },
      ]}
    >
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.appBar}>
              <Text style={[styles.title, { fontSize: 22 * fontScale }]}>
                Community
              </Text>
            </View>

            <View style={styles.searchBox}>
              <TextInput
                placeholder="Search people..."
                placeholderTextColor="#94A3B8"
                style={[
                  styles.search,
                  highContrast && styles.hcBorder,
                  { fontSize: 14 * fontScale },
                ]}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <View style={styles.tabs}>
              {["all", "doctor", "caregiver"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTab(t as any)}
                  style={[styles.tab, tab === t && styles.activeTab]}
                  activeOpacity={reduceMotion ? 1 : 0.7}
                >
                  <Text
                    style={[
                      styles.tabText,
                      tab === t && styles.activeTabText,
                      { fontSize: 12 * fontScale },
                    ]}
                  >
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={[styles.emptyText, { fontSize: 13 * fontScale }]}>
              No users found
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/profile/[id]",
                params: { id: item.id },
              })
            }
            style={[
              styles.card,
              highContrast && styles.hcBorder,
            ]}
            activeOpacity={reduceMotion ? 1 : 0.7}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor:
                    item.role === "doctor"
                      ? "#7C5CBF22"
                      : "#4A90E222",
                },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  {
                    color:
                      item.role === "doctor"
                        ? "#7C5CBF"
                        : "#4A90E2",
                    fontSize: 16 * fontScale,
                  },
                ]}
              >
                {getInitial(item.name)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { fontSize: 15 * fontScale }]}>
                {item.name}
              </Text>

              <View
                style={[
                  styles.roleBadge,
                  {
                    backgroundColor:
                      item.role === "doctor"
                        ? "#7C5CBF18"
                        : "#4A90E218",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    {
                      color:
                        item.role === "doctor"
                          ? "#7C5CBF"
                          : "#4A90E2",
                      fontSize: 11 * fontScale,
                    },
                  ]}
                >
                  {item.role}
                </Text>
              </View>

              <Text style={[styles.email, { fontSize: 12 * fontScale }]}>
                {item.email}
              </Text>
            </View>

            <View style={styles.actionBtn}>
              <Text style={[styles.actionText, { fontSize: 12 * fontScale }]}>
                Call
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View
            style={[
              styles.footerCard,
              highContrast && styles.hcBorder,
            ]}
          >
            <Text style={[styles.footerTitle, { fontSize: 14 * fontScale }]}>
              🧠 Mental Health Support (India)
            </Text>

            <View style={styles.helpRow}>
              <Text style={[styles.helpName, { fontSize: 13 * fontScale }]}>
                AASRA
              </Text>
              <Text style={[styles.helpNumber, { fontSize: 13 * fontScale }]}>
                9820466627
              </Text>
            </View>

            <View style={styles.helpRow}>
              <Text style={[styles.helpName, { fontSize: 13 * fontScale }]}>
                Kiran
              </Text>
              <Text style={[styles.helpNumber, { fontSize: 13 * fontScale }]}>
                1800-599-0019
              </Text>
            </View>

            <View style={[styles.helpRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.helpName, { fontSize: 13 * fontScale }]}>
                iCALL
              </Text>
              <Text style={[styles.helpNumber, { fontSize: 13 * fontScale }]}>
                9152987821
              </Text>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  appBar: { paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16 },

  title: { fontWeight: "800", color: "#1E293B" },

  searchBox: { paddingHorizontal: 16, marginBottom: 12 },

  search: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#1E293B",
  },

  tabs: { flexDirection: "row", paddingHorizontal: 16, marginBottom: 12 },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
  },

  activeTab: { backgroundColor: "#4A90E2" },

  tabText: { fontWeight: "600", color: "#64748B" },

  activeTabText: { color: "#fff" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: { fontWeight: "800" },

  name: { fontWeight: "700", color: "#1E293B" },

  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginVertical: 4,
  },

  roleText: { fontWeight: "600" },

  email: { color: "#94A3B8" },

  actionBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  actionText: { color: "#4A90E2", fontWeight: "600" },

  footerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  footerTitle: {
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },

  helpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  helpName: { fontWeight: "600", color: "#334155" },

  helpNumber: { color: "#4A90E2", fontWeight: "600" },

  hcBorder: { borderColor: "#1E293B", borderWidth: 1.5 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  loadingText: { color: "#94A3B8", marginTop: 10 },

  emptyText: { color: "#94A3B8" },
});