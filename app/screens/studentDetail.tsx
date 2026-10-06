import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { Stack } from "expo-router";

interface SubjectMarks {
  subject: string;
  marks: number;
  totalMarks: number;
  grade: string;
  status: 'passed' | 'failed';
}

interface AttendanceRecord {
  month: string;
  present: number;
  total: number;
  percentage: number;
}

export default function StudentDetailsScreen() {
  const router = useRouter();
  const { studentName } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'attendance' | 'academics'>('attendance');

  // fetch actual data from database
  const studentInfo = {
    name: studentName,
    id: "STU001",
    // class: "10th Grade",
    section: "B",
    rollNumber: "24",
    admissionDate: "2024-01-15",
    contact: "+1 234 567 890",
    email: "john.doe@school.com",
    address: "123 Main St, City, State 12345"
  };

  // fetch actual data from database
  const attendanceData: AttendanceRecord[] = [
    { month: "January 2026", present: 22, total: 24, percentage: 92 },
    { month: "February 2026", present: 20, total: 22, percentage: 91 },
    { month: "March 2026", present: 18, total: 20, percentage: 90 },
    { month: "April 2026", present: 21, total: 23, percentage: 91 },
    { month: "May 2026", present: 19, total: 21, percentage: 90 },
    { month: "June 2026", present: 15, total: 18, percentage: 83 },
  ];

  // fetch actual data from database
  const subjectMarks: SubjectMarks[] = [
    { subject: "Mathematics", marks: 85, totalMarks: 100, grade: "A", status: "passed" },
    { subject: "Science", marks: 78, totalMarks: 100, grade: "B+", status: "passed" },
    { subject: "English", marks: 92, totalMarks: 100, grade: "A+", status: "passed" },
    { subject: "Social Studies", marks: 45, totalMarks: 100, grade: "D", status: "failed" },
    { subject: "Computer Science", marks: 88, totalMarks: 100, grade: "A", status: "passed" },
    { subject: "Physics", marks: 76, totalMarks: 100, grade: "B", status: "passed" },
  ];

  const semesterStats = useMemo(() => {
    const total = subjectMarks.length;
    const passed = subjectMarks.filter(s => s.status === 'passed').length;
    const totalMarks = subjectMarks.reduce((acc, curr) => acc + curr.marks, 0);
    const percentage = (totalMarks / (total * 100)) * 100;
    
    let gpa = 0;
    if (percentage >= 90) gpa = 4.0;
    else if (percentage >= 80) gpa = 3.5;
    else if (percentage >= 70) gpa = 3.0;
    else if (percentage >= 60) gpa = 2.5;
    else if (percentage >= 50) gpa = 2.0;
    else gpa = 1.0;

    return {
      totalSubjects: total,
      passedSubjects: passed,
      failedSubjects: total - passed,
      totalMarks,
      percentage: Math.round(percentage * 10) / 10,
      gpa
    };
  }, [subjectMarks]);

  const renderAttendanceTab = () => (
    <View style={styles.tabContent}>
      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Feather name="calendar" size={20} color="#10B981" />
          </View>
          <Text style={styles.summaryValue}>92%</Text>
          <Text style={styles.summaryLabel}>Avg. Attendance</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
            <Feather name="check-circle" size={20} color="#4F46E5" />
          </View>
          <Text style={styles.summaryValue}>115</Text>
          <Text style={styles.summaryLabel}>Days Present</Text>
        </View>

        {/* <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <Feather name="clock" size={20} color="#F59E0B" />
          </View>
          <Text style={styles.summaryValue}>8</Text>
          <Text style={styles.summaryLabel}>Days Late</Text>
        </View> */}

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Feather name="x-circle" size={20} color="#EF4444" />
          </View>
          <Text style={styles.summaryValue}>12</Text>
          <Text style={styles.summaryLabel}>Days Absent</Text>
        </View>
      </View>

      {/* Monthly Attendance Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.columnHeader, { flex: 2 }]}>Month</Text>
          <Text style={styles.columnHeader}>Present</Text>
          <Text style={styles.columnHeader}>Total</Text>
          <Text style={styles.columnHeader}>%</Text>
        </View>
        
        {attendanceData.map((record, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{record.month}</Text>
            <Text style={styles.tableCell}>{record.present}</Text>
            <Text style={styles.tableCell}>{record.total}</Text>
            <View style={styles.percentageCell}>
              <Text style={[
                styles.percentageText,
                record.percentage >= 90 ? styles.excellentText :
                record.percentage >= 75 ? styles.goodText :
                record.percentage >= 60 ? styles.averageText :
                styles.poorText
              ]}>
                {record.percentage}%
              </Text>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill,
                  {
                    width: `${record.percentage}%`,
                    backgroundColor: record.percentage >= 90 ? '#10B981' :
                                   record.percentage >= 75 ? '#3B82F6' :
                                   record.percentage >= 60 ? '#F59E0B' : '#EF4444'
                  }
                ]} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAcademicsTab = () => (
    <View style={styles.tabContent}>
      {/* GPA Summary Card */}
      <View style={styles.gpaCard}>
        <View style={styles.gpaHeader}>
          <Text style={styles.gpaTitle}>Semester GPA</Text>
          <TouchableOpacity style={styles.reportButton}>
            <Feather name="download" size={16} color="#4F46E5" />
            <Text style={styles.reportText}>Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gpaMain}>
          <View style={styles.gpaCircle}>
            <Text style={styles.gpaValue}>{semesterStats.gpa.toFixed(1)}</Text>
            <Text style={styles.gpaScale}>/4.0</Text>
          </View>
          
          <View style={styles.gpaStats}>
            <View style={styles.gpaStatItem}>
              <Text style={styles.gpaStatLabel}>Total Marks</Text>
              <Text style={styles.gpaStatValue}>{semesterStats.totalMarks}/{semesterStats.totalSubjects * 100}</Text>
            </View>
            <View style={styles.gpaStatItem}>
              <Text style={styles.gpaStatLabel}>Percentage</Text>
              <Text style={styles.gpaStatValue}>{semesterStats.percentage}%</Text>
            </View>
            <View style={styles.gpaStatDivider} />
            <View style={styles.gpaStatItem}>
              <Text style={styles.gpaStatLabel}>Passed Subjects</Text>
              <Text style={[styles.gpaStatValue, { color: '#10B981' }]}>{semesterStats.passedSubjects}</Text>
            </View>
            <View style={styles.gpaStatItem}>
              <Text style={styles.gpaStatLabel}>Failed Subjects</Text>
              <Text style={[styles.gpaStatValue, { color: '#EF4444' }]}>{semesterStats.failedSubjects}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Subject Marks Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.columnHeader, { flex: 2 }]}>Subject</Text>
          <Text style={styles.columnHeader}>Marks</Text>
          <Text style={styles.columnHeader}>Grade</Text>
          <Text style={styles.columnHeader}>Status</Text>
        </View>
        
        {subjectMarks.map((subject, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{subject.subject}</Text>
            <Text style={styles.tableCell}>{subject.marks}/{subject.totalMarks}</Text>
            <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(subject.grade) + '15' }]}>
              <Text style={[styles.gradeText, { color: getGradeColor(subject.grade) }]}>{subject.grade}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              subject.status === 'passed' ? styles.passedBadge : styles.failedBadge
            ]}>
              <Text style={[
                styles.statusText,
                subject.status === 'passed' ? styles.passedText : styles.failedText
              ]}>
                {subject.status}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Performance Chart Placeholder */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Subject Performance</Text>
        <View style={styles.chartPlaceholder}>
          {subjectMarks.map((subject, index) => (
            <View key={index} style={styles.chartBarContainer}>
              <View style={styles.chartBarWrapper}>
                <View 
                  style={[
                    styles.chartBar,
                    { 
                      height: `${(subject.marks / subject.totalMarks) * 100}%`,
                      backgroundColor: subject.marks >= 75 ? '#10B981' :
                                      subject.marks >= 50 ? '#F59E0B' : '#EF4444'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.chartBarLabel} numberOfLines={1}>
                {subject.subject.substring(0, 3)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const getGradeColor = (grade: string) => {
    switch(grade) {
      case 'A+':
      case 'A': return '#10B981';
      case 'B+':
      case 'B': return '#3B82F6';
      case 'C+':
      case 'C': return '#F59E0B';
      default: return '#EF4444';
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#2D3748" />
            </TouchableOpacity>
            
            <View style={styles.headerIcons}>
              <Ionicons name="notifications-outline" size={22} color="#2D3748" />
              <TouchableOpacity style={styles.editButton}>
                <Feather name="edit-2" size={18} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Student Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>
                  
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{studentInfo.name}</Text>
                <View style={styles.badgeContainer}>
                  {/* <View style={styles.badge}>
                    <Feather name="book-open" size={12} color="#4F46E5" />
                    <Text style={styles.badgeText}>Class {studentInfo.class}</Text>
                  </View> */}
                  <View style={styles.badge}>
                    <Feather name="users" size={12} color="#4F46E5" />
                    <Text style={styles.badgeText}>Sec {studentInfo.section}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Feather name="hash" size={12} color="#4F46E5" />
                    <Text style={styles.badgeText}>Roll {studentInfo.rollNumber}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Feather name="mail" size={16} color="#64748B" />
                <Text style={styles.contactText}>{studentInfo.email}</Text>
              </View>
              <View style={styles.contactItem}>
                <Feather name="phone" size={16} color="#64748B" />
                <Text style={styles.contactText}>{studentInfo.contact}</Text>
              </View>
              <View style={styles.contactItem}>
                <Feather name="map-pin" size={16} color="#64748B" />
                <Text style={styles.contactText}>{studentInfo.address}</Text>
              </View>
            </View>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabSelector}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'attendance' && styles.activeTab]}
              onPress={() => setActiveTab('attendance')}
            >
              <Feather 
                name="calendar" 
                size={18} 
                color={activeTab === 'attendance' ? '#4F46E5' : '#64748B'} 
              />
              <Text style={[styles.tabText, activeTab === 'attendance' && styles.activeTabText]}>
                Attendance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'academics' && styles.activeTab]}
              onPress={() => setActiveTab('academics')}
            >
              <Feather 
                name="book" 
                size={18} 
                color={activeTab === 'academics' ? '#4F46E5' : '#64748B'} 
              />
              <Text style={[styles.tabText, activeTab === 'academics' && styles.activeTabText]}>
                Academics
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'attendance' ? renderAttendanceTab() : renderAcademicsTab()}

          {/* Quick Actions */}
          {/* <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Feather name="message-square" size={20} color="#10B981" />
                </View>
                <Text style={styles.actionText}>Message</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                  <Feather name="phone-call" size={20} color="#4F46E5" />
                </View>
                <Text style={styles.actionText}>Call Parent</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                  <Feather name="mail" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.actionText}>Email</Text>
              </TouchableOpacity>
            </View>
          </View> */}
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
  profileCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '500',
  },
  contactInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  tabSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
  },
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
    marginBottom: 24,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
  },
  percentageCell: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '600',
  },
  excellentText: {
    color: '#10B981',
  },
  goodText: {
    color: '#3B82F6',
  },
  averageText: {
    color: '#F59E0B',
  },
  poorText: {
    color: '#EF4444',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  gpaCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gpaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  gpaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  reportText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  gpaMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpaCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  gpaValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4F46E5',
  },
  gpaScale: {
    fontSize: 14,
    color: '#64748B',
  },
  gpaStats: {
    flex: 1,
  },
  gpaStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gpaStatLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  gpaStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  gpaStatDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  gradeBadge: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  passedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  failedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  passedText: {
    color: '#10B981',
  },
  failedText: {
    color: '#EF4444',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 20,
  },
  chartPlaceholder: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBarContainer: {
    alignItems: 'center',
    width: 40,
  },
  chartBarWrapper: {
    height: 100,
    width: 30,
    backgroundColor: '#F1F5F9',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 8,
  },
  chartBar: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderRadius: 15,
  },
  chartBarLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 32,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});