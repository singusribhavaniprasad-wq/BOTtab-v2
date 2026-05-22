export interface UserProfile {
  id: number;
  name: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  allergies: string;
  medicalConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  caregiverName: string;
  caregiverPhone: string;
  activeRole: string; // Patient, Caregiver, Wellness Coach, Pharmacist Support, Clinical Coordinator
  waterGoalMl: number;
  sleepGoalHours: number;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  timeMorning: boolean;
  timeNoon: boolean;
  timeEvening: boolean;
  timeNight: boolean;
  mealTiming: string; // Before food, After food, With food, None
  inventoryRemaining: number;
  refillThreshold: number;
  interactionWarnings: string;
  isActive: boolean;
}

export interface AdherenceLog {
  id: number;
  medicationId: number;
  medicationName: string;
  scheduledTime: string; // Morning, Noon, Evening, Night
  dateString: string; // YYYY-MM-DD
  status: string; // Taken, Skipped, Missed, Pending
  timestamp: number;
}

export interface DailyHealthLog {
  dateString: string;
  sleepHours: number;
  waterIntakeMl: number;
  steps: number;
  stressLevel: number; // 1 - 10
  moodRating: number; // 1 - 5
  heartRateBpm: number;
  bloodGlucose: number;
  systolicBp: number;
  diastolicBp: number;
}

export interface ChatMessage {
  id: number;
  sender: string; // User, AI, System
  message: string;
  timestamp: number;
}
