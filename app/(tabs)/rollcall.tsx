import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Pressable, Platform } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import DateTimePicker from '@react-native-community/datetimepicker';
import MonthPickerModal from "../(modals)/monthPickerModal";
import { useDailyAttendance, useMonthlyAttendance } from "@/hooks/useAttendance";
import { useRouter } from "expo-router";

interface DailyStudentData {
  student_id: string;
  name: string;
  attendance_logs: {
    scanned_at: string;
  }[];
};

interface MonthlyStudentData {
  id: string;
  name: string;
  daysPresent: string[];
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// shows the student's yearly data when user presses onto it
function countWeekdaysInMonth(year: number, month: number) {
  let totalWeekDays = 0;
  let currentDate = new Date(year, month, 1);
  const lastDate = new Date().getDate();
  while (currentDate.getMonth() === month && currentDate.getDate() <= lastDate) {
    let dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      totalWeekDays++;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return totalWeekDays;
}

export default function RollCallScreen() {
  const router = useRouter();

  const [timeFrame, setTimeFrame] = useState<'daily' | 'monthly'>('daily');
  const [isCalendarVisible, setIsCalendarVisible] = useState<boolean>(false);
  const [date, setDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const isDaily = timeFrame === 'daily';
  const isMonthly = timeFrame === 'monthly';

  const { data: dailyData, isLoading: isDailyLoading } = useDailyAttendance(date, isDaily);
  const { data: monthlyData, isLoading: isMonthlyLoading } = useMonthlyAttendance(selectedMonth, isMonthly);

  const renderDailyView = () => (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={[styles.columnHeader, styles.nameHeader]}>Name</Text>
        <Text style={styles.columnHeader}>Time</Text>
        <Text style={styles.columnHeader}>Status</Text>
      </View>
      {!isDailyLoading && dailyData && dailyData.map((item: DailyStudentData, index: number) => {
        const status = item.attendance_logs[0] ? 'present' : 'absent';

        return (
          <TouchableOpacity 
            key={index} 
            style={styles.tableRow}
            activeOpacity={0.7}
            onPress={() => {
              router.push({
                pathname: "/screens/studentDetail",
                params: { studentName: item.name }
              })
            }}
          >
            <Text style={styles.nameCell}>{item.name}</Text>
            <Text style={styles.timeCell}>
              {
                item.attendance_logs[0] && new Date(item.attendance_logs[0].scanned_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
               }
            </Text>
            <View style={[
              styles.statusBadge,
              status === 'present' && styles.presentBadge,
              // status === 'late' && styles.lateBadge,
              status === 'absent' && styles.absentBadge
            ]}>
              <Text style={styles.statusText}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  );

  const renderMonthlyView = () => (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={[styles.columnHeader, { flex: 2 }]}>Name</Text>
        <Text style={styles.columnHeader}>Total Present</Text>
        <Text style={styles.columnHeader}>Total Absent</Text>
        <Text style={styles.columnHeader}>Monthly %</Text>
        {/* <Text style={styles.columnHeader}>Status</Text> */}
      </View>
      {!isMonthlyLoading && monthlyData && monthlyData.map((item: MonthlyStudentData) => {
        const totalPresent = item.daysPresent.length;
        const yearlyPercentage = totalWeekDays > 0 
          ? Math.round((totalPresent / totalWeekDays) * 100) 
          : 0;
        
        let statusColor = '';
        
        if (yearlyPercentage >= 90) {
          // status = 'Excellent';
          statusColor = '#10B981';
        } else if (yearlyPercentage >= 75) {
          // status = 'Good';
          statusColor = '#3B82F6';
        } else if (yearlyPercentage >= 60) {
          // status = 'Average';
          statusColor = '#F59E0B';
        } else {
          // status = 'Poor';
          statusColor = '#EF4444';
        }
        
        return (
          <TouchableOpacity 
            key={item.id} 
            style={styles.tableRow}
            activeOpacity={0.7}
            onPress={() => 
              router.push({
                pathname: '/screens/studentDetail',
                params: { studentName: item.name }
              })
            }
          >
            <View style={[styles.nameCell, { flex: 2 }]}>
              {/* <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {item.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View> */}
              <View style={styles.nameInfo}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentId}>{item.id}</Text>
              </View>
            </View>
            <Text style={styles.presentCell}>{totalPresent}</Text>
            <Text style={styles.absentCell}>{totalWeekDays - totalPresent}</Text>
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
            {/* <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {status}
              </Text>
            </View> */}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const memorizedDailyView = useMemo(() => renderDailyView(), [dailyData]);
  const memorizedMonthlyView = useMemo(() => renderMonthlyView(), [monthlyData]);

  const totalWeekDays = useMemo(() => countWeekdaysInMonth(new Date().getFullYear(), selectedMonth), [selectedMonth]);

  const summary = useMemo(() => {
    if (!dailyData && !monthlyData) return { present: 0, total: 0 };

    if (isDaily && dailyData) {
      const { present, total } = dailyData.reduce(
        (acc, student) => {
          acc.total++;
          if (student.attendance_logs.length > 0) acc.present++;
          return acc;
        },
        { present: 0, total: 0 }
      );
      return { present, total };
    } else if (isMonthly && monthlyData) {
      const totalDays = countWeekdaysInMonth(new Date().getFullYear(), selectedMonth);
      const present = monthlyData.reduce((acc, student) => acc + student.daysPresent.length, 0);
      return { present, total: totalDays * monthlyData.length };
    }
    return { present: 0, total: 0 };
  }, [dailyData, monthlyData, isDaily, isMonthly, selectedMonth]);

  const dateOnChange = (_: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setIsCalendarVisible(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const monthOnChange = (month: number) => {
    setSelectedMonth(month);
  };

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
            <Pressable onPress={() => setIsCalendarVisible(true)}>
              <Ionicons name="calendar-number-outline" size={22} color="#2D3748" />
            </Pressable>
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
              style={[styles.timeFrameButton, timeFrame === 'monthly' && styles.timeFrameActive]}
              onPress={() => setTimeFrame('monthly')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'monthly' && styles.timeFrameTextActive]}>
                Monthly
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
              <Text style={styles.statValue}>{Math.floor((summary.present / summary.total) * 100)}%</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            
            {/* <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Feather name="clock" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>15%</Text>
              <Text style={styles.statLabel}>Late</Text>
            </View> */}
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Feather name="x-circle" size={20} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>{Math.floor(((summary.total - summary.present) / summary.total) * 100)}%</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
          </View>
        </View>

        {/* Roll Call Table */}
        <View style={styles.tableSection}>
          <View style={styles.sectionHeader}>
            {/* <Text style={styles.currentDate}></Text> */}
            <Text style={styles.sectionTitle}>
              {timeFrame === 'daily' ? `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}` : "Monthly attendance"}
            </Text>
            <View style={styles.totalCount}>
              <Text style={styles.totalCountText}>
                {timeFrame === 'daily' ? `${summary.total} students` : '5 Months'}
              </Text>
            </View>
          </View>
          
          {timeFrame === 'daily' && memorizedDailyView}
          {timeFrame === 'monthly' && memorizedMonthlyView}
        </View>
      </ScrollView>

      {isCalendarVisible && timeFrame == 'daily' &&
        <DateTimePicker
          value={date}
          mode="date"
          display='default'
          onChange={dateOnChange}
        />
      }

      {isCalendarVisible && timeFrame === 'monthly' && (
        <MonthPickerModal 
          isCalendarVisible={isCalendarVisible} 
          setIsCalendarVisible={setIsCalendarVisible}
          currentMonth={selectedMonth}
          monthOnChange={monthOnChange}
        />
      )}
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
    justifyContent: 'space-around',
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
  nameHeader: {
    flex: 2,
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
    flex: 2,
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