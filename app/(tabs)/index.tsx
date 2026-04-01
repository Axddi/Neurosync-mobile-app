import 'react-native-get-random-values';
import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Dimensions, StyleSheet
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { getCurrentSession } from "../../src/services/cognitoClient";
import { useRouter } from "expo-router";
import { getMoodLogs, createMoodLog } from "../../src/services/api";
import { useUI } from "../../src/context/UIContext";

const screenWidth = Dimensions.get("window").width;
const moods = ["Great", "Good", "Okay", "Low", "Difficult"];
const tagsList = ["Slept Well", "Good Appetite", "Social", "Confused", "Agitated", "Calm", "Active", "Tired"];
const moodMap: any = { Great: 5, Good: 4, Okay: 3, Low: 2, Difficult: 1 };

export default function Dashboard() {
  const router = useRouter();
  const { lowStimulus, highContrast, reduceMotion, fontScale } = useUI();

  const [logs, setLogs] = useState<any[]>([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [ready, setReady] = useState(false);

  const fetchLogs = async () => {
    try {
      const data = await getMoodLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log("Fetch error:", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await getCurrentSession();
        await fetchLogs();
        setReady(true);
      } catch {
        router.replace("/(auth)/login");
      }
    };
    init();
  }, []);

  const handleLog = async () => {
    if (!selectedMood) return;
    await createMoodLog({ mood: selectedMood, tags: selectedTags, note });
    setSelectedMood("");
    setSelectedTags([]);
    setNote("");
    fetchLogs();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const last7 = logs.slice(0, 7).reverse();
  const chartData = {
    labels: last7.map((_, i) => `D${i + 1}`),
    datasets: [{ data: last7.length > 0 ? last7.map((l) => moodMap[l.mood] || 0) : [0] }],
  };

  const latestMood = logs[0]?.mood || "No data";

  const moodCount: any = {};
  logs.forEach((l) => {
    moodCount[l.mood] = (moodCount[l.mood] || 0) + 1;
  });

  const mostFrequent =
    Object.keys(moodCount).sort((a, b) => moodCount[b] - moodCount[a])[0] || "N/A";

  if (!ready) return null;

  return (
    <ScrollView
      style={[
        styles.root,
        { backgroundColor: lowStimulus ? "#F0EDF7" : "#F5F7FA" },
      ]}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View style={styles.appBar}>
        <Text style={[styles.greeting, { fontSize: 22 * fontScale }]}>
          Hello 👋
        </Text>
        <Text style={[styles.sub, { fontSize: 13 * fontScale }]}>
          How are you feeling today?
        </Text>
      </View>
      <View style={[styles.card, highContrast && styles.hcBorder]}>
        <Text style={[styles.cardTitle, { fontSize: 15 * fontScale }]}>
          Log Mood
        </Text>

        <View style={styles.rowWrap}>
          {moods.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setSelectedMood(m)}
              style={[
                styles.moodBtn,
                selectedMood === m && styles.selected,
              ]}
              activeOpacity={reduceMotion ? 1 : 0.7}
            >
              <Text style={[styles.text, { fontSize: 12 * fontScale }]}>
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.rowWrap}>
          {tagsList.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => toggleTag(tag)}
              style={[
                styles.tag,
                selectedTags.includes(tag) && styles.selected,
              ]}
              activeOpacity={reduceMotion ? 1 : 0.7}
            >
              <Text style={[styles.text, { fontSize: 11 * fontScale }]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          placeholder="Add notes..."
          placeholderTextColor="#94A3B8"
          value={note}
          onChangeText={setNote}
          style={[
            styles.input,
            highContrast && styles.hcBorder,
            { fontSize: 13 * fontScale },
          ]}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLog}
          activeOpacity={reduceMotion ? 1 : 0.7}
        >
          <Text style={[styles.btnText, { fontSize: 13 * fontScale }]}>
            Log Entry
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <View style={[styles.summaryCard, highContrast && styles.hcBorder]}>
          <Text style={[styles.label, { fontSize: 11 * fontScale }]}>
            Latest Mood
          </Text>
          <Text style={[styles.value, { fontSize: 16 * fontScale }]}>
            {latestMood}
          </Text>
        </View>

        <View style={[styles.summaryCard, highContrast && styles.hcBorder]}>
          <Text style={[styles.label, { fontSize: 11 * fontScale }]}>
            Most Frequent
          </Text>
          <Text style={[styles.value, { fontSize: 16 * fontScale }]}>
            {mostFrequent}
          </Text>
        </View>
      </View>
      <View style={[styles.card, highContrast && styles.hcBorder]}>
        <Text style={[styles.cardTitle, { fontSize: 15 * fontScale }]}>
          Mood Trend
        </Text>

        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={200}
          chartConfig={{
            backgroundGradientFrom: "#FFFFFF",
            backgroundGradientTo: "#FFFFFF",
            color: (o = 1) => `rgba(74,144,226,${o})`,
            labelColor: () => "#64748B",
          }}
          bezier
          style={{ borderRadius: 12 }}
        />
      </View>

      <View style={[styles.card, highContrast && styles.hcBorder]}>
        <Text style={[styles.cardTitle, { fontSize: 15 * fontScale }]}>
          Insights
        </Text>

        <Text style={[styles.text, { fontSize: 13 * fontScale }]}>
          • Logging consistently improves tracking 📈
        </Text>
        <Text style={[styles.text, { fontSize: 13 * fontScale }]}>
          • Watch repeated "Low" or "Difficult"
        </Text>
        <Text style={[styles.text, { fontSize: 13 * fontScale }]}>
          • Add notes for better insights
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  appBar: { paddingTop: 50, paddingHorizontal: 16, marginBottom: 10 },

  greeting: { fontWeight: "800", color: "#1E293B" },

  sub: { color: "#94A3B8", marginTop: 2 },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardTitle: {
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
  },

  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  moodBtn: {
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
  },

  tag: {
    backgroundColor: "#F1F5F9",
    padding: 8,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
  },

  selected: { backgroundColor: "#4A90E2" },

  text: { color: "#334155" },

  input: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
    color: "#1E293B",
  },

  button: {
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: { color: "#fff", fontWeight: "700" },

  row: {
    flexDirection: "row",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  label: { color: "#94A3B8" },

  value: {
    color: "#1E293B",
    marginTop: 4,
    fontWeight: "700",
  },

  hcBorder: { borderColor: "#1E293B", borderWidth: 1.5 },
});