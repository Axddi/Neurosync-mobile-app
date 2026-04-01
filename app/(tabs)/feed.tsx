import 'react-native-get-random-values';
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, RefreshControl,
  TouchableOpacity, StyleSheet
} from "react-native";
import { getMoodLogs } from "../../src/services/api";
import { getCurrentSession } from "../../src/services/cognitoClient";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useUI } from "../../src/context/UIContext";

const moods = ["All", "Great", "Good", "Okay", "Low", "Difficult"];

export default function Feed() {
  const router = useRouter();
  const { lowStimulus, highContrast, reduceMotion, fontScale } = useUI();

  const [logs, setLogs] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const [filterMood, setFilterMood] = useState("All");

  const fetchLogs = async () => {
    try {
      const data = await getMoodLogs();
      const arr = Array.isArray(data) ? [...data] : [];
      setLogs(arr);
      applyFilters(arr, sort, filterMood);
    } catch (e) {
      console.log("Feed error:", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await getCurrentSession();
        await fetchLogs();
      } catch {
        router.replace("/(auth)/login");
      }
    };
    init();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  const applyFilters = (data: any[], sortType: string, mood: string) => {
    let temp = [...data];
    if (mood !== "All") temp = temp.filter((l) => l.mood === mood);
    temp.sort((a, b) =>
      sortType === "latest"
        ? Number(b.createdAt) - Number(a.createdAt)
        : Number(a.createdAt) - Number(b.createdAt)
    );
    setFiltered(temp);
  };

  const handleSort = () => {
    const newSort = sort === "latest" ? "oldest" : "latest";
    setSort(newSort);
    applyFilters(logs, newSort, filterMood);
  };

  const handleFilter = (mood: string) => {
    setFilterMood(mood);
    applyFilters(logs, sort, mood);
  };

  const timeAgo = (timestamp: string) => {
    const diff = Date.now() - Number(timestamp) * 1000;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  const moodColor = (mood: string) => {
    switch (mood) {
      case "Great": return "#2ecc71";
      case "Good": return "#4CAF50";
      case "Okay": return "#f1c40f";
      case "Low": return "#e67e22";
      case "Difficult": return "#e74c3c";
      default: return "#333";
    }
  };

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.card,
        { borderLeftColor: moodColor(item.mood) },
        highContrast && styles.hcBorder,
      ]}
    >
      <View style={styles.row}>
        <Text style={[styles.mood, { fontSize: 15 * fontScale }]}>
          {item.mood}
        </Text>
        <Text style={[styles.time, { fontSize: 11 * fontScale }]}>
          {timeAgo(item.createdAt)}
        </Text>
      </View>

      <View style={styles.tags}>
        {item.tags?.map((tag: string, i: number) => (
          <View key={i} style={styles.tag}>
            <Text style={[styles.tagText, { fontSize: 11 * fontScale }]}>
              {tag}
            </Text>
          </View>
        ))}
      </View>

      {item.note ? (
        <Text style={[styles.note, { fontSize: 13 * fontScale }]}>
          {item.note}
        </Text>
      ) : null}
    </View>
  );

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
                Care Feed
              </Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.sortBtn,
                  highContrast && styles.hcBorder,
                ]}
                onPress={handleSort}
                activeOpacity={reduceMotion ? 1 : 0.7}
              >
                <Text style={[styles.sortText, { fontSize: 13 * fontScale }]}>
                  Sort: {sort === "latest" ? "Latest ↓" : "Oldest ↑"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterRow}>
              {moods.map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => handleFilter(m)}
                  style={[
                    styles.filterBtn,
                    filterMood === m && styles.activeFilter,
                  ]}
                  activeOpacity={reduceMotion ? 1 : 0.7}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { fontSize: 11 * fontScale },
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        data={filtered}
        keyExtractor={(item) => item.sk}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={[styles.empty, { fontSize: 13 * fontScale }]}>
            No logs match filter
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  appBar: { paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16 },

  title: { fontWeight: "800", color: "#1E293B" },

  actionRow: { paddingHorizontal: 16, marginBottom: 10 },

  sortBtn: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  sortText: { color: "#1E293B", fontWeight: "600" },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  filterBtn: {
    backgroundColor: "#E5E7EB",
    padding: 8,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6,
  },

  activeFilter: { backgroundColor: "#4A90E2" },

  filterText: { color: "#334155", fontWeight: "600" },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  row: { flexDirection: "row", justifyContent: "space-between" },

  mood: { fontWeight: "700", color: "#1E293B" },

  time: { color: "#94A3B8" },

  tags: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },

  tag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 5,
    marginTop: 5,
  },

  tagText: { color: "#475569" },

  note: { color: "#334155", marginTop: 6 },

  empty: { color: "#94A3B8", textAlign: "center", marginTop: 50 },

  hcBorder: { borderColor: "#1E293B", borderWidth: 1.5 },
});