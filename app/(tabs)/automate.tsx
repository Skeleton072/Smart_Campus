import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Animated, Alert, Pressable } from "react-native";
import { Ionicons, Feather, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../utils/SupabaseClient";
import AutomationModal from "../(modals)/automationModal";
import NetInfo from "@react-native-community/netinfo";
import Swipeable from 'react-native-gesture-handler/Swipeable';

export default function AutomateScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [automationList, setAutomationList] = useState<null | any[]>();
  const [activeAutomations, setActiveAutomations] = useState(0);

  function onCreateFunction(newAutomation: object) {
    setAutomationList(prev => [...prev!, newAutomation])
  }

  async function fetchAutomations() {
    const { data, error } = await supabase
      .from("automations")
      .select("*");

    if (error) {
      console.log("Error: ", error.message);
    }

    let res = 0;
    data.forEach(row => {
      if (row.is_enabled) {
        res++;
      }
    });

    setActiveAutomations(res);
    setAutomationList(data);
  }


  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // console.log(state.isConnected);
      if (state.isConnected) {
        fetchAutomations();
      }
    });

    return () => unsubscribe();
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
                // subtitle={automation.device}
                subtitle={automation.type == "time" ? `From ${automation.condition.from} to ${automation.condition.to}` : automation.condition.details}
                icon={automation.device == "Light" ? "lightbulb-on-10" : "fan"}
                color={automation.type == "time" ? "#6200ea" : "#6200ea"}
                enabled={automation.is_enabled}
                setAutomationList={setAutomationList}
              />
            ))
          }
        </View>

        {/* Add New Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(!modalVisible)}>
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

      <AutomationModal modalVisible={modalVisible} setModalVisible={setModalVisible} onCreateFunction={onCreateFunction} />
    </SafeAreaView>
  );
}

function AutomationItem({ title, subtitle, icon, enabled, color, id, onDelete, setAutomationList }: any) {
  const [isEnabled, setIsEnabled] = useState();
  // console.log(id);

  useEffect(() => {
    setIsEnabled(enabled);
  }, [enabled]);

  async function switchFunction() {
    const { data, error } = await supabase
      .from("automations")
      .update({ is_enabled: !isEnabled })
      .eq("id", id);

    if (error) {
      console.log("Error: ", error.message);
      return;
    }
    
    setIsEnabled(!isEnabled);
    return;
  }

  function handleLongPress() {
    console.log("Long Press.");
  }

  async function deleteFunction() {
    const { data, error } = await supabase
      .from("automations")
      .delete()
      .match({ id: id });

    if (error) {
      console.log("Error: ", error.message);
      return;
    }

    setAutomationList(prev => prev.filter(row => row.id != id));
  }

  function renderRightAction() {
    return (
      <Pressable 
        onPress={deleteFunction}
        style={styles.deleteHint}
      >
        <Ionicons name="trash-outline" size={24} color="#DC2626" />
        <Text style={styles.deleteHintText}>Delete</Text>
      </Pressable>
    )
  }

  return (
    <Swipeable
      renderRightActions={renderRightAction}
      style={styles.automationContainer}
      overshootLeft={false}
      overshootRight={false}
    >
      <TouchableOpacity
        style={styles.automationCard}
        // onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={300}
      >
        <View style={styles.automationLeft}>
          <View style={[styles.automationIcon, { backgroundColor: `${color}15` }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
          </View>

          <View style={styles.automationContent}>
            <Text style={styles.automationTitle}>{title}</Text>
            <Text style={styles.automationSubtitle}>{subtitle}</Text>
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Switch
            onValueChange={switchFunction}
            value={isEnabled}
            trackColor={{ false: '#E2E8F0', true: color }}
            thumbColor={isEnabled ? 'white' : '#f4f3f4'}
          />
          {isEnabled && <View style={[styles.activeDot, { backgroundColor: color }]} />}
        </View>
      </TouchableOpacity>
    </Swipeable>
  )
}


/* ---------- Styles ---------- */

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
  switchContainer: {
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  deleteHint: {
    width: 80,
    height: 95,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    zIndex: -1,
  },
  deleteHintText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
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