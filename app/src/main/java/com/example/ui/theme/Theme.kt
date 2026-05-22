package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = CyanPrimary,
    secondary = BlueElectric,
    tertiary = AccentGreen,
    background = BlueDarkBG,
    surface = BlueCardBG,
    onPrimary = Color.Black,
    onSecondary = Color.White,
    onTertiary = Color.Black,
    onBackground = Color.White,
    onSurface = Color.White,
    surfaceVariant = BorderSlate,
    onSurfaceVariant = AccessibilityGray,
    error = AccentRed
)

// Force Premium Dark Theme as requested by "Dark medical aesthetic" and "Jarvis AI"
@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = true, // Force dark mode for cohesive futuristic branding
    dynamicColor: Boolean = false, // Disable dynamic colors to ensure high-fidelity neon cyber palette
    content: @Composable () -> Unit
) {
    val colorScheme = DarkColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
