import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function RollCallScreen() {
  const [timeFrame, setTimeFrame] = useState("daily");
  
  // Sample roll call data
  const dailyData = [
    { id: "1", name: "John Doe", time: "08:30 AM", status: "present" },
    { id: "2", name: "Jane Smith", time: "08:32 AM", status: "present" },
    { id: "3", name: "Robert Johnson", time: "09:15 AM", status: "late" },
    { id: "4", name: "Emily Davis", time: "-", status: "absent" },
    { id: "5", name: "Michael Brown", time: "08:28 AM", status: "present" },
    { id: "6", name: "Sarah Wilson", time: "08:31 AM", status: "present" },
    { id: "7", name: "David Miller", time: "09:05 AM", status: "late" },
    { id: "8", name: "Lisa Taylor", time: "08:29 AM", status: "present" },
  ];

  // Add these data arrays at the top of your component
  const studentsWeeklyData = [
    { id: "S001", name: "John Doe", present: 4, late: 1, absent: 0 },
    { id: "S002", name: "Jane Smith", present: 5, late: 0, absent: 0 },
    { id: "S003", name: "Robert Johnson", present: 3, late: 0, absent: 2 },
    { id: "S004", name: "Emily Davis", present: 2, late: 2, absent: 1 },
    { id: "S005", name: "Michael Brown", present: 4, late: 1, absent: 0 },
    { id: "S006", name: "Sarah Wilson", present: 5, late: 0, absent: 0 },
    { id: "S007", name: "David Miller", present: 3, late: 1, absent: 1 },
    { id: "S008", name: "Lisa Taylor", present: 4, late: 0, absent: 1 },
  ];

  const studentsYearlyData = [
    { id: "S001", name: "John Doe", class: "12A", totalPresent: 180, totalAbsent: 20 },
    { id: "S002", name: "Jane Smith", class: "12A", totalPresent: 195, totalAbsent: 5 },
    { id: "S003", name: "Robert Johnson", class: "12A", totalPresent: 150, totalAbsent: 50 },
    { id: "S004", name: "Emily Davis", class: "12A", totalPresent: 165, totalAbsent: 35 },
    { id: "S005", name: "Michael Brown", class: "12A", totalPresent: 190, totalAbsent: 10 },
    { id: "S006", name: "Sarah Wilson", class: "12A", totalPresent: 198, totalAbsent: 2 },
    { id: "S007", name: "David Miller", class: "12A", totalPresent: 140, totalAbsent: 60 },
    { id: "S008", name: "Lisa Taylor", class: "12A", totalPresent: 175, totalAbsent: 25 },
];

  const renderDailyView = () => (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={styles.columnHeader}>Name</Text>
        <Text style={styles.columnHeader}>Time</Text>
        <Text style={styles.columnHeader}>Status</Text>
      </View>
      {dailyData.map((item) => (
        <View key={item.id} style={styles.tableRow}>
          <Text style={styles.nameCell}>{item.name}</Text>
          <Text style={styles.timeCell}>{item.time}</Text>
          <View style={[
            styles.statusBadge,
            item.status === 'present' && styles.presentBadge,
            item.status === 'late' && styles.lateBadge,
            item.status === 'absent' && styles.absentBadge
          ]}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderWeeklyView = () => (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={[styles.columnHeader, { flex: 2 }]}>Name</Text>
        <Text style={styles.columnHeader}>Present</Text>
        <Text style={styles.columnHeader}>Late</Text>
        <Text style={styles.columnHeader}>Absent</Text>
        <Text style={styles.columnHeader}>Weekly %</Text>
      </View>
      {studentsWeeklyData.map((student, index) => {
        const totalDays = student.present + student.late + student.absent;
        const weeklyPercentage = totalDays > 0 
          ? Math.round((student.present / totalDays) * 100) 
          : 0;
        
        return (
          <TouchableOpacity 
            key={student.id} 
            style={styles.tableRow}
            activeOpacity={0.7}
            onPress={() => console.log('View student details:', student.id)}
          >
            <View style={[styles.nameCell, { flex: 2 }]}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentId}>{student.id}</Text>
            </View>
            <Text style={styles.presentCell}>{student.present}</Text>
            <Text style={styles.lateCell}>{student.late}</Text>
            <Text style={styles.absentCell}>{student.absent}</Text>
            <View style={styles.percentageCell}>
              <Text style={[
                styles.percentageText, 
                { color: weeklyPercentage >= 75 ? '#10B981' : weeklyPercentage >= 50 ? '#F59E0B' : '#EF4444' }
              ]}>
                {weeklyPercentage}%
              </Text>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { 
                    width: `${weeklyPercentage}%`,
                    backgroundColor: weeklyPercentage >= 75 ? '#10B981' : weeklyPercentage >= 50 ? '#F59E0B' : '#EF4444'
                  }
                ]} />
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderYearlyView = () => (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={[styles.columnHeader, { flex: 2 }]}>Name</Text>
        <Text style={styles.columnHeader}>Total Present</Text>
        <Text style={styles.columnHeader}>Total Absent</Text>
        <Text style={styles.columnHeader}>Yearly %</Text>
        <Text style={styles.columnHeader}>Status</Text>
      </View>
      {studentsYearlyData.map((student, index) => {
        const totalDays = student.totalPresent + student.totalAbsent;
        const yearlyPercentage = totalDays > 0 
          ? Math.round((student.totalPresent / totalDays) * 100) 
          : 0;
        
        let status = '';
        let statusColor = '';
        
        if (yearlyPercentage >= 90) {
          status = 'Excellent';
          statusColor = '#10B981';
        } else if (yearlyPercentage >= 75) {
          status = 'Good';
          statusColor = '#3B82F6';
        } else if (yearlyPercentage >= 60) {
          status = 'Average';
          statusColor = '#F59E0B';
        } else {
          status = 'Poor';
          statusColor = '#EF4444';
        }
        
        return (
          <TouchableOpacity 
            key={student.id} 
            style={styles.tableRow}
            activeOpacity={0.7}
            onPress={() => console.log('View student yearly details:', student.id)}
          >
            <View style={[styles.nameCell, { flex: 2 }]}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {student.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.nameInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentId}>{student.id} • {student.class}</Text>
              </View>
            </View>
            <Text style={styles.presentCell}>{student.totalPresent}</Text>
            <Text style={styles.absentCell}>{student.totalAbsent}</Text>
            <View style={styles.percentageCell}>
              <Text style={[
                styles.percentageText, 
                { color: statusColor }
              ]}>
                {yearlyPercentage}%
              </Text>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { 
                    width: `${yearlyPercentage}%`,
                    backgroundColor: statusColor
                  }
                ]} />
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {status}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Updated Header */}
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

        {/* Date & Time Frame Selector */}
        <View style={styles.dateSelector}>
          <View style={styles.timeFrameSelector}>
            <TouchableOpacity 
              style={[styles.timeFrameButton, timeFrame === 'daily' && styles.timeFrameActive]}
              onPress={() => setTimeFrame('daily')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'daily' && styles.timeFrameTextActive]}>
                Daily
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.timeFrameButton, timeFrame === 'weekly' && styles.timeFrameActive]}
              onPress={() => setTimeFrame('weekly')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'weekly' && styles.timeFrameTextActive]}>
                Weekly
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.timeFrameButton, timeFrame === 'yearly' && styles.timeFrameActive]}
              onPress={() => setTimeFrame('yearly')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'yearly' && styles.timeFrameTextActive]}>
                Yearly
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Attendance Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Attendance Summary</Text>
            <TouchableOpacity style={styles.exportButton}>
              <Feather name="download" size={18} color="#4F46E5" />
              <Text style={styles.exportText}>Export</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Feather name="check-circle" size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>75%</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Feather name="clock" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>15%</Text>
              <Text style={styles.statLabel}>Late</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Feather name="x-circle" size={20} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>10%</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
          </View>
        </View>

        {/* Roll Call Table */}
        <View style={styles.tableSection}>
          <View style={styles.sectionHeader}>
            {/* <Text style={styles.currentDate}></Text> */}
            <Text style={styles.sectionTitle}>
              {timeFrame === 'daily' ? 'Fri, 24 March 2023' : 
               timeFrame === 'weekly' ? 'Weekly Attendance' : 'Yearly Overview'}
            </Text>
            <View style={styles.totalCount}>
              <Text style={styles.totalCountText}>
                {timeFrame === 'daily' ? '8 Students' : 
                 timeFrame === 'weekly' ? '5 Days' : '5 Months'}
              </Text>
            </View>
          </View>
          
          {timeFrame === 'daily' && renderDailyView()}
          {timeFrame === 'weekly' && renderWeeklyView()}
          {timeFrame === 'yearly' && renderYearlyView()}
        </View>
        
        {/* Quick Actions */}
        {/* <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#4F46E5' }]}>
                <Feather name="plus" size={20} color="white" />
              </View>
              <Text style={styles.actionText}>Add Student</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
                <Feather name="edit" size={20} color="white" />
              </View>
              <Text style={styles.actionText}>Mark Attendance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
                <Feather name="file-text" size={20} color="white" />
              </View>
              <Text style={styles.actionText}>Generate Report</Text>
            </TouchableOpacity>
          </View>
        </View> */}
      </ScrollView>
    </SafeAreaView>
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
  headerLeft: {
    flexDirection: 'column',
  },
  gradientTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  gradientText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  gradientTextAccent: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4F46E5',
    marginLeft: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  // headerIcons: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   gap: 16,
  // },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // avatar: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   backgroundColor: '#4F46E5',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  avatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  // Date & Time Frame Selector
  dateSelector: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  currentDate: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  timeFrameSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeFrameActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeFrameText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  timeFrameTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  // Summary Card
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  exportText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  // Table Section
  tableSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalCount: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  totalCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Table Styles
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  columnHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  nameCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  timeCell: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
  },
  dayCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  monthCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  presentCell: {
    flex: 1,
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  lateCell: {
    flex: 1,
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
  },
  absentCell: {
    flex: 1,
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  statusBadge: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
  },
  presentBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  lateBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  absentBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentageCell: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Quick Actions
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    width: '31%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E293B',
    textAlign: 'center',
  },
  // tableRow: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingVertical: 12,
  //   paddingHorizontal: 16,
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#F1F5F9',
  // },
  // nameCell: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  // },
  studentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  studentId: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  // avatarText: {
  //   color: 'white',
  //   fontSize: 12,
  //   fontWeight: '600',
  // },
  nameInfo: {
    flex: 1,
  },
  // percentageCell: {
  //   flex: 1,
  //   flexDirection: 'column',
  //   gap: 4,
  //   minWidth: 80,
  // },
  // percentageText: {
  //   fontSize: 14,
  //   fontWeight: '600',
  // },
  // progressBar: {
  //   height: 6,
  //   backgroundColor: '#F1F5F9',
  //   borderRadius: 3,
  //   overflow: 'hidden',
  // },
  // progressFill: {
  //   height: '100%',
  //   borderRadius: 3,
  // },
  // statusBadge: {
  //   paddingHorizontal: 10,
  //   paddingVertical: 4,
  //   borderRadius: 12,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   minWidth: 80,
  // },
  // statusText: {
  //   fontSize: 12,
  //   fontWeight: '600',
  // },
});