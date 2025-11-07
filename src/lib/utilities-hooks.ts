// src/lib/utilities-hooks.ts
import api from '@/lib/axios-client'
import { useQuery } from '@tanstack/react-query'

/**
 * [Student/Faculty/Admin] Gets the current motivational quote for a student.
 */
export async function getMotivation(userId: string) {
  const res = await api.get(`/utilities/motivation/${userId}`)
  return res.data as { quote: string; author: string }
}

/**
 * [Student] Generates a new on-demand AI motivational quote.
 */
export async function generateNewMotivation(userId: string) {
  const res = await api.post(`/utilities/motivation/generate/${userId}`)
  return res.data as { quote: string; author: string }
}

/**
 * [Admin/Faculty] Sets a custom motivational message for a student.
 */
export async function setCustomMotivation(
  userId: string,
  quote: string,
  author: string = 'Your Faculty Advisor'
) {
  const res = await api.put(`/utilities/motivation/${userId}`, { quote, author })
  return res.data
}

/**
 * [Admin/Faculty] Clears a custom motivational message.
 */
export async function clearCustomMotivation(userId: string) {
  const res = await api.delete(`/utilities/motivation/${userId}`)
  return res.data
}

/**
 * [Admin/Faculty] Sends a push notification study reminder.
 */
export async function sendReminder(
  userId: string,
  title: string,
  body: string
) {
  const res = await api.post(`/utilities/send_reminder/${userId}`, {
    title,
    body,
  })
  return res.data
}

// --- Re-usable hook for getting motivation ---
export function useMotivation(userId: string) {
  return useQuery({
    queryKey: ['motivation', userId],
    queryFn: () => getMotivation(userId),
    enabled: !!userId,
  })
}