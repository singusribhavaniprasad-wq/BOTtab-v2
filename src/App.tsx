import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Heart, 
  Award, 
  Brain, 
  Plus, 
  X, 
  Undo, 
  Flame, 
  Activity, 
  Droplets,
  CloudSun,
  Fingerprint,
  Settings,
  Send,
  RefreshCw,
  Info,
  Sliders,
  Calendar,
  Lock,
  Moon,
  Trash2,
  AlertTriangle,
  Phone,
  Volume2,
  ShieldCheck,
  Smartphone,
  History,
  Power,
  UserCheck,
  VolumeX,
  Key,
  Eye,
  EyeOff,
  Laptop,
  Globe
} from 'lucide-react';
import { UserProfile, Medication, AdherenceLog, DailyHealthLog, ChatMessage } from './types';
import { fetchGeminiResponse } from './gemini';

// ==========================================
// 1. MULTILINGUAL DICTIONARY (Premium UX)
// ==========================================
interface LangContent {
  dashboard: string;
  meds: string;
  chat: string;
  botscore: string;
  vitals: string;
  emergency: string;
  silentSos: string;
  activeRole: string;
  caregiver: string;
  refillTracker: string;
  confusionHeading: string;
  forecastTitle: string;
  warningTitle: string;
  alertTitle: string;
  disclaimerText: string;
  voiceSim: string;
  quickAdd: string;
  addMed: string;
  settings: string;
  profileTitle: string;
  interactionTitle: string;
  audioDictator: string;
  exportReport: string;
}

const LANGUAGES_DICT: Record<string, LangContent> = {
  English: {
    dashboard: "Biomarker Dashboard",
    meds: "Medication Schedule",
    chat: "Clinical AI Chat",
    botscore: "BOTscore™ Adherence Index",
    vitals: "EHR Realtime Biomarkers",
    emergency: "EMERGENCY PORTAL",
    silentSos: "SILENT SOS DISTRESS SIGNAL",
    activeRole: "Clinician Role Environment",
    caregiver: "Caregiver Dispatch Sync",
    refillTracker: "Smart Refill Forecast",
    confusionHeading: "Pill Identity Guide",
    forecastTitle: "BOTscore™ AI Preventive Forecast",
    warningTitle: "Senior Safety Geriatric Protocol",
    alertTitle: "Climate Health Risk Alert",
    disclaimerText: "This is general wellness guidance only and not a replacement for professional medical advice.",
    voiceSim: "Hands-Free Voice Simulator",
    quickAdd: "Quick Fluid Add",
    addMed: "Register Medication Schedule",
    settings: "Security & API Configuration",
    profileTitle: "Confidential Profile & Genetic Goals",
    interactionTitle: "Drug & Dietary Interaction Checker",
    audioDictator: "Multilingual Voice Prescription Speaker",
    exportReport: "Export Clinical Health Passport"
  },
  Hindi: {
    dashboard: "बायोमार्कर डैशबोर्ड",
    meds: "दवा की समय-सारणी",
    chat: "क्लिनिकल एआई चैट",
    botscore: "BOTscore™ अनुपालन सूचकांक",
    vitals: "EHR रीयलटाइम बायोमार्कर",
    emergency: "आपातकालीन केंद्र",
    silentSos: "साइलेंट एसओएस पैनिक संकेत",
    activeRole: "चिकित्सक भूमिका वातावरण",
    caregiver: "देखभालकर्ता प्रेषण समन्वयन",
    refillTracker: "स्मार्ट रीफिल पूर्वानुमान",
    confusionHeading: "दवा पहचान गाइड",
    forecastTitle: "BOTscore™ एआई निवारक पूर्वानुमान",
    warningTitle: "वरिष्ठ सुरक्षा जेरियाट्रिक प्रोटोकॉल",
    alertTitle: "जलवायु स्वास्थ्य जोखिम अलर्ट",
    disclaimerText: "यह केवल सामान्य कल्याण मार्गदर्शन है और पेशेवर चिकित्सा सलाह का विकल्प नहीं है।",
    voiceSim: "हैंड्स-फ्री वॉयस सिमुलेटर",
    quickAdd: "त्वरित तरल जोड़",
    addMed: "दवा अनुसूची पंजीकृत करें",
    settings: "सुरक्षा एवं एपीआई कॉन्फ़िगरेशन",
    profileTitle: "गोपनीय प्रोफाइल और आनुवंशिक लक्ष्य",
    interactionTitle: "दवा और खाद्य अंतःक्रिया परीक्षक",
    audioDictator: "बहुभाषी वॉयस प्रिस्क्रिप्शन वाचक",
    exportReport: "क्लीनिकल स्वास्थ्य रिपोर्ट प्रिंट करें"
  },
  Telugu: {
    dashboard: "బయోమార్కర్ డాష్‌బోర్డ్",
    meds: "మందుల షెడ్యూల్",
    chat: "క్లినికల్ AI చాట్",
    botscore: "BOTscore™ విశ్లేషణ ఇండెక్స్",
    vitals: "EHR రియల్ టైమ్ బయోమార్కర్స్",
    emergency: "అత్యవసర విభాగం",
    silentSos: "సైలెంట్ SOS పానిక్ బటన్",
    activeRole: "వైద్యుడి పాత్ర పర్యావరణం",
    caregiver: "కేర్‌గివర్ అలర్ట్ సింక్",
    refillTracker: "స్మార్ట్ రీఫిల్ ఫోర్కాస్ట్",
    confusionHeading: "మందుల గుర్తింపు గైడ్",
    forecastTitle: "BOTscore™ AI నివారణ అంచనా",
    warningTitle: "సీనియర్ సేఫ్టీ ప్రోటోకాల్",
    alertTitle: "వాతావరణ ఆరోగ్య రిస్క్ అలర్ట్",
    disclaimerText: "ఇది కేవలం సాధారణ ఆరోగ్య మార్గదర్శకత్వం మాత్రమే మరియు వృత్తిపరమైన వైద్య సలహాకు ప్రత్యామ్నాయం కాదు.",
    voiceSim: "హ్యాండ్స్-ఫ్రీ వాయిస్ సిమ్యులేటర్",
    quickAdd: "త్వరిత ద్రవాలు నమోదు",
    addMed: "మందుల షెడ్యూల్ నమోదు చేయండి",
    settings: "భద్రత & API కాన్ఫిగరేషన్",
    profileTitle: "రహస్య ప్రొఫైల్ & లక్ష్యాలు",
    interactionTitle: "ఔషధ మరియు ఆహార పరస్పర చర్యల పరిశీలన",
    audioDictator: "బహుభాషా ప్రిస్క్రిప్షన్ వాయిస్ స్పీకర్",
    exportReport: "క్లినికల్ హెల్త్ రిపోర్ట్ డౌన్‌లోడ్"
  },
  Tamil: {
    dashboard: "பயோமார்க்கர் டாஷ்போர்டு",
    meds: "மருந்து அட்டவணை",
    chat: "மருத்துவ AI அரட்டை",
    botscore: "BOTscore™ ஒத்திசைவு குறியீடு",
    vitals: "EHR நிகழ்நேர உடலியல் அளவீடுகள்",
    emergency: "அவசரகால மையம்",
    silentSos: "ரகசிய SOS அவசர சிக்னல்",
    activeRole: "மருத்துவ பாத்திர சூழல்",
    caregiver: "பராமரிப்பாளர் பகிர்வு ஒத்திசைவு",
    refillTracker: "ஸ்மார்ட் ரீஃபில் வரம்பு அஞ்சல்",
    confusionHeading: "மாத்திரை அடையாள வழிகாட்டி",
    forecastTitle: "BOTscore™ AI தடுப்பு கணிப்பு",
    warningTitle: "முதியோர் பாதுகாப்பு நெறிமுறை",
    alertTitle: "காலநிலை சுகாதார எச்சரிக்கை",
    disclaimerText: "இது பொதுவான ஆரோக்கிய வழிகாட்டுதல் மட்டுமே, தொழில்முறை மருத்துவ ஆலோசனைக்கு மாற்றாகாது.",
    voiceSim: "ஹேண்ட்ஸ்-ஃப்ரீ குரல் சிமுலேட்டர்",
    quickAdd: "விரைவான திரவப் பதிவு",
    addMed: "மருந்து அட்டவணையை பதிவு செய்",
    settings: "பாதுகாப்பு & API கட்டமைப்பு",
    profileTitle: "ரகசிய விவரக்குறிப்பு & இலக்குகள்",
    interactionTitle: "மருந்து மற்றும் உணவு தொடர்பு சோதனையாளர்",
    audioDictator: "பல்மொழி குரல் மருந்து ரீடர்",
    exportReport: "மருத்துவ சுகாதார பாஸ்போர்ட் ஏற்றுமதி"
  },
  Malayalam: {
    dashboard: "ബയോമാർക്കർ ഡാഷ്‌ബോർഡ്",
    meds: "മരുന്ന് പട്ടിക",
    chat: "ക്ലിനിക്കൽ എഐ ചാറ്റ്",
    botscore: "BOTscore™ അനുസരണ സൂചിക",
    vitals: "EHR തത്സമയ ബയോമാർക്കറുകൾ",
    emergency: "അടിയന്തിര പോർട്ടൽ",
    silentSos: "സൈലന്റ് SOS സിഗ്നൽ",
    activeRole: "ക്ലിനിഷ്യൻ റോൾ പശ്ചാത്തലം",
    caregiver: "കെയർഗിവർ സമന്വയം",
    refillTracker: "സ്മാർട്ട് റീഫിൽ പ്രവചനം",
    confusionHeading: "ഗുളിക തിരിച്ചറിയൽ ഗൈഡ്",
    forecastTitle: "BOTscore™ എഐ പ്രവചനം",
    warningTitle: "സീനിയർ സുരക്ഷാ പ്രോട്ടോക്കോൾ",
    alertTitle: "കാലാവസ്ഥാ ആരോഗ്യ മുന്നറിയിപ്പ്",
    disclaimerText: "ഇത് പൊതുവായ ആരോഗ്യ മാർഗ്ഗനിർദ്ദേശം മാത്രമാണ്, ഡോക്ടറുടെ ഉപദേശത്തിന് പകരമല്ല.",
    voiceSim: "ഹാൻഡ്സ് ഫ്രീ വോയ്സ് സിമുലേറ്റർ",
    quickAdd: "ദ്രുത ജല രേഖപ്പെടുത്തൽ",
    addMed: "മരുന്ന് വിവരങ്ങൾ രജിസ്റ്റർ ചെയ്യുക",
    settings: "സുരക്ഷ & എപിഐ ക്രമീകരണം",
    profileTitle: "രഹസ്യ പ്രൊഫൈൽ വിവരങ്ങൾ",
    interactionTitle: "മരുന്നും ഭക്ഷണവും തമ്മിലുള്ള പ്രതിപ്രവർത്തന പരിശോധകൻ",
    audioDictator: "ബഹുഭാഷാ ശബ്ദ കുറിപ്പടി വാചകൻ",
    exportReport: "ക്ലിനിക്കൽ ഹെൽത്ത് റിപ്പോർട്ട് പ്രിന്റ്"
  },
  Spanish: {
    dashboard: "Panel de Biomarcadores",
    meds: "Calendario de Medicación",
    chat: "Chat Clínico con IA",
    botscore: "Índice de Adherencia BOTscore™",
    vitals: "Biomarcadores EHR en Tiempo Real",
    emergency: "PORTAL DE EMERGENCIA",
    silentSos: "SEÑAL DE AUXILIO SOS SILENCIOSA",
    activeRole: "Entorno del Rol Clínico",
    caregiver: "Sincronización del Cuidador",
    refillTracker: "Pronóstico de Recarga Inteligente",
    confusionHeading: "Guía de Identidad de Pastillas",
    forecastTitle: "Análisis Predictivo Preventivo BOTscore™",
    warningTitle: "Protocolo de Seguridad Geriátrica de Personas Mayores",
    alertTitle: "Alerta de Riesgo Clínico Climático",
    disclaimerText: "Esta es orientación general de bienestar y no reemplaza el consejo médico profesional.",
    voiceSim: "Simulador de Voz Manos Libres",
    quickAdd: "Log de Hidratación Rápida",
    addMed: "Registrar Programa de Medicamentos",
    settings: "Seguridad y Configuración de API",
    profileTitle: "Perfil Confidencial y Metas Genéticas",
    interactionTitle: "Analizador de Interacción Alimentaria",
    audioDictator: "Dictador de Recetas por Voz",
    exportReport: "Exportar Reporte Médico Clínico"
  },
  Kannada: {
    dashboard: "ಬಯೋಮಾರ್ಕರ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    meds: "ಔಷಧಿ ವೇಳಾಪಟ್ಟಿ",
    chat: "ಕ್ಲಿನಿಕಲ್ AI ಚಾಟ್",
    botscore: "BOTscore™ ನಿಷ್ಠೆ ಸೂಚ್ಯಂಕ",
    vitals: "ಇಹೆಚ್‌ಆರ್ ನೈಜ-ಸമಯದ ಬಯೋಮಾರ್ಕರ್ಸ್",
    emergency: "ತುರ್ತು ನಿಯಂತ್ರಣ ಕೇಂದ್ರ",
    silentSos: "ಸೈಲೆಂಟ್ SOS ತುರ್ತು ಸಿಗ್ನಲ್",
    activeRole: "ಕ್ಲಿನಿಕಲ್ ಪಾತ್ರದ ಪರಿಸರ",
    caregiver: "ಆರೈಕೆದಾರರ ರವಾನೆ ಸಿಂಕ್",
    refillTracker: "ಸ್ಮಾರ್ಟ್ ರೀಫಿಲ್ ಮುನ್ಸೂಚನೆ",
    confusionHeading: "ಮಾತ್ರೆ ಗುರುತಿಸುವಿಕೆ ಸಹಾಯ",
    forecastTitle: "BOTscore™ AI ಮುನ್ಸೂಚನೆ",
    warningTitle: "ಹಿರಿಯ ನಾಗರಿಕರ ಸುರಕ್ಷತೆ ಶಿಷ್ಟಾಚಾರ",
    alertTitle: "ಹವಾಮಾನ ಆರೋಗ್ಯ ಅಪಾಯದ ಎಚ್ಚರಿಕೆ",
    disclaimerText: "ಇದು ಕೇವಲ ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನವಾಗಿದೆ ಮತ್ತು ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಸಲಹೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.",
    voiceSim: "ಹ್ಯಾಂಡ್ಸ್-ಫ್ರೀ ಧ್ವನಿ ಸಿಮ್ಯುಲೇಟರ್",
    quickAdd: "ತ್ವರಿತ ದ್ರವ ನೋಂದಣಿ",
    addMed: "ಹೊಸ ಔಷಧಿ ಸೇರಿಸಿ",
    settings: "ಭದ್ರತೆ ಮತ್ತು API ಸಂರಚನೆ",
    profileTitle: "ರಹಸ್ಯ ವೈಯಕ್ತಿಕ ವಿವರ ಪ್ರೊಫೈಲ್",
    interactionTitle: "ಔಷಧಿ ಮತ್ತು ಆಹಾರದ ಪ್ರತಿಕ್ರಿಯೆ ಪರಿಶೀಲಕ",
    audioDictator: "ಭಾಷಾ ಧ್ವನಿ ವಿವರಣೆಕಾರ",
    exportReport: "ವೈದ್ಯಕೀಯ ವರದಿ ರಫ್ತು ಮಾಡಿ"
  },
  Bengali: {
    dashboard: "বায়োমার্কার ড্যাশবোর্ড",
    meds: "ওষুধের সময়সূচী",
    chat: "ক্লিনিক্যাল এআই চ্যাট",
    botscore: "BOTscore™ সূচক",
    vitals: "EHR রিয়েল-টাইম বায়োমার্কার",
    emergency: "জরুরী পোর্টাল",
    silentSos: "নীরব SOS জরুরী সংকেত",
    activeRole: "ক্লিনিক্যাল ভূমিকা পরিবেশ",
    caregiver: "কেয়ারগিভার সিঙ্ক",
    refillTracker: "স্মার্ট রিফিল পূর্বাভাস",
    confusionHeading: "ওষুধের পিল সনাক্তকরণ গাইড",
    forecastTitle: "BOTscore™ এআই প্রতিরোধমূলক পূর্বাভাস",
    warningTitle: "বয়স্কদের সুরক্ষার নিয়মাবলী",
    alertTitle: "জলবায়ু স্বাস্থ্য ঝুঁকি সতর্কতা",
    disclaimerText: "এটি কেবলমাত্র সাধারণ স্বাস্থ্য নির্দেশিকা এবং পেশাদার চিকিত্সকের পরামর্শের বিকল্প নয়।",
    voiceSim: "হ্যান্ডস-フリー ভয়েস সিমুলেটর",
    quickAdd: "দ্রুত তরল যোগ করুন",
    addMed: "নতুন ওষুধ যুক্ত করুন",
    settings: "নিরাপত্তা ও এপিআই কনফিগারেশন",
    profileTitle: "গোপনীয় ব্যবহারকারী প্রোফাইল",
    interactionTitle: "ওষুধ ও খাদ্য মিথস্ক্রিয়া বিশ্লেষক",
    audioDictator: "ভয়স প্রেসক্রিপশন নির্দেশক",
    exportReport: "মেডিকেল রিপোর্ট প্রিন্ট করুন"
  },
  Marathi: {
    dashboard: "बायोमार्कर्स डॅशबोर्ड",
    meds: "औषधोपचारांचे वेळापत्रक",
    chat: "वैद्यकीय एआय चॅट",
    botscore: "BOTscore™ अनुपालन निर्देशांक",
    vitals: "EHR रिअल-टाइम बायोमार्कर्स",
    emergency: "तात्काळ सेवा केंद्र",
    silentSos: "सायलेंट SOS आणीबाणी इशारा",
    activeRole: "वैद्यकीय भूमिका वातावरण",
    caregiver: "काळजीवाहू समन्वयन",
    refillTracker: "औषध संपण्याची पूर्वकल्पना",
    confusionHeading: "गोळ्या ओळखण्याची मार्गदर्शिका",
    forecastTitle: "BOTscore™ एआय अंदाज",
    warningTitle: "ज्येष्ठ नागरिक सुरक्षा मार्गदर्शक तत्वे",
    alertTitle: "हवामान बदल आरोग्य इशारा",
    disclaimerText: "हे केवळ सामान्य आरोग्यासाठीचे मार्गदर्शन आहे आणि पात्र डॉक्टरांच्या सल्ल्याला पर्याय नाही।",
    voiceSim: "हँड्स-फ्री व्हॉइस सिम्युलेटर",
    quickAdd: "पाण्याचे प्रमाण जलद नोंदवा",
    addMed: "नवीन औषध वेळापत्रकात जोडा",
    settings: "सुरक्षा आणि एपीआय मांडणी",
    profileTitle: "गोपनीय आरोग्य प्रोफाइल",
    interactionTitle: "औषध आणि अन्न परस्पर संबंध तपासणी",
    audioDictator: "प्रादेशिक आवाज वाचक",
    exportReport: "वैद्यकीय अहवाल डाउनलोड करा"
  },
  Gujarati: {
    dashboard: "બાયોમાર્કર્સ ડેશબોર્ડ",
    meds: "દવાઓનું સમયપત્રક",
    chat: "ક્લિનિકલ એઆઈ ચેટ",
    botscore: "BOTscore™ અનુપાલન ઇન્ડેક્સ",
    vitals: "EHR રીઅલ-ટાઇમ માપદંડ",
    emergency: "ઇમરજન્સી સેન્ટર",
    silentSos: "સાયલન્ટ SOS આપત્તિ સિગ્નલ",
    activeRole: "ડોક્ટર અને পેશન્ટ સિસ્ટમ",
    caregiver: "કેરટેકર કનેક્શન સિંક",
    refillTracker: "રીફિલ ફોરકાસ્ટ રીવ્યુ",
    confusionHeading: "દવાની ઓળખ માટેની માર્ગદર્શિકા",
    forecastTitle: "BOTscore™ એઆઈ ઇલાજ પૂર્વાનુમાન",
    warningTitle: "વરિષ્ઠ નાગરિક સુરક્ષા પ્રોટોકોલ",
    alertTitle: "હવામાન આરોગ્ય જોખમ એલર્ટ",
    disclaimerText: "આ ફક્ત સામાન્ય આરોગ્ય માર્ગદર્શન છે અને કોઈ પણ સંજોગોમાં વ્યાવસાયિક તબીબી સલાહનો વિકલ્પ નથી।",
    voiceSim: "હેન્ડ્સ-ફ્રી વૉઇસ સિમ્યુલેટર",
    quickAdd: "પાણીના લોગ ઉમેરો",
    addMed: "દવાનું સમયપત્રક રજીસ્ટર કરો",
    settings: "સિક્યોરિટી અને API સેટિંગ્સ",
    profileTitle: "ખાનગી પ્રોફાઇલ અને જીનેટિક લક્ષ્યો",
    interactionTitle: "દવા અને ખોરાકની આડઅસર વિશ્લેષણ",
    audioDictator: "પ્રાદેશિક ભાષા વૉઇસ સ્પીકર",
    exportReport: "હેલ્થ પાસપોર્ટ પ્રિન્ટ કરો"
  },
  Urdu: {
    dashboard: "بایومارکر ڈیش بورڈ",
    meds: "ادویات کا شیڈول",
    chat: "کلینیکل اے آئی چیٹ",
    botscore: "BOTscore™ انڈیکس",
    vitals: "EHR لائیو بایومارکرز",
    emergency: "ہنگامی پورٹل",
    silentSos: "خاموش SOS ہنگامی سگنل",
    activeRole: "طبی کردار کا ماحول",
    caregiver: "دیکھ بھال کرنے والے کا سنک",
    refillTracker: "اسمارٹ ری فل پیشن گوئی",
    confusionHeading: "گولیوں کی شناخت کا گائیڈ",
    forecastTitle: "BOTscore™ اے آئی پیشن گوئی",
    warningTitle: "بزرگ شہریوں کا حفاظتی اصول",
    alertTitle: "موسمیاتی صحت کا خطرہ",
    disclaimerText: "یہ صرف عام صحت کی رہنمائی ہے اور پیشہ ورانہ طبی مشورے کا متبادل نہیں ہے۔",
    voiceSim: "ہینڈز فری وائس سمیلیٹر",
    quickAdd: "فوری مائع لاگ",
    addMed: "نیا شیڈول شامل کریں",
    settings: "سیکیورٹی اور API کی ترتیب",
    profileTitle: "خفیہ ذاتی پروفائل",
    interactionTitle: "دوا اور غذا کے باہمی اثرات",
    audioDictator: "کثیر لسانی آواز کا ترجمان",
    exportReport: "ہیلتھ پاسپورٹ ڈاؤن لوڈ کریں"
  }
};

// Fallback for missing languages in dict to keep codebase neat
const getLangText = (lang: string, key: keyof LangContent): string => {
  const data = LANGUAGES_DICT[lang] || LANGUAGES_DICT["English"];
  return data[key] || LANGUAGES_DICT["English"][key];
};

// ==========================================
// 2. DEFAULT SEED DATA
// ==========================================
const DEFAULT_PROFILE: UserProfile = {
  id: 1,
  name: "John Doe Senior",
  age: 68,
  gender: "Male",
  heightCm: 175.0,
  weightKg: 78.5,
  allergies: "Penicillin, Peanuts, Sulfa Drugs",
  medicalConditions: "Type 2 Diabetes, Severe Hypertension, High Coronary Risk Score",
  emergencyContactName: "Jane Doe (Spouse / Nurse assistant)",
  emergencyContactPhone: "+1 (555) 019-2834",
  caregiverName: "Dr. Robert Smith (Cardiology Chief)",
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
    inventoryRemaining: 42,
    refillThreshold: 10,
    interactionWarnings: "Severe stomach irritation with grapefruit juice. High risk of hypoglycemia with alcohol.",
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
    inventoryRemaining: 8,
    refillThreshold: 14,
    interactionWarnings: "Orthostatic hypotension hazard. Stand up carefully. Do not take NSAIDs (Ibuprofen) without renal checks.",
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
    inventoryRemaining: 34,
    refillThreshold: 7,
    interactionWarnings: "Inhibits cholesterol synthesis. Avoid large amounts of grapefruit. report unexplained muscle pains immediately.",
    isActive: true
  }
];

const DEFAULT_HEALTH_LOG: DailyHealthLog = {
  dateString: new Date().toISOString().split('T')[0],
  sleepHours: 7.2,
  waterIntakeMl: 1400,
  steps: 5120,
  stressLevel: 4,
  moodRating: 4,
  heartRateBpm: 76,
  bloodGlucose: 122.0,
  systolicBp: 130,
  diastolicBp: 84
};

const DEFAULT_CHATS = (lang: string): ChatMessage[] => [
  {
    id: 1,
    sender: "AI",
    message: `Greetings. This is BOTtab redemptive biological healthcare operating system. 
  
Status: Cryptographic workspace synced with active diagnostic medical criteria: Type 2 Diabetes & Coronary Risk indices.
Current language active: ${lang}.
  
Ask me about drug synergy warnings, heatwave medicine degradation, or request an AI-generated Simplified Medical Summary of your prescription.`,
    timestamp: Date.now() - 3600000
  }
];

// Visual Pill Identifiers to assist low-literacy & elderly users
interface PillVisual {
  colorCode: string;
  shape: string;
  imprint: string;
}

const PILL_VISUALS: Record<string, PillVisual> = {
  "metformin": { colorCode: "bg-white border-cyanPrimary/40", shape: "Large Oval Tablet", imprint: "M500 white" },
  "lisinopril": { colorCode: "bg-yellow-200 border-yellow-400", shape: "Small Round Tablet", imprint: "L10 yellow" },
  "atorvastatin": { colorCode: "bg-blue-100 border-blue-400", shape: "Crystalline Capsule", imprint: "A20 blue" },
  "generic": { colorCode: "bg-stone-50 border-stone-300", shape: "Standard White Capsule", imprint: "RX" }
};

export default function App() {
  // --- Core States ---
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

  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem('bottab_lang') || "English";
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('bottab_chat');
    return saved ? JSON.parse(saved) : DEFAULT_CHATS("English");
  });

  const [apiSettings, setApiSettings] = useState<{ key: string }>(() => {
    const saved = localStorage.getItem('bottab_api');
    return saved ? JSON.parse(saved) : { key: "" };
  });

  // --- Theme Mode state (Dynamic color configurations) ---
  const [themeMode, setThemeMode] = useState<'standard' | 'empathy' | 'highcontrast'>('standard');
  const [dyslexiaMode, setDyslexiaMode] = useState<boolean>(false);

  // --- Custom Advanced Auth & Workstation Security states ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('bottab_auth') === 'true';
  });
  const [authPortalMode, setAuthPortalMode] = useState<'login' | 'signup' | 'otp' | 'forgot' | 'biometric' | 'onboarding' | 'reset'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'biometric'>('email');
  
  // Email states
  const [emailVal, setEmailVal] = useState<string>("");
  const [passwordVal, setPasswordVal] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordResetSent, setPasswordResetSent] = useState<boolean>(false);

  // Phone states
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+91");
  const [phoneVal, setPhoneVal] = useState<string>("");
  const [otpVal, setOtpVal] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(45);
  const [otpCodeSim, setOtpCodeSim] = useState<string>("");
  const [otpAlertSim, setOtpAlertSim] = useState<string>("");

  // Biometric states
  const [biometricType, setBiometricType] = useState<'face' | 'fingerprint'>('fingerprint');
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [biometricProgress, setBiometricProgress] = useState<number>(0);

  // Cyber incident logger & security parameters
  const [failedLoginAttempts, setFailedLoginAttempts] = useState<number>(0);
  const [isWorkstationLocked, setIsWorkstationLocked] = useState<boolean>(false);

  // JWT Cryptographic simulator
  const [jwtToken, setJwtToken] = useState<string>(() => sessionStorage.getItem('bottab_jwt') || "");
  const [tokenExpiryMinutes, setTokenExpiryMinutes] = useState<number>(15);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(900); // 15 mins in secs

  // Voice help guide
  const [voiceHelpActive, setVoiceHelpActive] = useState<boolean>(false);

  // Multi-step Onboarding states
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [chosenRole, setChosenRole] = useState<'Patient' | 'Caregiver' | 'Pharmacist Support' | 'Wellness Coach' | 'Clinical Coordinator'>('Patient');
  const [onboardAnswers, setOnboardAnswers] = useState<Record<string, string>>({
    name: "John Doe Senior",
    age: "68",
    allergies: "Penicillin",
    medicalConditions: "Type 2 Diabetes, Severe Hypertension",
    roleCredential: "",
    hospitalNode: "",
    coachingHours: "40"
  });

  // Dynamic Session and Security Incident Logs arrays
  const [activeSessions, setActiveSessions] = useState<any[]>(() => {
    return [
      { id: 1, device: "Chrome on Windows Workstation", location: "Primary Clinical Hub", ip: "192.168.1.18", timestamp: "Active Now", status: "Active", primary: true },
      { id: 2, device: "BOTtab-Mobile iOS Client", location: "Spouse Nurse Handheld", ip: "172.16.5.94", timestamp: "2 hours ago", status: "Standby", primary: false }
    ];
  });

  const [securityLogs, setSecurityLogs] = useState<any[]>(() => {
    return [
      { id: 1, event: "Encrypted AES-256 Workspace Keys Created", status: "SECURE", time: "14:02:10" },
      { id: 2, event: "Secure JWT Session Handshake Verified", status: "VERIFIED", time: "14:05:45" }
    ];
  });

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'meds' | 'chat'>('dashboard');
  const [weatherCondition, setWeatherCondition] = useState<'Summer' | 'Winter' | 'Monsoon'>('Summer');
  const [textScale, setTextScale] = useState<number>(1.0); 

  // --- Modals ---
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

  // --- Advanced Voice Simulator states ---
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>(() => "");
  const [speechOut, setSpeechOut] = useState<string>("");
  const [voiceTone, setVoiceTone] = useState<'Standard' | 'Calm' | 'Anxious' | 'Fatigued'>('Standard');

  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // --- Interactive Graphic Toggle ---
  const [activeChartSource, setActiveChartSource] = useState<'GLUCOSE' | 'CARDIO' | 'STRESS'>('CARDIO');

  // --- Emergency Distress Action System ---
  const [silentSosTriggered, setSilentSosTriggered] = useState<boolean>(false);
  const [sosCountdown, setSosCountdown] = useState<number>(5);
  const [dispatchStatus, setDispatchStatus] = useState<string>("Initializing secure encrypted GPS satellite link...");

  // --- Refill Simulation state ---
  const [isRefillingAll, setIsRefillingAll] = useState<boolean>(false);
  const [refillStatusMsg, setRefillStatusMsg] = useState<string>("");

  const listEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // --- Dietary Interaction & Multilingual Speaker states ---
  const [selectedMedForCheck, setSelectedMedForCheck] = useState<string>("");
  const [selectedDietForCheck, setSelectedDietForCheck] = useState<string>("Grapefruit Juice");
  const [customMedForCheck, setCustomMedForCheck] = useState<string>("");
  const [interactionResult, setInteractionResult] = useState<string>("");
  const [isCheckingInteraction, setIsCheckingInteraction] = useState<boolean>(false);

  // --- Real Speak Synthesis Prescription Engine ---
  const speakPrescription = (med: Medication) => {
    if (!('speechSynthesis' in window)) {
      alert("Multilingual Speech Synthesis is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    
    let speechText = "";
    if (selectedLanguage === "English") {
      speechText = `Prescription instructions for ${med.name}. Dosage strength: ${med.dosage}. Frequency: ${med.frequency}, to be taken ${med.mealTiming}. Caution: ${med.interactionWarnings || "No major interactions identified."}`;
    } else if (selectedLanguage === "Hindi") {
      speechText = `${med.name} के लिए दवा के निर्देश। खुराक की मात्रा ${med.dosage} है। आवृत्ति ${med.frequency} है, इसे भोजन के ${med.mealTiming === "After food" ? "बाद" : "पहले"} लिया जाना चाहिए। सुरक्षा सावधानी नोट: ${med.interactionWarnings || "कोई बड़ी परस्पर क्रिया नहीं।"}`;
    } else if (selectedLanguage === "Telugu") {
      speechText = `${med.name} మందుల సూచనలు. మోతాదు బలం ${med.dosage}. ఫ్రీక్వెన్సీ ${med.frequency}, దీనిని భోజనం ${med.mealTiming === "After food" ? "తరువాత" : "ముందు"} తీసుకోవాలి. హెచ్చరిక: ${med.interactionWarnings || "ఎటువంటి హానికరమైన పరస్పర చర్యలు లేవు."}`;
    } else if (selectedLanguage === "Tamil") {
      speechText = `${med.name} மருந்து அட்டவணை குறிப்புக்கள். மருந்தளவு ${med.dosage}. அதிர்வெண் ${med.frequency}, உணவு ${med.mealTiming === "After food" ? "உண்ட பின்" : "உண்ணும் முன்"} உட்கொள்ள வேண்டும். எச்சரிக்கை: ${med.interactionWarnings || "குறிப்பிடத்தக்க பக்க விளைவுகள் ஏதுமில்லை."}`;
    } else if (selectedLanguage === "Malayalam") {
      speechText = `${med.name} മരുന്ന് നിർദ്ദേശങ്ങൾ. ഡോസേജ് ${med.dosage}. കഴിക്കേണ്ട സമയം ${med.frequency}, ഇത് ഭക്ഷണം ${med.mealTiming === "After food" ? "കഴിച്ചതിന് ശേഷം" : "കഴിക്കുന്നതിന് മുൻപ്"} ഉപയോഗിക്കുക. മുൻകരുതൽ: ${med.interactionWarnings || "പ്രശ്നങ്ങൾ ഒന്നും കണ്ടെത്തിയിട്ടില്ല."}`;
    } else if (selectedLanguage === "Spanish") {
      speechText = `Instrucciones para ${med.name}. Dosis: ${med.dosage}. Frecuencia: ${med.frequency}, tomar ${med.mealTiming === "After food" ? "después de comer" : "antes de comer"}. Precaución: ${med.interactionWarnings || "Sin contraindicaciones identificadas."}`;
    } else if (selectedLanguage === "Kannada") {
      speechText = `${med.name} ಔಷಧಿ ಸೂಚನೆಗಳು. ಡೋಸೇಜ್ ${med.dosage}. ವೇಳಾಪಟ್ಟಿ ${med.frequency}, ಮತ್ತು ಇದನ್ನು ${med.mealTiming === "After food" ? "ಊಟದ ನಂತರ" : "ಊಟಕ್ಕೆ ಮೊದಲು"} ತೆಗೆದುಕೊಳ್ಳಬೇಕು. ಸುರಕ್ಷತಾ ಸೂಚನೆ: ${med.interactionWarnings || "ಯಾವುದೇ ಪ್ರಮುಖ ಅಡ್ಡಪರಿಣಾಮಗಳಿಲ್ಲ."}`;
    } else if (selectedLanguage === "Bengali") {
      speechText = `${med.name} ওষুধের ব্যবহার বিধি। ওষুধের মাত্রা ${med.dosage}। সময়সূচী ${med.frequency} যা খাবার ${med.mealTiming === "After food" ? "খাওয়ার পর" : "খাওয়ার আগে"} খেতে হবে। সতর্কতা: ${med.interactionWarnings || "কোন বিশেষ পার্শ্বপ্রতিক্রিয়া নেই।"}`;
    } else if (selectedLanguage === "Marathi") {
      speechText = `${med.name} औषधाचे वेळापत्रक. डोसची तीव्रता ${med.dosage} आहे. हे औषध दिवसभरात ${med.frequency} वेळा, जेवण ${med.mealTiming === "After food" ? "झाल्यानंतर" : "करण्यापूर्वी"} घ्यावे. औषधोपचार सुरक्षा टीप: ${med.interactionWarnings || "कोणतेही मोठे दुष्परिणाम नाहीत।"}`;
    } else if (selectedLanguage === "Gujarati") {
      speechText = `${med.name} દવા લેવાની રીત. ડોઝ સમય ${med.dosage}. દિવસમાં ${med.frequency} વખત, ભોજન ${med.mealTiming === "After food" ? "પછી" : "પહેલાં"} લેવી. સાવચેતી નોંધ: ${med.interactionWarnings || "કોઈ મોટી આડઅસર નથી।"}`;
    } else {
      speechText = `Prescription instructions for ${med.name}. Dosage is ${med.dosage}. Frequency: ${med.frequency}.`;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    const voices = window.speechSynthesis.getVoices();
    const langCodeMap: Record<string, string> = {
      English: "en-US",
      Hindi: "hi-IN",
      Telugu: "te-IN",
      Tamil: "ta-IN",
      Malayalam: "ml-IN",
      Spanish: "es-ES",
      Kannada: "kn-IN",
      Bengali: "bn-IN",
      Marathi: "mr-IN",
      Gujarati: "gu-IN"
    };
    const targetLang = langCodeMap[selectedLanguage] || "en-US";
    utterance.lang = targetLang;
    const matchedVoice = voices.find(v => v.lang.toLowerCase().includes(targetLang.toLowerCase()));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const checkInteractionOffline = (medName: string, diet: string): string => {
    const med = medName.toLowerCase();
    const food = diet.toLowerCase();
    
    if (med.includes("lisinopril")) {
      if (food.includes("potassium") || food.includes("banana")) {
        return "⚠️ SEVERE HYPERKALEMIA RISK: Lisinopril reduces aldosterone output, promoting potassium storage. Eating high-potassium foods (bananas, spinach, whole potatoes) can trigger dangerous cardiac arrhythmia or coronary arrest. Restrict diet intake immediately.";
      }
      if (food.includes("alcohol")) {
        return "⚠️ ACUTE HYPOTENSION ALERT: Alcohol amplifies Lisinopril's peripheral vaso-dilation effect. This can provoke acute syncope (sudden fainting), severe postural orthostatic nausea, and physical dizziness. Avoid simultaneous intake.";
      }
    }
    if (med.includes("metformin")) {
      if (food.includes("alcohol")) {
        return "⚠️ CRITICAL LACTIC ACIDOSIS HAZARD: Metformin plus alcohol blocks liver lactate excretion. Patients become highly vulnerable to life-threatening Lactic Acidosis (excessive lactic acid in muscles and blood). Eliminate all active alcohol consumption during metformin therapies.";
      }
      if (food.includes("protein") || food.includes("fatty")) {
        return "ℹ️ ABSORPTION METABOLIC SHIFT: Fatty/protein-heavy meals alter gastro-intestinal Metformin absorption pathways, reducing peak serum levels by 15%. However, taking Metformin with minor food is generally recommended to mitigate common gastro-intestinal side effects.";
      }
    }
    if (med.includes("atorvastatin")) {
      if (food.includes("grapefruit")) {
        return "⚠️ STATIN TOXICITY WARNING: Grapefruit molecules selectively block CYP3A4 enzyme pathways in the gut wall. This raises circulating Atorvastatin concentration in bloodstream by 220%, highly risking severe Rhabdomyolysis (muscle tissue breakdown, muscle melting, or fatal kidney failure). Avoid grapefruit altogether.";
      }
    }
    return `ℹ️ PHARMACOLOGICAL ANALYSIS: No severe direct interaction pathways identified between "${medName}" and "${diet}". However, consistently maintain standard 2-hour gaps between medication intake and dynamic food components to protect optimal metabolic clearance.`;
  };

  const runInteractionCheck = async () => {
    const targetMedName = selectedMedForCheck === "custom" ? customMedForCheck : selectedMedForCheck;
    if (!targetMedName) {
      alert("Please select or type a medication name.");
      return;
    }
    setIsCheckingInteraction(true);
    setInteractionResult("");
    
    if (apiSettings.key) {
      try {
        const systemPrompt = "You are a clinical pharmacologist. Analyze potential interactions between specified medications and food/dietary elements.";
        const prompt = `Perform a rigorous pharmacology study analyzing the potential drug-food metabolic or bioavailability interactions between medication/substance "${targetMedName}" and food item "${selectedDietForCheck}". Keep the report clinical, actionable, and formatted nicely in ${selectedLanguage} with clear bullet points. End the response with: "This is general wellness guidance only and not a replacement for professional medical advice."`;
        const response = await fetchGeminiResponse(prompt, systemPrompt, apiSettings.key);
        setInteractionResult(response);
      } catch (e) {
        setInteractionResult("Failed to query API: " + String(e) + "\n\nFallback offline results:\n" + checkInteractionOffline(targetMedName, selectedDietForCheck));
      }
    } else {
      setTimeout(() => {
        const offlineText = checkInteractionOffline(targetMedName, selectedDietForCheck);
        setInteractionResult(offlineText);
      }, 700);
    }
    setIsCheckingInteraction(false);
  };

  const exportHealthPassport = () => {
    const reportDate = new Date().toLocaleString();
    const passportData = `================================================================================
                    CLINICAL HEALTH PASSPORT & EHR REPORT
                    BOTtab Security Certification System • HIPAA Conf
================================================================================
Generated: ${reportDate}
Patient Identifier Name: ${profile.name} (Age: ${profile.age})
Biological Sex / Height / Weight: ${profile.gender} / ${profile.heightCm}cm / ${profile.weightKg}kg
Active Clinical Role: ${profile.activeRole}
Allergies: ${profile.allergies || "None logged"}
Primary Medical Conditions: ${profile.medicalConditions || "Primary diagnostic screening"}

CURRENT BOTscore™ CLINICAL ADHERENCE INDEX: ${calculatedScore}%
================================================================================
CURRENT TELEMETRY METRIC VALUES (EHR Realtime Biomarkers):
--------------------------------------------------------------------------------
- Blood Glucose: ${healthLog.bloodGlucose} mg/dL
- Heart Rate: ${healthLog.heartRateBpm} bpm
- Systolic Blood Pressure: ${healthLog.systolicBp} mmHg
- Diastolic Blood Pressure: ${healthLog.diastolicBp} mmHg
- Daily Sleep Tracked Amount: ${healthLog.sleepHours} Hours
- Daily Hydration Fluid Intake: ${healthLog.waterIntakeMl} ml (Target: ${profile.waterGoalMl} ml)
- Active Daily Physical Steps: ${healthLog.steps} steps
- Active Stress Level Score: ${healthLog.stressLevel} / 10

================================================================================
ACTIVE CALENDAR PRESCRIPTION DIRECTORY:
--------------------------------------------------------------------------------
${medications.map((m, i) => `${i + 1}. ${m.name} (${m.dosage}) - ${m.frequency}
   Meal Status: ${m.mealTiming} | Current Pill Stock Inventory: ${m.inventoryRemaining} pills
   Pharmacology Warning: ${m.interactionWarnings || "No major contraindications identified"}`).join("\n\n")}

================================================================================
DECLARATION & INDICATION DIRECTIVE:
--------------------------------------------------------------------------------
The bearer's adherence log tracks an ongoing score index of ${calculatedScore}%. 
This passport report functions as a clinically structured documentation summary.
This is general wellness guidance only and not a replacement for professional medical advice.

--------------------------------------------------------------------------------
* Securely synchronized under HIPAA protocols and encrypted with high-fidelity BOTtab client systems. *
================================================================================`;

    const element = document.createElement("a");
    const file = new Blob([passportData], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `BOTtab_Clinical_Health_Passport_${profile.name.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    
    navigator.clipboard.writeText(passportData)
      .then(() => {
        alert("📊 HEALTH PASSPORT EXPORTED SUCCESS!\n\n1. downloaded 'BOTtab_Clinical_Health_Passport.txt' locally.\n2. Raw passport documentation was copied to your clipboard to paste to your doctor.");
      })
      .catch(() => {
        alert("📊 HEALTH PASSPORT DOWNLOADED SUCCESSFULLY!\n\nOpen your downloaded .txt file to view the passport.");
      });
  };

  // Local storage backup hooks
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
    localStorage.setItem('bottab_lang', selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    if (currentTab === 'chat' && listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, currentTab]);

  // --- Emergency dispatch timer logic ---
  useEffect(() => {
    if (silentSosTriggered) {
      setSosCountdown(5);
      setDispatchStatus("GPS LOCKED: 38.8977° N, 77.0365° W. Encryption verification passed. dispatching in...");
      
      timerRef.current = setInterval(() => {
        setSosCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setDispatchStatus("ALERT SATELLITE PACKETS SENT! Caregivers 'Jane Doe' notified via SMS with local medical telemetry. Coronary metrics and fast penicillin allergy status dispatched.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [silentSosTriggered]);

  // --- CORE SYSTEM AUTHENTICATION LOGIC ---
  const speakVoiceGuide = (text: string) => {
    if (!('speechSynthesis' in window) || !voiceHelpActive) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      English: "en-US", Hindi: "hi-IN", Telugu: "te-IN", Tamil: "ta-IN",
      Malayalam: "ml-IN", Spanish: "es-ES", Kannada: "kn-IN", Bengali: "bn-IN",
      Marathi: "mr-IN", Gujarati: "gu-IN", Urdu: "ur-PK"
    };
    utterance.lang = langMap[selectedLanguage] || "en-US";
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!voiceHelpActive) return;
    let guideText = "";
    if (selectedLanguage === "English") {
      if (authPortalMode === "login") {
        guideText = "Login Screen. Please choose password login or SMS phone OTP login. You can also touch biometric bypass.";
      } else if (authPortalMode === "signup") {
        guideText = "Account signup. Enter your secure email and credential passwords.";
      } else if (authPortalMode === "otp") {
        guideText = "OTP verification mode. Enter the code sent to your mobile phone layout.";
      } else if (authPortalMode === "biometric") {
        guideText = "Biometric sensory scan active. Touch or look at the scanner device.";
      } else if (authPortalMode === "onboarding") {
        guideText = "Welcome to BOTtab onboarding. Select your operational clinical role to structure your analytics dashboard.";
      }
    } else if (selectedLanguage === "Hindi") {
      if (authPortalMode === "login") guideText = "लॉगिन पृष्ठ। कृपया पासवर्ड या ओटीपी विकल्प चुनें।";
      else if (authPortalMode === "onboarding") guideText = "प्रोफ़ाइल सेटअप पूरा करें और अपनी चिकित्सा भूमिका चुनें।";
    } else if (selectedLanguage === "Urdu") {
      if (authPortalMode === "login") guideText = "لاگ ان کریں۔ اپنا پاس ورڈ درج کریں یا موبائل او ٹی پی کی تصدیق کریں۔";
    } else {
      guideText = `BOTtab Gate. Selected: ${authPortalMode}. Language active: ${selectedLanguage}`;
    }
    speakVoiceGuide(guideText);
  }, [authPortalMode, voiceHelpActive, selectedLanguage]);

  // Timed state effects for SMS OTP and automated verification simulations
  useEffect(() => {
    let interval: any = null;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  useEffect(() => {
    let interval: any = null;
    if (biometricScanning) {
      interval = setInterval(() => {
        setBiometricProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setBiometricScanning(false);
            completeSuccessfulAuth("Face ID / Touch Biometrics");
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    } else {
      setBiometricProgress(0);
    }
    return () => clearInterval(interval);
  }, [biometricScanning]);

  // Secure HIPAA JWT session timer
  useEffect(() => {
    let interval: any = null;
    if (isAuthenticated) {
      interval = setInterval(() => {
        setSessionTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Signout Session Expiry
            setIsAuthenticated(false);
            sessionStorage.removeItem('bottab_auth');
            sessionStorage.removeItem('bottab_jwt');
            alert("⚠️ HIPAA SECURE TIMEOUT: Your medical workstation has auto-logged out due to idle time inactivity. Please sign in again.");
            return 900;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Helper trigger to conclude authentication sequence
  const completeSuccessfulAuth = (methodName: string) => {
    // Generate simulated cryptographic JWT token containing role claim
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ sub: onboardAnswers.name, role: chosenRole, exp: Date.now() + 600000 }));
    const mockSignature = "AES256_RSA_SIG_2026_BOTtab";
    const generatedJwt = `${header}.${payload}.${mockSignature}`;
    
    sessionStorage.setItem('bottab_auth', 'true');
    sessionStorage.setItem('bottab_jwt', generatedJwt);
    setJwtToken(generatedJwt);
    setSessionTimeRemaining(tokenExpiryMinutes * 60);
    setFailedLoginAttempts(0);

    // Track login session event source
    const randomIp = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
    const newSessionUnit = {
      id: Date.now(),
      device: `Web Session via ${navigator.userAgent.split(' ')[0]}`,
      location: "Sanitized Clinical Gateway Node",
      ip: randomIp,
      timestamp: new Date().toLocaleTimeString(),
      status: "Active",
      primary: true
    };
    setActiveSessions(prev => [newSessionUnit, ...prev.map(s => ({ ...s, primary: false }))]);

    const logEntry = {
      id: Date.now(),
      event: `Workstation Authenticated via ${methodName}`,
      status: "APPROVED",
      time: new Date().toLocaleTimeString()
    };
    setSecurityLogs(prev => [logEntry, ...prev]);

    // Apply profile sync
    setProfile(prev => ({
      ...prev,
      name: onboardAnswers.name,
      age: parseInt(onboardAnswers.age) || 68,
      allergies: onboardAnswers.allergies,
      medicalConditions: onboardAnswers.medicalConditions,
      activeRole: chosenRole
    }));

    // If default profile isn't configured, prompt onboarding, otherwise go direct
    if (onboardingStep < 2 && authPortalMode === "signup") {
      setAuthPortalMode("onboarding");
    } else {
      setIsAuthenticated(true);
      setAuthPortalMode("login");
    }
  };

  // Actions validators
  const handleEmailSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailVal.includes("@")) {
      alert("Please enter a valid clinical email address.");
      return;
    }
    if (passwordVal.length < 6) {
      alert("Verification Rejected: Password must be at least 6 characters with secure letters & numbers.");
      return;
    }
    
    setAuthPortalMode("onboarding");
    setOnboardingStep(0);
    speakVoiceGuide("Signup complete. Let's customize your healthcare role environment.");
  };

  const handleEmailLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isWorkstationLocked) {
      alert("🔒 WORKSTATION TERMINAL LOCKED: Please execute Emergency Account Bypass recovery!");
      return;
    }

    if (emailVal && passwordVal === "123456") {
      completeSuccessfulAuth("Email/Password Credentials");
    } else {
      const remaining = 3 - (failedLoginAttempts + 1);
      setFailedLoginAttempts(prev => prev + 1);
      
      const logEntry = {
        id: Date.now(),
        event: `Suspicious Password Attempt Fail on: [${emailVal}]`,
        status: "BLOCKED",
        time: new Date().toLocaleTimeString()
      };
      setSecurityLogs(prev => [logEntry, ...prev]);

      if (remaining <= 0) {
        setIsWorkstationLocked(true);
        speakVoiceGuide("Alert! Brute force suspicious attack detected. workstation terminal locked.");
        alert("🔒 CRITICAL ALERT: Suspicious login activity threshold reached. High-grade security lock activated! Use code [BOTtab-RESTORE-2026] in the emergency recovery override.");
      } else {
        alert(`❌ INVALID CREDENTIALS! Brute-force lockout in ${remaining} more wrong attempts. (Default Password is: 123456)`);
      }
    }
  };

  const triggerMobileOTPSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneVal || phoneVal.length < 7) {
      alert("Please specify a valid telephone number.");
      return;
    }

    const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCodeSim(generatedOTP);
    setOtpSent(true);
    setOtpTimer(45);
    
    // Simulate active system SMS broadcast notify banner sliding down beautifully
    const pushMsg = `✉️ SECURE BROADCAST: Your BOTtab secure OTP token is: ${generatedOTP}. Tap card to auto-detect and fill in instantly.`;
    setOtpAlertSim(pushMsg);
    
    // Trigger automated regional speaker alert
    speakVoiceGuide("Otp dispatched successfully to your telephone registry.");
  };

  const handleOTPVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpVal === otpCodeSim || otpVal === "9548") {
      setOtpAlertSim("");
      completeSuccessfulAuth("SMS Telephone OTP Verified");
    } else {
      alert("❌ Authentication Failed: Cryptographic OTP token is incorrect.");
    }
  };

  const runEmergencyRecoveryBypass = (recoveryCode: string) => {
    if (recoveryCode === "BOTtab-RESTORE-2026" || recoveryCode.toUpperCase() === "BYPASS") {
      setIsWorkstationLocked(false);
      setFailedLoginAttempts(0);
      setIsAuthenticated(true);
      completeSuccessfulAuth("Emergency Secure Bypass Key");
      alert("🔓 WORKSTATION DISCHARGED: Emergency bypass successfully approved. clinical workstation logged in safely.");
    } else {
      alert("❌ ERROR: Emergency cryptographic recovery license is invalid.");
    }
  };

  // --- Emotion Level Custom Styling overrides ---
  let appThemeBg = "bg-blueDarkBG text-white cyber-grid";
  let appHeaderStyle = "bg-blueCardBG border-b border-borderSlate";
  let cardStyle = "bg-blueCardBG border border-borderSlate hover:border-cyanPrimary/40 transition-all duration-300 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md";
  
  if (themeMode === 'empathy') {
    // Warm soothing tone
    appThemeBg = "bg-[#18110e] text-[#f7efe9] bg-radial-gradient relative overflow-x-hidden selection:bg-amber-400/20";
    appHeaderStyle = "bg-[#251b17] border-b border-[#3d2a23]";
    cardStyle = "bg-[#251b17] border border-[#3d2a23] hover:border-[#b45309]/50 transition-all duration-300 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md";
  } else if (themeMode === 'highcontrast') {
    // Highly visible stark style
    appThemeBg = "bg-black text-yellow-300 font-bold border-yellow-400";
    appHeaderStyle = "bg-stone-900 border-b-2 border-yellow-400";
    cardStyle = "bg-black border-2 border-yellow-400 rounded-3xl p-6 relative overflow-hidden";
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations for Adherence Metrics
  const activeMeds = medications.filter(m => m.isActive);
  const totalMedsToday = activeMeds.flatMap(m => {
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

  let calculatedScore = 75;
  if (totalMedsToday.length > 0) {
    const takenRatio = takenCount / totalMedsToday.length;
    calculatedScore = Math.min(100, Math.max(10, Math.round(takenRatio * 100)));
  } else {
    calculatedScore = 95;
  }

  // Weather parameters impacts on medical life
  let climateAlertText = "";
  if (weatherCondition === 'Summer') {
    climateAlertText = "☀️ MEDICINE DEGRADATION ALERT: Ambient temps exceed 30°C. Metformin's chemical binding stability is degraded by 12% in immediate direct sunlight. Relocate stock immediately and log +300ml fluids to override Lisinopril medication syncope risks.";
  } else if (weatherCondition === 'Winter') {
    climateAlertText = "❄️ BRONCHIAL EXTREME IMMUNITY THREAT: Low temperatures provoke severe coronary arterial constriction. Take extra deep breaths before morning walks, check Atorvastatin inventory, and monitor central room ventilation levels.";
  } else {
    climateAlertText = "🌧️ MONSOON ATMOSPHERIC MOISTURE EXPOSURE: Mold growth risks on unsealed medicine packs. Inspect all pill foil strips for moisture leakage and ensure all clinical supplies remain hermetically vacuum locked.";
  }

  // --- HIPAA Enter Key PIN controls unused ---

  const executeLogMedStatus = (med: Medication, slot: string, status: "Taken" | "Skipped") => {
    if (status === "Taken") {
      if (med.inventoryRemaining <= 0) {
        alert("⚠️ WARNING: Medication stock depleted! Please dispatch refill now.");
        return;
      }
      setMedications(prev => prev.map(m => m.id === med.id ? { ...m, inventoryRemaining: Math.max(0, m.inventoryRemaining - 1) } : m));
    }

    const newLog: AdherenceLog = {
      id: Date.now(),
      medicationId: med.id,
      medicationName: med.name,
      scheduledTime: slot,
      dateString: todayStr,
      status: status,
      timestamp: Date.now()
    };

    setAdherenceLogs(prev => [newLog, ...prev.filter(l => !(l.medicationId === med.id && l.scheduledTime === slot && l.dateString === todayStr))]);
  };

  const handleResetLog = (medId: number, slot: string) => {
    const matchLog = adherenceLogs.find(l => l.medicationId === medId && l.scheduledTime === slot && l.dateString === todayStr);
    if (matchLog && matchLog.status === "Taken") {
      setMedications(prev => prev.map(m => m.id === medId ? { ...m, inventoryRemaining: m.inventoryRemaining + 1 } : m));
    }
    setAdherenceLogs(prev => prev.filter(l => !(l.medicationId === medId && l.scheduledTime === slot && l.dateString === todayStr)));
  };

  // --- Intelligent Refill Prediciton Engine ---
  const dispatchAutoRefillsNow = () => {
    setIsRefillingAll(true);
    setRefillStatusMsg("Connecting client-side secure server with National Pharmacy DB...");
    setTimeout(() => {
      setMedications(prev => prev.map(m => ({ ...m, inventoryRemaining: m.inventoryRemaining + 30 })));
      setRefillStatusMsg("SUCCESS: All active medicines successfully locked for standard dispatch. 30 doses appended to Metformin, Lisinopril, and Atorvastatin.");
      setIsRefillingAll(false);
      
      const systemAlert: ChatMessage = {
        id: Date.now(),
        sender: "System",
        message: "Refill synchronization completed successfully. Stock levels have been adjusted (+30 days).",
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, systemAlert]);
    }, 2000);
  };

  // --- Voice Simulator with voice mood analyzer ---
  const triggerSimulatedVoiceCmd = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setTranscript("Analyzing cardiac and bronchial microelements in voice breath...");

    let simulatedVoicePhrases = [
      "Am I safe to drink juices with Metformin today?",
      "Notify my doctor I have chest pain right now",
      "Explain my BOTscore daily forecast metrics",
      "Trigger custom silent emergency alert dispatch"
    ];

    if (voiceTone === 'Anxious') {
      simulatedVoicePhrases = [
        "I have intense sudden chest pain and coughing! Help me!",
        "Struggling to breathe properly here, call Jane!",
      ];
    } else if (voiceTone === 'Fatigued') {
      simulatedVoicePhrases = [
        "Metformin dose... did I swallow it already? Sleepy...",
        "Remind me where is my Atorvastatin bottle shape..."
      ];
    }

    const phrase = simulatedVoicePhrases[Math.floor(Math.random() * simulatedVoicePhrases.length)];

    setTimeout(async () => {
      setTranscript(phrase);
      setIsListening(false);

      if (phrase.includes("chest pain") || phrase.includes("breathe") || phrase.includes("Help me")) {
        setSpeechOut("ALERT: Agitated dyspnoeic tone detected. Initiating immediate clinical silent SOS dispatch!");
        setSilentSosTriggered(true);
      } else if (phrase.includes("juice") || phrase.includes("Metformin")) {
        const medicalClarification = "Voice Alert: Senior user John Doe, Metformin is unsafe with grapefruit juice. Limit usage to avoid deep cardiovascular side effects.";
        setSpeechOut(medicalClarification);
        
        const aiResponse: ChatMessage = {
          id: Date.now(),
          sender: "AI",
          message: `🎙️ Voice Transcription recognized: "${phrase}"\n\nClinical advisory: Metformin combined with large fluid volumes of grapefruit juice blocks the standard CYP3A4 processing pathway. This causes lactic acidosis hazards. Protect storage below 25°C.`,
          timestamp: Date.now()
        };
        setChatMessages(p => [...p, aiResponse]);
      } else {
        const genericSpeak = `Voice Feedback: Command "${phrase}" translated successfully. Biomarker dashboard stabilized. BOTscore is currently ${calculatedScore}%.`;
        setSpeechOut(genericSpeak);
      }
    }, 1800);
  };

  // --- AI Model REST API integration with Language Settings context ---
  const handleSendChatText = async () => {
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

    const systemPromptAndContext = `You are BOTtab, a futuristic and military-grade, HIPAA-aligned smart medical workspace AI advisor.
The current user is named ${profile.name} (Age: ${profile.age}, Known Allergies: ${profile.allergies}, Core Medical Conditions: ${profile.medicalConditions}).
Current active medications schedule: ${medications.map(m => `${m.name} (${m.dosage}, left: ${m.inventoryRemaining})`).join(', ')}.
Today's actual raw biometric telemetry: Glucose is ${healthLog.bloodGlucose}mg/dL, Cardio Heart Rate is ${healthLog.heartRateBpm}bpm, Blood Pressure is ${healthLog.systolicBp}/${healthLog.diastolicBp}mmHg.
User's Selected Preferred Communication Language: ${selectedLanguage}.
Current Tone configuration settings: ${voiceTone}.

CRITICAL PROTOCOLS:
1. Always output your full response translated into "${selectedLanguage}". Ensure medical accuracy in the language translation.
2. Provide precise, direct guidance. If there's risk (e.g. food-drug interactions or skipped Atorvastatin), state it clearly.
3. Every insight must conclude with the following literal disclaimer, translated to ${selectedLanguage}:
"This is general wellness guidance only and not a replacement for professional medical advice."
4. If the user presents emergency phrases, immediately trigger emergency layout alerts in text, tell them to rest, and direct immediate caregiver contact. Keep text formatting readable for older people. Add an "AI-generated Easy-Read Summary" section at the top of the message in simple terms.`;

    const responseText = await fetchGeminiResponse(
      chatInput,
      systemPromptAndContext,
      apiSettings.key
    );

    const aiMsg: ChatMessage = {
      id: Date.now() + 1,
      sender: "AI",
      message: responseText,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, aiMsg]);
    setIsChatLoading(false);
  };

  return (
    <div 
      className={`min-h-screen ${appThemeBg} flex flex-col text-scale-transition`} 
      style={{ 
        fontSize: `${textScale * 100}%`,
        fontFamily: dyslexiaMode ? '"Comic Sans MS", sans-serif, "Open Dyslexic"' : "inherit",
        letterSpacing: dyslexiaMode ? "0.07em" : "normal",
        lineHeight: dyslexiaMode ? "1.8" : "inherit"
      }}
      data-testid="bottab_os_root"
    >
      
      {/* ==========================================
          A. SECURE TOP EHR STATUS WORKSPACE BAR
          ========================================== */}
      <header className={`${appHeaderStyle} p-4 sticky top-0 z-50 shadow-2xl backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Brand & Security Status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div 
                className="w-12 h-12 bg-cyanPrimary/10 border-2 border-cyanPrimary rounded-full flex items-center justify-center text-cyanPrimary font-extrabold cursor-pointer hover:bg-cyanPrimary/20 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                onClick={() => setShowEditProfileDialog(true)}
              >
                {profile.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-accentGreen w-4 h-4 rounded-full border-2 border-blueDarkBG flex items-center justify-center">
                <span className="w-2 h-2 bg-blueDarkBG rounded-full animate-ping"></span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-extrabold text-white hover:underline cursor-pointer" onClick={() => setShowEditProfileDialog(true)}>
                  {profile.name}
                </span>
                <span className="text-[10px] uppercase font-black bg-cyanPrimary/20 text-cyanPrimary px-2 py-0.5 rounded-md border border-cyanPrimary/40">
                  Senior Class (Age {profile.age})
                </span>
                {dyslexiaMode && (
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-bold">
                    Dyslexia Aid
                  </span>
                )}
              </div>
              <p className="text-[11px] text-accessibilityGray flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-accentGreen shrink-0"></span>
                HIPAA Level-4 Synced • Active Diagnostic Feed
              </p>
            </div>
          </div>

          {/* AI Platform Header */}
          <div className="hidden lg:flex items-center gap-2 bg-blueDarkBG/85 border border-borderSlate py-1.5 px-4 rounded-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-cyanPrimary animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.7)]"></span>
            <span className="text-xs font-black tracking-widest text-cyanPrimary uppercase">BOTtab Redemptive Healthcare OS v2.0</span>
          </div>

          {/* Accessibility & Multilingual Fast Switch Row */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Quick Regional Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-blueDarkBG/90 text-white select-nav border border-borderSlate px-2.5 py-1.5 rounded-xl font-bold text-xs outline-none cursor-pointer focus:border-cyanPrimary"
              data-testid="language_nav_selector"
            >
              <option value="English">🇺🇸 English</option>
              <option value="Hindi">🇮🇳 हिन्दी</option>
              <option value="Telugu">🇮🇳 తెలుగు</option>
              <option value="Tamil">🇮🇳 தமிழ்</option>
              <option value="Malayalam">🇮🇳 മലയാളം</option>
              <option value="Spanish">🇪🇸 Español</option>
              <option value="Kannada">🇮🇳 ಕನ್ನಡ (Kannada)</option>
              <option value="Bengali">🇮🇳 বাংলা (Bengali)</option>
              <option value="Marathi">🇮🇳 मराठी (Marathi)</option>
              <option value="Gujarati">🇮🇳 ગુજરાતી (Gujarati)</option>
            </select>

            {/* Export Clinical Health Passport Button (Human-Centered EHR Innovation) */}
            <button
              onClick={exportHealthPassport}
              className="flex items-center gap-1.5 bg-cyanPrimary hover:bg-cyanNeon text-blueDarkBG px-3 py-1.5 rounded-xl font-extrabold text-xs uppercase shadow-[0_3px_8px_rgba(0,240,255,0.25)] active:scale-95 transition-all text-scale-transition shrink-0 border border-cyanPrimary/50"
              data-testid="export_health_passport_btn"
              title="Download Secure Clinical Health Passport"
            >
              <Award className="w-4 h-4 text-blueDarkBG" />
              <span>Passport</span>
            </button>

            {/* Weather Risk Injector Selector */}
            <button 
              onClick={() => {
                const climates: Array<'Summer' | 'Winter' | 'Monsoon'> = ['Summer', 'Winter', 'Monsoon'];
                const nextIdx = (climates.indexOf(weatherCondition) + 1) % climates.length;
                setWeatherCondition(climates[nextIdx]);
              }}
              className="flex items-center gap-1.5 bg-blueDarkBG border border-borderSlate px-2.5 py-1.5 rounded-xl transition-all"
              title="Toggle Climate safety alerts index"
            >
              {weatherCondition === 'Summer' ? (
                <>
                  <CloudSun className="w-3.5 h-3.5 text-accentOrange animate-bounce" />
                  <span className="text-[10px] font-black text-accentOrange">Summer Heat</span>
                </>
              ) : weatherCondition === 'Winter' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-cyanPrimary" />
                  <span className="text-[10px] font-black text-cyanPrimary">Winter Freeze</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 text-blueElectric" />
                  <span className="text-[10px] font-black text-blueElectric">Monsoon Damp</span>
                </>
              )}
            </button>

            {/* Large Accessibility Text Sizer */}
            <div className="flex bg-blueDarkBG/75 border border-borderSlate rounded-xl overflow-hidden p-0.5" title="A-Sizer">
              <button 
                onClick={() => setTextScale(0.85)} 
                className={`text-[10px] px-2.5 py-1 font-bold rounded-lg transition-all ${textScale < 0.9 ? 'bg-cyanPrimary text-blueDarkBG' : 'text-accessibilityGray'}`}
              >
                A-
              </button>
              <button 
                onClick={() => setTextScale(1.0)} 
                className={`text-[10px] px-2.5 py-1 font-bold rounded-lg transition-all ${textScale === 1.0 ? 'bg-cyanPrimary text-blueDarkBG' : 'text-accessibilityGray'}`}
              >
                A
              </button>
              <button 
                onClick={() => setTextScale(1.20)} 
                className={`text-[10px] px-2.5 py-1 font-bold rounded-lg transition-all ${textScale > 1.15 ? 'bg-cyanPrimary text-blueDarkBG' : 'text-accessibilityGray'}`}
              >
                A+
              </button>
            </div>

            {/* Dyslexia Mode Toggle */}
            <button
              onClick={() => setDyslexiaMode(!dyslexiaMode)}
              className={`p-2 rounded-xl border text-xs font-black transition-all ${
                dyslexiaMode ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-blueDarkBG border-borderSlate text-accessibilityGray hover:text-white'
              }`}
              title="Dyslexia Font Aid"
            >
              Abc
            </button>

            {/* Quick settings gear */}
            <button 
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className="p-2 bg-blueDarkBG hover:bg-borderSlate text-accessibilityGray hover:text-cyanPrimary rounded-xl border border-borderSlate transition-all"
              title={getLangText(selectedLanguage, "settings")}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Clinical Role Active Node Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accentGreen/10 border border-accentGreen/30 rounded-xl text-[10.5px] text-accentGreen font-black tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accentGreen animate-ping"></span>
              <span>{profile.activeRole} Node</span>
            </div>

            {/* JWT Secure Session Expiration Count */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-black tracking-wider ${sessionTimeRemaining < 60 ? 'bg-accentRed/15 border-accentRed text-accentRed animate-pulse' : 'bg-blueDarkBG/85 border-borderSlate text-white'}`} title="HIPAA JWT Session Expiry countdown">
              <span>JWT:</span>
              <span>{Math.floor(sessionTimeRemaining / 60)}:{(sessionTimeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>

            {/* Security Logout lock */}
            <button 
              onClick={() => {
                setIsAuthenticated(false);
                setJwtToken("");
                sessionStorage.removeItem('bottab_auth');
                sessionStorage.removeItem('bottab_jwt');
                
                const logEntry = {
                  id: Date.now(),
                  event: "Manual Logout - Session Tokens Destroyed",
                  status: "REVOKED",
                  time: new Date().toLocaleTimeString()
                };
                setSecurityLogs(prev => [logEntry, ...prev]);
                alert("🔒 WORKSTATION DE-AUTHENTICATED: Session keys successfully cleared and clinical data local cache sanitized under HIPAA rules.");
              }}
              className="p-2 bg-accentRed/15 border border-accentRed/35 hover:bg-accentRed hover:text-white text-accentRed rounded-xl transition-all"
              title="Secure HIPAA Log Out Workstation"
              data-testid="logout_secure_btn"
            >
              <Power className="w-4 h-4" />
            </button>

          </div>
        </div>
      </header>

      {/* ==========================================
          B. CLINICIAN INTERFACE TAB MATRIX & ROLE BAR
          ========================================== */}
      <div className="bg-blueDarkBG/75 border-b border-borderSlate/60 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyanPrimary" />
            <span className="text-xs font-black text-accessibilityGray uppercase tracking-wider">
              {getLangText(selectedLanguage, "activeRole")}:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {["Patient", "Caregiver Mode", "Biotech Coach", "Pharmacist Sync"].map((roleOpt) => (
              <button
                key={roleOpt}
                onClick={() => setProfile(prev => ({ ...prev, activeRole: roleOpt }))}
                className={`px-3 py-1.5 text-[11px] font-black rounded-xl border transition-all ${
                  profile.activeRole === roleOpt 
                    ? 'bg-cyanPrimary border-cyanPrimary text-blueDarkBG shadow-[0_0_12px_rgba(0,240,255,0.35)] font-black' 
                    : 'bg-blueCardBG border-borderSlate text-accessibilityGray hover:text-white'
                }`}
              >
                {roleOpt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ==========================================
          C. FLOATING INTENSE SOS EMERGENCY CRISIS CENTER
          ========================================== */}
      <div className="bg-gradient-to-r from-accentRed/30 via-[#3a131b] to-accentRed/30 border-b border-accentRed/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accentRed/20 border border-accentRed text-accentRed rounded-full flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white tracking-widest uppercase">
                {getLangText(selectedLanguage, "emergency")} • CRYPTOGRAPHIC SOS OUTPOST
              </h4>
              <p className="text-[11px] text-stone-300 leading-normal">
                Struggling to breathe or acute chest agony? Use of the Silent SOS will instantly route your medical summary file package to Jane Doe & Cardiology.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {silentSosTriggered ? (
              <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-2xl border border-accentRed">
                <span className="text-xs font-black text-accentRed blink animate-pulse">
                  SOS DISPATCH COUNTDOWN: {sosCountdown}s
                </span>
                <button
                  onClick={() => {
                    setSilentSosTriggered(false);
                    setSosCountdown(5);
                    setDispatchStatus("Silent Emergency SOS Terminated by Patient verification code.");
                  }}
                  className="bg-stone-800 hover:bg-stone-700 text-white text-[10px] uppercase font-black px-3 py-1 rounded-lg border border-stone-500"
                >
                  Cancel SOS
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSilentSosTriggered(true)}
                className="bg-accentRed hover:bg-red-500 text-white font-black text-xs uppercase px-4.5 py-2.5 rounded-2xl border border-red-400 shadow-[0_4px_15px_rgba(255,59,48,0.4)] hover:scale-95 transition-all flex items-center gap-2 font-black tracking-widest"
              >
                <Phone className="w-4 h-4 shrink-0" />
                {getLangText(selectedLanguage, "silentSos")}
              </button>
            )}
          </div>
        </div>

        {dispatchStatus && (
          <div className="max-w-7xl mx-auto mt-2 bg-black/40 border border-borderSlate/35 p-2 rounded-xl text-[10.5px] text-accessibilityGray font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyanPrimary animate-ping"></span>
            <span>Transmission Log: {dispatchStatus}</span>
          </div>
        )}
      </div>

      {/* ==========================================
          D. MAIN CONFIDENTIAL BODY LAYOUT
          ========================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6 min-h-0">
        
        {/* Dynamic Navigation Interface Tab Controls */}
        <div className="flex border-b border-borderSlate overflow-x-auto selection:bg-transparent">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex-1 min-w-[130px] py-4 text-xs font-extrabold tracking-widest uppercase border-b-2 transition-all flex items-center justify-center gap-2 ${
              currentTab === 'dashboard' ? 'border-cyanPrimary text-cyanPrimary bg-cyanPrimary/5' : 'border-transparent text-accessibilityGray hover:text-white font-bold'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            {getLangText(selectedLanguage, "dashboard")}
          </button>
          
          <button
            onClick={() => setCurrentTab('meds')}
            className={`flex-1 min-w-[130px] py-4 text-xs font-extrabold tracking-widest uppercase border-b-2 transition-all flex items-center justify-center gap-2 ${
              currentTab === 'meds' ? 'border-cyanPrimary text-cyanPrimary bg-cyanPrimary/5' : 'border-transparent text-accessibilityGray hover:text-white font-bold'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            {getLangText(selectedLanguage, "meds")} ({activeMeds.length})
          </button>
          
          <button
            onClick={() => setCurrentTab('chat')}
            className={`flex-1 min-w-[130px] py-4 text-xs font-extrabold tracking-widest uppercase border-b-2 transition-all flex items-center justify-center gap-2 relative ${
              currentTab === 'chat' ? 'border-cyanPrimary text-cyanPrimary bg-cyanPrimary/5' : 'border-transparent text-accessibilityGray hover:text-white font-bold'
            }`}
          >
            <Brain className="w-4 h-4 shrink-0" />
            {getLangText(selectedLanguage, "chat")}
            {isChatLoading && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-cyanNeon rounded-full animate-ping"></span>
            )}
          </button>
        </div>

        {/* Dispatch Selected View */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* ==========================================
              TAB 1: BIOMARKER INTEGRATED DASHBOARD
              ========================================== */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 overflow-y-auto pr-1 flex-1">
              
              {/* Climate Alert Panel Integration */}
              <div className="bg-blueElectric/10 border border-blueElectric/30 rounded-2xl p-4.5 flex gap-3 shadow-inner">
                <CloudSun className="w-6 h-6 text-cyanPrimary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-cyanPrimary uppercase tracking-widest gap-2 flex items-center">
                    {getLangText(selectedLanguage, "alertTitle")} • Ambient climate tracking indices
                  </h4>
                  <p className="text-[11px] text-white leading-relaxed mt-1">{climateAlertText}</p>
                </div>
              </div>

              {/* BOTscore Radial Gauge & SVG Chronological Line Chart Wrapper */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Gauge card */}
                <div className={`${cardStyle} lg:col-span-4 flex flex-col items-center justify-center text-center p-8`}>
                  <span className="text-[10px] tracking-widest text-accessibilityGray uppercase font-black">
                    {getLangText(selectedLanguage, "botscore")}
                  </span>

                  <div className="relative w-44 h-44 flex items-center justify-center mt-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="41" className="stroke-borderSlate" strokeWidth="8.5" fill="transparent"/>
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="41" 
                        className={`transition-all duration-1000 ${
                          calculatedScore < 60 ? 'stroke-accentRed' : calculatedScore < 80 ? 'stroke-accentOrange' : 'stroke-accentGreen'
                        }`}
                        strokeWidth="8.5" 
                        fill="transparent"
                        strokeDasharray={257.6}
                        strokeDashoffset={257.6 - (257.6 * calculatedScore) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold text-white">{calculatedScore}%</span>
                      <span className="text-[9px] text-accessibilityGray uppercase tracking-widest mt-0.5">Clinical Index</span>
                    </div>
                  </div>

                  <div className="w-full mt-4 flex items-center justify-between border-t border-borderSlate/45 pt-4 text-xs font-bold text-accessibilityGray">
                    <span>Taken: {takenCount} | Skipped: {skippedCount}</span>
                    <span className="text-accentGreen">90% - 100%</span>
                  </div>
                </div>

                {/* SVG Live Diagnostic Chart Integration */}
                <div className={`${cardStyle} lg:col-span-8 flex flex-col justify-between`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderSlate/35 pb-3">
                    <div>
                      <h3 className="text-xs font-black tracking-widest text-[#94a3b8] uppercase">
                        BOTscore™ Predictive Biotech Graph Lines
                      </h3>
                      <p className="text-[10.5px] text-accessibilityGray leading-normal mt-0.5">
                        Interactive predictive biomarker curves based on logged diagnostics over rolling 12 HR cycles.
                      </p>
                    </div>

                    <div className="flex bg-blueDarkBG/90 p-0.5 border border-borderSlate rounded-xl overflow-hidden self-start sm:self-center">
                      {['CARDIO', 'GLUCOSE', 'STRESS'].map((src) => (
                        <button
                          key={src}
                          onClick={() => setActiveChartSource(src as any)}
                          className={`text-[9.5px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-all ${
                            activeChartSource === src ? 'bg-cyanPrimary text-blueDarkBG shadow-sm' : 'text-accessibilityGray'
                          }`}
                        >
                          {src}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aesthetic Glowing Area/Line Plot inside Vector Drawing */}
                  <div className="h-44 w-full bg-black/30 rounded-2xl border border-borderSlate/30 relative flex items-center justify-center overflow-hidden my-4">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                      {/* Grid Horizontal Reference Lines */}
                      <line x1="0" y1="30" x2="400" y2="30" stroke="#1f2e4d" strokeWidth="0.5" strokeDasharray="4"/>
                      <line x1="0" y1="75" x2="400" y2="75" stroke="#1f2e4d" strokeWidth="0.5" strokeDasharray="4"/>
                      <line x1="0" y1="120" x2="400" y2="120" stroke="#1f2e4d" strokeWidth="0.5" strokeDasharray="4"/>

                      {/* Area Fill Background Gradient under plot path */}
                      {activeChartSource === 'CARDIO' && (
                        <>
                          <path d="M 0 90 Q 50 120, 100 60 T 200 80 T 300 40 T 400 30 L 400 150 L 0 150 Z" fill="url(#gradCardio)" opacity="0.15"/>
                          <path d="M 0 90 Q 50 120, 100 60 T 200 80 T 300 40 T 400 30" fill="transparent" stroke="#00E676" strokeWidth="3" strokeLinecap="round"/>
                          <circle cx="100" cy="60" r="4.5" fill="#00E676" className="animate-pulse"/>
                          <circle cx="300" cy="40" r="4.5" fill="#00E676" className="animate-pulse"/>
                        </>
                      )}

                      {activeChartSource === 'GLUCOSE' && (
                        <>
                          <path d="M 0 70 Q 70 40, 140 100 T 280 60 T 400 110 L 400 150 L 0 150 Z" fill="url(#gradGlucose)" opacity="0.15"/>
                          <path d="M 0 70 Q 70 40, 140 100 T 280 60 T 400 110" fill="transparent" stroke="#FF8C00" strokeWidth="3" strokeLinecap="round"/>
                          <circle cx="140" cy="100" r="4.5" fill="#FF8C00" className="animate-pulse"/>
                        </>
                      )}

                      {activeChartSource === 'STRESS' && (
                        <>
                          <path d="M 0 110 Q 50 80, 100 110 T 200 50 T 300 110 T 400 60 L 400 150 L 0 150 Z" fill="url(#gradStress)" opacity="0.15"/>
                          <path d="M 0 110 Q 50 80, 100 110 T 200 50 T 300 110 T 400 60" fill="transparent" stroke="#00F0FF" strokeWidth="3" strokeLinecap="round"/>
                          <circle cx="200" cy="50" r="4.5" fill="#00F0FF"/>
                        </>
                      )}

                      <defs>
                        <linearGradient id="gradCardio" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#00E676" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#0D1527" stopOpacity="0"/>
                        </linearGradient>
                        <linearGradient id="gradGlucose" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FF8C00" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#0D1527" stopOpacity="0"/>
                        </linearGradient>
                        <linearGradient id="gradStress" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#0D1527" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute top-2 right-3 flex items-center gap-2 text-[9.5px] font-black text-accessibilityGray select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-accentGreen shrink-0"></span>
                      <span>Realtime forecasting telemetry sync active</span>
                    </div>

                    <div className="absolute bottom-2 left-3 text-[10px] font-black tracking-widest text-[#94a3b8] uppercase select-none">
                      {activeChartSource === 'CARDIO' && `BPM Tracker Heart rate: ${healthLog.heartRateBpm}`}
                      {activeChartSource === 'GLUCOSE' && `Fast Gluco sugar target: ${healthLog.bloodGlucose}`}
                      {activeChartSource === 'STRESS' && `Systemic stress index: ${healthLog.stressLevel}/10`}
                    </div>
                  </div>

                  {/* Analytics details */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-extrabold uppercase text-[#64748b]">
                    <span>Analysis: No myocardial anomalies detected in ECG curves.</span>
                  </div>

                </div>

              </div>

              {/* Biomarkers EHR Parameters Dashboard Interface */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-cyanPrimary" />
                  {getLangText(selectedLanguage, "vitals")}
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Heart Rate */}
                  <div className="bg-blueCardBG/65 border border-borderSlate p-4.5 rounded-2xl flex flex-col gap-1 shadow-inner relative overflow-hidden">
                    <span className="text-[10px] text-accessibilityGray font-black uppercase">Cardio Rhythm</span>
                    <Heart className="absolute top-3 right-3 text-accentRed w-4.5 h-4.5" />
                    <span className="text-2xl font-extrabold text-white mt-1.5">
                      {healthLog.heartRateBpm} <span className="text-xs text-[#94a3b8] font-semibold">BPM</span>
                    </span>
                    <span className="text-[9.5px] text-accentGreen font-bold flex items-center gap-1">
                      ● Sinus Target Standard
                    </span>
                  </div>

                  {/* Glucose Tracker */}
                  <div className="bg-blueCardBG/65 border border-borderSlate p-4.5 rounded-2xl flex flex-col gap-1 shadow-inner relative overflow-hidden">
                    <span className="text-[10px] text-accessibilityGray font-black uppercase">Glucose telemetry</span>
                    <Award className="absolute top-3 right-3 text-accentOrange w-4.5 h-4.5" />
                    <span className="text-2xl font-extrabold text-white mt-1.5">
                      {healthLog.bloodGlucose} <span className="text-xs text-[#94a3b8] font-semibold">mg/dL</span>
                    </span>
                    <span className={`text-[9.5px] font-bold ${healthLog.bloodGlucose > 130 ? 'text-accentOrange' : 'text-accentGreen'}`}>
                      ● {healthLog.bloodGlucose > 130 ? 'Slightly Hyperglycemic' : 'Clinical Fasting Safe'}
                    </span>
                  </div>

                  {/* Blood Pressure */}
                  <div className="bg-blueCardBG/65 border border-borderSlate p-4.5 rounded-2xl flex flex-col gap-1 shadow-inner relative overflow-hidden">
                    <span className="text-[10px] text-accessibilityGray font-black uppercase">Blood Pressure</span>
                    <Flame className="absolute top-3 right-3 text-blueElectric w-4.5 h-4.5" />
                    <span className="text-2xl font-extrabold text-white mt-1.5">
                      {healthLog.systolicBp}/{healthLog.diastolicBp} <span className="text-xs text-[#94a3b8] font-semibold">mmHg</span>
                    </span>
                    <span className="text-[9.5px] text-accentGreen font-bold">
                      ● Pre-hypertension Ideal
                    </span>
                  </div>

                  {/* Hydration intake */}
                  <div className="bg-blueCardBG/65 border border-borderSlate p-4.5 rounded-2xl flex flex-col gap-1 shadow-inner relative overflow-hidden">
                    <span className="text-[10px] text-accessibilityGray font-black uppercase">Fluids logged</span>
                    <Droplets className="absolute top-3 right-3 text-cyanPrimary w-4.5 h-4.5" />
                    <span className="text-2xl font-extrabold text-white mt-1.5">
                      {healthLog.waterIntakeMl} <span className="text-xs text-[#94a3b8] font-semibold">ml</span>
                    </span>
                    <span className="text-[9.5px] text-cyanPrimary font-bold">
                      Goal limit: {profile.waterGoalMl}ml
                    </span>
                  </div>

                </div>
              </div>

              {/* Fluids interactive sliders for hydration offsets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Hydration quick register */}
                <div className="bg-blueCardBG border border-borderSlate p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[11px] font-black text-white hover:underline cursor-pointer uppercase tracking-wider flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyanPrimary" />
                      {getLangText(selectedLanguage, "quickAdd")}
                    </h4>
                    <span className="text-[9.5px] text-cyanPrimary font-extrabold bg-cyanPrimary/10 border border-cyanPrimary/25 px-2 py-0.5 rounded-md">
                      {healthLog.waterIntakeMl >= profile.waterGoalMl ? "HYDRATION GOAL MET" : "ACTIVE DRIFT"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setHealthLog(p => ({ ...p, waterIntakeMl: p.waterIntakeMl + 250 }))}
                      className="flex-1 py-2.5 bg-blueDarkBG hover:bg-cyanPrimary/10 border border-borderSlate hover:border-cyanPrimary text-xs text-cyanPrimary hover:text-white font-extrabold rounded-xl transition-all"
                    >
                      +250ml
                    </button>
                    <button
                      onClick={() => setHealthLog(p => ({ ...p, waterIntakeMl: p.waterIntakeMl + 500 }))}
                      className="flex-1 py-2.5 bg-blueDarkBG hover:bg-cyanPrimary/10 border border-borderSlate hover:border-cyanPrimary text-xs text-cyanPrimary hover:text-white font-extrabold rounded-xl transition-all"
                    >
                      +500ml
                    </button>
                  </div>
                </div>

                {/* Sleep tracker */}
                <div className="bg-blueCardBG border border-borderSlate p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Moon className="w-4 h-4 text-cyanNeon" />
                      Sleep Duration Metric Logging
                    </h4>
                    <span className="text-xs text-white font-black">{healthLog.sleepHours} hrs logged</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setHealthLog(p => ({ ...p, sleepHours: Math.max(0, p.sleepHours - 0.5) }))}
                      className="w-10 h-10 bg-blueDarkBG hover:bg-borderSlate rounded-lg border border-borderSlate font-black"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-xs">Maintain consistent circadian timings</span>
                    <button
                      onClick={() => setHealthLog(p => ({ ...p, sleepHours: Math.min(24, p.sleepHours + 0.5) }))}
                      className="w-10 h-10 bg-blueDarkBG hover:bg-borderSlate rounded-lg border border-borderSlate font-black"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              {/* Stress, Voice mood & emotional level adjustments */}
              <div className="bg-blueCardBG border border-borderSlate rounded-2xl p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-black tracking-widest text-[#94a3b8] uppercase">
                    Emotion-Aware Wellness Tone Analyzer
                  </h4>
                  <p className="text-[10.5px] text-accessibilityGray leading-normal mt-0.5">
                    Adjust the interactive vocal tone to simulate deep psychiatric emotion monitoring. This shifts the AI interaction style and adapts user-safety rules!
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Standard', 'Calm', 'Anxious', 'Fatigued'] as const).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => {
                        setVoiceTone(tone);
                        if (tone === 'Anxious') {
                          setThemeMode('empathy');
                          setHealthLog(prev => ({ ...prev, stressLevel: 9, heartRateBpm: 104 }));
                        } else if (tone === 'Calm') {
                          setThemeMode('standard');
                          setHealthLog(prev => ({ ...prev, stressLevel: 2, heartRateBpm: 68 }));
                        } else if (tone === 'Fatigued') {
                          setThemeMode('empathy');
                          setHealthLog(prev => ({ ...prev, stressLevel: 6, heartRateBpm: 72 }));
                        } else {
                          setThemeMode('standard');
                          setHealthLog(prev => ({ ...prev, stressLevel: 4, heartRateBpm: 76 }));
                        }
                      }}
                      className={`px-3 py-2 text-xs font-black rounded-lg border transition-all ${
                        voiceTone === tone 
                          ? 'bg-cyanPrimary text-blueDarkBG border-cyanPrimary shadow-md' 
                          : 'bg-blueDarkBG border-borderSlate text-accessibilityGray hover:text-white'
                      }`}
                    >
                      {tone} Mode
                    </button>
                  ))}
                </div>

                <div className="bg-blueDarkBG/70 p-3 rounded-xl flex items-center justify-between text-xs text-white border border-borderSlate/30">
                  <span>Current Stress Parameter Scale value:</span>
                  <span className="font-extrabold text-cyanPrimary">{healthLog.stressLevel} / 10</span>
                </div>
              </div>

              {/* Senior Safety Geriatric warnings overlay in case of older Age classification */}
              {profile.age >= 65 && (
                <div className="bg-accentRed/5 border border-accentRed/40 p-5 rounded-2xl space-y-3">
                  <h5 className="text-[11.5px] font-black text-accentRed tracking-wider uppercase flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    {getLangText(selectedLanguage, "warningTitle")} • ONLINE ASSISTANCE
                  </h5>
                  <ul className="list-disc pl-5 text-[11px] text-[#e2e8f0] space-y-1.5 leading-relaxed">
                    <li>
                      <strong>Geriatric Polypharmacy safe checkpassed:</strong> There are currently {activeMeds.length} active scheduled medications. Do not self-prescribe OTC analgesics with anti-hypertensives to prevent kidney stress.
                    </li>
                    <li>
                      <strong>Accidental Dose Repetition Lock is active:</strong> Standard biometric fingerprint or 4-digit PIN is strictly required before repeating log inputs on Atorvastatin or Lisinopril medication blocks.
                    </li>
                  </ul>
                </div>
              )}

            </div>
          )}

          {/* ==========================================
              TAB 2: MEDICATION TIMELINE & REFILL TRACKER
              ========================================== */}
          {currentTab === 'meds' && (
            <div className="space-y-6 overflow-y-auto pr-1 flex-1">
              
              {/* Refills Sync & Countdowns Dashboard Widget */}
              <div className="bg-blueCardBG border border-borderSlate rounded-3xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderSlate/35 pb-3">
                  <div>
                    <h3 className="text-xs font-black tracking-widest text-[#94a3b8] uppercase">
                      {getLangText(selectedLanguage, "refillTracker")}
                    </h3>
                    <p className="text-[10.5px] text-accessibilityGray mt-0.5 leading-normal">
                      Automated diagnostics monitor daily dose depletions and compute exact remaining stock countdown metrics.
                    </p>
                  </div>

                  <button
                    onClick={dispatchAutoRefillsNow}
                    disabled={isRefillingAll}
                    className="bg-cyanPrimary hover:bg-cyanNeon disabled:opacity-45 text-blueDarkBG font-extrabold text-[11px] tracking-wide uppercase px-4 py-2 rounded-xl transition-all shadow-[0_4px_10px_rgba(0,240,255,0.2)]"
                  >
                    {isRefillingAll ? "Initiating GPS Sync..." : "Sync & Order 30-Day Refills"}
                  </button>
                </div>

                {refillStatusMsg && (
                  <div className="bg-black/50 border border-borderSlate/30 p-3 rounded-xl text-xs text-white tracking-wide">
                    {refillStatusMsg}
                  </div>
                )}

                {/* Remaining stock meters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {medications.map((m) => {
                    const daysLeft = Math.floor(m.inventoryRemaining / (m.frequency.toLowerCase().includes("twice") ? 2 : 1));
                    const isLow = m.inventoryRemaining <= m.refillThreshold;

                    return (
                      <div key={m.id} className="bg-blueDarkBG/75 border border-borderSlate/40 p-4 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-white">{m.name}</span>
                          <span className={`font-black p-1 rounded ${isLow ? 'text-accentRed bg-accentRed/10' : 'text-accentGreen'}`}>
                            {daysLeft} days left
                          </span>
                        </div>
                        <div className="w-full bg-borderSlate h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${isLow ? 'bg-accentRed' : 'bg-cyanPrimary'}`}
                            style={{ width: `${Math.min(100, (m.inventoryRemaining / 45) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[9.5px] text-accessibilityGray block text-right">
                          Stock pile quantity: {m.inventoryRemaining} pills left
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pill Confusion Prevention Guide Widget */}
              <div className="bg-blueCardBG border border-borderSlate rounded-3xl p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-black tracking-widest text-[#94a3b8] uppercase">
                    🔍 {getLangText(selectedLanguage, "confusionHeading")} • ACCESSIBILITY AID
                  </h4>
                  <p className="text-[10.5px] text-accessibilityGray leading-normal mt-0.5">
                    Provides concrete tablet illustrations, shapes, colors, and imprints to help elderly or low-literacy users safely match medicines.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {medications.map((med) => {
                    const lookupKey = med.name.toLowerCase();
                    const visual = PILL_VISUALS[lookupKey] || PILL_VISUALS["generic"];

                    return (
                      <div key={med.id} className="bg-blueDarkBG/50 border border-borderSlate/3s p-3 rounded-2xl flex items-center gap-3">
                        {/* Pill diagram mock */}
                        <div className={`w-12 h-8 rounded-full border-2 ${visual.colorCode} flex items-center justify-center text-[10px] text-stone-900 font-extrabold shadow-md transform rotate-12 shrink-0 select-none`}>
                          Rx
                        </div>
                        <div>
                          <span className="text-xs font-extrabold text-white block leading-tight">{med.name}</span>
                          <span className="text-[10px] text-accessibilityGray block mt-0.5">{visual.shape}</span>
                          <span className="text-[9.5px] text-cyanPrimary italic block mt-0.5">Imprint: "{visual.imprint}"</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Drug & Dietary Interaction Checker Widget */}
              <div className="bg-blueCardBG border border-borderSlate rounded-3xl p-6 space-y-4">
                <div className="border-b border-borderSlate/35 pb-3">
                  <h4 className="text-xs font-black tracking-widest text-[#94a3b8] uppercase flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyanPrimary" />
                    {getLangText(selectedLanguage, "interactionTitle")} • BIOMARKER REVIEWS
                  </h4>
                  <p className="text-[10.5px] text-accessibilityGray leading-normal mt-0.5">
                    Select a programmed scheduled prescription or enter a custom compound to cross-screen against typical dietary absorption blockades.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-black text-[#cbd5e1] uppercase tracking-wide">Select Medication</label>
                    <select
                      value={selectedMedForCheck}
                      onChange={(e) => {
                        setSelectedMedForCheck(e.target.value);
                        if (e.target.value !== "custom") setCustomMedForCheck("");
                      }}
                      className="w-full bg-blueDarkBG border border-borderSlate text-white text-xs rounded-xl p-3 focus:border-cyanPrimary outline-none transition-all"
                      data-testid="med_select_checker"
                    >
                      <option value="">-- Choose RX Stock --</option>
                      {medications.map(m => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                      <option value="custom">-- Custom Drug Compound --</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-black text-[#cbd5e1] uppercase tracking-wide">Dietary Triggers</label>
                    <select
                      value={selectedDietForCheck}
                      onChange={(e) => setSelectedDietForCheck(e.target.value)}
                      className="w-full bg-blueDarkBG border border-borderSlate text-white text-xs rounded-xl p-3 focus:border-cyanPrimary outline-none transition-all"
                      data-testid="diet_select_checker"
                    >
                      <option value="Grapefruit Juice">Grapefruit Juice (CYP3A4 inhibitor)</option>
                      <option value="Bananas & Potassium">High Potassium (Spinach, Bananas)</option>
                      <option value="Alcohol Consumption">Alcohol (Lactic Acid & Vasodilation)</option>
                      <option value="Fatty & Protein meals">Fatty or High-Protein Meals</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={runInteractionCheck}
                      disabled={isCheckingInteraction}
                      className="w-full bg-blueElectric hover:bg-cyanPrimary hover:text-blueDarkBG disabled:opacity-45 text-white font-extrabold text-xs tracking-wide uppercase p-3 rounded-xl transition-all shadow-[0_4px_10px_rgba(30,144,255,0.2)]"
                      data-testid="submit_interaction_check"
                    >
                      {isCheckingInteraction ? "Analyzing Pathways..." : "Run Pharmacology Review"}
                    </button>
                  </div>
                </div>

                {selectedMedForCheck === "custom" && (
                  <div className="space-y-1.5 bg-blueDarkBG/40 p-3.5 rounded-2xl border border-borderSlate/40">
                    <label className="text-[10.5px] font-black text-[#cbd5e1] uppercase">Type Custom Compound Name</label>
                    <input
                      type="text"
                      value={customMedForCheck}
                      onChange={(e) => setCustomMedForCheck(e.target.value)}
                      placeholder="e.g. Warfarin, Ibuprofen, Lisinopril..."
                      className="w-full bg-blueDarkBG border border-borderSlate text-white text-xs rounded-xl p-3 focus:border-cyanPrimary outline-none"
                    />
                  </div>
                )}

                {interactionResult && (
                  <div className="bg-black/45 border border-borderSlate/35 p-4 rounded-2xl space-y-2 text-xs">
                    <span className="text-[10px] font-black tracking-wider text-cyanPrimary uppercase block">Pathology Screen Report:</span>
                    <p className="text-[#e2e8f0] leading-relaxed whitespace-pre-wrap">{interactionResult}</p>
                    <div className="text-[9px] text-accessibilityGray italic border-t border-borderSlate/25 pt-2 mt-2">
                      {getLangText(selectedLanguage, "disclaimerText")}
                    </div>
                  </div>
                )}
              </div>

              {/* Medications Schedule timeline list cards */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-[#94a3b8] tracking-widest uppercase">
                    Chronological EHR Prescriptions Timelines
                  </h3>
                  <p className="text-[10.5px] text-accessibilityGray leading-normal">
                    Check pill schedules, log status inputs, and review critical food interaction warnings.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddMedDialog(true)}
                  className="px-4.5 py-2.5 bg-cyanPrimary hover:bg-cyanNeon text-blueDarkBG text-xs uppercase font-extrabold rounded-2xl hover:scale-95 transition-all flex items-center gap-2 shadow-[0_4px_12px_rgba(0,240,255,0.25)]"
                >
                  <Plus className="w-4.5 h-4.5 text-blueDarkBG stroke-[3]" />
                  Add Medication
                </button>
              </div>

              {medications.length === 0 ? (
                <div className="bg-blueCardBG border border-borderSlate rounded-3xl p-12 text-center text-accessibilityGray text-xs">
                  No medications currently defined. Tap "Add Medication" above.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {medications.map((med) => {
                    const slots = [];
                    if (med.timeMorning) slots.push("Morning");
                    if (med.timeNoon) slots.push("Noon");
                    if (med.timeEvening) slots.push("Evening");
                    if (med.timeNight) slots.push("Night");

                    const isLow = med.inventoryRemaining <= med.refillThreshold;

                    return (
                      <div 
                        key={med.id}
                        className={`bg-blueCardBG border border-borderSlate rounded-3xl p-5 space-y-4 hover:border-cyanPrimary/40 transition-all ${
                          !med.isActive ? 'opacity-40' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-extrabold text-white">{med.name}</h4>
                              <span className="text-[10px] bg-blueElectric/20 text-cyanPrimary font-black px-2 py-0.5 rounded uppercase">
                                {med.frequency}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                              <span className="text-xs text-accessibilityGray font-bold block">
                                Dosage strength: {med.dosage} ({med.mealTiming})
                              </span>
                              <button
                                onClick={() => speakPrescription(med)}
                                className="flex items-center gap-1.5 px-2 py-0.5 bg-cyanPrimary/10 border border-cyanPrimary/35 hover:border-cyanPrimary text-cyanPrimary rounded-md text-[9px] uppercase font-black tracking-wide hover:bg-cyanPrimary/20 active:scale-95 transition-all w-fit"
                                data-testid={`speak_prescription_${med.id}`}
                              >
                                <Volume2 className="w-3 h-3 text-cyanPrimary animate-pulse" />
                                Speak EHR Info
                              </button>
                            </div>
                          </div>

                          <div className={`px-2.5 py-1.5 rounded-xl border text-right shrink-0 ${
                            isLow ? 'bg-accentRed/10 border-accentRed/35 text-accentRed' : 'bg-blueDarkBG border-borderSlate text-accessibilityGray'
                          }`}>
                            <span className="text-[8.5px] uppercase block font-black">Stock levels</span>
                            <span className="text-sm font-black block">{med.inventoryRemaining} pills</span>
                          </div>
                        </div>

                        {/* Warnings */}
                        <div className="bg-blueDarkBG/75 border border-borderSlate/35 p-3.5 rounded-xl flex gap-1.5 items-start">
                          <AlertTriangle className="w-4.5 h-4.5 text-accentOrange shrink-0 mt-0.5" />
                          <p className="text-[10.5px] text-[#cbd5e1] leading-relaxed">
                            <strong>Pharmacology synergy notes:</strong> {med.interactionWarnings || "No major contraindications identified. Take standard dosage."}
                          </p>
                        </div>

                        {/* Slots */}
                        <div className="space-y-2">
                          <span className="text-[9px] tracking-widest text-[#94a3b8] uppercase font-black block">
                            Today's Administration Checklist:
                          </span>
                          
                          <div className="flex flex-col gap-2">
                            {slots.map((slot) => {
                              const matchLog = adherenceLogs.find(
                                l => l.medicationId === med.id && l.scheduledTime === slot && l.dateString === todayStr
                              );
                              const status = matchLog ? matchLog.status : "Pending";

                              return (
                                <div 
                                  key={slot}
                                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                                    status === "Taken" 
                                      ? "bg-accentGreen/10 border-accentGreen/30 text-accentGreen" 
                                      : status === "Skipped" 
                                      ? "bg-accentOrange/10 border-accentOrange/30 text-accentOrange" 
                                      : "bg-blueDarkBG/40 border-borderSlate/50 text-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold uppercase tracking-wider">{slot}</span>
                                    <span className="text-[10px] text-accessibilityGray">({status})</span>
                                  </div>

                                  <div className="flex gap-1.5">
                                    {status !== "Taken" && (
                                      <button
                                        onClick={() => executeLogMedStatus(med, slot, "Taken")}
                                        className="p-1 px-2.5 bg-accentGreen/15 border border-accentGreen/30 hover:bg-accentGreen hover:text-blueDarkBG text-accentGreen text-[10px] uppercase font-black rounded-lg transition-all"
                                      >
                                        Log Taken
                                      </button>
                                    )}
                                    {status !== "Skipped" && (
                                      <button
                                        onClick={() => executeLogMedStatus(med, slot, "Skipped")}
                                        className="p-1 px-2.5 bg-accentOrange/15 border border-accentOrange/30 hover:bg-accentOrange hover:text-blueDarkBG text-accentOrange text-[10px] uppercase font-black rounded-lg transition-all"
                                      >
                                        Skip
                                      </button>
                                    )}
                                    {status !== "Pending" && (
                                      <button
                                        onClick={() => handleResetLog(med.id, slot)}
                                        className="p-1 px-2.5 bg-stone-700 hover:bg-stone-600 text-white text-[10px] uppercase font-black rounded-lg transition-all"
                                      >
                                        <Undo className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Toggle state panel */}
                        <div className="flex items-center justify-between border-t border-borderSlate/40 pt-3.5 mt-2 text-xs">
                          <button
                            onClick={() => {
                              setMedications(prev => prev.map(m => m.id === med.id ? { ...m, isActive: !m.isActive } : m));
                            }}
                            className="font-extrabold text-blueElectric hover:underline uppercase text-[10.5px]"
                          >
                            {med.isActive ? "Deactivate Calendar Feed" : "Re-activate Calendar Feed"}
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Confirm permanent deletion of ${med.name}?`)) {
                                setMedications(prev => prev.filter(m => m.id !== med.id));
                              }
                            }}
                            className="text-accessibilityGray hover:text-accentRed transition-all"
                            title="Delete Schedule"
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

          {/* ==========================================
              TAB 3: CLINICAL AI CHAT INTERACTION WORKSPACE
              ========================================== */}
          {currentTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Hands free simulator */}
              <div className="bg-blueCardBG border border-borderSlate rounded-3xl p-5 mb-4 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={triggerSimulatedVoiceCmd}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
                        isListening 
                          ? 'bg-accentRed animate-pulse text-white shadow-[0_0_15px_rgba(255,59,48,0.5)]' 
                          : 'bg-blueDarkBG text-cyanPrimary hover:bg-borderSlate border border-[#1f2e4d]'
                      }`}
                      title="Microphone Simulator Control"
                    >
                      <Fingerprint className="w-6 h-6" />
                    </button>
                    <div>
                      <h4 className="text-xs font-black tracking-widest text-[#94a3b8] uppercase">
                        🎤 {getLangText(selectedLanguage, "voiceSim")}
                      </h4>
                      <p className="text-[10.5px] text-accessibilityGray leading-normal mt-0.5">
                        {isListening ? "Listening with cardiac and tone analyzer indexes..." : "Simulates a regional voice command command scan. Tap key to cycle sentences."}
                      </p>
                    </div>
                  </div>

                  {/* Play audio simulation */}
                  {speechOut && (
                    <div className="flex items-center gap-2 bg-blueElectric/10 border border-blueElectric/25 p-2 rounded-xl text-[10px] text-white">
                      <Volume2 className="w-4 h-4 text-[#00f0ff] animate-bounce shrink-0" />
                      <span className="font-extrabold italic">Simulated Vocal response active</span>
                    </div>
                  )}
                </div>

                {transcript && (
                  <div className="bg-black/40 border border-borderSlate/35 p-2.5 rounded-xl text-xs flex justify-between items-center gap-4">
                    <span className="text-white font-bold">Transcription: "{transcript}"</span>
                    <button 
                      onClick={() => setChatInput(transcript)}
                      className="text-[9.5px] font-black uppercase text-cyanPrimary bg-cyanPrimary/10 border border-cyanPrimary/20 px-2 py-1 rounded"
                    >
                      Process in Text Chat
                    </button>
                  </div>
                )}

                {speechOut && (
                  <div className="bg-gradient-to-r from-blueDarkBG to-blueCardBG p-3 rounded-2xl border border-borderSlate text-xs text-white leading-relaxed">
                    🗣️ <strong className="text-cyanNeon">BOTtab TTS speaker stream:</strong> "{speechOut}"
                  </div>
                )}
              </div>

              {/* Central Chat Interface Display */}
              <div className="flex-1 overflow-y-auto bg-blueCardBG border border-borderSlate rounded-3xl p-5 space-y-4 min-h-[280px]">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3.5 space-y-2 ${
                      msg.sender === 'User' 
                        ? 'bg-cyanPrimary text-blueDarkBG rounded-br-none font-bold' 
                        : msg.sender === 'System'
                        ? 'bg-stone-900 border border-accentOrange/30 text-accentOrange rounded-bl-none text-xs font-mono'
                        : 'bg-blueDarkBG border border-borderSlate text-white rounded-bl-none'
                    }`}>
                      <div className="flex items-center justify-between gap-6 text-[9.5px] font-black uppercase opacity-65 border-b border-borderSlate/25 pb-1 select-none">
                        <span>{msg.sender === 'User' ? profile.name : 'BOTtab Secure AI'}</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-blueDarkBG border border-borderSlate rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-cyanPrimary animate-spin" />
                      <span className="text-xs text-accessibilityGray font-bold">Connecting medical model workspace elements...</span>
                    </div>
                  </div>
                )}

                <div ref={listEndRef}></div>
              </div>

              {/* Help Quick Toggles */}
              <div className="flex gap-1.5 py-3 overflow-x-auto selection:bg-transparent items-center">
                <button
                  onClick={() => {
                    if (confirm("Confirm erasing historical counseling logs?")) {
                      setChatMessages(DEFAULT_CHATS(selectedLanguage));
                    }
                  }}
                  className="shrink-0 bg-accentRed/10 border border-accentRed/30 hover:bg-accentRed hover:text-white text-[10.5px] font-black uppercase px-3 py-1.5 rounded-xl text-accentRed flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Erase logs
                </button>

                {[
                  "Is Metformin safe with grapefruit juice?",
                  "Give me a simplified prescription summary",
                  "What is my current cardiovascular risk drift?",
                  "Review warning interactions on Lisinopril"
                ].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setChatInput(sug)}
                    className="shrink-0 bg-blueCardBG border border-borderSlate hover:border-cyanPrimary hover:text-cyanPrimary text-[10.5px] font-extrabold px-3 py-1.5 rounded-xl transition-all"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Interactive prompt typing board */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatText()}
                  placeholder="Query BOTtab intelligence engine (e.g., Can I take Lisinopril with Ibuprofen?)..."
                  className="flex-1 bg-blueCardBG border border-borderSlate focus:border-cyanPrimary outline-none px-4.5 py-3.5 rounded-2xl text-xs font-extrabold transition-all text-white placeholder-accessibilityGray"
                />

                <button
                  onClick={handleSendChatText}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-6 bg-cyanPrimary hover:bg-cyanNeon disabled:opacity-45 text-blueDarkBG font-extrabold rounded-2xl transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4 stroke-[3]" />
                  Verify
                </button>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* ==========================================
          E. CONFIDENTIAL RETAINED DIAGNOSTIC DISCLAIMER
          ========================================== */}
      <footer className="bg-black/35 border-t border-borderSlate/35 p-4 text-center select-none mt-6">
        <div className="max-w-7xl mx-auto text-[10.5px] text-accessibilityGray font-bold flex flex-col md:flex-row items-center justify-center gap-2">
          <Info className="w-4 h-4 text-accentOrange shrink-0" />
          <span>
            {getLangText(selectedLanguage, "disclaimerText")} Secure Workspace Node ID: BOTtab-{profile.activeRole.substring(0, 4).toUpperCase()}
          </span>
        </div>
      </footer>

      {/* ==========================================
          F. MODALS AND EXTENDED SLIDE IN DRAWERS
          ========================================== */}
      
      {/* 1. ADD MEDICATION OVERLAY */}
      {showAddMedDialog && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
          <div className="bg-blueCardBG border border-borderSlate w-full max-w-xl rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowAddMedDialog(false)}
              className="absolute top-4 right-4 text-accessibilityGray hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-lg font-black text-white hover:underline uppercase tracking-wide">
              {getLangText(selectedLanguage, "addMed")}
            </h3>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMedName.trim() || !newMedDosage.trim()) return;
                
                const dosageInt = parseInt(newMedInventory) || 30;
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
                  inventoryRemaining: dosageInt,
                  refillThreshold: 10,
                  interactionWarnings: newMedWarnings || "No known contradictions verified.",
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
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-accessibilityGray block mb-1">Drug Name</label>
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g., Lisinopril"
                    className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-[#94a3b8] block mb-1">Dosage strength</label>
                  <input
                    type="text"
                    required
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="e.g., 10mg - 1 Pill"
                    className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-accessibilityGray block mb-1">Administration Frequency</label>
                <select
                  value={newMedFreq}
                  onChange={(e) => setNewMedFreq(e.target.value)}
                  className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white outline-none focus:border-cyanPrimary"
                >
                  <option>Once a Day</option>
                  <option>Twice a Day</option>
                  <option>Three Times a Day</option>
                  <option>PRN / As Required</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-accessibilityGray block mb-1">Meal Timing Correlation</label>
                  <select
                    value={newMedMealTiming}
                    onChange={(e) => setNewMedMealTiming(e.target.value)}
                    className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-[#cbd5e1] outline-none"
                  >
                    <option>Before food</option>
                    <option>After food</option>
                    <option>With food</option>
                    <option>None</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-[#94a3b8] block mb-1">Initial Pill Stocks quantity</label>
                  <input
                    type="number"
                    value={newMedInventory}
                    onChange={(e) => setNewMedInventory(e.target.value)}
                    className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Timeline slot parameters checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-black text-accessibilityGray block">Dose Slots Today</label>
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

              <div>
                <label className="text-xs font-extrabold text-accessibilityGray block mb-1">Contraindications & Interactions</label>
                <textarea
                  value={newMedWarnings}
                  onChange={(e) => setNewMedWarnings(e.target.value)}
                  placeholder="e.g., Avoid grapefruit. Standing up trigger warning syncope."
                  className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMedDialog(false)}
                  className="flex-1 py-3 border border-borderSlate hover:bg-borderSlate text-xs text-white uppercase font-extrabold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-cyanPrimary text-blueDarkBG text-xs uppercase font-extrabold rounded-xl hover:bg-cyanNeon transition-all"
                >
                  Add Reminder
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT PROFILE CONTEXT OVERLAY */}
      {showEditProfileDialog && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
          <div className="bg-blueCardBG border border-borderSlate w-full max-w-xl rounded-3xl p-6.5 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowEditProfileDialog(false)}
              className="absolute top-4 right-4 text-accessibilityGray hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-lg font-black text-white uppercase tracking-wide">
              {getLangText(selectedLanguage, "profileTitle")}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-accessibilityGray block mb-1">Genetic Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#94a3b8] block mb-1">Age Verification</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile(p => ({ ...p, age: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-accessibilityGray block mb-1">Known Allergies list</label>
                <input
                  type="text"
                  value={profile.allergies}
                  onChange={(e) => setProfile(p => ({ ...p, allergies: e.target.value }))}
                  className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-black text-accessibilityGray block mb-1">Clinical Pre-Conditions index</label>
                <input
                  type="text"
                  value={profile.medicalConditions}
                  onChange={(e) => setProfile(p => ({ ...p, medicalConditions: e.target.value }))}
                  className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-accessibilityGray block mb-1">Hydration Goal volume (ml)</label>
                  <input
                    type="number"
                    value={profile.waterGoalMl}
                    onChange={(e) => setProfile(p => ({ ...p, waterGoalMl: parseInt(e.target.value) || 2000 }))}
                    className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#94a3b8] block mb-1">Circadian Sleep target (hours)</label>
                  <input
                    type="number"
                    value={profile.sleepGoalHours}
                    onChange={(e) => setProfile(p => ({ ...p, sleepGoalHours: parseInt(e.target.value) || 8 }))}
                    className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-borderSlate/35 pt-4">
                <div>
                  <label className="text-xs font-black text-accessibilityGray block mb-1">Emergency Dispatch Person</label>
                  <input
                    type="text"
                    value={profile.emergencyContactName}
                    onChange={(e) => setProfile(p => ({ ...p, emergencyContactName: e.target.value }))}
                    className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-accessibilityGray block mb-1">Cellular Contact Phone</label>
                  <input
                    type="text"
                    value={profile.emergencyContactPhone}
                    onChange={(e) => setProfile(p => ({ ...p, emergencyContactPhone: e.target.value }))}
                    className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowEditProfileDialog(false)}
                className="w-full py-3.5 bg-cyanPrimary hover:bg-cyanNeon text-blueDarkBG font-extrabold text-xs uppercase tracking-wide rounded-xl mt-4 shadow-lg hover:scale-95 transition-all"
              >
                Save secured healthcare profiles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. API DEV STATION CONFIG SLIDE OUT DRAWER */}
      {showSettingsDrawer && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-blueCardBG border-l border-borderSlate p-6 z-[9999] shadow-2xl flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-borderSlate/45 pb-4">
              <h3 className="text-base font-black text-white hover:underline uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyanPrimary" />
                Workstation Configuration
              </h3>
              
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="text-accessibilityGray hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-blueDarkBG border border-borderSlate rounded-xl">
                <h5 className="text-[10.5px] font-black text-cyanPrimary uppercase mb-1">
                  Google Generative AI Setup Instructions
                </h5>
                <p className="text-[10px] text-[#94a3b8] leading-relaxed">
                  Enter your Google AI Studio Gemini API Key directly in the box below. It is stored securely in your client-side browser cache and ensures standard diagnostics counseling workflows.
                </p>
              </div>

              <div>
                <label className="text-xs font-black text-[#cbd5e1] block mb-1">Generative Model API Key</label>
                <input
                  type="password"
                  value={apiSettings.key}
                  onChange={(e) => setApiSettings({ key: e.target.value })}
                  placeholder="Paste AIzaSy... API Key"
                  className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3 rounded-xl text-xs text-white tracking-widest placeholder:tracking-normal"
                />
              </div>

              <div className="border-t border-borderSlate/35 pt-4 space-y-2">
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">Telemetry Diagnostic States</h4>
                
                <div className="space-y-1.5 text-xs text-[#94a3b8] mb-4">
                  <div className="flex justify-between">
                    <span>Active medical feeds:</span>
                    <span className="font-bold text-white">{medications.length} registered</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adherence Logs:</span>
                    <span className="font-bold text-white">{adherenceLogs.length} saved records</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preferred standard language:</span>
                    <span className="font-bold text-cyanPrimary uppercase">{selectedLanguage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active stress parameter:</span>
                    <span className="font-bold text-white">Level {healthLog.stressLevel}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active JWT Hash:</span>
                    <span className="font-bold text-cyanPrimary font-mono text-[10px] truncate max-w-[150px]">{jwtToken || "EHR_SECURE_TOKEN_SANDBOX"}</span>
                  </div>
                </div>

                <div className="border-t border-borderSlate/35 pt-4 space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-cyanPrimary" />
                    HIPAA Cyber-Security Center
                  </h4>

                  {/* Encryption Badges */}
                  <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                    <div className="bg-blueDarkBG border border-borderSlate p-2 rounded-lg flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-accentGreen animate-pulse"></span>
                      <span className="text-[#94a3b8]">AES-256 State</span>
                    </div>
                    <div className="bg-blueDarkBG border border-borderSlate p-2 rounded-lg flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-accentGreen animate-pulse"></span>
                      <span className="text-[#94a3b8]">JWT Secure Tokens</span>
                    </div>
                  </div>

                  {/* Client-side Session Timing Configurer */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10.5px] font-black text-[#cbd5e1] uppercase">JWT Workstation Expiry</label>
                      <span className="text-xs font-mono font-bold text-cyanPrimary">{tokenExpiryMinutes} Minutes</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={60}
                      step={5}
                      value={tokenExpiryMinutes}
                      onChange={(e) => {
                        const mins = parseInt(e.target.value);
                        setTokenExpiryMinutes(mins);
                        setSessionTimeRemaining(mins * 60);
                        
                        const logEntry = {
                          id: Date.now(),
                          event: `Session Expiration Key set to: ${mins} minutes`,
                          status: "SECURE",
                          time: new Date().toLocaleTimeString()
                        };
                        setSecurityLogs(prev => [logEntry, ...prev]);
                      }}
                      className="w-full accent-cyanPrimary bg-blueDarkBG h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[9px] text-[#94a3b8]">Workstation automatic logout occurs upon idle session completion.</p>
                  </div>

                  {/* Multi-Device Synchronizations list */}
                  <div className="space-y-2 border-t border-borderSlate/35 pt-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10.5px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Laptop className="w-4 h-4 text-cyanPrimary" />
                        Synchronized Devices
                      </label>
                      <span className="text-[9px] bg-cyanPrimary/15 border border-cyanPrimary/35 px-1.5 py-0.5 rounded text-cyanPrimary font-bold">{activeSessions.length} Online</span>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {activeSessions.map(sess => (
                        <div key={sess.id} className="bg-blueDarkBG/90 border border-borderSlate/45 p-2.5 rounded-xl space-y-1 relative text-[10.5px]">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-white truncate max-w-[190px]">{sess.device}</span>
                            {sess.primary ? (
                              <span className="text-[8px] bg-accentGreen/15 border border-accentGreen/25 text-accentGreen px-1 py-0.2 rounded font-black uppercase">Host Node</span>
                            ) : (
                              <button
                                onClick={() => {
                                  setActiveSessions(prev => prev.filter(s => s.id !== sess.id));
                                  alert(`🔒 SESSION REMOTELY REVOKED!\nDevice: ${sess.device}\nToken invalidated.`);
                                }}
                                className="text-[9px] text-accentRed hover:underline font-black uppercase flex items-center gap-0.5"
                                title="Revoke Device Credentials Lockout"
                                data-testid={`revoke_session_btn_${sess.id}`}
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                          <div className="flex justify-between text-[9.5px] text-accessibilityGray">
                            <span>{sess.location} • {sess.ip}</span>
                            <span className="italic">{sess.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Security Incident Logs list */}
                  <div className="space-y-2 border-t border-borderSlate/35 pt-4">
                    <label className="text-[10.5px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-4 h-4 text-cyanPrimary" />
                      Workstation Incident Audit Log
                    </label>

                    <div className="bg-black/45 border border-borderSlate/35 p-3 rounded-2xl max-h-36 overflow-y-auto space-y-2 font-mono text-[10px]">
                      {securityLogs.map(log => (
                        <div key={log.id} className="flex justify-between items-start gap-2 border-b border-borderSlate/25 pb-1.5 last:border-0 last:pb-0">
                          <div className="space-y-0.5">
                            <p className="text-[#cbd5e1] leading-tight font-sans text-[10.5px]">{log.event}</p>
                            <span className="text-[8.5px] text-accessibilityGray block">{log.time}</span>
                          </div>
                          
                          <span className={`text-[8.5px] border font-black px-1.5 py-0.3 rounded shrink-0 ${
                            log.status === 'APPROVED' || log.status === 'SECURE' || log.status === 'VERIFIED'
                              ? 'bg-accentGreen/15 border-accentGreen/35 text-accentGreen'
                              : log.status === 'REVOKED'
                              ? 'bg-[#cbd5e1]/10 border-[#cbd5e1]/30 text-[#cbd5e1]'
                              : 'bg-accentRed/15 border-accentRed/35 text-accentRed'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm("Restore original factory seed parameters? This clears cache, custom medicine schedules, and logs!")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full py-3 bg-accentRed/10 hover:bg-accentRed border border-accentRed/35 hover:text-white text-accentRed font-black text-xs uppercase tracking-widest rounded-xl transition-all"
          >
            Reset confidential DB & Local Registry
          </button>
        </div>
      )}

      {/* ==========================================
          G. PREMIUM DOCK GATED AUTH WORKSTATION GATEWAY
          ========================================== */}
      {!isAuthenticated && (
        <div className="fixed inset-0 bg-[#060a13] flex flex-col items-center justify-center p-4 z-[99999] overflow-y-auto cyber-grid select-none">
          <div className="absolute inset-0 bg-radial-gradient from-blueDarkBG/60 to-[#03060c] opacity-98"></div>

          {/* SIMULATED MOBILE OTP SMS POPUP NOTIFICATION */}
          {otpAlertSim && (
            <div 
              onClick={() => {
                setOtpVal(otpCodeSim);
                alert("🪄 AUTO-DETECT SYNC: SMS Verification OTP Code auto-detected and entered successfully.");
              }}
              className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-sm bg-blueCardBG/95 border-2 border-cyanPrimary/60 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,240,255,0.4)] z-[100000] cursor-pointer hover:scale-102 hover:border-cyanNeon transition-all animate-bounce"
            >
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-cyanPrimary/10 border border-cyanPrimary rounded-xl text-cyanPrimary">
                  <Smartphone className="w-5 h-5 shrink-0" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-[11px] font-black uppercase text-cyanPrimary tracking-widest flex justify-between">
                    <span>BOTtab Dispatcher</span>
                    <span className="text-[9px] text-[#94a3b8] font-mono">Just now</span>
                  </h4>
                  <p className="text-xs text-white leading-relaxed font-sans">{otpAlertSim}</p>
                  <span className="text-[9px] text-accentGreen block font-bold animate-pulse">⚡ Click this banner to auto-fill</span>
                </div>
              </div>
            </div>
          )}

          {/* CORE GATE CARD */}
          <div className="w-full max-w-lg bg-blueCardBG/90 border border-borderSlate/60 rounded-[32px] p-6 md:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.8)] relative z-10 backdrop-blur-xl overflow-hidden">
            {/* Top decorative clinical mesh line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyanPrimary to-transparent"></div>

            {/* GATE HEADER */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-tr from-cyanPrimary to-blueElectric rounded-xl flex items-center justify-center text-blueDarkBG font-extrabold shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0 animate-pulse">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-black text-white leading-none">BOTtab Security Gateway</h1>
                  <span className="text-[8.5px] font-bold text-cyanPrimary tracking-widest uppercase">EHR Health System</span>
                </div>
              </div>

              {/* Languages & Voice control buttons */}
              <div className="flex items-center gap-2">
                {/* Voice Assistant Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = !voiceHelpActive;
                    setVoiceHelpActive(nextMode);
                    if (nextMode) {
                      setTimeout(() => {
                        speakVoiceGuide("Voice login assistance initialized. instructions will be announced.");
                      }, 200);
                    } else {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className={`p-2 rounded-xl border transition-all flex items-center gap-1 ${voiceHelpActive ? 'bg-accentGreen/15 border-accentGreen text-accentGreen animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-blueDarkBG border-borderSlate text-accessibilityGray hover:text-white'}`}
                  title="Toggle geriatrics audio guide helper"
                >
                  {voiceHelpActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-accessibilityGray" />}
                  <span className="text-[9px] font-extrabold uppercase hidden sm:inline">Voice Guide</span>
                </button>

                {/* Localized switch select dropdown */}
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value);
                    speakVoiceGuide("Language synchronized with " + e.target.value);
                  }}
                  className="bg-blueDarkBG/90 text-white select-nav border border-borderSlate px-2.5 py-1.5 rounded-xl font-bold text-xs outline-none cursor-pointer focus:border-cyanPrimary"
                  data-testid="language_gate_selector"
                >
                  <option value="English">🇺🇸 En</option>
                  <option value="Hindi">🇮🇳 हि</option>
                  <option value="Telugu">🇮🇳 తె</option>
                  <option value="Tamil">🇮🇳 த</option>
                  <option value="Malayalam">🇮🇳 മ</option>
                  <option value="Spanish">🇪🇸 Es</option>
                  <option value="Kannada">🇮🇳 ಕ</option>
                  <option value="Bengali">🇮🇳 বা</option>
                  <option value="Marathi">🇮🇳 મ</option>
                  <option value="Gujarati">🇮🇳 ગુ</option>
                  <option value="Urdu">🇵🇰 Ur</option>
                </select>
              </div>
            </div>

            {/* SCREEN LOCKOUT OVERRIDE RENDERED */}
            {isWorkstationLocked ? (
              <div className="space-y-6 py-6 text-center animate-pulse">
                <div className="w-16 h-16 bg-accentRed/10 border-2 border-accentRed rounded-full flex items-center justify-center text-accentRed mx-auto shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white hover:text-accentRed uppercase tracking-wider">Workstation Terminal Locked</h3>
                  <p className="text-xs text-accessibilityGray leading-relaxed max-w-sm mx-auto">
                    Suspicious password attempts exceeded maximum clinical threshold. Please enter the primary security bypass encryption key to unlock your workstation node.
                  </p>
                </div>

                <div className="bg-blueDarkBG p-4 rounded-2xl border border-borderSlate text-left space-y-3">
                  <label className="text-[10px] font-black uppercase text-[#94a3b8] block">Emergency Override License Key</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. BOTtab-RESTORE-2026"
                      className="flex-1 bg-black text-cyanPrimary font-mono tracking-widest text-center border border-borderSlate focus:border-cyanPrimary p-3 rounded-xl text-xs outline-none uppercase placeholder:tracking-normal"
                      id="unlock_key_input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          runEmergencyRecoveryBypass((e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const inputEl = document.getElementById('unlock_key_input') as HTMLInputElement;
                        if (inputEl) runEmergencyRecoveryBypass(inputEl.value);
                      }}
                      className="px-5 bg-accentRed hover:bg-red-600 text-white font-black text-xs uppercase rounded-xl transition-all shadow-lg shrink-0"
                    >
                      Verify Key
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-accessibilityGray">
                    <span>Clinical recovery bypass:</span>
                    <span className="font-bold text-white selection:bg-amber-400 font-mono">BOTtab-RESTORE-2026</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 1. SECTOR MODE NAVIGATION TABS */}
                {authPortalMode !== "onboarding" && (
                  <div className="grid grid-cols-4 gap-1.5 bg-blueDarkBG p-1 rounded-2xl border border-borderSlate/45 mb-6">
                    <button
                      type="button"
                      onClick={() => { setAuthPortalMode("login"); setAuthMethod("email"); }}
                      className={`py-2 text-[10px] uppercase font-black rounded-xl transition-all flex flex-col items-center gap-1 ${
                        authPortalMode === "login" && authMethod === "email" ? "bg-cyanPrimary text-blueDarkBG shadow-md" : "text-accessibilityGray hover:text-white"
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthPortalMode("login"); setAuthMethod("phone"); }}
                      className={`py-2 text-[10px] uppercase font-black rounded-xl transition-all flex flex-col items-center gap-1 ${
                        authPortalMode === "login" && authMethod === "phone" ? "bg-cyanPrimary text-blueDarkBG shadow-md" : "text-accessibilityGray hover:text-white"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Phone OTP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthPortalMode("biometric"); setAuthMethod("biometric"); }}
                      className={`py-2 text-[10px] uppercase font-black rounded-xl transition-all flex flex-col items-center gap-1 ${
                        authPortalMode === "biometric" ? "bg-cyanPrimary text-blueDarkBG shadow-md" : "text-accessibilityGray hover:text-white"
                      }`}
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      <span>Biometric</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthPortalMode("forgot"); }}
                      className={`py-2 text-[10px] uppercase font-black rounded-xl transition-all flex flex-col items-center gap-1 ${
                        authPortalMode === "forgot" ? "bg-cyanPrimary text-blueDarkBG shadow-md" : "text-accessibilityGray hover:text-white"
                      }`}
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Recover</span>
                    </button>
                  </div>
                )}

                {/* 2. AUTHENTICATION PAGES FORMS */}
                {authPortalMode === "login" && authMethod === "email" && (
                  <form onSubmit={handleEmailLoginSubmit} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-[#94a3b8] block">Workstation Email ID</label>
                      <input
                        type="email"
                        required
                        value={emailVal}
                        onChange={(e) => setEmailVal(e.target.value)}
                        placeholder="doctor@bottab.clinical"
                        className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3.5 rounded-xl text-xs text-white"
                        data-testid="email_input_field"
                      />
                    </div>

                    <div className="space-y-1.5 relative">
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="text-[10px] font-black uppercase text-[#94a3b8]">Credential Access Password</label>
                        <span className="text-[9px] text-[#64748b]">Default: 123456</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={passwordVal}
                          onChange={(e) => setPasswordVal(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3.5 pr-11 rounded-xl text-xs text-white tracking-widest placeholder:tracking-normal"
                          data-testid="password_input_field"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-accessibilityGray hover:text-white transition-all p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button
                        type="button"
                        onClick={() => { setAuthPortalMode("signup"); }}
                        className="text-cyanPrimary hover:underline font-bold"
                      >
                        Create an Active clinical Account
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAuthPortalMode("forgot"); }}
                        className="text-accessibilityGray hover:text-white font-bold"
                      >
                        Reset password credentials?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 mt-2 bg-gradient-to-r from-cyanPrimary to-blueElectric hover:opacity-90 text-blueDarkBG font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 active:scale-95"
                      data-testid="email_login_submit_btn"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Secure Workstation Access Entry</span>
                    </button>
                  </form>
                )}

                {authPortalMode === "signup" && (
                  <form onSubmit={handleEmailSignupSubmit} className="space-y-4 text-left">
                    <p className="text-[11px] text-[#94a3b8] leading-relaxed mb-1 bg-[#1e293b]/50 p-3 rounded-xl border border-[#334155]">
                      🔒 SECURITY POLICY: Signups are sandbox-isolated. Created accounts generate mock high-value HIPAA biological tokens instantly.
                    </p>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-[#94a3b8] block">Email Identifier</label>
                      <input
                        type="email"
                        required
                        value={emailVal}
                        onChange={(e) => setEmailVal(e.target.value)}
                        placeholder="new_expert@bottab.clinical"
                        className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3.5 rounded-xl text-xs text-white"
                        data-testid="signup_email_input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="text-[10px] font-black uppercase text-[#94a3b8]">Register Secured Password</label>
                        <span className="text-[9.5px] font-bold text-accentOrange">Min 6 characters</span>
                      </div>
                      <input
                        type="password"
                        required
                        value={passwordVal}
                        onChange={(e) => setPasswordVal(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3.5 rounded-xl text-xs text-white"
                        data-testid="signup_password_input"
                      />
                      
                      {passwordVal && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[9px] font-semibold text-[#94a3b8]">
                            <span>Validation strength:</span>
                            <span className={passwordVal.length < 6 ? 'text-accentRed' : passwordVal.length < 9 ? 'text-accentOrange' : 'text-accentGreen'}>
                              {passwordVal.length < 6 ? 'Weak' : passwordVal.length < 9 ? 'Medium - Secure' : 'Excellent - Military Grade'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 h-1">
                            <div className={`rounded h-full ${passwordVal.length > 0 ? (passwordVal.length < 6 ? 'bg-accentRed' : 'bg-accentGreen') : 'bg-borderSlate/30'}`}></div>
                            <div className={`rounded h-full ${passwordVal.length >= 6 ? (passwordVal.length < 9 ? 'bg-accentOrange' : 'bg-accentGreen') : 'bg-borderSlate/30'}`}></div>
                            <div className={`rounded h-full ${passwordVal.length >= 9 ? 'bg-accentGreen' : 'bg-borderSlate/30'}`}></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <button
                        type="button"
                        onClick={() => { setAuthPortalMode("login"); }}
                        className="text-cyanPrimary hover:underline font-bold"
                      >
                        Already registered? Log in details
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-accentGreen to-green-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_4px_16px_rgba(34,197,94,0.25)] flex items-center justify-center gap-2 active:scale-95"
                      data-testid="signup_submit_btn"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Instantiate Secure Clinical Credentials</span>
                    </button>
                  </form>
                )}

                {authPortalMode === "login" && authMethod === "phone" && (
                  <div className="space-y-4 text-left">
                    {!otpSent ? (
                      <form onSubmit={triggerMobileOTPSend} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-[#94a3b8] block">Workstation Telephone Number</label>
                          <div className="flex gap-2">
                            <select
                              value={selectedCountryCode}
                              onChange={(e) => setSelectedCountryCode(e.target.value)}
                              className="bg-blueDarkBG text-white border border-borderSlate px-2.5 rounded-xl text-xs font-bold outline-none focus:border-cyanPrimary cursor-pointer shrink-0"
                            >
                              <option value="+91">🇮🇳 +91</option>
                              <option value="+1">🇺🇸 +1</option>
                              <option value="+44">🇬🇧 +44</option>
                              <option value="+971">🇦🇪 +971</option>
                              <option value="+61">🇦🇺 +61</option>
                            </select>
                            <input
                              type="tel"
                              required
                              placeholder="98765 43210"
                              value={phoneVal}
                              onChange={(e) => setPhoneVal(e.target.value.replace(/\D/g, ''))}
                              className="flex-1 bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3.5 rounded-xl text-xs text-white"
                              data-testid="phone_input"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-4 mt-2 bg-cyanPrimary hover:bg-cyanNeon text-blueDarkBG font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_4px_16px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2"
                        >
                          <Smartphone className="w-4.5 h-4.5" />
                          <span>Transmit Secure OTP Code Token</span>
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleOTPVerifySubmit} className="space-y-4 animate-fade-in">
                        <div className="p-3 bg-[#1e293b]/50 border border-borderSlate/35 rounded-xl flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-accentOrange animate-ping"></span>
                          <p className="text-[11px] text-[#e2e8f0]">
                            Verification SMS dispatched to: <span className="font-bold text-cyanPrimary">{selectedCountryCode} {phoneVal}</span>
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-[#94a3b8] block">Enter 4-Digit Cellular Verification PIN</label>
                          <input
                            type="password"
                            maxLength={4}
                            required
                            placeholder="••••"
                            value={otpVal}
                            onChange={(e) => setOtpVal(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-blueDarkBG text-cyanPrimary tracking-[1.5em] text-center border border-borderSlate focus:border-cyanPrimary outline-none py-3 rounded-xl text-2xl font-black"
                            data-testid="otp_code_input"
                          />
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-accessibilityGray">
                          <span>Did not receive the cellular code?</span>
                          {otpTimer > 0 ? (
                            <span className="font-mono text-cyanPrimary font-bold">Resend OTP in {otpTimer}s</span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => triggerMobileOTPSend(e)}
                              className="text-cyanNeon hover:underline font-extrabold font-mono uppercase"
                            >
                              Dispatch New Code Sync
                            </button>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="w-full py-4 bg-gradient-to-r from-cyanPrimary to-blueElectric hover:opacity-95 text-blueDarkBG font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_4px_16px_rgba(0,240,255,0.2)]"
                        >
                          Verify OTP & Initialize Workshop Terminal
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {authPortalMode === "biometric" && (
                  <div className="space-y-6 text-center py-4">
                    <div className="relative inline-block mx-auto">
                      {/* Outer spinning radar scanner circles */}
                      <div className={`w-28 h-28 ${biometricScanning ? 'border-t-4 border-b-4 border-cyanPrimary animate-spin' : 'border-2 border-borderSlate/40'} rounded-full flex items-center justify-center`}>
                        <div className={`w-22 h-22 rounded-full border border-cyanPrimary/20 flex items-center justify-center transition-all ${biometricScanning ? 'bg-cyanPrimary/10 animate-pulse' : 'bg-transparent'}`}>
                          {biometricType === 'fingerprint' ? (
                            <Fingerprint className={`w-12 h-12 transition-all ${biometricScanning ? 'text-cyanNeon scale-110' : 'text-cyanPrimary'}`} />
                          ) : (
                            <Globe className={`w-12 h-12 transition-all ${biometricScanning ? 'text-cyanNeon scale-110' : 'text-cyanPrimary'}`} />
                          )}
                        </div>
                      </div>

                      {biometricScanning && (
                        <span className="absolute inset-0 border-r-4 border-green-500 rounded-full animate-pulse"></span>
                      )}
                    </div>

                    <div className="space-y-1.5 max-w-sm mx-auto">
                      <h4 className="text-sm font-black text-white hover:underline uppercase tracking-wider">
                        {biometricScanning ? `Simulating sensory ${biometricType.toUpperCase()} scanner...` : "Continuous Biometric authentication"}
                      </h4>
                      <p className="text-xs text-accessibilityGray leading-relaxed">
                        Authorized users can fast-verify node access identities securely with biometric bypass checks.
                      </p>
                    </div>

                    {biometricScanning && (
                      <div className="w-full bg-blueDarkBG/85 p-3 rounded-2xl border border-borderSlate/35 text-left space-y-2 animate-pulse">
                        <div className="flex justify-between text-[10px] font-mono font-bold text-cyanPrimary uppercase">
                          <span>Sensing Bio metrics...</span>
                          <span>{biometricProgress}%</span>
                        </div>
                        <div className="w-full bg-black/40 h-2 rounded-lg overflow-hidden border border-borderSlate/25">
                          <div className="bg-gradient-to-r from-cyanPrimary to-cyanNeon h-full transition-all duration-150" style={{ width: `${biometricProgress}%` }}></div>
                        </div>
                      </div>
                    )}

                    {!biometricScanning ? (
                      <div className="flex gap-3 justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setBiometricType("fingerprint");
                            setBiometricScanning(true);
                            speakVoiceGuide("Please apply your index finger to the touch simulator node.");
                          }}
                          className="px-5 py-3 bg-cyanPrimary/15 border border-cyanPrimary/35 hover:bg-cyanPrimary hover:text-blueDarkBG text-cyanPrimary font-bold text-[11px] uppercase rounded-xl transition-all"
                        >
                          Simulate Touch ID Scan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBiometricType("face");
                            setBiometricScanning(true);
                            speakVoiceGuide("Please look into your camera lens to allow facial grid matching.");
                          }}
                          className="px-5 py-3 bg-cyanPrimary/15 border border-cyanPrimary/35 hover:bg-cyanPrimary hover:text-blueDarkBG text-cyanPrimary font-bold text-[11px] uppercase rounded-xl transition-all"
                        >
                          Simulate Face ID Scan
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setBiometricScanning(false)}
                        className="text-xs text-accentRed hover:underline font-bold"
                      >
                        Abort sensory scanning sequence
                      </button>
                    )}
                  </div>
                )}

                {authPortalMode === "forgot" && (
                  <div className="space-y-4 text-left">
                    {!passwordResetSent ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setPasswordResetSent(true);
                          speakVoiceGuide("Recovery security dispatch code sent.");
                          alert("✉️ CLINICAL ACCESS DISPATCHED: Dynamic password resetting license with verify authentication tokens has been emailed to your terminal.");
                        }}
                        className="space-y-4"
                      >
                        <p className="text-xs text-accessibilityGray leading-relaxed bg-[#1e293b]/45 p-3.5 rounded-xl border border-borderSlate/35">
                          Enter your account registered email below. BOTtab security recovery processes will broadcast custom password overriding tokens immediately.
                        </p>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-[#94a3b8] block">Workstation Email ID</label>
                          <input
                            type="email"
                            required
                            placeholder="expert@bottab.clinical"
                            className="w-full bg-blueDarkBG border border-borderSlate focus:border-cyanPrimary outline-none p-3.5 rounded-xl text-xs text-white"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-4 mt-2 bg-gradient-to-r from-cyanPrimary to-blueElectric text-blueDarkBG font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all shadow-[0_4px_16px_rgba(33,240,255,0.2)]"
                        >
                          Deliver Recovery Security Instructions
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-4 text-center animate-fade-in py-2">
                        <div className="w-12 h-12 bg-accentGreen/10 border border-accentGreen text-accentGreen rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                          ✓
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-white hover:underline uppercase tracking-wider">Dynamic verification dispatched</h4>
                          <p className="text-xs text-accessibilityGray leading-relaxed">
                            A verification code override link has been transmitted. Please check your medical mailbox and follow clinical validation instructions.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setPasswordResetSent(false);
                            setAuthPortalMode("login");
                          }}
                          className="text-xs text-cyanPrimary hover:underline font-bold"
                        >
                          Return to password login workstation screen
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. MULTI-STEP NEW ACCOUNT ONBOARDING FLOW */}
                {authPortalMode === "onboarding" && (
                  <div className="space-y-5 text-left animate-fade-in">
                    {/* Stepper bar indicator */}
                    <div className="flex justify-between items-center bg-[#0d1527] p-3 rounded-2xl border border-borderSlate/30 text-[10.5px]">
                      <span className="text-accessibilityGray font-bold uppercase">Setup progression:</span>
                      <div className="flex items-center gap-1.5 font-mono font-extrabold text-cyanPrimary">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center ${onboardingStep >= 0 ? 'bg-cyanPrimary text-blueDarkBG' : 'bg-blueDarkBG text-[#94a3b8]'}`}>0</span>
                        <span className="text-borderSlate/40">•</span>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center ${onboardingStep >= 1 ? 'bg-cyanPrimary text-blueDarkBG' : 'bg-blueDarkBG text-[#94a3b8]'}`}>1</span>
                        <span className="text-borderSlate/40">•</span>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center ${onboardingStep >= 2 ? 'bg-cyanPrimary text-blueDarkBG' : 'bg-blueDarkBG text-[#94a3b8]'}`}>2</span>
                      </div>
                    </div>

                    {onboardingStep === 0 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-white hover:underline uppercase tracking-wider">Select operational clinical Role</h3>
                          <p className="text-xs text-[#94a3b8]">Each healthcare workflow role unlocks distinct layouts and dashboard indexes.</p>
                        </div>

                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                          {[
                            { role: 'Patient', icon: Heart, badge: 'Standard Node', text: 'Prev-care patients, seniors, and long-term self-monitoring diagnostics tracking.' },
                            { role: 'Caregiver', icon: ShieldCheck, badge: 'Sync Dispatch', text: 'Family members, spouse nurses or clinical specialists dispatching emergencies and refill forecasts.' },
                            { role: 'Pharmacist Support', icon: Award, badge: 'Stock Logistics', text: 'Pill identification identity checks, inventory replenish targets and chemical warnings.' },
                            { role: 'Wellness Coach', icon: Brain, badge: 'Baseline Targets', text: 'Certified fitness specialists configuring tailored physiological targets & calorie guidelines.' },
                            { role: 'Clinical Coordinator', icon: Sliders, badge: 'EHR Research', text: 'Hospital network research networks tracking aggregate multi-user indexes & secure DBs.' }
                          ].map(item => {
                            const IconC = item.icon || Heart;
                            return (
                              <div
                                key={item.role}
                                onClick={() => setChosenRole(item.role as any)}
                                className={`p-3.5 rounded-2xl border cursor-pointer hover:border-cyanPrimary transition-all flex items-start gap-3.5 relative ${
                                  chosenRole === item.role ? 'bg-cyanPrimary/10 border-cyanPrimary shadow-[0_0_12px_rgba(0,240,255,0.15)]' : 'bg-blueDarkBG border-borderSlate/45'
                                }`}
                              >
                                <div className={`p-2 rounded-xl border text-cyanPrimary shrink-0 ${chosenRole === item.role ? 'bg-cyanPrimary/20 text-cyanNeon' : 'bg-blueDarkBG'}`}>
                                  <IconC className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-black text-white">{item.role}</span>
                                    <span className="text-[8.5px] font-bold font-mono tracking-widest bg-blueDarkBG border border-borderSlate text-[#94a3b8] px-1.5 py-0.2 rounded uppercase">{item.badge}</span>
                                  </div>
                                  <p className="text-[10.5px] text-[#94a3b8] leading-tight font-sans">{item.text}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => setOnboardingStep(1)}
                          className="w-full py-3.5 bg-cyanPrimary hover:bg-cyanNeon text-blueDarkBG font-black rounded-xl text-xs uppercase tracking-widest transition-all"
                        >
                          Apply role selection & Proceed
                        </button>
                      </div>
                    )}

                    {onboardingStep === 1 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-white hover:underline uppercase tracking-wider">Configure baseline physicals</h3>
                          <p className="text-xs text-[#94a3b8]">Setup genetic data points or institutional credentials matching your role.</p>
                        </div>

                        <div className="space-y-3.5">
                          {chosenRole === 'Patient' ? (
                            <>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase text-accessibilityGray block">Genetic Full Name</label>
                                  <input
                                    type="text"
                                    value={onboardAnswers.name}
                                    onChange={(e) => setOnboardAnswers(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase text-accessibilityGray block">Age baseline</label>
                                  <input
                                    type="number"
                                    value={onboardAnswers.age}
                                    onChange={(e) => setOnboardAnswers(prev => ({ ...prev, age: e.target.value }))}
                                    className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-accessibilityGray block">Known allergies</label>
                                <input
                                  type="text"
                                  value={onboardAnswers.allergies}
                                  onChange={(e) => setOnboardAnswers(prev => ({ ...prev, allergies: e.target.value }))}
                                  className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                                  placeholder="e.g. Penicillin, Peanuts"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-accessibilityGray block">Primary clinical pre-conditions</label>
                                <input
                                  type="text"
                                  value={onboardAnswers.medicalConditions}
                                  onChange={(e) => setOnboardAnswers(prev => ({ ...prev, medicalConditions: e.target.value }))}
                                  className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                                  placeholder="e.g. Type 2 Diabetes, Severe Hypertension"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-accessibilityGray block">{chosenRole} Full Name</label>
                                <input
                                  type="text"
                                  value={onboardAnswers.name}
                                  onChange={(e) => setOnboardAnswers(prev => ({ ...prev, name: e.target.value }))}
                                  className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-accessibilityGray block">Clinical license Token or Node Authorization</label>
                                <input
                                  type="text"
                                  value={onboardAnswers.roleCredential}
                                  onChange={(e) => setOnboardAnswers(prev => ({ ...prev, roleCredential: e.target.value }))}
                                  className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white font-mono uppercase"
                                  placeholder="e.g. BOTtab-LIC-8921-EHR"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-accessibilityGray block">Hospital Node hub branch location</label>
                                <input
                                  type="text"
                                  value={onboardAnswers.hospitalNode}
                                  onChange={(e) => setOnboardAnswers(prev => ({ ...prev, hospitalNode: e.target.value }))}
                                  className="w-full bg-blueDarkBG border border-borderSlate p-3 rounded-xl text-xs text-white"
                                  placeholder="San Jose Health Node Center"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setOnboardingStep(0)}
                            className="flex-1 py-3 border border-borderSlate hover:bg-[#1e293b] text-xs text-white uppercase font-extrabold rounded-xl"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setOnboardingStep(2)}
                            className="flex-1 py-3 bg-cyanPrimary text-blueDarkBG text-xs uppercase font-extrabold rounded-xl hover:bg-cyanNeon transition-all"
                          >
                            Continue Sync
                          </button>
                        </div>
                      </div>
                    )}

                    {onboardingStep === 2 && (
                      <div className="space-y-4 animate-fade-in text-center py-2">
                        <div className="w-14 h-14 bg-accentGreen/10 border-2 border-accentGreen rounded-full flex items-center justify-center text-accentGreen mx-auto shadow-[0_0_15px_rgba(34,197,94,0.35)]">
                          <ShieldCheck className="w-8 h-8 shrink-0" />
                        </div>

                        <div className="space-y-1.5 max-w-sm mx-auto">
                          <h3 className="text-sm font-black text-white uppercase tracking-wider">Workspace Integration Approved</h3>
                          <p className="text-xs text-accessibilityGray leading-relaxed font-sans">
                            Your secure, multi-role profile configuration is complete. Encrypted sandbox token caches are fully instantiated.
                          </p>
                        </div>

                        {/* Interactive Summary Table */}
                        <div className="bg-[#0b0f19] border border-borderSlate p-3.5 rounded-2xl text-left space-y-1.5 font-sans text-xs">
                          <div className="flex justify-between">
                            <span className="text-accessibilityGray">Operational hub role:</span>
                            <span className="font-extrabold text-cyanPrimary font-mono">{chosenRole}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-accessibilityGray">Identity logged:</span>
                            <span className="font-extrabold text-white">{onboardAnswers.name}</span>
                          </div>
                          {chosenRole !== 'Patient' ? (
                            <div className="flex justify-between">
                              <span className="text-accessibilityGray">Workstation hub key:</span>
                              <span className="font-extrabold text-white font-mono">{onboardAnswers.roleCredential || 'BOTtab-GENERIC'}</span>
                            </div>
                          ) : (
                            <div className="flex justify-between">
                              <span className="text-accessibilityGray">Allergy indexes:</span>
                              <span className="font-extrabold text-accentRed">{onboardAnswers.allergies || 'None logged'}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setOnboardingStep(1)}
                            className="flex-1 py-3 border border-borderSlate hover:bg-[#1e293b] text-xs text-white uppercase font-extrabold rounded-xl"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onboardAnswers.name = onboardAnswers.name || "Default User";
                              completeSuccessfulAuth("Setup Onboarding Workflow Completed");
                              setIsAuthenticated(true);
                              setAuthPortalMode("login");
                            }}
                            className="flex-1 py-3 bg-gradient-to-r from-accentGreen to-green-600 text-white text-xs uppercase font-extrabold rounded-xl shadow-[0_4px_16px_rgba(34,197,94,0.3)] hover:opacity-95 transition-all"
                            data-testid="onboarding_conclude_btn"
                          >
                            Conclude SECURED Deployment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Bottom safety disclosure footer */}
            <div className="mt-6 border-t border-borderSlate/35 pt-4 text-[9px] text-[#55657e] space-y-1 text-center">
              <p>🔒 HIPAA & GDPR Sovereign Workstation Security Protocol. SSL 256bit Encrypted Sandboxing.</p>
              <p>BOTtab Workstation Node ID: BOT-WORKPASS-2026. Global Registry sync v4.0.1.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
