package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.ui.viewmodel.*

class MainActivity : ComponentActivity() {
    private val viewModel: HealthViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                val authState by viewModel.authState.collectAsStateWithLifecycle()
                val biometricsEnabled by viewModel.biometricEnabled.collectAsStateWithLifecycle()

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = BlueDarkBG
                ) {
                    if (authState !is AuthState.Authenticated) {
                        GateScreen(
                            authState = authState,
                            biometricsEnabled = biometricsEnabled,
                            onLogin = { viewModel.loginSimulated(it) },
                            onBiometric = { viewModel.performBiometrics() },
                            onToggleBio = { viewModel.toggleBiometrics(it) }
                        )
                    } else {
                        MainAppContent(viewModel)
                    }
                }
            }
        }
    }
}

@Composable
fun MainAppContent(viewModel: HealthViewModel) {
    // Collect StateFlows from ViewModel
    val activeTab by viewModel.activeTab.collectAsStateWithLifecycle()
    val userProfile by viewModel.userProfile.collectAsStateWithLifecycle()
    val activeMeds by viewModel.activeMedications.collectAsStateWithLifecycle()
    val adherenceLogs by viewModel.adherenceLogs.collectAsStateWithLifecycle()
    val todayHealthLog by viewModel.todayHealthLog.collectAsStateWithLifecycle()
    val botScore by viewModel.botScore.collectAsStateWithLifecycle()
    val selectedSeason by viewModel.selectedSeason.collectAsStateWithLifecycle()
    val predictiveInsight by viewModel.predictiveInsight.collectAsStateWithLifecycle()
    val activeRole by viewModel.currentRole.collectAsStateWithLifecycle()
    val chatMessages by viewModel.chatMessages.collectAsStateWithLifecycle()
    val chatLoading by viewModel.chatLoading.collectAsStateWithLifecycle()
    val seniorTextScale by viewModel.seniorTextScale.collectAsStateWithLifecycle()
    val isListening by viewModel.isListening.collectAsStateWithLifecycle()
    val voiceTranscript by viewModel.voiceAssistantTranscript.collectAsStateWithLifecycle()
    val voiceSpeechOutput by viewModel.voiceSpeechOutput.collectAsStateWithLifecycle()
    val ocrScanningState by viewModel.ocrScanningState.collectAsStateWithLifecycle()
    val isEmergencyTriggered by viewModel.isEmergencyTriggered.collectAsStateWithLifecycle()

    var showSettingsMenu by remember { mutableStateOf(false) }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            Column(
                modifier = Modifier
                    .background(BlueDarkBG)
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Left Header avatar
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(Brush.radialGradient(listOf(CyanNeon, BlueElectric))),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "B",
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = 16.sp
                            )
                        }
                        Column {
                            Text(
                                text = "BOTtab PRO",
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 18.sp,
                                color = Color.White
                            )
                            userProfile?.let {
                                Text(
                                    text = "${it.name} (${it.age} yrs)",
                                    fontSize = 11.sp,
                                    color = CyanNeon,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }

                    // Glow circle indicators / season switch on click
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        SeasonBadge(
                            season = selectedSeason,
                            onClick = {
                                val nextSeason = when(selectedSeason) {
                                    "Summer" -> "Winter"
                                    "Winter" -> "Monsoon"
                                    else -> "Summer"
                                }
                                viewModel.changeSeason(nextSeason)
                            }
                        )

                        // Settings trigger
                        IconButton(onClick = { showSettingsMenu = !showSettingsMenu }) {
                            Icon(Icons.Filled.Settings, "Settings menu", tint = Color.White)
                        }
                    }
                }

                // Inline Settings dropdown
                if (showSettingsMenu) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 10.dp)
                            .animateContentSize(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = BlueCardBG),
                        border = BorderStroke(1.dp, BorderSlate)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("Environmental and Accessibility Triggers", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            
                            // Age switcher
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                Text("Simulate Age category:", color = AccessibilityGray, fontSize = 11.sp)
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Button(
                                        onClick = {
                                            userProfile?.let { viewModel.updateProfile(it.copy(age = 6)) }
                                            viewModel.setSeniorTextScale(1.0f)
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = if (userProfile?.age == 6) CyanPrimary else BlueDarkBG),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp)
                                    ) { Text("Child", fontSize = 9.sp, color = if (userProfile?.age == 6) Color.Black else Color.White) }

                                    Button(
                                        onClick = {
                                            userProfile?.let { viewModel.updateProfile(it.copy(age = 35)) }
                                            viewModel.setSeniorTextScale(1.0f)
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = if (userProfile?.age == 35) CyanPrimary else BlueDarkBG),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp)
                                    ) { Text("Adult", fontSize = 9.sp, color = if (userProfile?.age == 35) Color.Black else Color.White) }

                                    Button(
                                        onClick = {
                                            userProfile?.let { viewModel.updateProfile(it.copy(age = 67)) }
                                            viewModel.setSeniorTextScale(1.2f) // Automatically sets accessibility zoom!
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = if (userProfile?.age == 67) CyanPrimary else BlueDarkBG),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp)
                                    ) { Text("Senior", fontSize = 9.sp, color = if (userProfile?.age == 67) Color.Black else Color.White) }
                                }
                            }

                            // Role toggle row
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                Text("Toggle Clinical Role Mode:", color = AccessibilityGray, fontSize = 11.sp)
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    val roles = listOf("Patient", "Caregiver", "Wellness Coach")
                                    for (r in roles) {
                                        Button(
                                            onClick = { viewModel.changeActiveRole(r) },
                                            colors = ButtonDefaults.buttonColors(containerColor = if (activeRole == r) CyanPrimary else BlueDarkBG),
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                                        ) { Text(r.split(" ").first(), fontSize = 9.sp, color = if (activeRole == r) Color.Black else Color.White) }
                                    }
                                }
                            }

                            // Accessibility Touch-Target/Text magnification toggle (For Seniors)
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                Text("Accessibility Text Zoom:", color = AccessibilityGray, fontSize = 11.sp)
                                Slider(
                                    value = seniorTextScale,
                                    onValueChange = { viewModel.setSeniorTextScale(it) },
                                    valueRange = 1.0f..1.5f,
                                    modifier = Modifier.width(180.dp),
                                    colors = SliderDefaults.colors(thumbColor = CyanPrimary, activeTrackColor = CyanPrimary)
                                )
                            }

                            // Manual Profile button
                            Button(
                                onClick = { viewModel.showProfileDialog.value = true; showSettingsMenu = false },
                                colors = ButtonDefaults.buttonColors(containerColor = BlueElectric),
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text("Full Patient File / Allergy logs", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        },
        bottomBar = {
            // Elegant modern glass bottom bar with gesture-safe margins
            Column(modifier = Modifier.background(BlueDarkBG)) {
                Divider(color = BorderSlate)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .navigationBarsPadding() // Safely positions above gesture bar or home buttons
                        .padding(vertical = 8.dp, horizontal = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val items = listOf(
                        NavigationItem("dashboard", Icons.Filled.Dashboard, "Health"),
                        NavigationItem("schedule", Icons.Filled.LocalPharmacy, "Timeline"),
                        NavigationItem("assistant", Icons.Filled.RecordVoiceOver, "Assistant"),
                        NavigationItem("scanner", Icons.Filled.DocumentScanner, "Scanner"),
                        NavigationItem("emergency", Icons.Filled.SmsFailed, "SOS")
                    )

                    for (item in items) {
                        val isActive = activeTab == item.route
                        IconButton(
                            onClick = { viewModel.setActiveTab(item.route) },
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isActive) CyanPrimary.copy(alpha = 0.15f) else Color.Transparent)
                                .size(48.dp) // Accessibility targets target
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(
                                    imageVector = item.icon,
                                    contentDescription = item.label,
                                    tint = if (isActive || (item.route == "emergency" && isEmergencyTriggered)) {
                                        if (item.route == "emergency") AccentRed else CyanPrimary
                                    } else {
                                        AccessibilityGray
                                    }
                                )
                                Text(
                                    text = item.label,
                                    fontSize = 9.sp,
                                    fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isActive) CyanPrimary else AccessibilityGray
                                )
                            }
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Screen switching block
            AnimatedContent(
                targetState = activeTab,
                transitionSpec = {
                    fadeIn() togetherWith fadeOut()
                },
                label = "Screen Transitions"
            ) { tab ->
                userProfile?.let { prof ->
                    when (tab) {
                        "dashboard" -> {
                            if (activeRole == "Caregiver") {
                                CaregiverTab(
                                    viewModel = viewModel,
                                    profile = prof,
                                    meds = activeMeds,
                                    logs = adherenceLogs,
                                    dateStr = viewModel.currentDateString.value,
                                    textScale = seniorTextScale
                                )
                            } else {
                                DashboardTab(
                                    viewModel = viewModel,
                                    profile = prof,
                                    meds = activeMeds,
                                    logs = adherenceLogs,
                                    healthLog = todayHealthLog,
                                    botScore = botScore,
                                    season = selectedSeason,
                                    insight = predictiveInsight,
                                    role = activeRole,
                                    textScale = seniorTextScale
                                )
                            }
                        }
                        "schedule" -> {
                            MedicationTab(
                                viewModel = viewModel,
                                meds = activeMeds,
                                logs = adherenceLogs,
                                dateStr = viewModel.currentDateString.value,
                                textScale = seniorTextScale
                            )
                        }
                        "assistant" -> {
                            ChatTab(
                                viewModel = viewModel,
                                messages = chatMessages,
                                isLoading = chatLoading,
                                isListening = isListening,
                                transcript = voiceTranscript,
                                speechOut = voiceSpeechOutput,
                                textScale = seniorTextScale
                            )
                        }
                        "scanner" -> {
                            ScannerTab(
                                viewModel = viewModel,
                                scanState = ocrScanningState,
                                textScale = seniorTextScale
                            )
                        }
                        "emergency" -> {
                            EmergencyTab(
                                viewModel = viewModel,
                                profile = prof,
                                textScale = seniorTextScale
                            )
                        }
                    }
                }
            }

            // --- Floating Interactive Warning Alerts ---
            if (activeMeds.any { it.inventoryRemaining <= it.refillThreshold }) {
                Snackbar(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(16.dp),
                    containerColor = AccentRed.copy(alpha = 0.95f),
                    contentColor = Color.White,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Active Alert: Low Prescription Inventory remaining! Tap to refill.", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        TextButton(onClick = { viewModel.setActiveTab("schedule") }) {
                            Text("REFILL", color = CyanNeon, fontWeight = FontWeight.ExtraBold, fontSize = 11.sp)
                        }
                    }
                }
            }
        }
    }

    // Modal dialog trigger boxes
    if (viewModel.showAddMedDialog.value) {
        AddMedicationDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showAddMedDialog.value = false }
        )
    }

    if (viewModel.showProfileDialog.value) {
        userProfile?.let { prof ->
            EditProfileDialog(
                profile = prof,
                onDismiss = { viewModel.showProfileDialog.value = false },
                onSave = { viewModel.updateProfile(it) }
            )
        }
    }
}

@Composable
fun SeasonBadge(season: String, onClick: () -> Unit) {
    val icon = when(season) {
        "Summer" -> Icons.Filled.LightMode
        "Winter" -> Icons.Filled.AcUnit
        else -> Icons.Filled.Cloud
    }
    val color = when(season) {
        "Summer" -> AccentOrange
        "Winter" -> CyanPrimary
        else -> BlueElectric
    }
    val text = when(season) {
        "Summer" -> "Summer Heat"
        "Winter" -> "Winter Flu"
        else -> "Monsoon Risk"
    }

    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(color.copy(alpha = 0.2f))
            .border(1.dp, color.copy(alpha = 0.4f), RoundedCornerShape(20.dp))
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Icon(icon, contentDescription = text, tint = color, modifier = Modifier.size(16.dp))
        Text(text, color = color, fontSize = 11.sp, fontWeight = FontWeight.Bold)
    }
}

data class NavigationItem(val route: String, val icon: ImageVector, val label: String)
