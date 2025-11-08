// src/lib/analytics-hooks.ts
import api from '@/lib/axios-client'
import { useQuery } from '@tanstack/react-query'

/**
 * [Admin/Faculty] Gets the pass/fail predictions for all students.
 */
export async function getGlobalPredictions() {
  const res = await api.get(`/analytics/global_predictions`)
  return res.data
}

export function useGlobalPredictions() {
  return useQuery({
    queryKey: ['globalPredictions'],
    queryFn: getGlobalPredictions,
  })
}

/**
 * [Admin/Faculty/Student] Gets the strengths/weaknesses for one student.
 */
export async function getStudentAnalytics(studentId: string) {
  const res = await api.get(`/analytics/student_report/${studentId}`)
  return res.data
}

export function useStudentAnalytics(studentId: string) {
  return useQuery({
    queryKey: ['studentAnalytics', studentId],
    queryFn: () => getStudentAnalytics(studentId),
    enabled: !!studentId, // Only run if studentId is provided
  })
}