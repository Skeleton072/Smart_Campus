import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../utils/SupabaseClient";
import { getDevicesData, updateDevicesData } from "../utils/services/indexService";

interface DeviceCardProps {
  title: string,
  subtitle: string,
  icon: any,
  active: boolean
}

interface WeatherInfoProps {
  icon: any,
  label: string,
  value: string
}

interface DeviceProps {
  device_name: string,
  is_enabled: boolean,
}

// need to do weather api or fetch data from ESP32 for the weather card
// YOU CAN'T MAKE THE ALRAM GO ON

const devices = [
  {
    title: "Light",
    subtitle: "Light Opened",
    table: "classroom_settings",
    icon: "lightbulb-on-10",
    col: "light_enabled",
  },
  {
    title: "Fan",
    subtitle: "Fan Opened",
    table: "fan_table",
    icon: "fan",
    col: "is_enabled",
  },
  {
    title: "Gate",
    subtitle: "Gate Opened",
    table: "gate_table",
    icon: "boom-gate",
    col: "is_enabled",
  },
  {
    title: "Alarm",
    subtitle: "Alarm Opened",
    table: "intrusion_state",
    icon: "alarm-light-outline",
    col: "is_enabled",
  }
];

export default function HomeScreen() {
  const [deviceState, setDeviceState] = useState<Record<string, boolean> | null>({});

  const deviceCards = useMemo(() => {
    if (deviceState) {
      return devices.map((device) => {
        return (
          <DeviceCard
            key={device.title}
            title={device.title} 
            subtitle={deviceState[device.title] ? `${device.title} Opened` : `${device.title} Closed`}
            icon={device.icon}
            active={deviceState[device.title] ?? false}
          />
        )
      })
    }
  }, [deviceState]);

  useEffect(() => {
    async function fetchFunction() {
      const data = await getDevicesData();

      if (data) {
        const myobject: Record<string, boolean> = {};
    
        data.forEach((row: DeviceProps) => {
          myobject[row.device_name] = row.is_enabled;
        });
    
        setDeviceState(myobject);
      }
    }

    fetchFunction();

    const channel = supabase
      .channel("classroom-devices")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT | UPDATE | DELETE
          schema: "public",
          table: "classroom_devices",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const { device_name, is_enabled } = payload.new;

            setDeviceState((prev) => ({
              ...prev,
              [device_name]: is_enabled,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  if (deviceState == null) {
    return(
      <View>
        <Text>fetching data</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* This is like _layout.tsx */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.locationSelector}>
            <Feather name="home" size={17} color="#4A5568" />
            <Text style={styles.locationText}>Smart Campus</Text>
          </TouchableOpacity>

          <View style={styles.headerIcons}>
            <Ionicons name="notifications-outline" size={22} color="#2D3748" />
            <View style={styles.avatar} />
          </View>
        </View>

        {/* Need changes */}
        <View style={styles.weatherCard}>
          <Text style={styles.weatherDate}>Tuesday, 11 March 2026</Text>

          <View style={styles.weatherMain}>
            <View>
              <Text style={styles.weatherCondition}>Cloudy</Text>
              <Text style={styles.weatherDescription}>Limited Sunshine</Text>
            </View>

            <Text style={styles.weatherTemp}>52°F</Text>
          </View>

          <View style={styles.weatherInfoContainer}>
            <WeatherInfo icon="droplet" label="Humidity" value="65%" />
            <WeatherInfo icon="wind" label="Wind" value="5 km/h" />
            <WeatherInfo icon="umbrella" label="Rain" value="40%" />
          </View>
        </View>

        {/* Connected Devices */}
        <View style={styles.devicesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Connected Devices</Text>
            <View style={styles.deviceCount}>
              <Text style={styles.deviceCountText}>{devices.length}</Text>
            </View>
          </View>

          <View style={styles.devicesGrid}>
            {deviceCards}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function WeatherInfo({ icon, label, value }: WeatherInfoProps) {
  return (
    <View style={styles.weatherInfo}>
      <View style={[styles.weatherIcon, { backgroundColor: "#ffffff" }]}>
        <Feather name={icon} size={20} color="blue" />
      </View>
      <Text style={styles.weatherInfoLabel}>{label}</Text>
      <Text style={styles.weatherInfoValue}>{value}</Text>
    </View>
  );
}

const DeviceCard = React.memo(({ title, subtitle, icon, active }: DeviceCardProps) => {
  async function onPressFunction() {
    return await updateDevicesData(!active, title);
  }

  return (
    <TouchableOpacity
      style={[
        styles.deviceCard,
        active && styles.deviceCardActive,
      ]}
      activeOpacity={0.3}
      onPress={onPressFunction}
    >
      <View style={[styles.deviceIcon, { backgroundColor: `white` }]}>
        <MaterialCommunityIcons
          name={icon}
          size={25}
          color={"000"}
        />
      </View>
      <Text style={[
        styles.deviceTitle,
        // isPressed && styles.deviceTitlePressed
      ]}>
        {title}
      </Text>
      <Text style={styles.deviceSubtitle}>{subtitle}</Text>
      {active && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#2D3748",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
  },
  weatherCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "rgba(45, 55, 72, 0.95)",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#2D3748",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  weatherDate: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginBottom: 8,
  },
  weatherMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  weatherCondition: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },
  weatherDescription: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginTop: 2,
  },
  weatherTemp: {
    color: "white",
    fontSize: 36,
    fontWeight: "700",
  },
  weatherInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  weatherInfo: {
    alignItems: "center",
  },
  weatherInfoLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 6,
  },
  weatherInfoValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  devicesSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
  },
  deviceCount: {
    marginLeft: 8,
    backgroundColor: "#667EEA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deviceCountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  devicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  deviceCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  deviceCardActive: {
    borderColor: "#667EEA",
    shadowColor: "#667EEA",
    shadowOpacity: 0.1,
  },
  deviceCardPressed: {
    borderColor: "#4F46E5",
    backgroundColor: "#F8FAFC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    elevation: 1,
    transform: [{ scale: 0.97 }],
  },
  deviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  deviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  deviceTitlePressed: {
    color: "#4F46E5",
  },
  deviceSubtitle: {
    fontSize: 12,
    color: "#718096",
  },
  activeIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#667EEA",
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 5,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#667EEA",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667EEA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  navCurve: {
    height: 30,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  navItems: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: "center",
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIconContainerActive: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
  },
  tabLabel: {
    fontSize: 10,
    color: "#A0AEC0",
    marginTop: 4,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#667EEA",
    fontWeight: "600",
  },
  weatherIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },



  button: {
    width: "48%",
    backgroundColor: "#3B82F6", // blue-500
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,

    // "border-b-[4px]" illusion
    borderBottomWidth: 4,
    borderColor: "#2563EB", // blue-600

    // lifted look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,

    alignItems: "center",
    justifyContent: "center",
  },

  buttonPressed: {
    // active:translate-y-[2px]
    transform: [{ translateY: 2 }],

    // active:border-b-[2px]
    borderBottomWidth: 2,

    // active:brightness-90
    backgroundColor: "#2563EB",

    // reduce shadow when pressed
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    elevation: 1,
  },

  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
