import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, TouchableOpacity } from 'react-native';

interface monthPickerType {
  isCalendarVisible: boolean,
  currentMonth: number,
  setIsCalendarVisible: (arg: boolean) => void,
  monthOnChange: (month: number) => void,
}

export default function MonthPickerModal({ isCalendarVisible, currentMonth, setIsCalendarVisible, monthOnChange }: monthPickerType) {
  // const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Final selected month
  const [tempSelectedMonth, setTempSelectedMonth] = useState(currentMonth); // Temporary selection

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const handleCancel = () => {
    setIsCalendarVisible(false);
  };

  const handleOk = () => {
    monthOnChange(tempSelectedMonth); // Apply the temporary selection
    setIsCalendarVisible(false);
  };

  return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCalendarVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
            </View>

            {/* Month Picker */}
            <View style={styles.monthContainer}>
              {months.map((monthName, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.month,
                    tempSelectedMonth === index && styles.monthActive
                  ]}
                  onPress={() => setTempSelectedMonth(index)}
                >
                  <Text style={[
                    styles.monthText,
                    tempSelectedMonth === index && styles.monthTextActive
                  ]}>
                    {monthName}
                  </Text>
                </Pressable>
              ))}
            </View>
            

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.okButton]} 
                onPress={handleOk}
              >
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  openButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  openButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  monthContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
  },
  month: {
    width: '30%',
    marginVertical: 6,
    marginHorizontal: '1.5%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  monthActive: {
    backgroundColor: '#007AFF',
    borderColor: '#0056b3',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  monthTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  okButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '600',
  },
  okButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
