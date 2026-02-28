import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, Platform, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../utils/SupabaseClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

interface AutomationModalProps {
  modalVisible: boolean;
  onCreateFunction: (newData: any) => void;
  setModalVisible: (visible: boolean) => void;
}

export default function AddAutomationScreen() {
  const router = useRouter();
  const { title, device, type, action } = useLocalSearchParams();

  const [automationTitle, setAutomationTitle] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 3600000)); // +1 hour
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [automationType, setAutomationType] = useState<'time' | 'sensor'>('sensor'); // Changed to explicit type
  const [shouldTurnOn, setShouldTurnOn] = useState(true);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null); // New state for conditions

  const devices = [
    { id: '1', name: 'Light', icon: 'lightbulb-on-10' },
    { id: '2', name: 'Fan', icon: 'fan' }
  ];

  const lightConditions = [
    { id: 'light-1', title: 'When it gets dark', description: 'Based on sunset time', icon: 'moon-outline' },
  ];

  const fanConditions = [
    { id: 'fan-1', title: 'When temperature rises', description: 'Above 25°C', icon: 'thermometer-outline' },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const resetForm = () => {
    setAutomationTitle('');
    setSelectedDevice(null);
    setSelectedCondition(null);
    setShouldTurnOn(true);
    setAutomationType('time');
    setStartTime(new Date());
    setEndTime(new Date(Date.now() + 3600000));
  };

  const handleCreate = async () => {
    if (!automationTitle || !selectedDevice) {
      return false;
    }

    // Validate based on automation type
    if (automationType === 'sensor' && !selectedCondition) {
      return false;
    }

    // setModalVisible(false);

    const newData = {
      title: automationTitle,
      device: selectedDevice === "1" ? "Light" : "Fan",
      is_enabled: true,
      trigger_type: automationType,
      condition: automationType === 'time' 
        ? { 
            trigger_type: 'time',
            from: `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`, 
            to: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}` 
          } 
        : { 
            trigger_type: 'sensor',
            details: selectedDevice === "1" 
              ? lightConditions.find(c => c.id == selectedCondition)!.title
              : fanConditions.find(c => c.id == selectedCondition)!.title
          },
      action: shouldTurnOn ? "ON" : "OFF"
    };

    const { error } = await supabase
      .from("automations")
      .insert(newData)
      .select()
      .single();

    if (error) {
      console.log("Error: ", error.message);
      return;
    }
    router.back();
    // onCreateFunction(newData);
    resetForm();
  };

  const onCloseFunction = () => {
    resetForm();
    // setModalVisible(false);
    router.back();
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  // Get conditions based on selected device
  const getConditionsForDevice = () => {
    if (!selectedDevice) return [];
    return selectedDevice === "1" ? lightConditions : fanConditions;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#2D3748" />
            </TouchableOpacity>
            
            <View style={styles.headerLeft}>
              {/* <Ionicons name="settings-outline" size={20} color="#667EEA" /> */}
              <Text style={styles.modalTitle}>New Automation</Text>
            </View>

            <View />
          </View>

          <View>
            {/* Automation Name */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Automation Name</Text>
                <View style={styles.requiredDot} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Morning Routine"
                placeholderTextColor="#A0AEC0"
                value={automationTitle}
                onChangeText={setAutomationTitle}
              />
            </View>
            {/* Select Device */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Select Device</Text>
                <View style={styles.requiredDot} />
              </View>
              <Text style={styles.sectionSubtitle}>Choose which device to automate</Text>
              
              <View style={styles.devicesGrid}>
                {devices.map((device) => (
                  <TouchableOpacity
                    key={device.id}
                    activeOpacity={0.3}
                    style={[
                      styles.deviceCard,
                      selectedDevice === device.id && styles.deviceCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedDevice(device.id);
                    }}>
                    <View style={[
                      styles.deviceIcon,
                      selectedDevice === device.id && styles.deviceIconSelected,
                    ]}>
                      <MaterialCommunityIcons
                        name={device.icon as any}
                        size={24}
                        color={selectedDevice === device.id ? '#667EEA' : '#4A5568'}
                      />
                    </View>
                    <Text style={[
                      styles.deviceName,
                      selectedDevice === device.id && styles.deviceNameSelected,
                    ]}>
                      {device.name}
                    </Text>
                    {selectedDevice === device.id && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark-circle" size={20} color="#667EEA" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Device Action (Switch On/Off) */}
            {selectedDevice && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Device Action</Text>
                  <View style={styles.requiredDot} />
                </View>
                <Text style={styles.sectionSubtitle}>Choose what happens when automation triggers</Text>
                
                <View style={styles.actionSwitchContainer}>
                  <View style={styles.actionSwitch}>
                    {/* ON Button */}
                    <Pressable 
                      style={[
                        styles.actionButton,
                        styles.actionButtonLeft,
                        // shouldTurnOn && styles.conditionButtonActive,
                        shouldTurnOn && styles.actionButtonOnActive,
                      ]}
                      onPress={() => setShouldTurnOn(true)}
                    >
                      <Ionicons 
                        name="power" 
                        size={20} 
                        color={shouldTurnOn ? "#ffffff" : "#48BB78"} 
                      />
                      <Text style={[
                        styles.actionButtonText,
                        shouldTurnOn && styles.actionButtonTextActive,
                      ]}>TURN ON</Text>
                    </Pressable>
                    
                    {/* OFF Button */}
                    <Pressable 
                      style={[
                        styles.actionButton,
                        styles.actionButtonRight,
                        // !shouldTurnOn && styles.conditionButtonActive,
                        !shouldTurnOn && styles.actionButtonOffActive,
                      ]}
                      onPress={() => setShouldTurnOn(false)}
                    >
                      <Ionicons 
                        name="power" 
                        size={20} 
                        color={!shouldTurnOn ? "#ffffff" : "#F56565"} 
                      />
                      <Text style={[
                        styles.actionButtonText,
                        !shouldTurnOn && styles.actionButtonTextActive,
                      ]}>TURN OFF</Text>
                    </Pressable>
                  </View>
                  
                  {/* Visual indicator */}
                  <View style={styles.actionIndicator}>
                    <View style={[
                      styles.indicatorIcon,
                      shouldTurnOn ? styles.indicatorOn : styles.indicatorOff,
                    ]}>
                      <Ionicons 
                        name={shouldTurnOn ? "sunny" : "moon"} 
                        size={16} 
                        color="white" 
                      />
                    </View>
                    <Text style={styles.actionIndicatorText}>
                      {shouldTurnOn ? 'Device will turn ON' : 'Device will turn OFF'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            {/* Automation Type Selection */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Automation Type</Text>
                <View style={styles.requiredDot} />
              </View>
              
              <View style={styles.actionSwitch}>
                {/* Time Based Button */}
                <Pressable
                  style={[
                    styles.actionButton,
                    styles.actionButtonLeft,
                    // automationType === 'condition' && styles.conditionButtonActive,
                    automationType === 'time' && styles.conditionButtonOnActive,
                  ]}
                  onPress={() => setAutomationType('time')}
                >
                  <Ionicons 
                    name="time-outline" 
                    size={20}
                    color={automationType === 'time' ? "#ffffff" : "#667EEA"} 
                  />
                  <Text style={[
                    styles.actionButtonText,
                    // automationType === 'condition' && styles.actionButtonTextOnActive,
                    automationType === 'time' && styles.actionButtonTextActive,
                  ]}>Time Based</Text>
                </Pressable>
                
                {/* Condition Based Button */}
                <Pressable 
                  style={[
                    styles.actionButton,
                    styles.actionButtonRight,
                    // automationType === 'time' && styles.conditionButtonActive,
                    automationType === 'sensor' && styles.conditionButtonOnActive,
                  ]}
                  onPress={() => setAutomationType('sensor')}
                >
                  <Ionicons 
                    name="contrast-outline" 
                    size={20}
                    color={automationType === 'sensor' ? "#ffffff" : "#667EEA"} 
                  />
                  <Text style={[
                    styles.actionButtonText,
                    // automationType === 'time' && styles.actionButtonTextOnActive,
                    automationType === 'sensor' && styles.actionButtonTextActive,
                  ]}>Condition Based</Text>
                </Pressable>
              </View>
            </View>
            {/* Condition Based UI */}
            {selectedDevice && automationType === 'sensor' && (
              <View style={styles.section}>
                {/* <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Select Condition</Text>
                  <View style={styles.requiredDot} />
                </View> */}
                
                <View style={styles.conditionsList}>
                  {getConditionsForDevice().map((condition: any) => (
                    <TouchableOpacity
                      key={condition.id}
                      activeOpacity={0.3}
                      style={[
                        styles.conditionCard,
                        selectedCondition === condition.id && styles.conditionCardSelected,
                      ]}
                      onPress={() => setSelectedCondition(condition.id)}
                    >
                      <View style={styles.conditionLeft}>
                        <View style={[
                          styles.conditionIcon,
                          selectedCondition === condition.id && styles.conditionIconSelected,
                        ]}>
                          <Ionicons
                            name={condition.icon as any}
                            size={20}
                            color={selectedCondition === condition.id ? '#667EEA' : '#4A5568'}
                          />
                        </View>
                        <View style={styles.conditionContent}>
                          <Text style={styles.conditionTitle}>{condition.title}</Text>
                          <Text style={styles.conditionDescription}>{condition.description}</Text>
                        </View>
                      </View>
                      <View style={[
                        styles.conditionCheckbox,
                        selectedCondition === condition.id && styles.conditionCheckboxSelected,
                      ]}>
                        {selectedCondition === condition.id && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            {/* Time Based UI */}
            {selectedDevice && automationType === 'time' && (
              <View style={styles.section}>
                <View style={styles.timeContainer}>
                  {/* Start Time */}
                  <TouchableOpacity 
                    style={styles.timeCard}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <View style={styles.timeCardHeader}>
                      <Feather name="sunrise" size={16} color={'#F6AD55'} />
                      <Text style={styles.timeCardTitle}>Start Time</Text>
                    </View>
                    <View style={styles.timeSelector}>
                      <Text style={styles.timeText}>{formatTime(startTime)}</Text>
                      <Ionicons name="time-outline" size={20} color="#718096" />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.timeDivider}>
                    <Feather name="arrow-right" size={16} color="#CBD5E0" />
                  </View>
                  {/* End Time */}
                  <TouchableOpacity
                    style={styles.timeCard}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <View style={styles.timeCardHeader}>
                      <Feather name="sunset" size={16} color={'#667EEA'} />
                      <Text style={styles.timeCardTitle}>End Time</Text>
                    </View>
                    <View style={styles.timeSelector}>
                      <Text style={styles.timeText}>{formatTime(endTime)}</Text>
                      <Ionicons name="time-outline" size={20} color="#718096" />
                    </View>
                  </TouchableOpacity>
                </View>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onStartTimeChange}
                  />
                )}
                {showEndTimePicker && (
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onEndTimeChange}
                  />
                )}
              </View>
            )}
            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCloseFunction}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!automationTitle || !selectedDevice || 
                    (automationType === 'sensor' && !selectedCondition)) && 
                    styles.createButtonDisabled,
                ]}
                onPress={handleCreate}
                disabled={!automationTitle || !selectedDevice || 
                  (automationType === 'sensor' && !selectedCondition)}>
                <Text style={styles.createButtonText}>Create Automation</Text>
                <Ionicons name="add-circle-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalContent: {
    backgroundColor: '#F7FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    paddingHorizontal: 20,
    width: '100%',
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  requiredDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FC8181',
  },
  optionalLabel: {
    fontSize: 12,
    color: '#718096',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  devicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  deviceCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  deviceCardSelected: {
    borderColor: '#667EEA',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceIconSelected: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  deviceName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4A5568',
    textAlign: 'center',
  },
  deviceNameSelected: {
    color: '#667EEA',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  actionSwitchContainer: {
    alignItems: 'center',
  },
  conditionSwitchContainer: {
    alignItems: 'center',
    marginTop: 25,
  },
  actionSwitch: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 12,
    width: '100%',
    height: 60,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonLeft: {
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  actionButtonRight: {
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
  },
  actionButtonActive: {
    backgroundColor: '#667EEA',
  },
  actionButtonOnActive: {
    backgroundColor: '#48BB78', // Green for ON
  },
  conditionButtonOnActive: {
    backgroundColor: "#667EEA"
  },
  actionButtonOffActive: {
    backgroundColor: '#F56565', // Red for OFF
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A5568',
  },
  actionButtonTextActive: {
    color: 'white',
  },
  actionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  indicatorIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorOn: {
    backgroundColor: '#48BB78',
  },
  indicatorOff: {
    backgroundColor: '#718096',
  },
  actionIndicatorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4A5568',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeCardTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A5568',
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white', // Normal state
    borderColor: '#E2E8F0',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    // color: '#4A5568', // Normal state
  },
  timeDivider: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionsList: {
    gap: 8,
  },
  conditionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  conditionCardSelected: {
    borderColor: '#667EEA',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  conditionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  conditionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conditionIconSelected: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  conditionContent: {
    flex: 1,
  },
  conditionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  conditionDescription: {
    fontSize: 12,
    color: '#718096',
  },
  conditionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conditionCheckboxSelected: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 32,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#EDF2F7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
  },
  createButton: {
    flex: 2,
    backgroundColor: '#667EEA',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  disabledContainer: {
    opacity: 0.6, // Optional: dim the entire time container
  },
  disabledSelector: {
    backgroundColor: '#F7FAFC', // Lighter background for disabled state
    borderColor: '#E2E8F0', // Lighter border color
  },
  disabledText: {
    color: '#A0AEC0', // Gray out the text
  },
});