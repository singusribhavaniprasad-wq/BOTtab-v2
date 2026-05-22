package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.UserProfile
import com.example.ui.theme.*
import com.example.ui.viewmodel.HealthViewModel

@Composable
fun AddMedicationDialog(
    viewModel: HealthViewModel,
    onDismiss: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var dosage by remember { mutableStateOf("") }
    var frequency by remember { mutableStateOf("Once a Day") }
    
    var timeMorning by remember { mutableStateOf(true) }
    var timeNoon by remember { mutableStateOf(false) }
    var timeEvening by remember { mutableStateOf(false) }
    var timeNight by remember { mutableStateOf(false) }
    
    var mealTiming by remember { mutableStateOf("After food") } // Before food, After food, With food, None
    var inventoryRemaining by remember { mutableStateOf("30") }
    var warnings by remember { mutableStateOf("") }

    val mealOptions = listOf("Before food", "After food", "With food", "None")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
                .verticalScroll(rememberScrollState()),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = BlueCardBG),
            border = BorderStroke(1.dp, BorderSlate)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(
                    text = "Add Clinical Medication",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                // Name
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Medication Name (e.g. Metformin)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = CyanPrimary,
                        unfocusedBorderColor = BorderSlate,
                        focusedLabelColor = CyanPrimary,
                        unfocusedLabelColor = AccessibilityGray,
                        focusedTextColor = Color.White
                    )
                )

                // Dosage
                OutlinedTextField(
                    value = dosage,
                    onValueChange = { dosage = it },
                    label = { Text("Dosage (e.g. 500mg, 1 Tablet)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = CyanPrimary,
                        unfocusedBorderColor = BorderSlate,
                        focusedLabelColor = CyanPrimary,
                        unfocusedLabelColor = AccessibilityGray,
                        focusedTextColor = Color.White
                    )
                )

                // Target Reminder Times
                Text("Scheduled Administration Times", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Morning", fontSize = 11.sp, color = AccessibilityGray)
                        Checkbox(checked = timeMorning, onCheckedChange = { timeMorning = it }, colors = CheckboxDefaults.colors(checkedColor = CyanPrimary))
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Noon", fontSize = 11.sp, color = AccessibilityGray)
                        Checkbox(checked = timeNoon, onCheckedChange = { timeNoon = it }, colors = CheckboxDefaults.colors(checkedColor = CyanPrimary))
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Evening", fontSize = 11.sp, color = AccessibilityGray)
                        Checkbox(checked = timeEvening, onCheckedChange = { timeEvening = it }, colors = CheckboxDefaults.colors(checkedColor = CyanPrimary))
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Night", fontSize = 11.sp, color = AccessibilityGray)
                        Checkbox(checked = timeNight, onCheckedChange = { timeNight = it }, colors = CheckboxDefaults.colors(checkedColor = CyanPrimary))
                    }
                }

                // Food Association Timing
                Text("Food Intake Association", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    for (opt in mealOptions) {
                        Button(
                            onClick = { mealTiming = opt },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (mealTiming == opt) CyanPrimary else BlueDarkBG,
                                contentColor = if (mealTiming == opt) Color.Black else Color.White
                            ),
                            border = BorderStroke(1.dp, BorderSlate),
                            modifier = Modifier.weight(1f),
                            contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(opt, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                // Pill Initial Inventory Stock
                OutlinedTextField(
                    value = inventoryRemaining,
                    onValueChange = { inventoryRemaining = it },
                    label = { Text("Pill Inventory Stock Count") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = CyanPrimary,
                        unfocusedBorderColor = BorderSlate,
                        focusedLabelColor = CyanPrimary,
                        unfocusedLabelColor = AccessibilityGray,
                        focusedTextColor = Color.White
                    )
                )

                // Warnings/Interactions
                OutlinedTextField(
                    value = warnings,
                    onValueChange = { warnings = it },
                    label = { Text("Clinical warnings (e.g. No alcohol)") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = CyanPrimary,
                        unfocusedBorderColor = BorderSlate,
                        focusedLabelColor = CyanPrimary,
                        unfocusedLabelColor = AccessibilityGray,
                        focusedTextColor = Color.White
                    )
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Actions row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    TextButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel", color = AccessibilityGray, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {
                            if (name.trim().isNotEmpty() && dosage.trim().isNotEmpty()) {
                                viewModel.insertNewMedication(
                                    name = name,
                                    dosage = dosage,
                                    frequency = frequency,
                                    morning = timeMorning,
                                    noon = timeNoon,
                                    evening = timeEvening,
                                    night = timeNight,
                                    mealTiming = mealTiming,
                                    inventory = inventoryRemaining.toIntOrNull() ?: 30,
                                    warnings = if (warnings.trim().isEmpty()) "None declared. Safe as directed." else warnings
                                )
                                onDismiss()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = CyanPrimary),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1.2f)
                    ) {
                        Text("Add Reminder", color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun EditProfileDialog(
    profile: UserProfile,
    onDismiss: () -> Unit,
    onSave: (UserProfile) -> Unit
) {
    // Local copy states
    var name by remember { mutableStateOf(profile.name) }
    var age by remember { mutableStateOf(profile.age.toString()) }
    var allergies by remember { mutableStateOf(profile.allergies) }
    var conditions by remember { mutableStateOf(profile.medicalConditions) }
    var waterGoal by remember { mutableStateOf(profile.waterGoalMl.toString()) }
    var emergencyContact by remember { mutableStateOf(profile.emergencyContactName) }
    var emergencyPhone by remember { mutableStateOf(profile.emergencyContactPhone) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
                .verticalScroll(rememberScrollState()),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = BlueCardBG),
            border = BorderStroke(1.dp, BorderSlate)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(
                    text = "Edit Patient Record profile",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Full Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = CyanPrimary, unfocusedBorderColor = BorderSlate, focusedTextColor = Color.White)
                )

                OutlinedTextField(
                    value = age,
                    onValueChange = { age = it },
                    label = { Text("Age (Enables Age-Smart warnings)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = CyanPrimary, unfocusedBorderColor = BorderSlate, focusedTextColor = Color.White)
                )

                OutlinedTextField(
                    value = allergies,
                    onValueChange = { allergies = it },
                    label = { Text("Known Allergies (Comma separated)") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = CyanPrimary, unfocusedBorderColor = BorderSlate, focusedTextColor = Color.White)
                )

                OutlinedTextField(
                    value = conditions,
                    onValueChange = { conditions = it },
                    label = { Text("Medical Conditions / Diagnosis") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = CyanPrimary, unfocusedBorderColor = BorderSlate, focusedTextColor = Color.White)
                )

                OutlinedTextField(
                    value = waterGoal,
                    onValueChange = { waterGoal = it },
                    label = { Text("Daily Water hydration Goal (ml)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = CyanPrimary, unfocusedBorderColor = BorderSlate, focusedTextColor = Color.White)
                )

                OutlinedTextField(
                    value = emergencyContact,
                    onValueChange = { emergencyContact = it },
                    label = { Text("Emergency Contact Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = CyanPrimary, unfocusedBorderColor = BorderSlate, focusedTextColor = Color.White)
                )

                OutlinedTextField(
                    value = emergencyPhone,
                    onValueChange = { emergencyPhone = it },
                    label = { Text("Emergency Phone") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = CyanPrimary, unfocusedBorderColor = BorderSlate, focusedTextColor = Color.White)
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    TextButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                        Text("Cancel", color = AccessibilityGray)
                    }

                    Button(
                        onClick = {
                            if (name.trim().isNotEmpty() && age.trim().toIntOrNull() != null) {
                                onSave(
                                    profile.copy(
                                        name = name,
                                        age = age.toInt(),
                                        allergies = allergies,
                                        medicalConditions = conditions,
                                        waterGoalMl = waterGoal.toIntOrNull() ?: 2500,
                                        emergencyContactName = emergencyContact,
                                        emergencyContactPhone = emergencyPhone
                                    )
                                )
                                onDismiss()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = CyanPrimary),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1.2f)
                    ) {
                        Text("Save Changes", color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
