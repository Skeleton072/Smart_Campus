import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function UsageScreen() {
  const weeklyData = [
    { day: "Sun", value: 60 },
    { day: "Mon", value: 40 },
    { day: "Tue", value: 80 },
    { day: "Wed", value: 55 },
    { day: "Thu", value: 65 },
    { day: "Fri", value: 100, active: true }, // Highlighted bar
    { day: "Sat", value: 35 },
  ];

  const devices = [
    {
      id: 1,
      name: "Smart Lamp",
      units: 6,
      time: "8h 3m",
      usage: "100 kWh",
      trend: "+05.3%",
      up: true,
      icon: <MaterialCommunityIcons name="lamp-outline" size={25} color="000" />,
    },
    {
      id: 2,
      name: "Smart TV",
      units: 2,
      time: "2h 3m",
      usage: "400 kWh",
      trend: "-10.3%",
      up: false,
      icon: <MaterialCommunityIcons name="television" size={25} color="000" />,
    },
    {
      id: 3,
      name: "Air Conditioner",
      units: 3,
      time: "2h 3m",
      usage: "600 kWh",
      trend: "+07.3%",
      up: true,
      icon: <MaterialCommunityIcons name="air-conditioner" size={25} color="000" />,
    },
    {
      id: 4,
      name: "Wireless Speaker",
      units: 3,
      time: "2h 3m",
      usage: "100 kWh",
      trend: "+02.3%",
      up: true,
      icon: <MaterialCommunityIcons name="speaker" size={25} color="000" />,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Power Usage</Text>
            <Text style={styles.headerSubtitle}>
              See power consumption report here!
            </Text>
          </View>
        </View>

        {/* Time Filter Tabs */}
        <View style={styles.tabContainer}>
          {["1W", "1M", "3M", "1Y", "3Y"].map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, index === 0 && styles.activeTab]}
            >
              <Text
                style={[styles.tabText, index === 0 && styles.activeTabText]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart Section */}
        <View style={styles.chartContainer}>
          {weeklyData.map((item, index) => (
            <View key={index} style={styles.barWrapper}>
              {item.active && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>1200 kWh</Text>
                  <View style={styles.tooltipArrow} />
                </View>
              )}
              <View
                style={[
                  styles.bar,
                  { height: item.value * 1.5 },
                  item.active && styles.activeBar,
                ]}
              />
              <Text
                style={[styles.dayText, item.active && styles.activeDayText]}
              >
                {item.day}
              </Text>
            </View>
          ))}
        </View>

        {/* Device List Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today Power Usage</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {devices.map((device) => (
          <View key={device.id} style={styles.deviceCard}>
            <View style={styles.iconCircle}>{device.icon}</View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceMeta}>
                {device.units} Unit • {device.time}
              </Text>
            </View>
            <View style={styles.usageInfo}>
              <Text style={styles.usageText}>{device.usage}</Text>
              <Text
                style={[
                  styles.trendText,
                  { color: device.up ? "#4CAF50" : "#F44336" },
                ]}
              >
                {device.up ? "↗" : "↘"} {device.trend}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContent: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1A1A1A" },
  headerSubtitle: { color: "#999", marginTop: 4 },
  shareButton: {
    padding: 10,
    backgroundColor: "#FFF",
    borderRadius: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 30,
    padding: 5,
    marginBottom: 30,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 25 },
  activeTab: { backgroundColor: "#FFF", elevation: 3 },
  tabText: { color: "#999", fontWeight: "600" },
  activeTabText: { color: "#1A1A1A" },

  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 250,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  barWrapper: { alignItems: "center", flex: 1 },
  bar: { width: 35, backgroundColor: "#E0E0E0", borderRadius: 8 },
  activeBar: { backgroundColor: "#007AFF" },
  dayText: { marginTop: 10, color: "#999", fontSize: 13 },
  activeDayText: { color: "#007AFF", fontWeight: "bold" },

  tooltip: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    position: "absolute",
    top: -45,
    zIndex: 10,
  },
  tooltipText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#1A1A1A",
    alignSelf: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1A1A1A" },
  seeAll: {
    color: "#999",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 12,
  },

  deviceCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderBottomWidth: 1,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 16, fontWeight: "600", color: "#1A1A1A" },
  deviceMeta: { color: "#999", fontSize: 13, marginTop: 4 },
  usageInfo: { alignItems: "flex-end" },
  usageText: { fontSize: 16, fontWeight: "bold", color: "#0056B3" },
  trendText: { fontSize: 12, marginTop: 4, fontWeight: "600" },
});

