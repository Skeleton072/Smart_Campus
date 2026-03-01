import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Pressable } from "react-native";
import { Ionicons, Feather, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../utils/SupabaseClient";
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { router, useRouter } from "expo-router";
import { automationToggle, deleteAutomation } from "../utils/services/automateService";

type AutomationListType = {
  id: string,
  title: string,
  device: string,
  is_enabled: boolean,
  trigger_type: "sensor" | "time",
  condition: { from: string, to: string } | { details: string},
  action: "ON" | "OFF",
  is_running: boolean,
}

type AutomationItemType = {
  title: string,
  condition: { from: string, to: string } | { details: string},
  type: "sensor" | "time",
  device: string,
  enabled: boolean,
  color: string,
  id: string,
  action: "ON" | "OFF",
  setAutomationList: React.Dispatch<React.SetStateAction<AutomationListType[] | null>>,
  is_running: boolean
}


export default function AutomateScreen() {
  const router = useRouter();

  const [automationList, setAutomationList] = useState<AutomationListType[] | null>(null);
  const [activeAutomations, setActiveAutomations] = useState(0);

  // useEffect(() => {
  //   const unsubscribe = NetInfo.addEventListener(state => {
  //     if (state.isConnected) {
  //       fetchAutomations();
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);

  useEffect(() => {
    async function fetchAutomations() {
      const { data, error } = await supabase
        .from("automations")
        .select("*");

      if (error) {
        console.log("Error: ", error.message);
      }

      let res = 0;
      data!.forEach(row => {
        if (row.is_enabled) {
          res++;
        }
      });

      setActiveAutomations(res);
      setAutomationList(data);
    }

    fetchAutomations();

    const channel = supabase
      .channel("automations")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT | UPDATE | DELETE
          schema: "public",
          table: "automations",
        },
        (payload) => {
          switch (payload.eventType) {
            case "INSERT":
              setAutomationList((prev: any) =>
                prev ? [payload.new, ...prev] : [payload.new]
              );
              break;

            case "UPDATE":
              setAutomationList((prev: any) =>
                prev?.map((automation: AutomationListType) =>
                  automation.id === payload.new.id
                    ? payload.new
                    : automation
                )
              );
              break;

            case "DELETE":
              setAutomationList((prev: any) =>
                prev?.filter(
                  (automation: AutomationListType) => automation.id !== payload.old.id
                )
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  


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

        {/* Title with decorative elements */}
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Feather name="zap" size={20} color="#667EEA" />
              <Text style={styles.title}>Smart Automations</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{activeAutomations} Active</Text>
            </View>
          </View>
        </View>

        {/* Automation List */}
        <View style={styles.automationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Routines</Text>
            <View style={styles.sectionDecoration} />
          </View>

          {
            automationList?.map((automation, index) => (
              <AutomationItem 
                key={index}
                title={automation.title}
                id={automation.id}
                device={automation.device}
                condition={automation.condition}
                type={automation.trigger_type}
                action={automation.action}
                // subtitle={automation.type == "time" ? `From ${automation.condition.from} to ${automation.condition.to}` : automation.condition.details}
                // icon={automation.device == "Light" ? "lightbulb-on-10" : "fan"}
                color={automation.trigger_type == "time" ? "#6200ea" : "#6200ea"}
                enabled={automation.is_enabled}
                is_running={automation.is_running}
                setAutomationList={setAutomationList}
              />
            ))
          }
        </View>

        {/* Add New Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => {
          router.push({
            pathname: "/screens/addAutomation",
            params: {
              update: "false"
            }
          });
        }}>
          <View style={styles.addButtonInner}>
            <View style={styles.addIcon}>
              <Ionicons name="add" size={24} color="#667EEA" />
            </View>
            <View style={styles.addButtonContent}>
              <Text style={styles.addButtonTitle}>Create New Automation</Text>
              <Text style={styles.addButtonSubtitle}>Set up custom routines and triggers</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* <AutomationModal modalVisible={modalVisible} setModalVisible={setModalVisible} onCreateFunction={onCreateFunction} /> */}
    </SafeAreaView>
  );
}

const AutomationItem = React.memo(({ title, condition, type, device, enabled, color, id, action, setAutomationList, is_running }: AutomationItemType) => {
  const [isEnabled, setIsEnabled] = useState<boolean>();
  const swipeRef = useRef<Swipeable>(null);

  useEffect(() => {
    setIsEnabled(enabled);
  }, [enabled]);

  async function switchFunction() {
    // const { error } = await supabase
    //   .from("automations")
    //   .update({ is_enabled: !isEnabled })
    //   .eq("id", id);

    await automationToggle(isEnabled!, id);
    
    setIsEnabled(!isEnabled);
    return;
  }

  async function deleteFunction() {
    // const { error } = await supabase
    //   .from("automations")
    //   .delete()
    //   .match({ id: id });

    // if (error) {
    //   console.log("Error: ", error.message);
    //   return;
    // }

    await deleteAutomation(id);

    swipeRef.current?.close();
    // need to add types
    setAutomationList((prev) => {
      if (!prev) return prev;
      return prev.filter((row) => row.id !== id);
    });
  }

  function renderRightAction() {
    return (
      <Pressable 
        onPress={deleteFunction}
        style={[styles.hint, styles.deleteHint]}
      >
        <Ionicons name="trash-outline" size={24} color="#DC2626" />
        <Text style={[styles.hintText, styles.deleteHintText]}>Delete</Text>
      </Pressable>
    )
  }

  function renderLeftAction() {
    return (
      <Pressable
        onPress={() => {
          router.push({
            pathname: "/screens/addAutomation",
            params: {
              id,
              title,
              device,
              condition: JSON.stringify(condition),
              type,
              action,
              update: "true",
            }
          });
          swipeRef.current?.close();
        }}
        style={[styles.hint, styles.editHint]}
      >
        <Feather name="edit" size={24} color="#000080"/>
        <Text style={[styles.hintText, styles.editHintText]}>Edit</Text>
      </Pressable>
    )
  }

  return (
    <Swipeable
      renderRightActions={renderRightAction}
      renderLeftActions={renderLeftAction}
      overshootLeft={false}
      overshootRight={false}
      ref={swipeRef}
    >
      <TouchableOpacity
        style={styles.automationCard}
        // onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={300}
      >
        <View style={styles.automationLeft}>
          <View style={[styles.automationIcon, { backgroundColor: `${color}15` }]}>
            <MaterialCommunityIcons name={device == "Light" ? "lightbulb-on-10" : "fan"} size={24} color={color} />
          </View>

          <View style={styles.automationContent}>
            <Text style={styles.automationTitle}>{title}</Text>
            <Text style={styles.automationSubtitle}>{
              type === "time"
                ? `From ${(condition as { from: string }).from} to ${(condition as { to: string }).to}`
                : (condition as { details: string }).details
            }</Text>
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Switch
            onValueChange={switchFunction}
            value={isEnabled}
            trackColor={{ false: '#E2E8F0', true: color }}
            thumbColor={isEnabled ? 'white' : '#f4f3f4'}
          />
          {is_running && <View style={[styles.activeDot, { backgroundColor: color }]} />}
        </View>
      </TouchableOpacity>
    </Swipeable>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  headerContainer: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3748',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
  roomSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roomText: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3748',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 4,
  },
  countBadge: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  countText: {
    color: '#667EEA',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 18,
  },
  automationsSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  sectionDecoration: {
    width: 40,
    height: 4,
    backgroundColor: '#667EEA',
    borderRadius: 2,
  },
  automationContainer: {
    position: 'relative',
    marginTop: 12,
  },
  automationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 14
  },
  touchableArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  automationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  automationIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  automationContent: {
    flex: 1,
  },
  automationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  automationSubtitle: {
    fontSize: 12,
  },
  switchContainer: {
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  hint: {
    width: 80,
    height: 85,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    zIndex: -1,
  },
  deleteHint: {
    marginLeft: 15,
    backgroundColor: '#FEE2E2',
  },
  editHint: {
    marginRight: 15,
    backgroundColor: "#B0E0E6"
  },
  hintText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  deleteHintText: {
    color: '#DC2626',
  }, 
  editHintText: {
    color: "#000080"
  },
  quickActions: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3748',
  },
  addButton: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  addButtonInner: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  addIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addButtonContent: {
    flex: 1,
  },
  addButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  addButtonSubtitle: {
    fontSize: 12,
    color: '#718096',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667EEA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});