package com.example.ui.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.*
import java.text.SimpleDateFormat
import java.util.*

// ============================================
// 1. GATE / SECURE LOGIN SCREEN (Simulated HIPAA Protocol)
// ============================================
@Composable
fun GateScreen(
    authState: AuthState,
    biometricsEnabled: Boolean,
    onLogin: (String) -> Unit,
    onBiometric: () -> Unit,
    onToggleBio: (Boolean) -> Unit
) {
    var pinValue by remember { mutableStateOf("") }
    val isError = authState is AuthState.Error

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BlueDarkBG)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        // Futuristic abstract grid background
        Canvas(modifier = Modifier.fillMaxSize()) {
            val gridSpacing = 60.dp.toPx()
            for (x in 0..size.width.toInt() step gridSpacing.toInt()) {
                drawLine(
                    color = Color(0xFF152238),
                    start = Offset(x.toFloat(), 0f),
                    end = Offset(x.toFloat(), size.height),
                    strokeWidth = 1f
                )
            }
            for (y in 0..size.height.toInt() step gridSpacing.toInt()) {
                drawLine(
                    color = Color(0xFF152238),
                    start = Offset(0f, y.toFloat()),
                    end = Offset(size.width, y.toFloat()),
                    strokeWidth = 1f
                )
            }
        }

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .statusBarsPadding()
                .shadow(24.dp, RoundedCornerShape(24.dp)),
            colors = CardDefaults.cardColors(containerColor = BlueCardBG.copy(alpha = 0.9f)),
            shape = RoundedCornerShape(24.dp),
            border = BorderStroke(1.dp, BorderSlate)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                // Glow logo wrapper
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .drawBehind {
                            drawCircle(
                                color = CyanPrimary.copy(alpha = 0.2f),
                                radius = size.minDimension / 1.5f
                            )
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.HealthAndSafety,
                        contentDescription = "BOTtab Shield",
                        tint = CyanPrimary,
                        modifier = Modifier.size(48.dp)
                    )
                }

                Text(
                    text = "BOTtab PRO",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White,
                    letterSpacing = 1.sp
                )

                Text(
                    text = "MILITARY-GRADE ENCRYPTION • OFFLINE SECURE",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = CyanNeon,
                    letterSpacing = 1.5.sp
                )

                Spacer(modifier = Modifier.height(8.dp))

                if (authState is AuthState.Authenticating) {
                    CircularProgressIndicator(color = CyanPrimary, strokeWidth = 3.dp)
                    Text("Authenticating JWT session...", color = AccessibilityGray, fontSize = 13.sp)
                } else {
                    Text(
                        text = "Enter 4-Digit Security PIN",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )

                    // Pin input field
                    OutlinedTextField(
                        value = pinValue,
                        onValueChange = {
                            if (it.length <= 4 && it.all { char -> char.isDigit() }) {
                                pinValue = it
                                if (it.length == 4) {
                                    onLogin(it)
                                    pinValue = ""
                                }
                            }
                        },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        modifier = Modifier
                            .fillMaxWidth(0.8f)
                            .testTag("pin_field"),
                        textStyle = LocalTextStyle.current.copy(
                            textAlign = TextAlign.Center,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = CyanPrimary
                        ),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = BlueDarkBG,
                            unfocusedContainerColor = BlueDarkBG,
                            focusedBorderColor = CyanPrimary,
                            unfocusedBorderColor = BorderSlate,
                            errorBorderColor = AccentRed
                        ),
                        isError = isError,
                        shape = RoundedCornerShape(12.dp)
                    )

                    if (isError) {
                        Text(
                            text = (authState as AuthState.Error).message,
                            color = AccentRed,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    if (biometricsEnabled) {
                        Button(
                            onClick = onBiometric,
                            colors = ButtonDefaults.buttonColors(containerColor = BlueElectric),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("biometric_login_button")
                        ) {
                            Icon(Icons.Filled.Fingerprint, contentDescription = "Biometric Scan")
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Fast Biometric Authenticate", fontWeight = FontWeight.Bold)
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Checkbox(
                            checked = biometricsEnabled,
                            onCheckedChange = onToggleBio,
                            colors = CheckboxDefaults.colors(checkedColor = CyanPrimary, uncheckedColor = AccessibilityGray)
                        )
                        Text(
                            text = "Enable Face / Touch ID integration",
                            color = AccessibilityGray,
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }
    }
}

// ============================================
// 2. DASHBOARD MAIN TAB (Overview of entire ecosystem)
// ============================================
@Composable
fun DashboardTab(
    viewModel: HealthViewModel,
    profile: UserProfile,
    meds: List<Medication>,
    logs: List<AdherenceLog>,
    healthLog: DailyHealthLog,
    botScore: Int,
    season: String,
    insight: String,
    role: String,
    textScale: Float
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Role Custom guidance alert
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = BlueElectric.copy(alpha = 0.15f)),
            border = BorderStroke(1.dp, BlueElectric.copy(alpha = 0.4f))
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = when(role) {
                        "Patient" -> Icons.Default.Person
                        "Caregiver" -> Icons.Default.SupervisorAccount
                        "Wellness Coach" -> Icons.Default.Sports
                        "Pharmacist Support" -> Icons.Default.LocalPharmacy
                        else -> Icons.Default.AssignmentInd
                    },
                    contentDescription = "Role Mode",
                    tint = CyanPrimary,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "$role Workspace Active",
                        fontSize = 13.sp * textScale,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = when(role) {
                            "Patient" -> "Viewing your personal wellness track and daily clinical adherence logs."
                            "Caregiver" -> "Secondary remote observer mode. Monitoring adherence graphs of John Doe Senior."
                            "Wellness Coach" -> "Goal optimization activated: Highlight physical steps, water levels, sleep goals."
                            "Pharmacist Support" -> "Dispensing oversight mode. Verifying drug interactions list and refill limits."
                            else -> "Clinical monitoring dashboard. Accessing full patient record securely."
                        },
                        fontSize = 11.sp * textScale,
                        color = AccessibilityGray,
                        lineHeight = 14.sp
                    )
                }
            }
        }

        // 2. BOTscore™ and Adherence Level Side-by-Side
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Circular BOTscore progress card
            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = BlueCardBG),
                border = BorderStroke(1.dp, BorderSlate)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "BOTscore™",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp * textScale,
                        color = AccessibilityGray
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Box(contentAlignment = Alignment.Center, modifier = Modifier.size(90.dp)) {
                        // Background arc
                        Canvas(modifier = Modifier.fillMaxSize()) {
                            drawArc(
                                color = BorderSlate,
                                startAngle = -220f,
                                sweepAngle = 260f,
                                useCenter = false,
                                style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round)
                            )
                            // Real score arc
                            drawArc(
                                color = if (botScore < 60) AccentRed else if (botScore < 80) AccentOrange else AccentGreen,
                                startAngle = -220f,
                                sweepAngle = (botScore / 100f) * 260f,
                                useCenter = false,
                                style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round)
                            )
                        }
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "$botScore%",
                                fontSize = 24.sp * textScale,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White
                            )
                            Text(
                                text = if (botScore < 60) "Critical" else if (botScore < 80) "Fair" else "Stable",
                                fontSize = 10.sp * textScale,
                                fontWeight = FontWeight.Bold,
                                color = if (botScore < 60) AccentRed else if (botScore < 80) AccentOrange else AccentGreen
                            )
                        }
                    }
                }
            }

            // Quick Stats details
            Card(
                modifier = Modifier.weight(1.1f),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = BlueCardBG),
                border = BorderStroke(1.dp, BorderSlate)
            ) {
                Column(
                    modifier = Modifier
                        .padding(16.dp)
                        .fillMaxHeight(),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Real-Time Adherence",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp * textScale,
                        color = AccessibilityGray
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    val todayLogs = logs.filter { it.dateString == healthLog.dateString }
                    val totalScheduled = meds.flatMap { med ->
                        listOfNotNull(
                            if (med.timeMorning) "Morning" else null,
                            if (med.timeNoon) "Noon" else null,
                            if (med.timeEvening) "Evening" else null,
                            if (med.timeNight) "Night" else null
                        )
                    }.size
                    
                    val takenCount = todayLogs.count { it.status == "Taken" }
                    val skippedCount = todayLogs.count { it.status == "Skipped" }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Scheduled:", fontSize = 11.sp, color = AccessibilityGray)
                        Text("$totalScheduled doses", fontSize = 11.sp, color = Color.White, fontWeight = FontWeight.Bold)
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Taken:", fontSize = 11.sp, color = AccentGreen)
                        Text("$takenCount logged", fontSize = 11.sp, color = AccentGreen, fontWeight = FontWeight.Bold)
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Skipped:", fontSize = 11.sp, color = AccentOrange)
                        Text("$skippedCount logged", fontSize = 11.sp, color = AccentOrange, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    LinearProgressIndicator(
                        progress = { if (totalScheduled == 0) 1f else takenCount.toFloat() / totalScheduled.toFloat() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(CircleShape),
                        color = AccentGreen,
                        trackColor = BorderSlate,
                    )
                }
            }
        }

        // 3. Dynamic Predictive Insight Banner
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = BlueDarkBG.copy(alpha = 0.5f)),
            border = BorderStroke(1.dp, BorderSlate)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Filled.Psychology, contentDescription = "AI Forecaster", tint = CyanPrimary, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("BOTscore™ Predictive Forecasting", color = CyanPrimary, fontSize = 12.sp * textScale, fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = insight,
                    fontSize = 11.sp * textScale,
                    color = Color.White,
                    lineHeight = 15.sp
                )
            }
        }

        // 4. Vitals Dashboard Matrix
        Text("Daily Biomarker Parameters", fontWeight = FontWeight.ExtraBold, fontSize = 15.sp * textScale, color = Color.White)

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            VitalTile(
                modifier = Modifier.weight(1f),
                title = "Cardio Rate",
                value = "${healthLog.heartRateBpm} BPM",
                status = if (healthLog.heartRateBpm in 60..90) "Healthy" else "Elevated",
                statusColor = if (healthLog.heartRateBpm in 60..90) AccentGreen else AccentOrange,
                icon = Icons.Outlined.Favorite,
                iconColor = AccentRed
            )
            VitalTile(
                modifier = Modifier.weight(1f),
                title = "Blood Sugar",
                value = "${healthLog.bloodGlucose.toInt()} mg/dL",
                status = if (healthLog.bloodGlucose < 110) "Fasting Optimal" else "Fasting High",
                statusColor = if (healthLog.bloodGlucose < 110) AccentGreen else AccentOrange,
                icon = Icons.Outlined.Bloodtype,
                iconColor = AccentOrange
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            VitalTile(
                modifier = Modifier.weight(1f),
                title = "Blood Pressure",
                value = "${healthLog.systolicBp}/${healthLog.diastolicBp} mmHg",
                status = if (healthLog.systolicBp < 130) "Standard" else "Pre-hypertension",
                statusColor = if (healthLog.systolicBp < 130) AccentGreen else AccentOrange,
                icon = Icons.Outlined.Speed,
                iconColor = BlueElectric
            )
            VitalTile(
                modifier = Modifier.weight(1f),
                title = "Hydration Intake",
                value = "${healthLog.waterIntakeMl} ml",
                status = "${(healthLog.waterIntakeMl / 2500f * 100f).toInt()}% Done",
                statusColor = if (healthLog.waterIntakeMl >= 2000) AccentGreen else AccentRed,
                icon = Icons.Outlined.WaterDrop,
                iconColor = CyanPrimary
            )
        }

        // Interactive Fluid Addition Slider
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = BlueCardBG),
            border = BorderStroke(1.dp, BorderSlate)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Interactive Fluids Logging", color = Color.White, fontSize = 13.sp * textScale, fontWeight = FontWeight.Bold)
                    Text("Goal: 2500 ml", color = AccessibilityGray, fontSize = 11.sp)
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Button(
                        onClick = { viewModel.addWater(250) },
                        colors = ButtonDefaults.buttonColors(containerColor = BlueDarkBG),
                        border = BorderStroke(1.dp, BorderSlate),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("+250 ml", color = CyanPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = { viewModel.addWater(500) },
                        colors = ButtonDefaults.buttonColors(containerColor = BlueDarkBG),
                        border = BorderStroke(1.dp, BorderSlate),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("+500 ml", color = CyanPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Stress and Sleep Trackers
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = BlueCardBG),
            border = BorderStroke(1.dp, BorderSlate)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Stress and Sleep Diagnostics", color = Color.White, fontSize = 13.sp * textScale, fontWeight = FontWeight.Bold)
                
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Sleep Goal: ${profile.sleepGoalHours} Hours", fontSize = 11.sp, color = AccessibilityGray)
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = { if (healthLog.sleepHours > 0) viewModel.updateSleep(healthLog.sleepHours - 0.5) }) {
                                Icon(Icons.Filled.Remove, "Less sleep", tint = CyanPrimary)
                            }
                            Text("${healthLog.sleepHours}h", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
                            IconButton(onClick = { viewModel.updateSleep(healthLog.sleepHours + 0.5) }) {
                                Icon(Icons.Filled.Add, "More sleep", tint = CyanPrimary)
                            }
                        }
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Active Stress Index: ${healthLog.stressLevel}/10", fontSize = 11.sp, color = AccessibilityGray)
                        Spacer(modifier = Modifier.height(4.dp))
                        Slider(
                            value = healthLog.stressLevel.toFloat(),
                            onValueChange = { viewModel.updateVitalsAndMood(healthLog.heartRateBpm, healthLog.bloodGlucose, healthLog.systolicBp, healthLog.diastolicBp, healthLog.moodRating, it.toInt()) },
                            valueRange = 1f..10f,
                            colors = SliderDefaults.colors(thumbColor = CyanPrimary, activeTrackColor = CyanPrimary, inactiveTrackColor = BorderSlate)
                        )
                    }
                }
            }
        }

        // 5. Age-Aware Custom Mode Details (For Children metrics / Seniors metrics)
        if (profile.age >= 65) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = AccentRed.copy(alpha = 0.1f)),
                border = BorderStroke(1.dp, AccentRed.copy(alpha = 0.3f))
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("Senior Safety Guard Protocols ACTIVE", color = AccentRed, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("• Polypharmacy check validated: taking ${meds.size} prescription medications.", color = Color.White, fontSize = 11.sp)
                    Text("• Fall risk high due to combined Beta-Blockers & Antihypertensives.", color = Color.White, fontSize = 11.sp)
                    Text("• Increased text touch boundaries enabled (text target sizing target > 48dp).", color = Color.White, fontSize = 11.sp)
                }
            }
        } else if (profile.age <= 12) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = BlueElectric.copy(alpha = 0.1f)),
                border = BorderStroke(1.dp, BlueElectric.copy(alpha = 0.3f))
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("Pediatric Growth & Vaccine Tracker Mode", color = BlueElectric, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("• Next vaccination due: MMR booster scheduled in June 2026.", color = Color.White, fontSize = 11.sp)
                    Text("• Pediatric growth logs: Height 124cm, weight 22.5kg (78th percentile).", color = Color.White, fontSize = 11.sp)
                }
            }
        }
    }
}

@Composable
fun VitalTile(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    status: String,
    statusColor: Color,
    icon: ImageVector,
    iconColor: Color
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = BlueCardBG),
        border = BorderStroke(1.dp, BorderSlate)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(title, color = AccessibilityGray, fontSize = 12.sp)
                Icon(icon, contentDescription = title, tint = iconColor, modifier = Modifier.size(18.dp))
            }
            Text(value, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold)
            Text(status, color = statusColor, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
    }
}

// ============================================
// 3. MEDICATION TIMELINE TAB (Complex Medication Engine)
// ============================================
@Composable
fun MedicationTab(
    viewModel: HealthViewModel,
    meds: List<Medication>,
    logs: List<AdherenceLog>,
    dateStr: String,
    textScale: Float
) {
    var filterTime by remember { mutableStateOf("All") } // All, Morning, Noon, Evening, Night

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Medication Schedule", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp * textScale, color = Color.White)
            IconButton(
                onClick = { viewModel.showAddMedDialog.value = true },
                modifier = Modifier.background(CyanPrimary, CircleShape)
            ) {
                Icon(Icons.Filled.Add, "Add Med", tint = Color.Black)
            }
        }

        // Horizontal filter chips
        Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val listFilters = listOf("All", "Morning", "Noon", "Evening", "Night")
            for (filter in listFilters) {
                FilterChip(
                    selected = filterTime == filter,
                    onClick = { filterTime = filter },
                    label = { Text(filter) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = CyanPrimary,
                        selectedLabelColor = Color.Black,
                        containerColor = BlueCardBG,
                        labelColor = AccessibilityGray
                    ),
                    border = FilterChipDefaults.filterChipBorder(enabled = true, selected = filterTime == filter, borderColor = BorderSlate, selectedBorderColor = CyanPrimary)
                )
            }
        }

        if (meds.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No medications added. Tap the + icon to register schedule.", color = AccessibilityGray, textAlign = TextAlign.Center)
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                // Flatten reminders across scheduled times
                val timelineItems = mutableListOf<Pair<Medication, String>>()
                for (med in meds) {
                    if (med.timeMorning && (filterTime == "All" || filterTime == "Morning")) timelineItems.add(med to "Morning")
                    if (med.timeNoon && (filterTime == "All" || filterTime == "Noon")) timelineItems.add(med to "Noon")
                    if (med.timeEvening && (filterTime == "All" || filterTime == "Evening")) timelineItems.add(med to "Evening")
                    if (med.timeNight && (filterTime == "All" || filterTime == "Night")) timelineItems.add(med to "Night")
                }

                items(timelineItems) { (med, timeSlot) ->
                    val statusLog = logs.find { it.medicationId == med.id && it.scheduledTime == timeSlot && it.dateString == dateStr }
                    val status = statusLog?.status ?: "Pending"

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("med_card_${med.name}_$timeSlot"),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = BlueCardBG),
                        border = BorderStroke(1.dp, if (status == "Taken") AccentGreen.copy(alpha = 0.5f) else BorderSlate)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(med.name, fontSize = 16.sp * textScale, fontWeight = FontWeight.Bold, color = Color.White)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Badge(containerColor = BlueElectric, contentColor = Color.White) {
                                            Text(timeSlot, fontSize = 9.sp)
                                        }
                                    }
                                    Text("Dosage: ${med.dosage} (${med.mealTiming})", fontSize = 11.sp, color = AccessibilityGray)
                                }

                                // Status badge
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(
                                            when (status) {
                                                "Taken" -> AccentGreen.copy(alpha = 0.15f)
                                                "Skipped" -> AccentOrange.copy(alpha = 0.15f)
                                                else -> BlueDarkBG
                                            }
                                        )
                                        .padding(horizontal = 10.dp, vertical = 6.dp)
                                ) {
                                    Text(
                                        text = status,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = when(status) {
                                            "Taken" -> AccentGreen
                                            "Skipped" -> AccentOrange
                                            else -> AccessibilityGray
                                        }
                                    )
                                }
                            }

                            // Interaction warnings and Inventory levels
                            Text(
                                text = "⚠️ Clinical Notes: ${med.interactionWarnings}",
                                fontSize = 10.sp * textScale,
                                color = AccessibilityGray,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Filled.Inventory, contentDescription = "Pills Remaining", tint = AccessibilityGray, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "Stock: ${med.inventoryRemaining} remaining",
                                        fontSize = 11.sp,
                                        color = if (med.inventoryRemaining <= med.refillThreshold) AccentRed else AccessibilityGray,
                                        fontWeight = if (med.inventoryRemaining <= med.refillThreshold) FontWeight.Bold else FontWeight.Normal
                                    )
                                    if (med.inventoryRemaining <= med.refillThreshold) {
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("(REFILL NEEDED)", fontSize = 9.sp, color = AccentRed, fontWeight = FontWeight.Bold)
                                    }
                                }

                                // Interactive Log Controls
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    if (status != "Taken") {
                                        IconButton(
                                            onClick = { viewModel.takeMedication(med, timeSlot) },
                                            modifier = Modifier
                                                .background(AccentGreen.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                                                .size(34.dp)
                                        ) {
                                            Icon(Icons.Filled.Check, "Log Take", tint = AccentGreen, modifier = Modifier.size(16.dp))
                                        }
                                    }

                                    if (status != "Skipped") {
                                        IconButton(
                                            onClick = { viewModel.skipMedication(med, timeSlot) },
                                            modifier = Modifier
                                                .background(AccentOrange.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                                                .size(34.dp)
                                        ) {
                                            Icon(Icons.Filled.Close, "Log Skip", tint = AccentOrange, modifier = Modifier.size(16.dp))
                                        }
                                    }

                                    if (status != "Pending") {
                                        IconButton(
                                            onClick = { viewModel.resetMedicationLog(med.id, timeSlot) },
                                            modifier = Modifier
                                                .background(BorderSlate, RoundedCornerShape(8.dp))
                                                .size(34.dp)
                                        ) {
                                            Icon(Icons.Filled.Undo, "Undo", tint = Color.White, modifier = Modifier.size(14.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ============================================
// 4. ASSISTANT CHAT TAB (Medical Safe Conversational Assistant)
// ============================================
@Composable
fun ChatTab(
    viewModel: HealthViewModel,
    messages: List<ChatMessage>,
    isLoading: Boolean,
    isListening: Boolean,
    transcript: String,
    speechOut: String,
    textScale: Float
) {
    var txtPrompt by remember { mutableStateOf("") }
    val listState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("BOTtab AI Preventive Core", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp * textScale, color = Color.White)
            IconButton(onClick = { viewModel.clearChatHistory() }) {
                Icon(Icons.Filled.Delete, "Clear chat", tint = AccessibilityGray)
            }
        }

        // Voice simulator notification banner
        if (speechOut.isNotEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth().clickable { viewModel.startListening() },
                colors = CardDefaults.cardColors(containerColor = BlueElectric.copy(alpha = 0.2f)),
                border = BorderStroke(1.dp, BlueElectric.copy(alpha = 0.4f)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Filled.RecordVoiceOver, "TTS Speech active", tint = CyanPrimary, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Voice Assistant Out: \"$speechOut\"",
                        color = Color.White,
                        fontSize = 11.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Chat Conversation Logs
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(BlueDarkBG)
                .border(1.dp, BorderSlate, RoundedCornerShape(16.dp))
        ) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(10.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                reverseLayout = true
            ) {
                if (isLoading) {
                    item {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(10.dp)
                        ) {
                            CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp, color = CyanPrimary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Analyzing biomarkers and interactions...", fontSize = 11.sp, color = AccessibilityGray)
                        }
                    }
                }

                items(messages.reversed()) { msg ->
                    ChatBubble(messageObj = msg, textScale = textScale)
                }
            }
        }

        // Quick prompts assistant helper bubbles
        Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            val suggestions = listOf(
                "Is Metformin safe with grapefruits?",
                "Analyze weekend gaps metrics",
                "Review high fall risks for senior status",
                "I have intense chest pain"
            )
            for (sug in suggestions) {
                Button(
                    onClick = { viewModel.sendMessageToAI(sug) },
                    colors = ButtonDefaults.buttonColors(containerColor = BorderSlate),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(sug, fontSize = 10.sp, color = CyanNeon, fontWeight = FontWeight.Medium)
                }
            }
        }

        // Hands-free Voice simulation trigger bar
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = BlueCardBG),
            border = BorderStroke(1.dp, BorderSlate)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = {
                        if (isListening) viewModel.stopAndProcessListening() else viewModel.startListening()
                    },
                    modifier = Modifier.background(if (isListening) AccentRed else BlueDarkBG, CircleShape)
                ) {
                    Icon(
                        imageVector = if (isListening) Icons.Filled.MicOff else Icons.Filled.Mic,
                        contentDescription = "Simulate Hands-free trigger",
                        tint = if (isListening) Color.White else CyanPrimary
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = if (isListening) "Mic capturing ambient..." else "TAP MIC FOR HANDS-FREE REMINDER SIMULATOR",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isListening) AccentRed else AccessibilityGray
                    )
                    Text(
                        text = if (transcript.isNotEmpty()) transcript else "Example query: Did I take my medication?",
                        color = Color.White,
                        fontSize = 11.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                if (isListening) {
                    Button(
                        onClick = { viewModel.stopAndProcessListening() },
                        colors = ButtonDefaults.buttonColors(containerColor = AccentGreen)
                    ) {
                        Text("PROCESS", fontSize = 10.sp, color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Conversational input row
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = txtPrompt,
                onValueChange = { txtPrompt = it },
                placeholder = { Text("Ask BOTtab (e.g., Metformin warnings)", color = AccessibilityGray, fontSize = 13.sp) },
                modifier = Modifier
                    .weight(1f)
                    .testTag("chat_input_field"),
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CyanPrimary,
                    unfocusedBorderColor = BorderSlate,
                    focusedContainerColor = BlueCardBG,
                    unfocusedContainerColor = BlueCardBG
                )
            )

            Button(
                onClick = {
                    if (txtPrompt.trim().isNotEmpty()) {
                        viewModel.sendMessageToAI(txtPrompt)
                        txtPrompt = ""
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = CyanPrimary),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.height(50.dp).testTag("chat_send_button")
            ) {
                Icon(Icons.Filled.Send, "Send prompt", tint = Color.Black)
            }
        }

        // Mandatory medical footnote
        Text(
            text = "⚠️ Medical Alert Warning: BOTtab is general preventive wellness guidance only. It cannot prescribe medication, adjust dosages, or replace professional consulting. If you experience intense distress, seek immediate emergency clinic care.",
            fontSize = 9.sp,
            color = AccessibilityGray,
            textAlign = TextAlign.Center,
            lineHeight = 12.sp,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
fun ChatBubble(messageObj: ChatMessage, textScale: Float) {
    val isUser = messageObj.sender == "User"
    val isAI = messageObj.sender == "AI"

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clip(
                    RoundedCornerShape(
                        topStart = 14.dp,
                        topEnd = 14.dp,
                        bottomStart = if (isUser) 14.dp else 2.dp,
                        bottomEnd = if (isUser) 2.dp else 14.dp
                    )
                )
                .background(if (isUser) BlueElectric else if (isAI) BlueCardBG else AccentRed.copy(alpha = 0.2f))
                .border(1.dp, if (isUser) BlueElectric else BorderSlate, RoundedCornerShape(14.dp))
                .padding(12.dp)
        ) {
            Text(
                text = messageObj.message,
                color = Color.White,
                fontSize = 13.sp * textScale,
                lineHeight = 17.sp
            )
        }
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = messageObj.sender,
            color = AccessibilityGray,
            fontSize = 8.sp,
            modifier = Modifier.padding(horizontal = 4.dp)
        )
    }
}

// ============================================
// 5. CAMERA + AI INTERACTION SCANNER TAB
// ============================================
@Composable
fun ScannerTab(
    viewModel: HealthViewModel,
    scanState: ScanState,
    textScale: Float
) {
    var selectedReportMed by remember { mutableStateOf("Amoxicillin") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("AI Vision Prescription Scanner", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp * textScale, color = Color.White)
        Text("Select a medication template strip or doctor's prescription recipe below. Our holographic engine will run optical medicine checks automatically.", color = AccessibilityGray, fontSize = 11.sp, textAlign = TextAlign.Center)

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val listScannerMeds = listOf("Amoxicillin", "Clopidogrel", "Panadol")
            for (m in listScannerMeds) {
                Button(
                    onClick = { selectedReportMed = m },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedReportMed == m) CyanPrimary else BorderSlate,
                        contentColor = if (selectedReportMed == m) Color.Black else Color.White
                    ),
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(m, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Holographic Camera Sight Box
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(240.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(BlueDarkBG)
                .border(2.dp, CyanPrimary.copy(alpha = 0.6f), RoundedCornerShape(20.dp)),
            contentAlignment = Alignment.Center
        ) {
            // Neon crosshair corners
            Canvas(modifier = Modifier.fillMaxSize()) {
                val lineL = 30.dp.toPx()
                val lineW = 3.dp.toPx()
                // Top Left
                drawLine(CyanPrimary, Offset(16.dp.toPx(), 16.dp.toPx()), Offset(16.dp.toPx() + lineL, 16.dp.toPx()), strokeWidth = lineW)
                drawLine(CyanPrimary, Offset(16.dp.toPx(), 16.dp.toPx()), Offset(16.dp.toPx(), 16.dp.toPx() + lineL), strokeWidth = lineW)
                // Top Right
                drawLine(CyanPrimary, Offset(size.width - 16.dp.toPx(), 16.dp.toPx()), Offset(size.width - 16.dp.toPx() - lineL, 16.dp.toPx()), strokeWidth = lineW)
                drawLine(CyanPrimary, Offset(size.width - 16.dp.toPx(), 16.dp.toPx()), Offset(size.width - 16.dp.toPx(), 16.dp.toPx() + lineL), strokeWidth = lineW)
                // Bottom Left
                drawLine(CyanPrimary, Offset(16.dp.toPx(), size.height - 16.dp.toPx()), Offset(16.dp.toPx() + lineL, size.height - 16.dp.toPx()), strokeWidth = lineW)
                drawLine(CyanPrimary, Offset(16.dp.toPx(), size.height - 16.dp.toPx()), Offset(16.dp.toPx(), size.height - 16.dp.toPx() - lineL), strokeWidth = lineW)
                // Bottom Right
                drawLine(CyanPrimary, Offset(size.width - 16.dp.toPx(), size.height - 16.dp.toPx()), Offset(size.width - 16.dp.toPx() - lineL, size.height - 16.dp.toPx()), strokeWidth = lineW)
                drawLine(CyanPrimary, Offset(size.width - 16.dp.toPx(), size.height - 16.dp.toPx()), Offset(size.width - 16.dp.toPx(), size.height - 16.dp.toPx() - lineL), strokeWidth = lineW)
            }

            if (scanState is ScanState.Scanning) {
                val infiniteTransition = rememberInfiniteTransition()
                val animatedY by infiniteTransition.animateFloat(
                    initialValue = 20f,
                    targetValue = 220f,
                    animationSpec = infiniteRepeatable(
                        animation = tween(2000, easing = LinearEasing),
                        repeatMode = RepeatMode.Reverse
                    )
                )
                Canvas(modifier = Modifier.fillMaxSize()) {
                    drawLine(
                        color = CyanPrimary,
                        start = Offset(20.dp.toPx(), animatedY.dp.toPx()),
                        end = Offset(size.width - 20.dp.toPx(), animatedY.dp.toPx()),
                        strokeWidth = 2.dp.toPx()
                    )
                }
                Text("SCANNING: $selectedReportMed STAGE...", color = CyanPrimary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            } else {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(Icons.Filled.PhotoCamera, "Mock Camera", tint = AccessibilityGray, modifier = Modifier.size(54.dp))
                    Text("TARGET STRETCH: $selectedReportMed", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        Button(
            onClick = { viewModel.scanPrescriptionDocument(selectedReportMed) },
            colors = ButtonDefaults.buttonColors(containerColor = CyanPrimary),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth().height(48.dp)
        ) {
            Icon(Icons.Filled.DocumentScanner, "Scan action", tint = Color.Black)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Simulate Doc-Scanning & Interaction Check", color = Color.Black, fontWeight = FontWeight.Bold)
        }

        if (scanState is ScanState.Success) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = BlueCardBG),
                border = BorderStroke(1.dp, BorderSlate)
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Scanned Active Prescription Elements:", color = AccentGreen, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    Text(scanState.parsedJson, color = Color.White, fontSize = 11.sp, lineHeight = 15.sp)
                }
            }
        }
    }
}

// ============================================
// 6. EMERGENCY SOS TAB (Critical Lifesaver)
// ============================================
@Composable
fun EmergencyTab(
    viewModel: HealthViewModel,
    profile: UserProfile,
    textScale: Float
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Text("BOTtab Emergency System", fontWeight = FontWeight.ExtraBold, fontSize = 20.sp * textScale, color = Color.White)
        Text("In life-threatening situations, use our hotkeys to auto-alert caregivers and contact paramedic coordinators immediately.", color = AccessibilityGray, fontSize = 11.sp, textAlign = TextAlign.Center)

        // Pulsing Emergency Red Button
        val infiniteTransition = rememberInfiniteTransition()
        val pulseScale by infiniteTransition.animateFloat(
            initialValue = 1f,
            targetValue = 1.15f,
            animationSpec = infiniteRepeatable(
                animation = tween(1200, easing = LinearEasing),
                repeatMode = RepeatMode.Reverse
            )
        )

        Box(
            modifier = Modifier
                .size(160.dp * pulseScale)
                .clip(CircleShape)
                .background(AccentRed.copy(alpha = 0.15f))
                .clickable { viewModel.triggerEmergencySOS() },
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .size(110.dp)
                    .clip(CircleShape)
                    .background(AccentRed)
                    .shadow(12.dp, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Filled.SmsFailed, "Panic", tint = Color.White, modifier = Modifier.size(36.dp))
                    Text("TAP SOS", fontWeight = FontWeight.ExtraBold, color = Color.White, fontSize = 12.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // SOS Specific quick action help categories
        Text("Critical Crisis Safety Checklist", fontWeight = FontWeight.Bold, fontSize = 14.sp * textScale, color = Color.White, modifier = Modifier.fillMaxWidth())

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = BlueCardBG),
            border = BorderStroke(1.dp, BorderSlate)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Filled.Warning, "Cardiac Warning", tint = AccentRed)
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text("Heart Pressure / Tight Chest Pain", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                        Text("Chew 325mg Aspirin instantly if directed by clinician. Sit upright. Do not walk.", color = AccessibilityGray, fontSize = 11.sp)
                    }
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Filled.Coronavirus, "Asthma Warning", tint = AccentOrange)
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text("Acute Breathlessness / Throat Tightness", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                        Text("Use Rescue Inhaler immediately. Loosen collared garments and lean forward.", color = AccessibilityGray, fontSize = 11.sp)
                    }
                }
            }
        }

        // Fast coordinator contact row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = { /* Simulated Call */ },
                colors = ButtonDefaults.buttonColors(containerColor = BorderSlate),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f).height(48.dp)
            ) {
                Icon(Icons.Filled.PhoneInTalk, "Paramedics Call", tint = AccentGreen)
                Spacer(modifier = Modifier.width(6.dp))
                Text("911 Dispatch", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
            Button(
                onClick = { /* Simulated SMS */ },
                colors = ButtonDefaults.buttonColors(containerColor = BorderSlate),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1.1f).height(48.dp)
            ) {
                Icon(Icons.Filled.FamilyRestroom, "Alert Contacts", tint = CyanPrimary)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Alert: ${profile.emergencyContactName}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp, maxLines = 1)
            }
        }
    }
}

// ============================================
// 7. CAREGIVER INTEGRATION MONITOR TAB
// ============================================
@Composable
fun CaregiverTab(
    viewModel: HealthViewModel,
    profile: UserProfile,
    meds: List<Medication>,
    logs: List<AdherenceLog>,
    dateStr: String,
    textScale: Float
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Caregiver Monitoring Panel", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp * textScale, color = Color.White)
        Text("Simulating remote visibility. Observer can monitor compliance indices of elderly family relatives or pediatric schedules remotely.", color = AccessibilityGray, fontSize = 11.sp)

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = BlueCardBG),
            border = BorderStroke(1.dp, BorderSlate)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(42.dp).background(BlueDarkBG, CircleShape), contentAlignment = Alignment.Center) {
                        Text("JD", color = CyanPrimary, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text("Dependent: ${profile.name} (Age: ${profile.age})", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                        Text("Clinical Diagnostics Sync: 4 mins ago", color = AccessibilityGray, fontSize = 11.sp)
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))
                
                // Analytics details
                val takenCount = logs.count { it.dateString == dateStr && it.status == "Taken" }
                val skipCount = logs.count { it.dateString == dateStr && it.status == "Skipped" }
                
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Today's Medication Compliance Index:", fontSize = 12.sp, color = AccessibilityGray)
                    Text("$takenCount Taken / $skipCount Skipped", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                LinearProgressIndicator(
                    progress = { if (meds.isNotEmpty()) takenCount.toFloat() / (meds.size * 2).toFloat() else 1f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(CircleShape),
                    color = AccentGreen,
                    trackColor = BorderSlate
                )
            }
        }

        // Live Alerts logs
        Text("Observer Compliance Warnings", fontWeight = FontWeight.Bold, fontSize = 14.sp * textScale, color = Color.White)
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = BlueDarkBG),
            border = BorderStroke(1.dp, BorderSlate)
        ) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Filled.NotificationsActive, "Missed Warning", tint = AccentOrange, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("WARNING: Tablet 'Metformin' Evening dose unresolved. 30 mins late.", color = Color.White, fontSize = 11.sp)
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Filled.LocalPharmacy, "Refill alarm", tint = AccentRed, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("CRITICAL STOCK: 'Lisinopril' is below refill threshold (only 4 left!).", color = Color.White, fontSize = 11.sp)
                }
            }
        }
    }
}
