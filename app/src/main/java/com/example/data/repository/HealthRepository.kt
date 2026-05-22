package com.example.data.repository

import com.example.data.database.*
import com.example.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import java.text.SimpleDateFormat
import java.util.*

class HealthRepository(private val db: AppDatabase) {
    val userProfileFlow: Flow<UserProfile?> = db.userProfileDao().getUserProfileFlow()
    val activeMedicationsFlow: Flow<List<Medication>> = db.medicationDao().getActiveMedicationsFlow()
    val allLogsFlow: Flow<List<AdherenceLog>> = db.adherenceLogDao().getAllLogsFlow()
    val allHealthLogsFlow: Flow<List<DailyHealthLog>> = db.dailyHealthLogDao().getAllHealthLogsFlow()
    val chatMessagesFlow: Flow<List<ChatMessage>> = db.chatMessageDao().getAllMessagesFlow()

    suspend fun saveUserProfile(profile: UserProfile) {
        db.userProfileDao().saveUserProfile(profile)
    }

    suspend fun insertMedication(medication: Medication) {
        db.medicationDao().insertMedication(medication)
    }

    suspend fun updateMedication(medication: Medication) {
        db.medicationDao().updateMedication(medication)
    }

    suspend fun deleteMedication(medication: Medication) {
        db.medicationDao().deleteMedication(medication)
    }

    suspend fun logAdherence(log: AdherenceLog) {
        db.adherenceLogDao().insertLog(log)
        // Adjust inventory count if pill taken
        if (log.status == "Taken") {
            val med = db.medicationDao().getMedicationById(log.medicationId)
            if (med != null && med.inventoryRemaining > 0) {
                db.medicationDao().updateMedication(med.copy(inventoryRemaining = med.inventoryRemaining - 1))
            }
        }
    }

    suspend fun removeAdherenceLog(medicationId: Int, dateString: String, scheduledTime: String) {
        // If it was "Taken", we might want to refund the pill
        db.adherenceLogDao().deleteLogByTime(medicationId, dateString, scheduledTime)
    }

    suspend fun insertHealthLog(log: DailyHealthLog) {
        db.dailyHealthLogDao().insertHealthLog(log)
    }

    suspend fun insertChatMessage(message: ChatMessage) {
        db.chatMessageDao().insertMessage(message)
    }

    suspend fun clearChatHistory() {
        db.chatMessageDao().clearHistory()
    }

    // Seeding functional demo data on startup to amaze the user immediately!
    suspend fun seedDatabaseIfEmpty() {
        val existingProfile = db.userProfileDao().getUserProfile()
        if (existingProfile == null) {
            // Seed Profile
            db.userProfileDao().saveUserProfile(
                UserProfile(
                    id = 1,
                    name = "John Doe",
                    age = 67, // Seniors by default for the rich polypharmacy context & fallback warnings
                    gender = "Male",
                    heightCm = 175.0,
                    weightKg = 82.0,
                    allergies = "Penicillin, Shellfish",
                    medicalConditions = "Type-2 Diabetes, Hypertension, Mild Osteoarthritis",
                    emergencyContactName = "Jane Doe (Spouse)",
                    emergencyContactPhone = "+1 (555) 019-2834",
                    caregiverName = "Dr. Robert Smith",
                    caregiverPhone = "+1 (555) 014-9988",
                    activeRole = "Patient",
                    waterGoalMl = 2500,
                    sleepGoalHours = 8
                )
            )

            // Seed Medications
            val meds = listOf(
                Medication(
                    name = "Metformin",
                    dosage = "500mg",
                    frequency = "Twice a Day",
                    timeMorning = true,
                    timeNoon = false,
                    timeEvening = true,
                    timeNight = false,
                    mealTiming = "After food",
                    inventoryRemaining = 24,
                    refillThreshold = 6,
                    interactionWarnings = "Take with meals to avoid stomach upsets. Avoid excessive alcohol."
                ),
                Medication(
                    name = "Lisinopril",
                    dosage = "10mg",
                    frequency = "Once a Day",
                    timeMorning = true,
                    timeNoon = false,
                    timeEvening = false,
                    timeNight = false,
                    mealTiming = "Before food",
                    inventoryRemaining = 18,
                    refillThreshold = 5,
                    interactionWarnings = "Do not take potassium supplements without consulting your doctor. Watch for dry cough."
                ),
                Medication(
                    name = "Atorvastatin",
                    dosage = "20mg",
                    frequency = "Once a Day at Night",
                    timeMorning = false,
                    timeNoon = false,
                    timeEvening = false,
                    timeNight = true,
                    mealTiming = "None",
                    inventoryRemaining = 45,
                    refillThreshold = 10,
                    interactionWarnings = "Avoid massive consumption of grapefruit juice. Take before sleep."
                )
            )
            for (med in meds) {
                db.medicationDao().insertMedication(med)
            }

            // Seed 7 Days of Health Logs to demonstrate premium charts out-of-the-box
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val cal = Calendar.getInstance()
            
            // Generate some random history
            val waterIntakes = listOf(1400, 2200, 2600, 1800, 2300, 2500, 1900)
            val sleepHours = listOf(6.5, 7.2, 8.0, 7.8, 6.0, 7.5, 8.2)
            val stepsList = listOf(4500, 7800, 9200, 5100, 6800, 8100, 6100)
            val heartRates = listOf(74, 68, 71, 75, 82, 70, 73)
            val bloodGlucoses = listOf(105.0, 98.0, 115.0, 101.0, 120.0, 96.0, 108.0)
            val systolicBps = listOf(132, 128, 121, 134, 130, 125, 128)
            val diastolicBps = listOf(85, 81, 79, 86, 84, 80, 82)
            
            for (i in 6 downTo 0) {
                cal.time = Date()
                cal.add(Calendar.DAY_OF_YEAR, -i)
                val dateStr = sdf.format(cal.time)
                
                db.dailyHealthLogDao().insertHealthLog(
                    DailyHealthLog(
                        dateString = dateStr,
                        sleepHours = sleepHours[6 - i],
                        waterIntakeMl = waterIntakes[6 - i],
                        steps = stepsList[6 - i],
                        stressLevel = (3..7).random(),
                        moodRating = (3..5).random(),
                        heartRateBpm = heartRates[6 - i],
                        bloodGlucose = bloodGlucoses[6 - i],
                        systolicBp = systolicBps[6 - i],
                        diastolicBp = diastolicBps[6 - i]
                    )
                )

                // Fill adherence logs for some days to display compliance history
                if (i > 0) {
                    val formattedDate = sdf.format(cal.time)
                    db.adherenceLogDao().insertLog(
                        AdherenceLog(
                            medicationId = 1,
                            medicationName = "Metformin",
                            scheduledTime = "Morning",
                            dateString = formattedDate,
                            status = "Taken",
                            timestamp = cal.timeInMillis + 8 * 3600 * 1000
                        )
                    )
                    db.adherenceLogDao().insertLog(
                        AdherenceLog(
                            medicationId = 2,
                            medicationName = "Lisinopril",
                            scheduledTime = "Morning",
                            dateString = formattedDate,
                            status = "Taken",
                            timestamp = cal.timeInMillis + 8 * 3600 * 1000
                        )
                    )
                    // Let's mark occasional skips to challenge the BOTscore
                    db.adherenceLogDao().insertLog(
                        AdherenceLog(
                            medicationId = 1,
                            medicationName = "Metformin",
                            scheduledTime = "Evening",
                            dateString = formattedDate,
                            status = if (i == 2 || i == 5) "Skipped" else "Taken",
                            timestamp = cal.timeInMillis + 19 * 3600 * 1000
                        )
                    )
                }
            }

            // Seed introductory assistant chats
            db.chatMessageDao().insertMessage(
                ChatMessage(
                    sender = "AI",
                    message = "Greetings, John Doe! I am BOTtab, your contextual preventive health co-pilot. I have synchronized your medical profiles and initiated your BOTscore™. We are currently tracking your seasonal health risk. Reach out anytime! (Note: Wellness tips only; always consult Dr. Robert Smith for emergency medical changes)."
                )
            )
        }
    }
}
