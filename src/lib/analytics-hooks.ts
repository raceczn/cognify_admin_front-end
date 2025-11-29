// src/lib/analytics-hooks.ts
import api from '@/lib/axios-client'
import { useQuery } from '@tanstack/react-query'

export interface AnalyticsSummary {
  total_students_predicted: number
  count_predicted_to_pass: number
  count_predicted_to_fail: number
  predicted_pass_rate: number
}

export interface Prediction {
  student_id: string
  first_name: string
  last_name: string
  predicted_to_pass: boolean
  overall_score: number
  risk_level: string
  passing_probability: number
}

// [NEW]
export interface GlobalSubjectData {
  subject_id: string
  title: string
  passing_rate: number
}

// [NEW]
export interface BloomPerformance {
  [key: string]: number
}

export interface GlobalPredictionResponse {
  summary: AnalyticsSummary
  predictions: Prediction[]
  subjects: GlobalSubjectData[]          // <--- Matches backend
  performance_by_bloom: BloomPerformance // <--- Matches backend
}

export async function getGlobalPredictions() {
  const res = await api.get('/analytics/global_predictions')
  return res.data as GlobalPredictionResponse
}

export function useGlobalPredictions() {
  return useQuery({
    queryKey: ['globalPredictions'],
    queryFn: getGlobalPredictions,
    staleTime: 1000 * 60 * 5, 
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