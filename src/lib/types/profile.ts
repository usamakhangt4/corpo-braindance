/**
 * Type definitions for user profile
 */

export interface NotificationPreferences {
  email: boolean
  push: boolean
  buzzword_submissions?: boolean
  votes?: boolean
  comments?: boolean
}

export type Theme = 'light' | 'dark' | 'system'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  website: string | null
  theme: Theme
  language: string
  timezone: string
  notification_preferences: NotificationPreferences
  created_at: string
  updated_at: string
}

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'username'>>

