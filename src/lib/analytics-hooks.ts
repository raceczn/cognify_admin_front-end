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
  first_name: string | null
  last_name: string | null
  predicted_to_pass: boolean
  overall_score: number
  risk_level: string
  passing_probability: number
}

export interface BehavioralTraits {
  average_session_length: number
  preferred_study_time: string
  interruption_frequency: string
  learning_pace: string
  timeliness_score: number
  personal_readiness: string
  confident_subjects: string[]
}

export interface StudentWeakness {
  competency_id: string
  competency_name: string
  mastery: number
  attempts: number
  status: 'Mastery' | 'Proficient' | 'Developing' | 'Critical'
  risk_level: 'Low' | 'Medium' | 'High'
  recommendation: string
}

export interface SubjectPerformance {
  subject_id: string
  subject_title: string
  average_score: number
  assessments_taken: number
  modules_completeness: number
  assessment_completeness: number
  overall_completeness: number
  status: string
}

export interface BloomPerformance {
  [key: string]: number
}

export interface StudentAnalyticsResponse {
  student_profile: {
    name: string
    email: string
    id: string
  }
  behavioral_traits: BehavioralTraits
  overall_performance: {
    average_score: number
    passing_probability: number
    risk_level: string
    recommendation: string
  }
  subject_performance: SubjectPerformance[]
  weaknesses: StudentWeakness[] 
  performance_by_bloom: BloomPerformance // [FIX] Added
  recent_activity: any[]
}

// --- GLOBAL STATS ---
export interface GlobalSubjectData {
  subject_id: string
  title: string
  passing_rate: number
}

export interface GlobalPredictionResponse {
  summary: AnalyticsSummary
  predictions: Prediction[]
  subjects: GlobalSubjectData[]
  performance_by_bloom: BloomPerformance
}

// --- API HOOKS ---

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

export async function getStudentAnalytics(studentId: string) {
  const res = await api.get(`/analytics/student_report/${studentId}`)
  return res.data as StudentAnalyticsResponse
}

export function useStudentAnalytics(studentId: string) {
  return useQuery({
    queryKey: ['studentAnalytics', studentId],
    queryFn: () => getStudentAnalytics(studentId),
    enabled: !!studentId,
  })
}