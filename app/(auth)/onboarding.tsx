import React, { useRef, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { useUI } from "../../src/context/UIContext";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const LG = (LinearGradient as unknown) as React.ComponentType<any>;

const slides = [
  {
    title: "Track Mood",
    desc: "Log daily mood and behavior easily",
  },
  {
    title: "Stay Connected",
    desc: "Caregivers and doctors stay in sync",
  },
  {
    title: "Gain Insights",
    desc: "Understand patterns and improve care",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { lowStimulus, reduceMotion, fontScale } = useUI();

  const [index, setIndex] = useState(0);

  const onScroll = (e: any) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  const finish = async () => {
    await AsyncStorage.setItem("seenOnboarding", "true");
    router.replace("/(auth)/login");
  };

  const next = async () => {
    if (index < slides.length - 1) {
      scrollRef.current?.scrollTo({
        x: width * (index + 1),
        animated: !reduceMotion,
      });
    } else {
      finish();
    }
  };

  const skip = async () => {
    finish();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* BACKGROUND */}
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

      {/* SLIDES */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {slides.map((s, i) => (
          <View key={i} style={styles.slide}>
            <Text style={[styles.title, { fontSize: 26 * fontScale }]}>
              {s.title}
            </Text>
            <Text style={[styles.desc, { fontSize: 14 * fontScale }]}>
              {s.desc}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* DOTS */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              index === i && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={skip}
          activeOpacity={reduceMotion ? 1 : 0.7}
        >
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={next}
          style={styles.nextBtn}
          activeOpacity={reduceMotion ? 1 : 0.7}
        >
          <Text style={styles.nextText}>
            {index === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  title: {
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 10,
  },

  desc: {
    color: "#E2E8F0",
    textAlign: "center",
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5F5",
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: "#FFFFFF",
    width: 16,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 30,
  },

  skip: {
    color: "#E2E8F0",
    fontWeight: "600",
  },

  nextBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },

  nextText: {
    color: "#4A90E2",
    fontWeight: "700",
  },
});