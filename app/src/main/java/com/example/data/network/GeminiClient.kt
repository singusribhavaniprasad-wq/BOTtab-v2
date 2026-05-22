package com.example.data.network

import android.util.Log
import com.example.BuildConfig
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object GeminiClient {
    private const val TAG = "GeminiClient"
    private const val MODEL_NAME = "gemini-3.5-flash"
    private const val BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/$MODEL_NAME:generateContent"

    private val client = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    // Clean, robust manual JSON generation and parsing to avoid any Moshi adapter/versioning mismatches
    suspend fun getCompletion(
        prompt: String,
        systemInstruction: String,
        apiKey: String = BuildConfig.GEMINI_API_KEY
    ): String = withContext(Dispatchers.IO) {
        if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY") {
            Log.e(TAG, "Gemini API Key is a placeholder or empty!")
            return@withContext "API Configuration Error: Please set your GEMINI_API_KEY in the Secrets panel."
        }

        val url = "$BASE_URL?key=$apiKey"

        val requestJson = JSONObject().apply {
            // Contents list
            val contentsArray = JSONArray().apply {
                val turnParts = JSONObject().apply {
                    val partsArray = JSONArray().apply {
                        val partObj = JSONObject().apply {
                            put("text", prompt)
                        }
                        put(partObj)
                    }
                    put("parts", partsArray)
                }
                put(turnParts)
            }
            put("contents", contentsArray)

            // System Instruction
            if (systemInstruction.isNotEmpty()) {
                val sysInstObj = JSONObject().apply {
                    val partsArray = JSONArray().apply {
                        val partObj = JSONObject().apply {
                            put("text", systemInstruction)
                        }
                        put(partObj)
                    }
                    put("parts", partsArray)
                }
                put("systemInstruction", sysInstObj)
            }

            // Generation config with medium randomness and structured layout
            val genConfig = JSONObject().apply {
                put("temperature", 0.4) // Slightly lower temp for healthcare reliability
            }
            put("generationConfig", genConfig)
        }

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val requestBody = requestJson.toString().toRequestBody(mediaType)

        val request = Request.Builder()
            .url(url)
            .post(requestBody)
            .addHeader("Content-Type", "application/json")
            .build()

        try {
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    val errBody = response.body?.string() ?: ""
                    Log.e(TAG, "Unsuccessful response from Gemini: Code ${response.code}, Body: $errBody")
                    
                    // User friendly error handling
                    return@withContext when (response.code) {
                        400 -> "System Error: The request formatting is invalid. Please try a different query."
                        403 -> "Authentication Error: Gemini API key is unauthorized. Please verify the key in Secrets panel."
                        429 -> "Traffic Limit: The AI is busy. Please wait a moment and tap send again."
                        else -> "Connection Error (${response.code}). Please check your internet connection."
                    }
                }

                val responseBody = response.body?.string()
                if (responseBody.isNullOrEmpty()) {
                    return@withContext "Empty response received from the AI engine."
                }

                try {
                    val rootJson = JSONObject(responseBody)
                    val candidates = rootJson.optJSONArray("candidates")
                    if (candidates != null && candidates.length() > 0) {
                        val firstCandidate = candidates.getJSONObject(0)
                        val contentObj = firstCandidate.optJSONObject("content")
                        if (contentObj != null) {
                            val parts = contentObj.optJSONArray("parts")
                            if (parts != null && parts.length() > 0) {
                                val firstPart = parts.getJSONObject(0)
                                return@withContext firstPart.optString("text", "No text generated.")
                            }
                        }
                    }
                    return@withContext "The AI engine was unable to generate content for this query."
                } catch (e: Exception) {
                    Log.e(TAG, "Error parsing Gemini response JSON", e)
                    return@withContext "JSON parsing error on AI response."
                }
            }
        } catch (e: IOException) {
            Log.e(TAG, "Network error during Gemini API call", e)
            return@withContext "Network Timeout: Could not connect to the healthcare AI server. Please check your internet connection and try again."
        }
    }
}
