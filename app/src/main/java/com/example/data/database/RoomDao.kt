package com.example.data.database

import androidx.room.*
import com.example.data.model.*
import kotlinx.coroutines.flow.Flow

@Dao
interface UserProfileDao {
    @Query("SELECT * FROM user_profile WHERE id = 1 LIMIT 1")
    fun getUserProfileFlow(): Flow<UserProfile?>

    @Query("SELECT * FROM user_profile WHERE id = 1 LIMIT 1")
    suspend fun getUserProfile(): UserProfile?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveUserProfile(profile: UserProfile)
}

@Dao
interface MedicationDao {
    @Query("SELECT * FROM medications WHERE isActive = 1")
    fun getActiveMedicationsFlow(): Flow<List<Medication>>

    @Query("SELECT * FROM medications")
    suspend fun getAllMedications(): List<Medication>

    @Query("SELECT * FROM medications WHERE id = :id")
    suspend fun getMedicationById(id: Int): Medication?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMedication(medication: Medication)

    @Update
    suspend fun updateMedication(medication: Medication)

    @Delete
    suspend fun deleteMedication(medication: Medication)
}

@Dao
interface AdherenceLogDao {
    @Query("SELECT * FROM adherence_logs ORDER BY timestamp DESC")
    fun getAllLogsFlow(): Flow<List<AdherenceLog>>

    @Query("SELECT * FROM adherence_logs WHERE dateString = :dateString")
    suspend fun getLogsForDate(dateString: String): List<AdherenceLog>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLog(log: AdherenceLog)

    @Query("DELETE FROM adherence_logs WHERE medicationId = :medicationId AND dateString = :dateString AND scheduledTime = :scheduledTime")
    suspend fun deleteLogByTime(medicationId: Int, dateString: String, scheduledTime: String)
}

@Dao
interface DailyHealthLogDao {
    @Query("SELECT * FROM daily_health_logs ORDER BY dateString DESC")
    fun getAllHealthLogsFlow(): Flow<List<DailyHealthLog>>

    @Query("SELECT * FROM daily_health_logs WHERE dateString = :dateString LIMIT 1")
    suspend fun getLogForDate(dateString: String): DailyHealthLog?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHealthLog(log: DailyHealthLog)
}

@Dao
interface ChatMessageDao {
    @Query("SELECT * FROM chat_messages ORDER BY timestamp ASC")
    fun getAllMessagesFlow(): Flow<List<ChatMessage>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: ChatMessage)

    @Query("DELETE FROM chat_messages")
    suspend fun clearHistory()
}
