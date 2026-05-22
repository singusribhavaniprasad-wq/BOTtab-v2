package com.example.ui.viewmodel

import android.app.Application
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.database.AppDatabase
import com.example.data.model.*
import com.example.data.network.GeminiClient
import com.example.data.repository.HealthRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class HealthViewModel(application: Application) : AndroidViewModel(application) {
    private val repository: HealthRepository

    init {
        val database = AppDatabase.getDatabase(application)
        repository = HealthRepository(database)
        
        // Seed database if empty to present a gorgeous dashboards on first run
        viewModelScope.launch {
            repository.seedDatabaseIfEmpty()
        }
    }

    // --- Flows from Database ---
    val userProfile: StateFlow<UserProfile?> = repository.userProfileFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val activeMedications: StateFlow<List<Medication>> = repository.activeMedicationsFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val adherenceLogs: StateFlow<List<AdherenceLog>> = repository.allLogsFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val healthLogs: StateFlow<List<DailyHealthLog>> = repository.allHealthLogsFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val chatMessages: StateFlow<List<ChatMessage>> = repository.chatMessagesFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // --- UI State Variables ---
    private val _currentDateString = MutableStateFlow(getCurrentDateStr())
    val currentDateString: StateFlow<String> = _currentDateString.asStateFlow()

    // Authentication States
    private val _authState = MutableStateFlow<AuthState>(AuthState.Authenticated) // Start as Authenticated for frictionless first run!
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private val _biometricEnabled = MutableStateFlow(true)
    val biometricEnabled: StateFlow<Boolean> = _biometricEnabled.asStateFlow()

    // Multi-role Mode
    val currentRole = userProfile.map { it?.activeRole ?: "Patient" }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "Patient")

    // Active Tab in Dashboard
    private val _activeTab = MutableStateFlow("dashboard") // dashboard, assistant, schedule, wellness, emergency, caregiver
    val activeTab: StateFlow<String> = _activeTab.asStateFlow()

    // Environmental / Seasonal States
    private val _selectedSeason = MutableStateFlow("Summer") // Summer, Winter, Monsoon
    val selectedSeason: StateFlow<String> = _selectedSeason.asStateFlow()

    // Sound / Voice Assistance States
    private val _isListening = MutableStateFlow(false)
    val isListening: StateFlow<Boolean> = _isListening.asStateFlow()

    private val _voiceAssistantTranscript = MutableStateFlow("")
    val voiceAssistantTranscript: StateFlow<String> = _voiceAssistantTranscript.asStateFlow()

    private val _voiceSpeechOutput = MutableStateFlow("")
    val voiceSpeechOutput: StateFlow<String> = _voiceSpeechOutput.asStateFlow()

    // OCR prescription scanning visual states
    private val _ocrScanningState = MutableStateFlow<ScanState>(ScanState.Idle)
    val ocrScanningState: StateFlow<ScanState> = _ocrScanningState.asStateFlow()

    // Emergency Trigger State
    private val _isEmergencyTriggered = MutableStateFlow(false)
    val isEmergencyTriggered: StateFlow<Boolean> = _isEmergencyTriggered.asStateFlow()

    // Text size accessibility scaling state (for Seniors)
    private val _seniorTextScale = MutableStateFlow(1.0f)
    val seniorTextScale: StateFlow<Float> = _seniorTextScale.asStateFlow()

    // Chat typing / loading state
    private val _chatLoading = MutableStateFlow(false)
    val chatLoading: StateFlow<Boolean> = _chatLoading.asStateFlow()

    // Show medication entry bottom-sheets/dialogs helper values
    val showAddMedDialog = mutableStateOf(false)
    val showProfileDialog = mutableStateOf(false)

    // --- Daily Health Tracking Actions ---
    val todayHealthLog = combine(currentDateString, healthLogs) { date, logs ->
        logs.find { it.dateString == date } ?: DailyHealthLog(dateString = date)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), DailyHealthLog(getCurrentDateStr()))

    // Calculated BOTscore State %
    val botScore = combine(todayHealthLog, activeMedications, adherenceLogs, currentDateString) { log, meds, logs, date ->
        calculateBotScore(log, meds, logs, date)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 75)

    // Predictive insights (generated dynamically based on metrics)
    val predictiveInsight = combine(botScore, todayHealthLog, activeMedications, adherenceLogs) { score, log, meds, logs ->
        generatePredictiveInsights(score, log, meds, logs)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "Calculating initial behavioral forecasting...")

    // --- Authentication Actions ---
    fun signUpSimulated(name: String, email: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Authenticating
            delay(1500)
            val profile = UserProfile(id = 1, name = name, activeRole = "Patient")
            repository.saveUserProfile(profile)
            _authState.value = AuthState.Authenticated
        }
    }

    fun loginSimulated(pin: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Authenticating
            delay(1000)
            if (pin == "1234" || pin.length == 4) {
                _authState.value = AuthState.Authenticated
            } else {
                _authState.value = AuthState.Error("Invalid security pin.")
            }
        }
    }

    fun performBiometrics() {
        viewModelScope.launch {
            _ocrScanningState.value = ScanState.Scanning("Scanning Face ID / Touch ID...")
            delay(1500)
            _authState.value = AuthState.Authenticated
            _ocrScanningState.value = ScanState.Idle
        }
    }

    fun logout() {
        _authState.value = AuthState.Unauthenticated
    }

    fun toggleBiometrics(enabled: Boolean) {
        _biometricEnabled.value = enabled
    }

    // --- Screen Actions ---
    fun setActiveTab(tab: String) {
        _activeTab.value = tab
    }

    fun changeSeason(season: String) {
        _selectedSeason.value = season
    }

    fun setSeniorTextScale(scale: Float) {
        _seniorTextScale.value = scale
    }

    // --- Profile Editing Actions ---
    fun updateProfile(profile: UserProfile) {
        viewModelScope.launch {
            repository.saveUserProfile(profile)
        }
    }

    fun changeActiveRole(role: String) {
        viewModelScope.launch {
            val prof = userProfile.value ?: UserProfile()
            repository.saveUserProfile(prof.copy(activeRole = role))
        }
    }

    // --- Medication Reminders Logic ---
    fun insertNewMedication(name: String, dosage: String, frequency: String, morning: Boolean, noon: Boolean, evening: Boolean, night: Boolean, mealTiming: String, inventory: Int, warnings: String) {
        viewModelScope.launch {
            val med = Medication(
                name = name,
                dosage = dosage,
                frequency = frequency,
                timeMorning = morning,
                timeNoon = noon,
                timeEvening = evening,
                timeNight = night,
                mealTiming = mealTiming,
                inventoryRemaining = inventory,
                interactionWarnings = warnings
            )
            repository.insertMedication(med)
            
            // Log virtual notification assistant speech
            _voiceSpeechOutput.value = "New medication added successfully. I have created reminders based on your sleep schedule."
        }
    }

    fun takeMedication(medication: Medication, timeOfDay: String) {
        viewModelScope.launch {
            val dateStr = _currentDateString.value
            val log = AdherenceLog(
                medicationId = medication.id,
                medicationName = medication.name,
                scheduledTime = timeOfDay,
                dateString = dateStr,
                status = "Taken"
            )
            repository.logAdherence(log)
        }
    }

    fun skipMedication(medication: Medication, timeOfDay: String) {
        viewModelScope.launch {
            val dateStr = _currentDateString.value
            val log = AdherenceLog(
                medicationId = medication.id,
                medicationName = medication.name,
                scheduledTime = timeOfDay,
                dateString = dateStr,
                status = "Skipped"
            )
            repository.logAdherence(log)
        }
    }

    fun resetMedicationLog(medicationId: Int, timeOfDay: String) {
        viewModelScope.launch {
            val dateStr = _currentDateString.value
            repository.removeAdherenceLog(medicationId, dateStr, timeOfDay)
        }
    }

    // --- Water, Sleep, Log Actions ---
    fun addWater(ml: Int) {
        viewModelScope.launch {
            val log = todayHealthLog.value
            val currentW = log.waterIntakeMl
            repository.insertHealthLog(log.copy(waterIntakeMl = currentW + ml))
        }
    }

    fun updateSleep(hours: Double) {
        viewModelScope.launch {
            val log = todayHealthLog.value
            repository.insertHealthLog(log.copy(sleepHours = hours))
        }
    }

    fun updateSteps(steps: Int) {
        viewModelScope.launch {
            val log = todayHealthLog.value
            repository.insertHealthLog(log.copy(steps = steps))
        }
    }

    fun updateVitalsAndMood(bpm: Int, glucose: Double, systolic: Int, diastolic: Int, mood: Int, stress: Int) {
        viewModelScope.launch {
            val log = todayHealthLog.value
            repository.insertHealthLog(log.copy(
                heartRateBpm = bpm,
                bloodGlucose = glucose,
                systolicBp = systolic,
                diastolicBp = diastolic,
                moodRating = mood,
                stressLevel = stress
            ))
        }
    }

    // --- Voice Assistant Simulation ---
    fun startListening() {
        _isListening.value = true
        _voiceAssistantTranscript.value = "Listening to your request..."
    }

    fun stopAndProcessListening(transcriptOverride: String? = null) {
        _isListening.value = false
        val command = transcriptOverride ?: selectRandomMockVoiceCommand()
        _voiceAssistantTranscript.value = "\"$command\""
        
        viewModelScope.launch {
            delay(800)
            processVoiceAssistantCommand(command)
        }
    }

    private fun selectRandomMockVoiceCommand(): String {
        val commands = listOf(
            "Did I take my morning metformin medical dosage?",
            "What is my current preventive BOTscore today?",
            "Generate thermal safety tips regarding high heat warnings",
            "Emergency breathing issues and throat congestion"
        )
        return commands.random()
    }

    private suspend fun processVoiceAssistantCommand(cmd: String) {
        val lower = cmd.lowercase(Locale.ROOT)
        when {
            lower.contains("metformin") || lower.contains("did i take") -> {
                val takenMeds = adherenceLogs.value.filter { it.dateString == _currentDateString.value && it.status == "Taken" }
                val isTaken = takenMeds.any { it.medicationName.contains("Metformin", true) }
                if (isTaken) {
                    _voiceSpeechOutput.value = "Yes, you logged your clinical medication Metformin at 8:04 AM. Your next scheduled dose is after dinner."
                } else {
                    _voiceSpeechOutput.value = "No, you haven't logged your morning Metformin yet. You should have your tablet now. Would you like me to log it?"
                }
            }
            lower.contains("botscore") || lower.contains("score") -> {
                _voiceSpeechOutput.value = "Your health score stands at outstanding ${botScore.value}% today. Adherence is 100%, and sleep looks perfect. Your water intake is slightly low; tap to add 500ml."
            }
            lower.contains("heat") || lower.contains("summer") || lower.contains("hydra") -> {
                _voiceSpeechOutput.value = "Summer High Heat Alert Active: In temperatures exceeding 90°F, Atorvastatin and Metformin increase heat fatigue risks. We recommend elevating water goals to 3000ml."
            }
            lower.contains("breathing") || lower.contains("allergies") || lower.contains("emergency") || lower.contains("chest pin") -> {
                _voiceSpeechOutput.value = "WARNING: Extreme Respiratory / Cardiovascular Alert triggered. Please click the red SOS warning block immediately. Initiating contact with Dr. Robert Smith."
                _isEmergencyTriggered.value = true
                _activeTab.value = "emergency"
            }
            else -> {
                _voiceSpeechOutput.value = "I heard '$cmd'. I recommend completing your water intake of ${todayHealthLog.value.waterIntakeMl}ml and keeping up medication compliance."
            }
        }
    }

    // --- Prescription Camera Scanner Simulation ---
    fun scanPrescriptionDocument(type: String) {
        viewModelScope.launch {
            _ocrScanningState.value = ScanState.Scanning("Aligning holographic scan bounds on medication strip...")
            delay(2000)
            
            val info = when (type) {
                "Amoxicillin" -> {
                    "OCR Identified Document: SPEC-Rx-A90\nDrug: Amoxicillin 500mg\nDirection: 1 Capsule 3 times daily (Morning, Noon, Night), and take after meal.\nInteraction check: None detected. Safe."
                }
                "Clopidogrel" -> {
                    "OCR Strip Analysis: PLAVIX STRIP\nDrug: Clopidogrel 75mg\nDirection: 1 tablet daily at Bedtime.\nInteraction check: Moderate bleeding risk with Aspirin. Recommended monitoring."
                }
                "Panadol" -> {
                    "OCR Over-The-Counter Box: ACETAMINOPHEN\nDrug: Acetaminophen 500mg\nDirection: 1 tablet as needed every 6 hours.\nInteraction check: Do not exceed 4000mg per day to protect liver tissues."
                }
                else -> "Prescription scanning error. Ensure clear contrast and lighting."
            }

            _ocrScanningState.value = ScanState.Success(info)
            delay(1500)
            
            // Automatically add to list depending on choice
            when (type) {
                "Amoxicillin" -> {
                    insertNewMedication(
                        "Amoxicillin", "500mg", "3 times a Day",
                        morning = true, noon = true, evening = true, night = false,
                        mealTiming = "After food", inventory = 21,
                        "Finish full 7-day course even if symptoms disappear. Do not take with sour juices."
                    )
                }
                "Clopidogrel" -> {
                    insertNewMedication(
                        "Clopidogrel", "75mg", "Once Daily",
                        morning = false, noon = false, evening = false, night = true,
                        mealTiming = "None", inventory = 30,
                        "Watch for red spots or gums bleeding. Safe for hypertension."
                    )
                }
                "Panadol" -> {
                    insertNewMedication(
                        "Panadol", "500mg", "As Needed",
                        morning = false, noon = true, evening = false, night = false,
                        mealTiming = "None", inventory = 10,
                        "Avoid double doses with other flu/cough syrups containing acetaminophen."
                    )
                }
            }
            _ocrScanningState.value = ScanState.Idle
        }
    }

    // --- SOS / Emergency Triggers ---
    fun triggerEmergencySOS() {
        _isEmergencyTriggered.value = true
        _activeTab.value = "emergency"
    }

    fun dismissEmergencySOS() {
        _isEmergencyTriggered.value = false
        _activeTab.value = "dashboard"
    }

    // --- AI Chat Assistant Core Integration ---
    fun sendMessageToAI(userMessage: String) {
        if (userMessage.trim().isEmpty()) return

        val messageEntity = ChatMessage(sender = "User", message = userMessage)
        
        viewModelScope.launch {
            repository.insertChatMessage(messageEntity)
            
            // Check for emergency crisis indicators in chat!
            if (isEmergencyCrisisLanguage(userMessage)) {
                _isEmergencyTriggered.value = true
                _activeTab.value = "emergency"
                val systemWarn = ChatMessage(
                    sender = "System",
                    message = "ALERT: Life threatening crisis indicators identified in chat! Immediately launched BOTtab SOS protocols. Recommended contacting emergency services."
                )
                repository.insertChatMessage(systemWarn)
                return@launch
            }

            _chatLoading.value = true
            
            // Build the conversational context
            val age = userProfile.value?.age ?: 35
            val currentRoleValue = currentRole.value
            val allergenString = userProfile.value?.allergies ?: "None"
            val conditions = userProfile.value?.medicalConditions ?: "None"
            val medicationsString = activeMedications.value.joinToString { "${it.name} (${it.dosage})" }
            val climate = _selectedSeason.value
            
            val systemRule = "You are the highly qualified medical prevention AI engine inside the BOTtab app. " +
                    "Your patient matches this metadata: Age $age, Allergens: $allergenString, Diseases: $conditions. " +
                    "Active prescription medications scheduled in database: $medicationsString. " +
                    "Local meteorological season: $climate. " +
                    "Today's calculated BOTscore™ is ${botScore.value}%. " +
                    "User's role context: $currentRoleValue. " +
                    "CRITICAL SECURITY RESTRICTIONS: " +
                    "1. NEVER prescribe medicine or adjust dosages. " +
                    "2. NEVER diagnose disease. " +
                    "3. Highlight allergy warnings immediately if the user asks about taking something with allergy interactions. " +
                    "4. If they complain of chest pain, asthma attacks, heavy pressure or severe trauma, output clear instructions to seek clinical emergency care immediately. " +
                    "5. Keep responses short, elegant, and highly professional. Use formatting like bullet points." +
                    "6. Always append the mandatory medical safety footnote: 'This is general wellness guidance and not a replacement for professional medical advice.'"

            try {
                val completion = GeminiClient.getCompletion(userMessage, systemRule)
                repository.insertChatMessage(ChatMessage(sender = "AI", message = completion))
            } catch (e: Exception) {
                repository.insertChatMessage(ChatMessage(sender = "AI", message = "Offline fallback check: My servers are busy, but here is a safe health tip for $conditions: Please check your water logs and maintain regular medications. Avoid allergens: $allergenString."))
            } finally {
                _chatLoading.value = false
            }
        }
    }

    fun clearChatHistory() {
        viewModelScope.launch {
            repository.clearChatHistory()
            repository.insertChatMessage(
                ChatMessage(
                    sender = "AI",
                    message = "Memory reset successful. I am your BOTtab healthcare companion. How can I help you today?"
                )
            )
        }
    }

    // --- Helper Math Algorithms ---
    private fun getCurrentDateStr(): String {
        return SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
    }

    private fun calculateBotScore(log: DailyHealthLog, meds: List<Medication>, logs: List<AdherenceLog>, date: String): Int {
        // Core weighted factors: Adherence % (45%), Water % (20%), Sleep % (15%), Vitals Range % (20%)
        var totalPoints = 0

        // 1. Medication Adherence (45 pt)
        val todayLogs = logs.filter { it.dateString == date }
        if (meds.isEmpty()) {
            totalPoints += 45 // Grace points if no meds are scheduled (keeps focus on wellness)
        } else {
            // Count distinct scheduled daily times (each med can have Morning, Noon, Evening, Night)
            var totalScheduledTimes = 0
            for (med in meds) {
                if (med.timeMorning) totalScheduledTimes++
                if (med.timeNoon) totalScheduledTimes++
                if (med.timeEvening) totalScheduledTimes++
                if (med.timeNight) totalScheduledTimes++
            }
            if (totalScheduledTimes == 0) {
                totalPoints += 45
            } else {
                val takenCount = todayLogs.count { it.status == "Taken" }
                val adherencePercentage = takenCount.toFloat() / totalScheduledTimes.toFloat()
                totalPoints += (adherencePercentage * 45f).toInt().coerceIn(0, 45)
            }
        }

        // 2. Water Intake (20 pt)
        val waterRatio = log.waterIntakeMl.toFloat() / 2500f // benchmark goal
        totalPoints += (waterRatio * 20f).toInt().coerceIn(0, 20)

        // 3. Sleep (15 pt)
        val sleepRatio = log.sleepHours.toFloat() / 8f
        totalPoints += (sleepRatio * 15f).toInt().coerceIn(0, 15)

        // 4. Vitals & Stress limits (20 pt)
        var vitalsPoints = 10
        if (log.heartRateBpm in 60..100) vitalsPoints += 3
        if (log.bloodGlucose in 70.0..120.0) vitalsPoints += 3
        if (log.stressLevel <= 4) vitalsPoints += 4 else vitalsPoints += (10 - log.stressLevel).coerceIn(0, 4)
        totalPoints += vitalsPoints

        return totalPoints.coerceIn(10, 100)
    }

    private fun generatePredictiveInsights(score: Int, log: DailyHealthLog, meds: List<Medication>, logs: List<AdherenceLog>): String {
        val ageStr = userProfile.value?.age ?: 35
        val baseMessage = when {
            score < 60 -> "High Risk Trend: Low adherence and physical activity matches historical high stress indices. Seek rest."
            score < 80 -> "Moderate Alert: Water intake is significantly lower than typical hydration peaks. Metformin efficacy improves with higher fluids."
            else -> "Optimal Health Index: Adherence exceeds 90% today. Vitals heart rate is healthy, cardiovascular margins are stable."
        }
        
        // Add specific alerts for seniors or special roles
        val ageAlert = if (ageStr >= 65) {
            " Senior Fall-Risk Warning: Lisinopril medication can provoke orthogonal dizziness upon standing quickly. Support is advised."
        } else {
            " General Prevention: Consistent routines minimize vascular strain."
        }

        return baseMessage + ageAlert
    }

    private fun isEmergencyCrisisLanguage(message: String): Boolean {
        val lower = message.lowercase(Locale.ROOT)
        return lower.contains("chest pain") || 
               lower.contains("heart attack") || 
               lower.contains("breathing difficulty") || 
               lower.contains("suffocating") || 
               lower.contains("suicide") || 
               lower.contains("allergic reaction") || 
               lower.contains("unconscious") || 
               lower.contains("anaphylaxis")
    }
}

// Sealed Auth states
sealed class AuthState {
    object Unauthenticated : AuthState()
    object Authenticating : AuthState()
    object Authenticated : AuthState()
    data class Error(val message: String) : AuthState()
}

// Scanning / Visual State
sealed class ScanState {
    object Idle : ScanState()
    data class Scanning(val phase: String) : ScanState()
    data class Success(val parsedJson: String) : ScanState()
}
