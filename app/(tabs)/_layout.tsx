import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useUI } from "../../src/context/UIContext";
import * as Haptics from "expo-haptics";

export default function TabLayout() {
  const { highContrast, fontScale, reduceMotion } = useUI();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: highContrast ? 1.5 : 0.5,
          borderTopColor: "#E5E7EB",
        },

        tabBarActiveTintColor: "#4A90E2",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarLabelStyle: {
          fontSize: 10 * fontScale,
          fontWeight: "600",
        },
        tabBarButton: (props: any) => (
          <Pressable
            {...(props as any)}
            onPress={(e) => {
              if (!reduceMotion) {
                Haptics.selectionAsync();
              }
              props.onPress?.(e);
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={20} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}