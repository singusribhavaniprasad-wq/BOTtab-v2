import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  User, 
  Users, 
  Heart, 
  Award, 
  Brain, 
  ChevronRight, 
  Plus, 
  Check, 
  X, 
  Undo, 
  Flame, 
  Activity, 
  Compass, 
  Droplets,
  CloudSun,
  Fingerprint,
  RotateCcw,
  Settings,
  AlertTriangle,
  FileCheck,
  Send,
  Sparkles,
  RefreshCw,
  PlusCircle,
  HelpCircle,
  Info,
  Sliders,
  Calendar,
  Lock,
  Moon,
  Trash2
} from 'lucide-react';
import { UserProfile, Medication, AdherenceLog, DailyHealthLog, ChatMessage } from './types';
import { fetchGeminiResponse } from './gemini';

// --- Default Seed Data ---
const DEFAULT_PROFILE: UserProfile = {
  id: 1,
  name: "John Doe Senior",
  age: 68,
  gender: "Male",
  heightCm: 175.0,
  weightKg: 78.5,
  allergies: "Penicillin, Peanuts",
  medicalConditions: "Type 2 Diabetes, Hypertension, Mild Osteoarthritis",
  emergencyContactName: "Jane Doe (Spouse)",
  emergencyContactPhone: "+1 (555) 019-2834",
  caregiverName: "Dr. Robert Smith",
  caregiverPhone: "+1 (555) 014-9988",
  activeRole: "Patient", 
  waterGoalMl: 2500,
  sleepGoalHours: 8
};

const DEFAULT_MEDICATIONS: Medication[] = [
  {
    id: 1,
    name: "Metformin",
    dosage: "500mg - 1 Tablet",
    frequency: "Twice a Day",
    timeMorning: true,
    timeNoon: false,
    timeEvening: true,
    timeNight: false,
    mealTiming: "After food",
    inventoryRemaining: 58,
    refillThreshold: 10,
    interactionWarnings: "Avoid consuming on empty stomach. Avoid excessive alcohol intake.",
    isActive: true
  },
  {
    id: 2,
    name: "Lisinopril",
    dosage: "10mg - 1 Tablet",
    frequency: "Once a Day",
    timeMorning: false,
    timeNoon: false,
    timeEvening: false,
    timeNight: true,
    mealTiming: "None",
    inventoryRemaining: 24,
    refillThreshold: 7,
    interactionWarnings: "Can cause sudden lightheadedness or dizziness if standing quickly.",
    isActive: true
  },
  {
    id: 3,
    name: "Atorvastatin",
    dosage: "20mg - 1 Tablet",
    frequency: "Once a Day",
    timeMorning: false,
    timeNoon: false,
    timeEvening: false,
    timeNight: true,
    mealTiming: "After food",
    inventoryRemaining: 5,
    refillThreshold: 7,
    interactionWarnings: "Limit grapefruit juice. Report muscle pain immediately to cardiologist.",
    isActive: true
  },
  {
    id: 4,
    name: "Pediatric Multivitamin (Child Mode Mock)",
    dosage: "1 Gummy",
    frequency: "Once a Day",
    timeMorning: true,
    timeNoon: false,
    timeEvening: false,
    timeNight: false,
    mealTiming: "With food",
    inventoryRemaining: 30,
    refillThreshold: 5,
    interactionWarnings: "Tastes chewable. Store safely out of reach of children.",
    isActive: false
  }
];

const DEFAULT_HEALTH_LOG: DailyHealthLog = {
  dateString: new Date().toISOString().split('T')[0],
  sleepHours: 6.5,
  waterIntakeMl: 1250,
  steps: 6420,
  stressLevel: 5,
  moodRating: 4,
  heartRateBpm: 72,
  bloodGlucose: 114.0,
  systolicBp: 128,
  diastolicBp: 82
};

const DEFAULT_CHAT: ChatMessage[] = [
  {
    id: 1,
    sender: "AI",
    message: "Welcome to your BOTtab Preventive Core workspace. I have securely synchronized your clinical records: **Type 2 Diabetes & Hypertension**.\n\nAsk me about food drug reactions, your metrics gaps (e.g. Lisinopril stock at 0 or Metformin tracking gaps), or seasonal health forecasts.",
    timestamp: Date.now() - 3600000
  }
];

export default function App() {
  // --- Persistent States ---
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('bottab_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('bottab_medications');
    return saved ? JSON.parse(saved) : DEFAULT_MEDICATIONS;
  });

  const [adherenceLogs, setAdherenceLogs] = useState<AdherenceLog[]>(() => {
    const saved = localStorage.getItem('bottab_adherence');
    return saved ? JSON.parse(saved) : [];
  });

  const [healthLog, setHealthLog] = useState<DailyHealthLog>(() => {
    const saved = localStorage.getItem('bottab_health');
    return saved ? JSON.parse(saved) : DEFAULT_HEALTH_LOG;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('bottab_chat');
    return saved ? JSON.parse(saved) : DEFAULT_CHAT;
  });

  const [apiSettings, setApiSettings] = useState<{ key: string }>(() => {
    const saved = localStorage.getItem('bottab_api');
    return saved ? JSON.parse(saved) : { key: "" };
  });

  // --- UI Layout States ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = sessionStorage.getItem('bottab_auth');
    return saved === 'true';
  });
  const [pinValue, setPinValue] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(true);

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'meds' | 'chat'>('dashboard');
  const [selectedSeason, setSelectedSeason] = useState<'Summer' | 'Winter' | 'Monsoon'>('Summer');
  const [textScale, setTextScale] = useState<number>(1.0); // 0.8 as Compact, 1.0 as Standard, 1.2 as Large
  const [role, setRole] = useState<string>(profile.activeRole);

  const [showAddMedDialog, setShowAddMedDialog] = useState<boolean>(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // --- Add Medication Form States ---
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedFreq, setNewMedFreq] = useState("Once a Day");
  const [newMedMorning, setNewMedMorning] = useState(true);
  const [newMedNoon, setNewMedNoon] = useState(false);
  const [newMedEvening, setNewMedEvening] = useState(false);
  const [newMedNight, setNewMedNight] = useState(false);
  const [newMedMealTiming, setNewMedMealTiming] = useState("After food");
  const [newMedInventory, setNewMedInventory] = useState("30");
  const [newMedWarnings, setNewMedWarnings] = useState("");

  // --- Voice Simulator states ---
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [speechOut, setSpeechOut] = useState<string>("");
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const listEndRef = useRef<HTMLDivElement>(null);

  // --- Auto synchronization to localStorage ---
  useEffect(() => {
    localStorage.setItem('bottab_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('bottab_medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('bottab_adherence', JSON.stringify(adherenceLogs));
  }, [adherenceLogs]);

  useEffect(() => {
    localStorage.setItem('bottab_health', JSON.stringify(healthLog));
  }, [healthLog]);

  useEffect(() => {
    localStorage.setItem('bottab_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('bottab_api', JSON.stringify(apiSettings));
  }, [apiSettings]);

  useEffect(() => {
    if (currentTab === 'chat' && listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, currentTab]);

  // --- Helper Date Strings ---
  const todayStr = new Date().toISOString().split('T')[0];

  // --- Clinical Metrics Calculations ---
  const totalMedsToday = medications.filter(m => m.isActive).flatMap(m => {
    const list: string[] = [];
    if (m.timeMorning) list.push("Morning");
    if (m.timeNoon) list.push("Noon");
    if (m.timeEvening) list.push("Evening");
    if (m.timeNight) list.push("Night");
    return list.map(time => ({ ...m, timeSlot: time }));
  });

  const todayLogs = adherenceLogs.filter(log => log.dateString === todayStr);
  const takenCount = todayLogs.filter(l => l.status === "Taken").length;
  const skippedCount = todayLogs.filter(l => l.status === "Skipped").length;

  // BOTscore calculation: base formula influenced by taken logs and vital health parameters
  let calculatedScore = 75;
  if (totalMedsToday.length > 0) {
    const loggedCount = todayLogs.length;
    if (loggedCount > 0) {
      const takenRatio = takenCount / totalMedsToday.length;
      calculatedScore = Math.min(100, Math.max(30, Math.round(takenRatio * 100)));
    } else {
      calculatedScore = 50; // no logs today
    }
  } else {
    calculatedScore = 90; // perfectly fine if no med schedule defined
  }

  // Adjust score based on healthy parameters
  if (healthLog.heartRateBpm > 95 || healthLog.heartRateBpm < 55) calculatedScore -= 5;
  if (healthLog.bloodGlucose > 140) calculatedScore -= 10;
  if (healthLog.systolicBp > 135) calculatedScore -= 5;
  if (healthLog.stressLevel > 7) calculatedScore -= 5;
  calculatedScore = Math.max(10, Math.min(100, calculatedScore));

  // --- Dynamic Predictive AI Insight Banner Selection ---
  let aiForecastText = "Analyzing biomarkers: Cardio Rhythm & glucose parameters indicate high stability. Keep standard fluid tracker pacing.";
  if (calculatedScore < 50) {
    aiForecastText = "⚠️ CRITICAL DRIFT FORECAST: Extremely low medication adherence. Your heart rate variability and blood pressure levels combined with missed Atorvastatin doses multiply cardiovascular risks in the next 48 hours.";
  } else if (selectedSeason === 'Summer') {
    aiForecastText = "☀️ Summer Heatwaves Risk Active: High baseline hydration depletion rate. Maintain daily hydration tracker at > 2400ml to avoid acute Lisinopril orthostatic hypotension.";
  } else if (selectedSeason === 'Winter') {
    aiForecastText = "❄️ Winter Flu Threat Escalated: Lower ambient immunity window predicted. Consider pediatric pneumococcal checks or senior influenza prophylaxis protocols.";
  } else {
    aiForecastText = "🌧️ Monsoon Environmental Trigger Active: Heightened asthma and bronchial inflammation patterns detected. Check rescue inhaler expiration counters.";
  }

  // --- HIPAA Authentication Handlers ---
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinValue === "1234") {
      setIsAuthenticated(true);
      sessionStorage.setItem('bottab_auth', 'true');
      setPinError("");
    } else {
      setPinError("INCORRECT PIN - UNAUTHORIZED USER DISMISSAL BLOCKED");
      setPinValue("");
    }
  };

  const handleBiometricSimulation = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('bottab_auth', 'true');
    setPinError("");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('bottab_auth');
  };

  const handleAddWater = (amount: number) => {
    setHealthLog(prev => ({
      ...prev,
      waterIntakeMl: prev.waterIntakeMl + amount
    }));
  };

  const handleUpdateSleep = (amount: number) => {
    setHealthLog(prev => ({
      ...prev,
      sleepHours: Math.min(24, Math.max(0, prev.sleepHours + amount))
    }));
  };

  const handleUpdateStress = (level: number) => {
    setHealthLog(prev => ({
      ...prev,
      stressLevel: level
    }));
  };

  // --- Daily Medication Control logs ---
  const handleTakeMedication = (med: Medication, timeSlot: string) => {
    if (med.inventoryRemaining <= 0) {
      alert(`⚠️ Cannot log. ${med.name} inventory is depleted! Re-fill stock now in schedule workspace.`);
      return;
    }

    // Deduct inventory stock
    const updatedMeds = medications.map(m => {
      if (m.id === med.id) {
        return { ...m, inventoryRemaining: Math.max(0, m.inventoryRemaining - 1) };
      }
      return m;
    });
    setMedications(updatedMeds);

    // Create log
    const newLog: AdherenceLog = {
      id: Date.now(),
      medicationId: med.id,
      medicationName: med.name,
      scheduledTime: timeSlot,
      dateString: todayStr,
      status: "Taken",
      timestamp: Date.now()
    };

    setAdherenceLogs(prev => [newLog, ...prev.filter(l => !(l.medicationId === med.id && l.scheduledTime === timeSlot && l.dateString === todayStr))]);
  };

  const handleSkipMedication = (med: Medication, timeSlot: string) => {
    const newLog: AdherenceLog = {
      id: Date.now(),
      medicationId: med.id,
      medicationName: med.name,
      scheduledTime: timeSlot,
      dateString: todayStr,
      status: "Skipped",
      timestamp: Date.now()
    };

    setAdherenceLogs(prev => [newLog, ...prev.filter(l => !(l.medicationId === med.id && l.scheduledTime === timeSlot && l.dateString === todayStr))]);
  };

  const handleResetLog = (medId: number, timeSlot: string) => {
    // If resetting from 'Taken', restore 1 pill to inventory
    const existingLog = adherenceLogs.find(l => l.medicationId === medId && l.scheduledTime === timeSlot && l.dateString === todayStr);
    if (existingLog && existingLog.status === "Taken") {
      setMedications(prev => prev.map(m => {
        if (m.id === medId) {
          return { ...m, inventoryRemaining: m.inventoryRemaining + 1 };
        }
        return m;
      }));
    }

    setAdherenceLogs(prev => prev.filter(l => !(l.medicationId === medId && l.scheduledTime === timeSlot && l.dateString === todayStr)));
  };

  // --- Voice Hands-Free Reminder Simulator ---
  const simulateVoiceCore = async (command: string) => {
    const lower = command.toLowerCase();
    
    // Check if looking for Metformin or "did i take"
    if (lower.includes("metformin") || lower.includes("did i take") || lower.includes("take my")) {
      const takenLog = adherenceLogs.filter(l => l.dateString === todayStr && l.status === "Taken");
      const namesJoined = takenLog.map(l => l.medicationName).join(", ");
      
      if (takenLog.length > 0) {
        setSpeechOut(`Voice Output: "Secure database check complete. Yes John, you have already taken ${namesJoined} today. Your BOTscore is stable at ${calculatedScore}%."`);
      } else {
        setSpeechOut(`Voice Output: "Alert: Clinical adherence logs show zero morning medications taken today. Please administer Metformin to prevent glucose drifts."`);
      }
    } else if (lower.includes("chest pain") || lower.includes("heart attack") || lower.includes("struggling to breathe") || lower.includes("pain in chest")) {
      // Emergency trigger
      setSpeechOut(`Voice Output: "EMERGENCY PROTOCOL DETECTED! John, sit down immediately. Initiating direct cellular dial to your doctor Dr. Robert Smith at ${profile.caregiverPhone}. Alerting Jane Doe."`);
    } else {
      setSpeechOut(`Voice Output: "I received command: '${command}'. Searching secure electronic health record index. All metrics nominal."`);
    }
  };

  const toggleVoiceRecording = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript("Listening for clinical voice command...");
      
      const commands = [
        "Did I take my Metformin today?",
        "I have sudden intense chest pain!",
        "What is my water goal hydration score?",
        "Refill status of Atorvastatin",
      ];
      const selected = commands[Math.floor(Math.random() * commands.length)];
      
      setTimeout(() => {
        setTranscript(selected);
      }, 1500);
    } else {
      setIsListening(false);
      if (transcript && transcript !== "Listening for clinical voice command...") {
        simulateVoiceCore(transcript);
      }
    }
  };

  // --- Add Medication Handler ---
  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim()) return;

    const newMed: Medication = {
      id: Date.now(),
      name: newMedName,
      dosage: newMedDosage,
      frequency: newMedFreq,
      timeMorning: newMedMorning,
      timeNoon: newMedNoon,
      timeEvening: newMedEvening,
      timeNight: newMedNight,
      mealTiming: newMedMealTiming,
      inventoryRemaining: parseInt(newMedInventory) || 30,
      refillThreshold: 7,
      interactionWarnings: newMedWarnings || "None declared. Safe as directed.",
      isActive: true
    };

    setMedications(prev => [...prev, newMed]);
    setShowAddMedDialog(false);
    
    // Reset inputs
    setNewMedName("");
    setNewMedDosage("");
    setNewMedFreq("Once a Day");
    setNewMedMorning(true);
    setNewMedNoon(false);
    setNewMedEvening(false);
    setNewMedNight(false);
    setNewMedMealTiming("After food");
    setNewMedInventory("30");
    setNewMedWarnings("");
  };

  // --- AI Chat Integration via Gemini Serverless REST API ---
  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: "User",
      message: chatInput,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    // Build medical prompt instructions with context of current medication schedule & user health parameters
    const systemPrompt = `You are BOTtab, a military-grade, HIPAA-aligned smart medical workspace AI advisor.
    The patient is ${profile.name} (Age: ${profile.age}, Allergies: ${profile.allergies}, Medical Conditions: ${profile.medicalConditions}).
    Current medication schedule: ${medications.map(m => `${m.name} [${m.dosage}, stock: ${m.inventoryRemaining}/${m.refillThreshold}]`).join(', ')}.
    Today's health metrics: Blood Glucose ${healthLog.bloodGlucose}mg/dL, Heart Rate ${healthLog.heartRateBpm}bpm, Blood Pressure ${healthLog.systolicBp}/${healthLog.diastolicBp}, Water Goal: ${profile.waterGoalMl}ml (taken: ${healthLog.waterIntakeMl}ml).
    
    IMPORTANT RULES:
    1. Provide clinical-grade, accurate, and structured medication advisories but with a warm empathetic tone.
    2. If the user presents emergency crisis language (chest pain, stroke, heart attack, breathing difficulty, severe bleeding, sudden paralysis), immediately output an intense EMERGENCY PROTOCOL instruction calling 911/emergency contacts and provide NO OTHER normal guidelines.
    3. Keep answers compact, clear, and highlight specific drug-food or drug-drug interactions (e.g., grapefruit juice, NSAIDs interaction warnings).`;

    // Direct fetch
    const aiResponse = await fetchGeminiResponse(
      chatInput,
      systemPrompt,
      apiSettings.key
    );

    const aiMsg: ChatMessage = {
      id: Date.now() + 1,
      sender: "AI",
      message: aiResponse,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, aiMsg]);
    setIsChatLoading(false);
  };

  const clearChatHistory = () => {
    if (window.confirm("Clean all safe chat history?")) {
      setChatMessages(DEFAULT_CHAT);
    }
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    setRole(updated.activeRole);
    setShowEditProfileDialog(false);
  };

  // --- RENDER HIPAA PIN DOORWAY SPLASH ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-blueDarkBG flex items-center justify-center p-6 cyber-grid relative overflow-hidden">
        {/* Abstract Cyber grid layout */}
        <div className="absolute inset-0 z-0 bg-radial-gradient from-blueDarkBG to-blueCardBG opacity-90"></div>

        <div className="w-full max-w-md bg-blueCardBG/95 border border-borderSlate rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Pulsing cyber-shield */}
            <div className="w-20 h-20 bg-cyanPrimary/10 border border-cyanPrimary/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.15)] animate-pulse">
              <Fingerprint className="w-12 h-12 text-cyanPrimary" />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">BOTtab PRO</h1>
            <p className="text-xs font-bold tracking-[0.2em] text-cyanNeon bg-cyanNeon/10 px-3 py-1 rounded-md">
              MILITARY-GRADE ENCRYPTION • OFFLINE SECURE
            </p>
            
            <p className="text-xs text-accessibilityGray leading-relaxed mt-1">
              Authorized clinical workstation deployment. Enter secure JWT security PIN code or trigger fast biometric scan.
            </p>

            <form onSubmit={handlePinSubmit} className="w-full mt-6 flex flex-col gap-4">
              <label className="text-xs text-accessibilityGray font-semibold block text-left">
                Enter 4-Digit Security PIN Code (Default: 1234)
              </label>
              
              <input
                type="password"
                maxLength={4}
                value={pinValue}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPinValue(val);
                  if (val.length === 4 && val === "1234") {
                    setIsAuthenticated(true);
                    sessionStorage.setItem('bottab_auth', 'true');
                    setPinError("");
                  } else if (val.length === 4) {
                    setPinError("INCORRECT PIN - SECURITY DISMISSAL LOCKED");
                    setPinValue("");
                  }
                }}
                className="w-full bg-blueDarkBG text-cyanPrimary tracking-[1.5em] text-center border border-borderSlate focus:border-cyanPrimary outline-none py-4 rounded-xl text-3xl font-bold transition-all placeholder:tracking-normal placeholder:text-lg"
                placeholder="••••"
                required
              />

              {pinError && (
                <div className="bg-accentRed/10 border border-accentRed/30 text-accentRed rounded-xl p-3 text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4.5 bg-cyanPrimary hover:bg-cyanNeon text-blueDarkBG font-extrabold rounded-xl transition-all shadow-[0_4px_16px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Unlock Confidential Record
              </button>
            </form>

            <div className="w-full flex items-center justify-center gap-3 border-t border-borderSlate/50 pt-5 mt-3">
              <button
                onClick={handleBiometricSimulation}
                className="flex items-center gap-2 text-xs font-bold text-blueElectric hover:text-white transition-all bg-blueElectric/15 px-4 py-2.5 rounded-xl border border-blueElectric/20"
              >
                <Fingerprint className="w-4 h-4" />
                Simulation Biometric Bypass
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 mt-2">
              <input
                type="checkbox"
                id="faceId"
                checked={isBiometricEnabled}
                onChange={(e) => setIsBiometricEnabled(e.target.checked)}
                className="accent-cyanPrimary"
              />
              <label htmlFor="faceId" className="text-xs text-accessibilityGray selection:bg-transparent">
                Enable Touch ID / Face ID quick unlock
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN CONFIDENTIAL WORKSPACE UI ---
  return (
    <div className="min-h-screen bg-blueDarkBG text-white flex flex-col cyber-grid text-scale-transition" style={{ fontSize: `${textScale * 100}%` }}>
      
      {/* 1. SECURE WORKSPACE HEADER */}
      <header className="bg-blueCardBG border-b border-borderSlate px-4 py-3 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Avatar and User Name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div 
                className="w-10 h-10 bg-cyanPrimary/10 border border-cyanPrimary/30 rounded-full flex items-center justify-center text-cyanPrimary font-bold cursor-pointer hover:bg-cyanPrimary/20 transition-all"
                onClick={() => setShowEditProfileDialog(true)}
              >
                {profile.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-accentGreen w-3.5 h-3.5 rounded-full border-2 border-blueCardBG flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-blueDarkBG rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white hover:underline cursor-pointer" onClick={() => setShowEditProfileDialog(true)}>{profile.name}</span>
                <span className="text-[10px] uppercase font-extrabold text-cyanPrimary bg-cyanPrimary/10 px-1.5 py-0.5 rounded-sm">
                  Age {profile.age}
                </span>
              </div>
              <p className="text-[10px] text-accessibilityGray flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accentGreen shrink-0"></span>
                EHR Record Secure • Active
              </p>
            </div>
          </div>

          {/* Core Title (Center helper on wide screens) */}
          <div className="hidden md:flex items-center gap-2 bg-blueDarkBG border border-borderSlate py-1.5 px-4 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-cyanPrimary animate-pulse"></span>
            <span className="text-xs font-extrabold tracking-widest text-cyanPrimary uppercase">BOTtab HEALTH INTELLIGENCE ENGINE</span>
          </div>

          {/* Action buttons controls */}
          <div className="flex items-center gap-2">
            
            {/* Season Badge selector */}
            <button 
              onClick={() => {
                const nextSeason = selectedSeason === 'Summer' ? 'Winter' : selectedSeason === 'Winter' ? 'Monsoon' : 'Summer';
                setSelectedSeason(nextSeason);
              }}
              className="flex items-center gap-1.5 bg-blueDarkBG hover:bg-blueDarkBG/75 border border-borderSlate px-2.5 py-1.5 rounded-xl transition-all"
            >
              {selectedSeason === 'Summer' ? (
                <>
                  <CloudSun className="w-3.5 h-3.5 text-accentOrange animate-spin-slow" />
                  <span className="text-[10px] font-bold text-accentOrange hidden sm:inline">Summer Heat</span>
                </>
              ) : selectedSeason === 'Winter' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-cyanPrimary" />
                  <span className="text-[10px] font-bold text-cyanPrimary hidden sm:inline">Winter Flu</span>
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5 text-blueElectric" />
                  <span className="text-[10px] font-bold text-blueElectric hidden sm:inline">Monsoon Risk</span>
                </>
              )}
            </button>

            {/* Scale control switcher */}
            <div className="flex bg-blueDarkBG border border-borderSlate rounded-xl overflow-hidden p-0.5">
              <button 
                onClick={() => setTextScale(0.85)} 
                title="Compact text representation"
                className={`text-[10px] px-2 py-1 font-bold rounded-lg transition-all ${textScale < 0.9 ? 'bg-cyanPrimary text-blueDarkBG' : 'text-accessibilityGray'}`}
              >
                A-
              </button>
              <button 
                onClick={() => setTextScale(1.0)} 
                title="Standard text representation"
                className={`text-[10px] px-2 py-1 font-bold rounded-lg transition-all ${textScale === 1.0 ? 'bg-cyanPrimary text-blueDarkBG' : 'text-accessibilityGray'}`}
              >
                A
              </button>
              <button 
                onClick={() => setTextScale(1.15)} 
                title="Seniors high accessibility text representation"
                className={`text-[10px] px-2 py-1 font-bold rounded-lg transition-all ${textScale > 1.1 ? 'bg-cyanPrimary text-blueDarkBG' : 'text-accessibilityGray'}`}
              >
                A+
              </button>
            </div>

            {/* Quick settings gear */}
            <button 
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className="p-2 bg-blueDarkBG hover:bg-borderSlate text-accessibilityGray hover:text-cyanPrimary rounded-xl border border-borderSlate transition-all"
              title="Interactive API keys dashboard"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Security Logout lock */}
            <button 
              onClick={handleLogout}
              className="p-2 bg-accentRed/10 border border-accentRed/20 text-accentRed hover:bg-accentRed hover:text-white rounded-xl transition-all"
              title="Lock Patient Health Files"
            >
              <Lock className="w-4 h-4" />
            </button>

          </div>
        </div>
      </header>

      {/* --- RECONCILED ROLE TOGGLE ROW --- */}
      <div className="bg-blueDarkBG border-b border-borderSlate px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-cyanPrimary" />
            <span className="text-[11px] font-bold text-accessibilityGray">Clinician Role Environment:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Patient", "Caregiver", "Wellness Coach", "Pharmacist Support"].map((roleOpt) => (
              <button
                key={roleOpt}
                onClick={() => {
                  setRole(roleOpt);
                  setProfile(prev => ({ ...prev, activeRole: roleOpt }));
                }}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                  role === roleOpt 
                    ? 'bg-cyanPrimary border-cyanPrimary text-blueDarkBG shadow-[0_0_12px_rgba(0,240,255,0.2)]' 
                    : 'bg-blueCardBG border-borderSlate text-accessibilityGray hover:bg-borderSlate hover:text-white'
                }`}
              >
                {roleOpt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CONFIDENTIAL WORKSPACE BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 overflow-hidden flex flex-col gap-6">
        
        {/* Role Custom guidelines banner active */}
        <div className="bg-blueElectric/10 border border-blueElectric/20 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2 bg-blueElectric/20 text-cyanPrimary rounded-lg shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white mb-0.5">{role} Mode Activated</h4>
            <p className="text-xs text-accessibilityGray leading-normal">
              {role === 'Patient' && "Ecosystem focuses on personal medication tracking, vital trends correlation, and AI interaction safety checks."}
              {role === 'Caregiver' && "Accessing secondary monitoring stream of John Doe Senior. Read-only records with remote drug log sync simulation active."}
              {role === 'Wellness Coach' ? "Enhanced focus: Tracking water targets, daily walking step gaps, sleep score consistency." : ""}
              {role === 'Pharmacist Support' ? "Dispensing check active. Double check contraindicated warnings and stock replenishment alerts." : ""}
            </p>
          </div>
        </div>

        {/* --- DYNAMIC TAB NAVIGATION BAR --- */}
        <div className="flex border-b border-borderSlate">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              currentTab === 'dashboard' ? 'border-cyanPrimary text-cyanPrimary bg-cyanPrimary/5' : 'border-transparent text-accessibilityGray hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            Biomarker Dashboard
          </button>
          
          <button
            onClick={() => setCurrentTab('meds')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              currentTab === 'meds' ? 'border-cyanPrimary text-cyanPrimary bg-cyanPrimary/5' : 'border-transparent text-accessibilityGray hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Medication Schedule ({medications.filter(m => m.isActive).length})
          </button>
          
          <button
            onClick={() => setCurrentTab('chat')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 relative ${
              currentTab === 'chat' ? 'border-cyanPrimary text-cyanPrimary bg-cyanPrimary/5' : 'border-transparent text-accessibilityGray hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            Clinical AI Chat
            {isChatLoading && (
              <span className="absolute top-2.5 right-6 w-2 h-2 rounded-full bg-cyanPrimary animate-ping"></span>
            )}
          </button>
        </div>

        {/* --- VIEW TAB ROOT DISPATCHER --- */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* A. DASHBOARD VIEW TAB */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 overflow-y-auto pr-1 flex-1">
              
              {/* BOTscore Gauges and Doses status side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* BOTscore Radial Card */}
                <div className="bg-blueCardBG border border-borderSlate rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-3 right-3 bg-cyanNeon/10 border border-cyanNeon/20 px-2 py-0.5 rounded-md text-[10px] font-bold text-cyanNeon">
                    SECURE MONITOR
                  </div>
                  
                  <span className="text-xs font-bold text-accessibilityGray tracking-wider uppercase mb-4">BOTscore™ Adherence Index</span>
                  
                  {/* Gauge Arc representation */}
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* background circle */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        className="stroke-borderSlate" 
                        strokeWidth="8" 
                        fill="transparent"
                      />
                      {/* real score progress arc */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        className={`transition-all duration-1000 ${
                          calculatedScore < 60 ? 'stroke-accentRed' : calculatedScore < 80 ? 'stroke-accentOrange' : 'stroke-accentGreen'
                        }`}
                        strokeWidth="8" 
                        fill="transparent"
                        strokeDasharray={263.8}
                        strokeDashoffset={263.8 - (263.8 * calculatedScore) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold text-white">{calculatedScore}%</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${
                        calculatedScore < 60 ? 'text-accentRed' : calculatedScore < 80 ? 'text-accentOrange' : 'text-accentGreen'
                      }`}>
                        {calculatedScore < 60 ? 'Critical Drift' : calculatedScore < 80 ? 'Fair Quality' : 'Stable Medical'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Adherence detailed logging list */}
                <div className="bg-blueCardBG border border-borderSlate rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-accessibilityGray tracking-widest uppercase mb-4">Log Status Administration</h3>
                    <p className="text-xs text-accessibilityGray leading-normal mb-4">
                      Log summaries of scheduled medications for today, helping feed precise forecasting metrics.
                    </p>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold border-b border-borderSlate/35 pb-2">
                        <span className="text-white">Scheduled administrations:</span>
                        <span className="text-cyanNeon">{totalMedsToday.length} doses</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold border-b border-borderSlate/35 pb-2">
                        <span className="text-accentGreen">Taken & Recorded:</span>
                        <span>{takenCount} recorded</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold border-b border-borderSlate/35 pb-2">
                        <span className="text-accentOrange">Deliberately Skipped:</span>
                        <span>{skippedCount} documented</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-bold mb-2 text-accessibilityGray">
                      <span>Daily dose progression:</span>
                      <span>{Math.round(((takenCount + skippedCount) / (totalMedsToday.length || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-borderSlate h-3.5 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="bg-accentGreen h-full rounded-full transition-all duration-500"
                        style={{ width: `${((takenCount + skippedCount) / (totalMedsToday.length || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Dynamic Foresight alert banner */}
              <div className="bg-blueDarkBG border border-borderSlate rounded-2xl p-4.5 flex items-start gap-3 shadow-inner">
                <Brain className="w-5 h-5 text-cyanPrimary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-cyanPrimary tracking-widest uppercase mb-1">BOTscore™ AI Preventive Forecast</h4>
                  <p className="text-xs text-white leading-relaxed">{aiForecastText}</p>
                </div>
              </div>

              {/* Biomarkers Matrix Grid */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyanPrimary" />
                  EHR Realtime Biomarker Parameters
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* HR */}
                  <div className="bg-blueCardBG border border-borderSlate p-4 rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center justify-between text-accessibilityGray">
                      <span className="text-xs">Cardio Heart Rate</span>
                      <Heart className="w-4.5 h-4.5 text-accentRed" />
                    </div>
                    <span className="text-2xl font-black text-white">{healthLog.heartRateBpm} <span className="text-xs font-medium">BPM</span></span>
                    <span className="text-[10px] font-bold text-accentGreen">Healthy Sinus Rhythm</span>
                  </div>

                  {/* Glucose */}
                  <div className="bg-blueCardBG border border-borderSlate p-4 rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center justify-between text-accessibilityGray">
                      <span className="text-xs">Blood Sugar</span>
                      <Award className="w-4.5 h-4.5 text-accentOrange" />
                    </div>
                    <span className="text-2xl font-black text-white">{healthLog.bloodGlucose} <span className="text-xs font-medium">mg/dL</span></span>
                    <span className={`text-[10px] font-bold ${healthLog.bloodGlucose > 120 ? 'text-accentOrange' : 'text-accentGreen'}`}>
                      {healthLog.bloodGlucose > 120 ? 'Elevated Hyperglycemic' : 'Fasting Target Safe'}
                    </span>
                  </div>

                  {/* BP */}
                  <div className="bg-blueCardBG border border-borderSlate p-4 rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center justify-between text-accessibilityGray">
                      <span className="text-xs">Hypertension BP</span>
                      <Flame className="w-4.5 h-4.5 text-blueElectric" />
                    </div>
                    <span className="text-2xl font-black text-white">{healthLog.systolicBp}/{healthLog.diastolicBp} <span className="text-xs font-medium">mmHg</span></span>
                    <span className="text-[10px] font-bold text-accentGreen">Pre-hypertension Standard</span>
                  </div>

                  {/* Water */}
                  <div className="bg-blueCardBG border border-borderSlate p-4 rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center justify-between text-accessibilityGray">
                      <span className="text-xs">Fluids Logged</span>
                      <Droplets className="w-4.5 h-4.5 text-cyanPrimary" />
                    </div>
                    <span className="text-2xl font-black text-white">{healthLog.waterIntakeMl} <span className="text-xs font-medium">ml</span></span>
                    <span className={`text-[10px] font-bold ${healthLog.waterIntakeMl >= profile.waterGoalMl ? 'text-accentGreen' : 'text-accentOrange'}`}>
                      {healthLog.waterIntakeMl >= profile.waterGoalMl ? 'Hydration Target Met' : `${profile.waterGoalMl - healthLog.waterIntakeMl}ml deficit remaining`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fluids increment log sliders */}
              <div className="bg-blueCardBG border border-borderSlate rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold tracking-widest text-white uppercase">Interactive Fluids Intake logging</h4>
                  <span className="text-[10px] bg-cyanPrimary/10 border border-cyanPrimary/25 text-cyanPrimary px-2.5 py-0.5 rounded-md font-bold uppercase">
                    Daily Goal: {profile.waterGoalMl} ml
                  </span>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleAddWater(250)}
                    className="flex-1 py-3 border border-borderSlate hover:border-cyanPrimary bg-blueDarkBG/60 hover:bg-cyanPrimary/5 text-xs text-cyanPrimary hover:text-white font-extrabold rounded-xl transition-all"
                  >
                    +250 ml (One Cup)
                  </button>
                  <button 
                    onClick={() => handleAddWater(500)}
                    className="flex-1 py-3 border border-borderSlate hover:border-cyanPrimary bg-blueDarkBG/60 hover:bg-cyanPrimary/5 text-xs text-cyanPrimary hover:text-white font-extrabold rounded-xl transition-all"
                  >
                    +500 ml (Large Bottle)
                  </button>
                </div>
              </div>

              {/* Stress and sleep controls */}
              <div className="bg-blueCardBG border border-borderSlate rounded-2xl p-5">
                <h4 className="text-xs font-bold tracking-widest text-white uppercase mb-4">Functional Health Trackers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Sleep tracking counter */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-accessibilityGray">Sleep Hours logged today:</span>
                      <span className="font-bold text-white">{healthLog.sleepHours} hrs</span>
                    </div>
                    <div className="flex items-center gap-3 bg-blueDarkBG border border-borderSlate p-2 rounded-xl">
                      <button 
                        onClick={() => handleUpdateSleep(-0.5)}
                        className="w-10 h-10 border border-borderSlate bg-blueCardBG hover:bg-borderSlate text-white font-black rounded-lg transition-all"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-extrabold text-sm">{healthLog.sleepHours} hours</span>
                      <button 
                        onClick={() => handleUpdateSleep(0.5)}
                        className="w-10 h-10 border border-borderSlate bg-blueCardBG hover:bg-borderSlate text-white font-black rounded-lg transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Stress slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-accessibilityGray">Calculated Stress level:</span>
                      <span className="font-bold text-white">{healthLog.stressLevel} / 10</span>
                    </div>
                    <div className="bg-blueDarkBG border border-borderSlate p-3 rounded-xl flex items-center gap-4">
                      <input 
                        type="range"
                        min="1"
                        max="10"
                        value={healthLog.stressLevel}
                        onChange={(e) => handleUpdateStress(parseInt(e.target.value))}
                        className="flex-1 accent-cyanPrimary bg-borderSlate h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="w-8 text-center text-xs font-extrabold text-cyanPrimary bg-cyanPrimary/10 border border-cyanPrimary/20 px-1.5 py-0.5 rounded-md">
                        Lvl {healthLog.stressLevel}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Age-smart dynamically adapting warnings */}
              {profile.age >= 65 ? (
                <div className="bg-accentRed/10 border border-accentRed/20 p-4.5 rounded-2xl space-y-2">
                  <h4 className="text-xs font-black text-accentRed tracking-wider uppercase flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    Senior Safety Geriatric Protocol ACTIVE
                  </h4>
                  <ul className="list-disc pl-5 text-xs text-white space-y-1">
                    <li><strong>Polypharmacy check verified:</strong> You are administering {medications.filter(m => m.isActive).length} scheduled medicines. Be careful of combination reactions.</li>
                    <li><strong>High Fall Hazards:</strong> Combined usage of Beta-blockers and your Atorvastatin doses may induce lightheaded state. Stand slowly.</li>
                    <li>Seniors dynamic layout text enhancements enabled (Minimum touch target sizes enforced at &gt;48px).</li>
                  </ul>
                </div>
              ) : profile.age <= 12 ? (
                <div className="bg-blueElectric/10 border border-blueElectric/25 p-4.5 rounded-2xl space-y-2">
                  <h4 className="text-xs font-black text-blueElectric tracking-wider uppercase flex items-center gap-2">
                    <Info className="w-5 h-5 shrink-0" />
                    Pediatric Vaccine Growth Tracker ENGAGED
                  </h4>
                  <ul className="list-disc pl-5 text-xs text-white space-y-1">
                    <li><strong>Growth records:</strong> Weight status standard for age category. Height percentile logged healthy.</li>
                    <li><strong>Vaccine schedules:</strong> Next pediatric booster active in June 2026. Keep files locked.</li>
                  </ul>
                </div>
              ) : null}

            </div>
          )}

          {/* B. MEDICATION TAB */}
          {currentTab === 'meds' && (
            <div className="space-y-6 overflow-y-auto pr-1 flex-1">
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-accessibilityGray">Confidential Reminders</h3>
                  <p className="text-xs text-accessibilityGray">Maintain clinical precision by logging daily doses correctly.</p>
                </div>
                
                <button
                  onClick={() => setShowAddMedDialog(true)}
                  className="px-4 py-2.5 bg-cyanPrimary hover:bg-cyanNeon text-blueDarkBG font-extrabold rounded-xl transition-all hover:scale-[1.02] flex items-center gap-2 shadow-[0_4px_12px_rgba(0,240,255,0.15)]"
                >
                  <Plus className="w-4 h-4 text-blueDarkBG stroke-[3]" />
                  Add Medication
                </button>
              </div>

              {medications.length === 0 ? (
                <div className="bg-blueCardBG border border-borderSlate rounded-3xl p-12 text-center text-accessibilityGray text-sm">
                  No active medical schedule declared yet inside your EHR profile. Tap "Add Medication" above.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medications.map((med) => {
                    const times = [];
                    if (med.timeMorning) times.push("Morning");
                    if (med.timeNoon) times.push("Noon");
                    if (med.timeEvening) times.push("Evening");
                    if (med.timeNight) times.push("Night");

                    return (
                      <div 
                        key={med.id}
                        className={`bg-blueCardBG border border-borderSlate rounded-3xl p-5 space-y-4 hover:border-gray-500 transition-all ${!med.isActive ? 'opacity-45' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-extrabold text-white">{med.name}</h4>
                              <span className="text-[10px] bg-blueElectric/20 text-cyanNeon px-2 py-0.5 rounded font-black uppercase">
                                {med.frequency}
                              </span>
                            </div>
                            <span className="text-xs text-accessibilityGray font-bold block mt-1">Dosage: {med.dosage} ({med.mealTiming})</span>
                          </div>

                          {/* Inventory Pill Stock tracker badge */}
                          <div className={`text-right px-3 py-1.5 rounded-xl border ${
                            med.inventoryRemaining <= med.refillThreshold ? 'bg-accentRed/10 border-accentRed/30 text-accentRed' : 'bg-blueDarkBG/75 border-borderSlate text-accessibilityGray'
                          }`}>
                            <span className="text-[9px] uppercase block font-bold">Pills Left</span>
                            <span className="text-sm font-black">{med.inventoryRemaining}</span>
                            {med.inventoryRemaining <= med.refillThreshold && (
                              <span className="text-[8px] font-black block mt-0.5 text-accentRed">REFILL NEEDED</span>
                            )}
                          </div>
                        </div>

                        {/* Interactive Warning banner */}
                        <div className="bg-blueDarkBG/50 border border-borderSlate/35 p-3 rounded-2xl">
                          <p className="text-[11px] text-accessibilityGray leading-normal">
                            ⚠️ <strong>Clinical Notes:</strong> {med.interactionWarnings}
                          </p>
                        </div>

                        {/* Scheduled times checkboxes & administration log button triggers */}
                        <div className="space-y-3 pt-2">
                          <span className="text-[10px] tracking-wider uppercase font-extrabold text-accessibilityGray block">Scheduled Administrations Today:</span>
                          
                          <div className="flex flex-col gap-2">
                            {times.map((slot) => {
                              const loggedObj = adherenceLogs.find(l => l.medicationId === med.id && l.scheduledTime === slot && l.dateString === todayStr);
                              const status = loggedObj?.status || "Pending";

                              return (
                                <div 
                                  key={slot}
                                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                                    status === "Taken" ? 'bg-accentGreen/5 border-accentGreen/25 text-accentGreen' : status === "Skipped" ? 'bg-accentOrange/5 border-accentOrange/25 text-accentOrange' : 'bg-blueDarkBG/30 border-borderSlate/45 text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black uppercase tracking-wider">{slot}</span>
                                    <span className="text-[9px] text-accessibilityGray">Log State: {status}</span>
                                  </div>

                                  <div className="flex gap-2">
                                    {status !== "Taken" && (
                                      <button
                                        onClick={() => handleTakeMedication(med, slot)}
                                        className="p-1.5 bg-accentGreen/15 hover:bg-accentGreen text-accentGreen hover:text-blueDarkBG rounded-lg border border-accentGreen/20 transition-all"
                                        title="Log dose taken"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                    )}
                                    {status !== "Skipped" && (
                                      <button
                                        onClick={() => handleSkipMedication(med, slot)}
                                        className="p-1.5 bg-accentOrange/15 hover:bg-accentOrange text-accentOrange hover:text-blueDarkBG rounded-lg border border-accentOrange/20 transition-all"
                                        title="Log dose skipped"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                    {status !== "Pending" && (
                                      <button
                                        onClick={() => handleResetLog(med.id, slot)}
                                        className="p-1.5 bg-borderSlate hover:bg-white text-white hover:text-blueDarkBG rounded-lg transition-all"
                                        title="Undo log"
                                      >
                                        <Undo className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Toggle active / delete med layout options */}
                        <div className="flex justify-between items-center border-t border-borderSlate/40 pt-4 mt-2">
                          <button
                            onClick={() => {
                              setMedications(prev => prev.map(m => m.id === med.id ? { ...m, isActive: !m.isActive } : m));
                            }}
                            className="text-xs font-bold text-blueElectric hover:underline"
                          >
                            {med.isActive ? "Deactivate Reminder" : "Re-activate Reminder"}
                          </button>
                          
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${med.name} permanently?`)) {
                                setMedications(prev => prev.filter(m => m.id !== med.id));
                                setAdherenceLogs(prev => prev.filter(l => l.medicationId !== med.id));
                              }
                            }}
                            className="p-1.5 text-accessibilityGray hover:text-accentRed transition-all"
                            title="Delete Schedule permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* C. CLINICAL AI CHAT TAB */}
          {currentTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Hands-Free Voice reminder card */}
              <div className="bg-blueCardBG border border-borderSlate rounded-2xl p-4.5 mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleVoiceRecording}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                      isListening ? 'bg-accentRed animate-pulse' : 'bg-blueDarkBG text-cyanPrimary hover:bg-borderSlate'
                    }`}
                  >
                    <Fingerprint className="w-6 h-6" />
                  </button>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-widest uppercase">Clinical Hands-free Voice simulator</h4>
                    <p className="text-[11px] text-accessibilityGray leading-normal mt-0.5">
                      {isListening ? "Listening for command - Click voice icon again to stop and process." : "Simulate hands-free voice search. Tap finger icon to start listening."}
                    </p>
                    {transcript && (
                      <p className="text-xs text-cyanPrimary font-bold mt-1">Transcribed: "{transcript}"</p>
                    )}
                  </div>
                </div>

                {speechOut && (
                  <div className="bg-blueElectric/10 border border-blueElectric/20 p-2.5 rounded-xl text-[10px] text-white max-w-sm hidden md:block">
                    {speechOut}
                  </div>
                )}
              </div>

              {/* Chat Message Lists */}
              <div className="flex-1 overflow-y-auto bg-blueCardBG border border-borderSlate rounded-3xl p-5 space-y-4 min-h-[300px]">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3.5 space-y-1.5 ${
                      msg.sender === 'User' 
                        ? 'bg-cyanPrimary text-blueDarkBG rounded-br-none font-bold' 
                        : msg.sender === 'System' 
                        ? 'bg-blueDarkBG/60 border border-accentOrange/35 text-accentOrange rounded-bl-none text-xs'
                        : 'bg-blueDarkBG border border-borderSlate text-white rounded-bl-none'
                    }`}>
                      <div className="flex items-center justify-between gap-6 text-[10px] font-black uppercase opacity-65">
                        <span>{msg.sender === 'User' ? profile.name : 'BOTtab Secure AI'}</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-blueDarkBG border border-borderSlate rounded-2xl rounded-bl-none px-4 py-3.5 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-cyanPrimary animate-spin" />
                      <span className="text-xs text-accessibilityGray font-bold">Synthesizing clinical interactions...</span>
                    </div>
                  </div>
                )}
                
                <div ref={listEndRef}></div>
              </div>

              {/* Suggested helper pill prompts */}
              <div className="flex gap-2 py-3 overflow-x-auto selection:bg-transparent">
                {[
                  "Is Metformin safe with grapefruit juice?",
                  "Review warning interactions on Lisinopril",
                  "Explain BOTscore metrics calculations",
                  "I am suffering intense chest pain"
                ].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => {
                      setChatInput(sug);
                    }}
                    className="shrink-0 bg-blueCardBG border border-borderSlate hover:border-cyanPrimary hover:text-cyanPrimary transition-all text-[11px] px-3.5 py-1.5 rounded-xl font-bold"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Conversational text input bar */}
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask BOTtab AI (e.g. Can I take Lisinopril at night?)"
                  className="flex-1 bg-blueCardBG border border-borderSlate focus:border-cyanPrimary outline-none px-4.5 py-3.5 rounded-2xl text-xs font-bold transition-all text-white placeholder-accessibilityGray"
                />
                
                <button
                  onClick={handleSendChat}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-6 bg-cyanPrimary hover:bg-cyanNeon disabled:opacity-45 text-blueDarkBG font-extrabold rounded-2xl transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4 text-blueDarkBG stroke-[3]" />
                  Send
                </button>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* 3. DIALOGS AND CONFIGDRAWERS */}
      
      {/* A. ADD MEDICATION DIALOG COMPONENT */}
      {showAddMedDialog && (
        <div className="fixed inset-0 bg-blueDarkBG/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto">
          <div className="bg-blueCardBG border border-borderSlate w-full max-w-xl rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowAddMedDialog(false)}
              className="absolute top-4 right-4 text-accessibilityGray hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-black text-white">Add Medication Schedule</h3>

            <form onSubmit={handleAddMedication} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-accessibilityGray block mb-1">Medication Name</label>
                  <input 
                    type="text" 
                    required 
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g. Metformin"
                    className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-accessibilityGray block mb-1">Dosage Format</label>
                  <input 
                    type="text" 
                    required 
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="e.g. 500mg, 1 Capsule"
                    className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-accessibilityGray block mb-1">Dose Administration Frequency</label>
                <select 
                  value={newMedFreq} 
                  onChange={(e) => setNewMedFreq(e.target.value)}
                  className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                >
                  <option>Once a Day</option>
                  <option>Twice a Day</option>
                  <option>Three Times a Day</option>
                  <option>As Requested / PRN</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-accessibilityGray block">Dose Timings Today</label>
                <div className="grid grid-cols-4 gap-2 bg-blueDarkBG p-3 rounded-xl border border-borderSlate">
                  <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <span className="text-[10px] text-accessibilityGray">Morning</span>
                    <input type="checkbox" checked={newMedMorning} onChange={(e) => setNewMedMorning(e.target.checked)} className="accent-cyanPrimary" />
                  </label>
                  <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <span className="text-[10px] text-accessibilityGray">Noon</span>
                    <input type="checkbox" checked={newMedNoon} onChange={(e) => setNewMedNoon(e.target.checked)} className="accent-cyanPrimary" />
                  </label>
                  <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <span className="text-[10px] text-accessibilityGray">Evening</span>
                    <input type="checkbox" checked={newMedEvening} onChange={(e) => setNewMedEvening(e.target.checked)} className="accent-cyanPrimary" />
                  </label>
                  <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <span className="text-[10px] text-accessibilityGray">Night</span>
                    <input type="checkbox" checked={newMedNight} onChange={(e) => setNewMedNight(e.target.checked)} className="accent-cyanPrimary" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-accessibilityGray block mb-1">Meal Timing Association</label>
                  <select 
                    value={newMedMealTiming} 
                    onChange={(e) => setNewMedMealTiming(e.target.value)}
                    className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                  >
                    <option>Before food</option>
                    <option>After food</option>
                    <option>With food</option>
                    <option>None</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-accessibilityGray block mb-1">Pill Stocks quantity</label>
                  <input 
                    type="number" 
                    value={newMedInventory}
                    onChange={(e) => setNewMedInventory(e.target.value)}
                    placeholder="30"
                    className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-accessibilityGray block mb-1">Clinical Warnings / Food interactions</label>
                <textarea 
                  value={newMedWarnings}
                  onChange={(e) => setNewMedWarnings(e.target.value)}
                  placeholder="e.g. Do not combine with dairy products. Can cause drowsiness."
                  className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-borderSlate/45">
                <button
                  type="button"
                  onClick={() => setShowAddMedDialog(false)}
                  className="flex-1 py-3 border border-borderSlate hover:bg-borderSlate text-xs text-white font-extrabold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-cyanPrimary hover:bg-cyanNeon text-blueDarkBG text-xs font-extrabold rounded-xl transition-all shadow-[0_4px_12px_rgba(0,240,255,0.15)]"
                >
                  Add Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. EDIT PROFILE PROFILE DIALOG */}
      {showEditProfileDialog && (
        <div className="fixed inset-0 bg-blueDarkBG/75 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto">
          <div className="bg-blueCardBG border border-borderSlate w-full max-w-xl rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowEditProfileDialog(false)}
              className="absolute top-4 right-4 text-accessibilityGray hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-black text-white">Edit Confidential Profile & Goals</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-accessibilityGray block mb-1">Patient Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-accessibilityGray block mb-1">Patient Age</label>
                  <input 
                    type="number" 
                    value={profile.age}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-accessibilityGray block mb-1">Active Allergies List</label>
                <input 
                  type="text" 
                  value={profile.allergies}
                  onChange={(e) => setProfile(prev => ({ ...prev, allergies: e.target.value }))}
                  className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-accessibilityGray block mb-1">Known Medical Conditions</label>
                <input 
                  type="text" 
                  value={profile.medicalConditions}
                  onChange={(e) => setProfile(prev => ({ ...prev, medicalConditions: e.target.value }))}
                  className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-accessibilityGray block mb-1">Hydration Target (ml)</label>
                  <input 
                    type="number" 
                    value={profile.waterGoalMl}
                    onChange={(e) => setProfile(prev => ({ ...prev, waterGoalMl: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-accessibilityGray block mb-1">Sleep Target (hours)</label>
                  <input 
                    type="number" 
                    value={profile.sleepGoalHours}
                    onChange={(e) => setProfile(prev => ({ ...prev, sleepGoalHours: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-borderSlate/35 pt-4">
                <div>
                  <label className="text-xs font-bold text-accessibilityGray block mb-1">Emergency Contact Person</label>
                  <input 
                    type="text" 
                    value={profile.emergencyContactName}
                    onChange={(e) => setProfile(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                    className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-accessibilityGray block mb-1">Emergency Contact Phone</label>
                  <input 
                    type="text" 
                    value={profile.emergencyContactPhone}
                    onChange={(e) => setProfile(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                    className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowEditProfileDialog(false)}
                className="w-full py-3.5 bg-cyanPrimary hover:bg-cyanNeon text-blueDarkBG font-extrabold text-xs rounded-xl transition-all shadow-[0_4px_12px_rgba(0,240,255,0.15)] mt-4"
              >
                Save Secure profile Information
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. API AND SECURITY DEV DRAWER SETTINGS */}
      {showSettingsDrawer && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-blueCardBG border-l border-borderSlate p-6 md:p-8 z-[100] shadow-2xl flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-borderSlate/45 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyanPrimary" />
                API Key & Sec Workstation
              </h3>
              <button 
                onClick={() => setShowSettingsDrawer(false)}
                className="text-accessibilityGray hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-blueDarkBG border border-borderSlate rounded-xl">
                <h5 className="text-[11px] font-bold text-cyanPrimary uppercase mb-1">HIPAA Dev Station Disclaimer</h5>
                <p className="text-[10px] text-accessibilityGray leading-normal">
                  You can paste your Google AI Studio Gemini API Key directly below to persist your intelligent medicine counselor locally in your browser. All requests are made client-side solely.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-accessibilityGray block mb-1">Google Generative AI Studio API Key</label>
                <input 
                  type="password"
                  value={apiSettings.key}
                  onChange={(e) => setApiSettings({ key: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white tracking-widest placeholder:tracking-normal"
                />
              </div>

              <div className="border-t border-borderSlate/35 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase">Workstation Diagnostics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-accessibilityGray">Persisted Reminders:</span>
                    <span className="font-bold">{medications.length} registered</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-accessibilityGray">Log records total:</span>
                    <span className="font-bold">{adherenceLogs.length} saved</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-accessibilityGray">Target region zone:</span>
                    <span className="font-bold">EHR Secured LocalDB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm("Restore factory seed defaults? This clears custom logs and settings.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full py-3.5 bg-accentRed/10 hover:bg-accentRed border border-accentRed/35 hover:text-white text-xs font-bold rounded-xl transition-all text-accentRed"
          >
            Reset Station defaults & Database
          </button>
        </div>
      )}

    </div>
  );
}
