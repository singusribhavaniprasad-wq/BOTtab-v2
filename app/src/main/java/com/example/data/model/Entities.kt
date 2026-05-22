package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_profile")
data class UserProfile(
    @PrimaryKey val id: Int = 1,
    val name: String = "John Doe",
    val age: Int = 35,
    val gender: String = "Male",
    val heightCm: Double = 175.0,
    val weightKg: Double = 72.5,
    val allergies: String = "Penicillin, Peanuts",
    val medicalConditions: String = "Hypertension, Mild Seasonal Allergies",
    val emergencyContactName: String = "Jane Doe (Spouse)",
    val emergencyContactPhone: String = "+1 (555) 019-2834",
    val caregiverName: String = "Dr. Robert Smith",
    val caregiverPhone: String = "+1 (555) 014-9988",
    val activeRole: String = "Patient", // Patient, Caregiver, Wellness Coach, Pharmacist Support, Clinical Coordinator
    val waterGoalMl: Int = 2500,
    val sleepGoalHours: Int = 8
)

@Entity(tableName = "medications")
data class Medication(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val dosage: String,
    val frequency: String, // e.g. "Once a Day", "Twice a Day"
    val timeMorning: Boolean = true,
    val timeNoon: Boolean = false,
    val timeEvening: Boolean = false,
    val timeNight: Boolean = false,
    val mealTiming: String = "After food", // "Before food", "After food", "With food", "None"
    val inventoryRemaining: Int = 30,
    val refillThreshold: Int = 7,
    val interactionWarnings: String = "Avoid consuming with grape juice or grapefruit.",
    val isActive: Boolean = true
)

@Entity(tableName = "adherence_logs")
data class AdherenceLog(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val medicationId: Int,
    val medicationName: String,
    val scheduledTime: String, // "Morning", "Noon", "Evening", "Night"
    val dateString: String, // "YYYY-MM-DD"
    val status: String, // "Taken", "Skipped", "Missed"
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "daily_health_logs")
data class DailyHealthLog(
    @PrimaryKey val dateString: String, // "YYYY-MM-DD"
    val sleepHours: Double = 7.0,
    val waterIntakeMl: Int = 1200,
    val steps: Int = 6500,
    val stressLevel: Int = 5, // 1 - 10
    val moodRating: Int = 4, // 1 - 5 (Awful, Bad, Okay, Good, Excellent)
    val heartRateBpm: Int = 72,
    val bloodGlucose: Double = 95.0,
    val systolicBp: Int = 120,
    val diastolicBp: Int = 80
)

@Entity(tableName = "chat_messages")
data class ChatMessage(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val sender: String, // "User" or "AI" or "System"
    val message: String,
    val timestamp: Long = System.currentTimeMillis()
)
