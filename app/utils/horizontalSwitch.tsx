import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const HorizontalSwitchSimple = () => {
  const [isOn, setIsOn] = useState(false);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Switch On/Off</Text>
      
      <Pressable 
        style={styles.switchContainer}
        onPress={() => setIsOn(!isOn)}
      >
        <View style={[
          styles.switchTrack,
          isOn && styles.switchTrackOn
        ]}>
          {/* Switch Thumb */}
          <View style={[
            styles.switchThumb,
            isOn && styles.switchThumbOn
          ]} />
          
          {/* Labels */}
          <View style={styles.labelsContainer}>
            <Text style={[
              styles.label,
              !isOn && styles.activeLabel
            ]}>OFF</Text>
            <Text style={[
              styles.label,
              isOn && styles.activeLabel
            ]}>ON</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    alignItems: 'center',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  switchContainer: {
    width: 180,
    height: 80,
  },
  switchTrack: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 45,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    position: 'relative',
  },
  switchTrackOn: {
    backgroundColor: '#4CAF50',
  },
  switchThumb: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    position: 'absolute',
    left: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  switchThumbOn: {
    left: 108, // Moved to ON position
  },
  labelsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
  },
  activeLabel: {
    color: '#fff',
  },
});

export default HorizontalSwitchSimple;