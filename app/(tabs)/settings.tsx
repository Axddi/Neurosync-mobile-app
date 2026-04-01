import 'react-native-get-random-values';
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, ScrollView, Switch, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUI } from "../../src/context/UIContext";
import { getCurrentUserAttributes, signOutUser } from "../../src/services/cognitoClient";

const C = {
  primary: "#4A90E2", secondary: "#7C5CBF", accent: "#F59E0B",
  sos: "#EF4444", bg: "#F5F7FA", surface: "#FFFFFF",
  divider: "#E5E7EB", textPrimary: "#1E293B",
  textTertiary: "#94A3B8",
};

const STORAGE_KEYS = {
  lowStimulus: "@ns_lowStimulus", reduceMotion: "@ns_reduceMotion",
  highContrast: "@ns_highContrast", fontScale: "@ns_fontScale",
};

interface CognitoUser { name: string; email: string; role: string; username: string; }

export default function SettingsScreen() {
  const router = useRouter();
  const { lowStimulus, setLowStimulus, reduceMotion, setReduceMotion,
    highContrast, setHighContrast, fontScale, setFontScale } = useUI();
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [ls, rm, hc, fs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.lowStimulus),
          AsyncStorage.getItem(STORAGE_KEYS.reduceMotion),
          AsyncStorage.getItem(STORAGE_KEYS.highContrast),
          AsyncStorage.getItem(STORAGE_KEYS.fontScale),
        ]);
        if (ls !== null) setLowStimulus(ls === "true");
        if (rm !== null) setReduceMotion(rm === "true");
        if (hc !== null) setHighContrast(hc === "true");
        if (fs !== null) setFontScale(parseFloat(fs));
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoadingUser(true);
        const attrs = await getCurrentUserAttributes();
        setUser({
          name: attrs.name,
          email: attrs.email,
          role: attrs.role,
          username: attrs.username,
        });
      } catch (e) {
        console.log("USER LOAD ERROR:", e);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  const persist = useCallback(async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  }, []);

  const toggleLS = (v: boolean) => { setLowStimulus(v); persist(STORAGE_KEYS.lowStimulus, String(v)); };
  const toggleRM = (v: boolean) => { setReduceMotion(v); persist(STORAGE_KEYS.reduceMotion, String(v)); };
  const toggleHC = (v: boolean) => { setHighContrast(v); persist(STORAGE_KEYS.highContrast, String(v)); };
  const updateFontScale = (v: number) => {
    const rounded = Math.round(v * 20) / 20;
    setFontScale(rounded);
    persist(STORAGE_KEYS.fontScale, String(rounded));
  };

  const confirmLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out", style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await signOutUser(true);
            await AsyncStorage.clear();
            router.replace("/(auth)/login");
          } catch (err: any) {
            console.log("LOGOUT ERROR:", err);
            await AsyncStorage.clear();
            router.replace("/(auth)/login");
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const fs = fontScale;
  const fontLabel = fs <= 0.9 ? "Small" : fs <= 1.1 ? "Normal" : fs <= 1.25 ? "Large" : "X-Large";
  const roleColor = user?.role === "doctor" ? C.secondary : C.primary;
  const roleLabel = user?.role === "doctor" ? "Doctor" : "Caregiver";
  const roleIcon: any = user?.role === "doctor" ? "medical" : "heart";
  const initials = user?.name ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "??";

  return (
    <ScrollView style={[styles.root, { backgroundColor: lowStimulus ? "#F0EDF7" : C.bg }]} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.appBar}>
        <Text style={[styles.appBarTitle, { fontSize: 22 * fs }]}>Settings</Text>
      </View>

      {loadingUser ? (
        <View style={styles.profileCardSkeleton}><ActivityIndicator color={C.primary} /></View>
      ) : user ? (
        <View style={[styles.profileCard, highContrast && styles.hcBorder]}>
          <View style={[styles.avatar, { backgroundColor: roleColor + "22" }]}>
            <Text style={[styles.avatarText, { color: roleColor, fontSize: 20 * fs }]}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { fontSize: 18 * fs }]} numberOfLines={1}>{user.name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: roleColor + "18" }]}>
              <Ionicons name={roleIcon} size={11} color={roleColor} style={{ marginRight: 4 }} />
              <Text style={[styles.roleBadgeText, { color: roleColor, fontSize: 11 * fs }]}>{roleLabel}</Text>
            </View>
            <Text style={[styles.profileEmail, { fontSize: 12 * fs }]} numberOfLines={1}>{user.email}</Text>
          </View>
        </View>
      ) : null}

      <SectionTitle label="Accessibility" fs={fs} />
      <SettingsCard highContrast={highContrast}>
        <SwitchRow icon="leaf" iconBg={C.secondary + "18"} iconColor={C.secondary} title="Low-Stimulus Mode" subtitle="Soft colors, reduced visual noise" value={lowStimulus} onToggle={toggleLS} fs={fs} />
        <CardDivider />
        <SwitchRow icon="contrast" iconBg={C.primary + "18"} iconColor={C.primary} title="High Contrast" subtitle="Sharper text and border visibility" value={highContrast} onToggle={toggleHC} fs={fs} />
        <CardDivider />
        <SwitchRow icon="pause-circle" iconBg={C.accent + "18"} iconColor={C.accent} title="Reduce Motion" subtitle="Disable animations throughout the app" value={reduceMotion} onToggle={toggleRM} fs={fs} />
        <CardDivider />
        <View style={styles.fontRow}>
          <View style={styles.fontRowTop}>
            <View style={[styles.iconWrap, { backgroundColor: C.accent + "18" }]}><Ionicons name="text" size={17} color={C.accent} /></View>
            <Text style={[styles.tileTitle, { fontSize: 15 * fs, marginLeft: 12 }]}>Font Size</Text>
            <View style={styles.flex1} />
            <Text style={[styles.tileSubtitle, { fontSize: 12 * fs }]}>{fontLabel}</Text>
          </View>
          <Slider style={styles.slider} value={fontScale} minimumValue={0.85} maximumValue={1.5} step={0.05} minimumTrackTintColor={C.primary} maximumTrackTintColor={C.divider} thumbTintColor={C.primary} onValueChange={updateFontScale} />
          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabel, { fontSize: 10 * fs }]}>A</Text>
            <Text style={[styles.sliderLabelLg, { fontSize: 14 * fs }]}>A</Text>
          </View>
        </View>
      </SettingsCard>

      <SectionTitle label="About" fs={fs} />
      <SettingsCard highContrast={highContrast}>
        <TapRow icon="information-circle-outline" iconColor={C.textTertiary} title="App Version" subtitle="1.0.0" fs={fs} />
        <CardDivider />
        <TapRow icon="shield-checkmark-outline" iconColor={C.textTertiary} title="Privacy Policy" fs={fs} onPress={() => {}} />
        <CardDivider />
        <TapRow icon="document-text-outline" iconColor={C.textTertiary} title="Terms of Service" fs={fs} onPress={() => {}} />
      </SettingsCard>

      <SettingsCard highContrast={highContrast}>
        <TouchableOpacity style={styles.signOutRow} onPress={confirmLogout} activeOpacity={0.7} disabled={loggingOut}>
          <View style={[styles.iconWrap, { backgroundColor: C.sos + "15" }]}>
            {loggingOut ? <ActivityIndicator size="small" color={C.sos} /> : <Ionicons name="log-out-outline" size={18} color={C.sos} />}
          </View>
          <Text style={[styles.signOutText, { fontSize: 15 * fs, marginLeft: 12 }]}>{loggingOut ? "Signing out…" : "Sign Out"}</Text>
        </TouchableOpacity>
      </SettingsCard>
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

function SectionTitle({ label, fs }: { label: string; fs: number }) {
  return <Text style={[styles.sectionTitle, { fontSize: 11 * fs }]}>{label.toUpperCase()}</Text>;
}
function SettingsCard({ children, highContrast }: { children: React.ReactNode; highContrast: boolean }) {
  return <View style={[styles.card, highContrast && styles.hcBorder]}>{children}</View>;
}
function CardDivider() { return <View style={styles.divider} />; }
function SwitchRow({ icon, iconBg, iconColor, title, subtitle, value, onToggle, fs }: { icon: any; iconBg: string; iconColor: string; title: string; subtitle: string; value: boolean; onToggle: (v: boolean) => void; fs: number; }) {
  return (
    <View style={styles.tileRow}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}><Ionicons name={icon} size={17} color={iconColor} /></View>
      <View style={[styles.tileMeta, { marginLeft: 12 }]}>
        <Text style={[styles.tileTitle, { fontSize: 15 * fs }]}>{title}</Text>
        <Text style={[styles.tileSubtitle, { fontSize: 12 * fs }]}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: C.divider, true: C.primary + "55" }} thumbColor={value ? C.primary : "#f4f3f4"} ios_backgroundColor={C.divider} />
    </View>
  );
}
function TapRow({ icon, iconColor, title, subtitle, fs, onPress }: { icon: any; iconColor: string; title: string; subtitle?: string; fs: number; onPress?: () => void; }) {
  return (
    <TouchableOpacity style={styles.tileRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.iconWrap, { backgroundColor: iconColor + "15" }]}><Ionicons name={icon} size={17} color={iconColor} /></View>
      <View style={[styles.tileMeta, { marginLeft: 12 }]}>
        <Text style={[styles.tileTitle, { fontSize: 15 * fs }]}>{title}</Text>
        {subtitle && <Text style={[styles.tileSubtitle, { fontSize: 12 * fs }]}>{subtitle}</Text>}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={14} color={C.textTertiary} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, container: { paddingHorizontal: 16, paddingBottom: 16 },
  appBar: { paddingTop: Platform.OS === "ios" ? 56 : 20, paddingBottom: 12 },
  appBarTitle: { fontWeight: "800", color: "#1E293B", letterSpacing: -0.3 },
  profileCardSkeleton: { height: 100, borderRadius: 18, backgroundColor: "#FFFFFF", marginBottom: 24, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E5E7EB" },
  profileCard: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 18, backgroundColor: "#FFFFFF", marginBottom: 24, borderWidth: 1, borderColor: "#E5E7EB", shadowColor: "#4A90E2", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", marginRight: 14 },
  avatarText: { fontWeight: "800" }, profileInfo: { flex: 1 },
  profileName: { fontWeight: "800", color: "#1E293B", marginBottom: 5 },
  roleBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginBottom: 4 },
  roleBadgeText: { fontWeight: "700" }, profileEmail: { color: "#94A3B8" },
  sectionTitle: { fontWeight: "700", color: "#94A3B8", letterSpacing: 1.0, marginBottom: 10, marginTop: 4 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 20, overflow: "hidden" },
  hcBorder: { borderColor: "#1E293B", borderWidth: 1.5 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginLeft: 52 },
  tileRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  tileMeta: { flex: 1 }, tileTitle: { fontWeight: "600", color: "#1E293B" }, tileSubtitle: { color: "#94A3B8", marginTop: 2 },
  fontRow: { paddingHorizontal: 16, paddingVertical: 12 }, fontRowTop: { flexDirection: "row", alignItems: "center" },
  flex1: { flex: 1 }, slider: { width: "100%", marginTop: 8 },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4, marginTop: -4 },
  sliderLabel: { color: "#94A3B8", fontWeight: "500" }, sliderLabelLg: { color: "#94A3B8", fontWeight: "700" },
  signOutRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  signOutText: { fontWeight: "700", color: "#EF4444" },
});