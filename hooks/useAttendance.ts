import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/app/utils/SupabaseClient";

export function useDailyAttendance(date: Date, enabled: boolean) {
  return useQuery({
    queryKey: ['daily', date],
    queryFn: async () => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 1);

      const { data, error } = await supabase
        .from("students")
        .select(`
          student_id,
          name,
          attendance_logs!left (
            scanned_at
          )
        `)
        .gte("attendance_logs.scanned_at", start.toISOString())
        .lt("attendance_logs.scanned_at", end.toISOString());

      if (error) throw error;

      return data;
    },
    staleTime: 5 * 60 * 1000,
    enabled
  });
}

export function useMonthlyAttendance(selectedMonth: number, enabled: boolean) {
  return useQuery({
    queryKey: ['monthly', selectedMonth],
    queryFn: async () => {
      const year = new Date().getFullYear();
      const start = new Date(year, selectedMonth, 1);
      const end = new Date(year, selectedMonth + 1, 1);

      const { data, error } = await supabase
        .from("students")
        .select(`
          student_id,
          name,
          attendance_logs!left (
            scanned_at
          )
        `)
        .gte("attendance_logs.scanned_at", start.toISOString())
        .lt("attendance_logs.scanned_at", end.toISOString());

      if (error) throw error;

      const monthlyData = data?.map(student => {
        const daysPresent = [
          ...new Set(
            student.attendance_logs.map(log =>
              log.scanned_at.split("T")[0]
            )
          )
        ];

        return {
          id: student.student_id,
          name: student.name,
          daysPresent
        };
      });

      return monthlyData;
    },
    staleTime: 5 * 60 * 1000,
    enabled
  })
}