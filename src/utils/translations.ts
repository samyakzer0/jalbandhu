// All translation keys used in the application
// When adding a new key, add it here and in the English translations object
type TranslationKeys =
  | 'welcome'
  | 'signInWithGoogle'
  | 'signInWithTwitter'
  | 'continueAnonymously'
  | 'or'
  | 'home'
  | 'report'
  | 'status'
  | 'profile'
  | 'makeYourVoiceHeard'
  | 'reportNewIssue'
  | 'communityImpact'
  | 'issuesResolved'
  | 'avgResponseTime'
  | 'recentUpdates'
  | 'reportIssue'
  | 'title'
  | 'briefDescription'
  | 'imageUpload'
  | 'location'
  | 'category'
  | 'submitReport'
  | 'reportStatus'
  | 'signInRequired'
  | 'pleaseSignIn'
  | 'signIn'
  | 'personalInformation'
  | 'email'
  | 'phone'
  | 'password'
  | 'notificationPreferences'
  | 'pushNotifications'
  | 'emailNotifications'
  | 'appSettings'
  | 'language'
  | 'theme'
  | 'about'
  | 'logout'
  | 'aboutJalBandhu'
  | 'aboutDescription'
  | 'mission'
  | 'vision'
  | 'contactUs'
  | 'change'
  | 'welcomeToCity'
  | 'yourReports'
  | 'seeAll'
  | 'analyzing'
  | 'aiDetected'
  | 'reportSubmitted'
  | 'yourReferenceNumber'
  | 'statusUpdateNotification'
  | 'viewStatus'
  | 'close'
  | 'takePhoto'
  | 'useLocation'
  | 'currentLocation'
  | 'changeLocation'
  | 'previewReport'
  | 'confirmSubmit'
  | 'processingImage'
  | 'clickToAdjustLocation'
  | 'adminPanel'
  | 'adminLogin'
  | 'categoryAdmin'
  | 'liveIssuesMap';

type Translations = {
  [key: string]: string; // Allow any string key for flexibility
};

type LanguageMap = {
  [key: string]: Translations;
};

const translations: LanguageMap = {
  en: {
    welcome: 'Welcome to JalBandhu',
    signInWithGoogle: 'Sign in with Google',
    signInWithTwitter: 'Sign in with Twitter',
    continueAnonymously: 'Continue Anonymously',
    or: 'or',
    home: 'Home',
    report: 'Report',
    status: 'Status',
    profile: 'Profile',
    makeYourVoiceHeard: 'Make Your Voice Heard',
    reportNewIssue: 'Report New Issue',
    communityImpact: 'Community Impact',
    issuesResolved: 'Issues Resolved',
    avgResponseTime: 'Avg Response Time',
    recentUpdates: 'Recent Updates',
    reportIssue: 'Report an Issue',
    title: 'Title',
    briefDescription: 'Brief Description',
    imageUpload: 'Image Upload',
    location: 'Location',
    category: 'Category',
    submitReport: 'Submit Report',
    reportStatus: 'Report Status',
    signInRequired: 'Sign In Required',
    pleaseSignIn: 'Please sign in to access your profile and preferences.',
    signIn: 'Sign In',
    personalInformation: 'Personal Information',
    email: 'Email',
    phone: 'Phone',
    password: 'Password',
    notificationPreferences: 'Notification Preferences',
    pushNotifications: 'Push Notifications',
    emailNotifications: 'Email Notifications',
    appSettings: 'App Settings',
    language: 'Language',
    theme: 'Theme',
    about: 'About',
    logout: 'Logout',
    aboutJalBandhu: 'About JalBandhu',
    aboutDescription: 'SagarSetu is a comprehensive ocean hazard reporting and social media monitoring platform designed to bridge the communication gap between coastal communities and maritime authorities for INCOIS (Indian National Centre for Ocean Information Services).',
    mission: 'Our mission is to empower coastal communities to actively participate in maritime safety by providing a seamless platform for reporting and monitoring ocean hazards and extreme weather events.',
    vision: 'We envision safer coastal communities where every citizen\'s voice is heard and valued, leading to faster response to ocean hazards and improved maritime safety.',
    contactUs: 'Contact Us',
    change: 'Change',
    welcomeToCity: 'Your voice for a better community. Report issues, track progress, and help make your neighborhood a better place.',
    yourReports: 'Your Reports',
    seeAll: 'See All',
    analyzing: 'Analyzing image...',
    aiDetected: 'AI detected the following:',
    reportSubmitted: 'Report Submitted Successfully!',
    yourReferenceNumber: 'Your reference number is:',
    statusUpdateNotification: 'You will receive notifications when your report status changes.',
    viewStatus: 'View Status',
    close: 'Close',
    takePhoto: 'Take Photo',
    useLocation: 'Use Current Location',
    currentLocation: 'Current Location',
    changeLocation: 'Change Location',
    previewReport: 'Preview Report',
    confirmSubmit: 'Confirm & Submit',
    processingImage: 'Processing image...',
    clickToAdjustLocation: 'Click to adjust location',
    adminPanel: 'Admin Panel',
    adminLogin: 'Admin Login',
    categoryAdmin: 'Category Management',
    liveIssuesMap: 'Live Issues Map'
  },
  hi: {
    welcome: 'निवारण में आपका स्वागत है',
    signInWithGoogle: 'Google के साथ साइन इन करें',
    signInWithTwitter: 'Twitter के साथ साइन इन करें',
    continueAnonymously: 'अनाम रूप से जारी रखें',
    or: 'या',
    home: 'होम',
    report: 'रिपोर्ट',
    status: 'स्थिति',
    profile: 'प्रोफाइल',
    makeYourVoiceHeard: 'अपनी आवाज़ को सुनाएं',
    reportNewIssue: 'नई समस्या की रिपोर्ट करें',
    communityImpact: 'सामुदायिक प्रभाव',
    issuesResolved: 'समस्याएं हल हुईं',
    avgResponseTime: 'औसत प्रतिक्रिया समय',
    recentUpdates: 'हाल के अपडेट',
    reportIssue: 'समस्या की रिपोर्ट करें',
    title: 'शीर्षक',
    briefDescription: 'संक्षिप्त विवरण',
    imageUpload: 'छवि अपलोड करें',
    location: 'स्थान',
    category: 'श्रेणी',
    submitReport: 'रिपोर्ट सबमिट करें',
    reportStatus: 'रिपोर्ट की स्थिति',
    signInRequired: 'साइन इन आवश्यक है',
    pleaseSignIn: 'अपनी प्रोफाइल और प्राथमिकताओं तक पहुंचने के लिए कृपया साइन इन करें।',
    signIn: 'साइन इन',
    personalInformation: 'व्यक्तिगत जानकारी',
    email: 'ईमेल',
    phone: 'फ़ोन',
    password: 'पासवर्ड',
    notificationPreferences: 'नोटिफिकेशन प्राथमिकताएँ',
    pushNotifications: 'पुश नोटिफिकेशन',
    emailNotifications: 'ईमेल नोटिफिकेशन',
    appSettings: 'ऐप सेटिंग्स',
    language: 'भाषा',
    theme: 'थीम',
    about: 'परिचय',
    logout: 'लॉगआउट',
    aboutJalBandhu: 'जलबंधु के बारे में',
    aboutDescription: 'निवरण एक नागरिक-केंद्रित नागरिक मुद्दा रिपोर्टिंग प्लेटफॉर्म है जिसे नागरिकों और स्थानीय अधिकारियों के बीच संचार अंतर को पाटने के लिए डिज़ाइन किया गया है।',
    mission: 'हमारा मिशन नागरिकों को नागरिक मुद्दों की रिपोर्टिंग और ट्रैकिंग के लिए एक सहज प्लेटफॉर्म प्रदान करके अपने समुदायों को बेहतर बनाने में सक्रिय रूप से भाग लेने के लिए सशक्त बनाना है।',
    vision: 'हम ऐसे समुदायों की कल्पना करते हैं जहां हर नागरिक की आवाज सुनी और मूल्यवान होती है, जिससे नागरिक मुद्दों का तेजी से समाधान और जीवन की गुणवत्ता में सुधार होता है।',
    contactUs: 'संपर्क करें',
    change: 'बदलें',
    welcomeToCity: 'एक बेहतर समुदाय के लिए आपकी आवाज़। समस्याओं की रिपोर्ट करें, प्रगति को ट्रैक करें, और अपने पड़ोस को बेहतर बनाने में मदद करें।',
    yourReports: 'आपकी रिपोर्ट',
    seeAll: 'सभी देखें',
    analyzing: 'छवि का विश्लेषण किया जा रहा है...',
    aiDetected: 'AI ने निम्नलिखित का पता लगाया:',
    reportSubmitted: 'रिपोर्ट सफलतापूर्वक सबमिट की गई!',
    yourReferenceNumber: 'आपका संदर्भ संख्या है:',
    statusUpdateNotification: 'जब आपकी रिपोर्ट की स्थिति बदलेगी, तब आपको सूचनाएं प्राप्त होंगी।',
    viewStatus: 'स्थिति देखें',
    close: 'बंद करें',
    takePhoto: 'फोटो लें',
    useLocation: 'वर्तमान स्थान का उपयोग करें',
    currentLocation: 'वर्तमान स्थान',
    changeLocation: 'स्थान बदलें',
    previewReport: 'रिपोर्ट का पूर्वावलोकन करें',
    confirmSubmit: 'पुष्टि करें और सबमिट करें',
    processingImage: 'छवि संसाधित की जा रही है...',
    clickToAdjustLocation: 'स्थान समायोजित करने के लिए क्लिक करें',
    adminPanel: 'एडमिन पैनल',
    adminLogin: 'एडमिन लॉगिन',
    categoryAdmin: 'श्रेणी प्रबंधन',
    liveIssuesMap: 'लाइव इश्यूज मैप'
  },
  te: {
    welcome: 'నివరణ్ కి స్వాగతం',
    signInWithGoogle: 'Google తో సైన్ ఇన్ చేయండి',
    signInWithTwitter: 'Twitter తో సైన్ ఇన్ చేయండి',
    continueAnonymously: 'అనామకంగా కొనసాగించండి',
    or: 'లేదా',
    home: 'హోమ్',
    report: 'రిపోర్ట్',
    status: 'స్థితి',
    profile: 'ప్రొఫైల్',
    makeYourVoiceHeard: 'మీ స్వరాన్ని వినిపించండి',
    reportNewIssue: 'కొత్త సమస్యను రిపోర్ట్ చేయండి',
    communityImpact: 'సామాజిక ప్రభావం',
    issuesResolved: 'సమస్యలు పరిష్కరించబడ్డాయి',
    avgResponseTime: 'సగటు ప్రతిస్పందన సమయం',
    recentUpdates: 'ఇటీవలి అప్‌డేట్‌లు',
    reportIssue: 'సమస్యను రిపోర్ట్ చేయండి',
    title: 'శీర్షిక',
    briefDescription: 'సంక్షిప్త వివరణ',
    imageUpload: 'చిత్రాన్ని అప్‌లోడ్ చేయండి',
    location: 'స్థానం',
    category: 'వర్గం',
    submitReport: 'రిపోర్ట్ సమర్పించండి',
    reportStatus: 'రిపోర్ట్ స్థితి',
    signInRequired: 'సైన్ ఇన్ అవసరం',
    pleaseSignIn: 'మీ ప్రొఫైల్ మరియు ప్రాధాన్యతలను యాక్సెస్ చేయడానికి దయచేసి సైన్ ఇన్ చేయండి.',
    signIn: 'సైన్ ఇన్',
    personalInformation: 'వ్యక్తిగత సమాచారం',
    email: 'ఇమెయిల్',
    phone: 'ఫోన్',
    password: 'పాస్‌వర్డ్',
    notificationPreferences: 'నోటిఫికేషన్ ప్రాధాన్యతలు',
    pushNotifications: 'పుష్ నోటిఫికేషన్లు',
    emailNotifications: 'ఇమెయిల్ నోటిఫికేషన్లు',
    appSettings: 'యాప్ సెట్టింగులు',
    language: 'భాష',
    theme: 'థీమ్',
    about: 'గురించి',
    logout: 'లాగౌట్',
    aboutJalBandhu: 'జలబంధు గురించి',
    aboutDescription: 'నివరణ్ పౌరులు మరియు స్థానిక అధికారుల మధ్య కమ్యూనికేషన్ గ్యాప్‌ను పరిష్కరించడానికి డిజైన్ చేయబడిన పౌర-కేంద్రీకృత పౌర సమస్య రిపోర్టింగ్ ప్లాట్‌ఫామ్.',
    mission: 'మా మిషన్ పౌర సమస్యల రిపోర్టింగ్ మరియు ట్రాకింగ్ కోసం సజావుగా ప్లాట్‌ఫామ్ అందించడం ద్వారా పౌరులను తమ కమ్యూనిటీలను మెరుగుపరచడంలో యాక్టివ్‌గా పాల్గొనేలా చేయడం.',
    vision: 'మేము ప్రతి పౌరుని స్వరం వినబడి మరియు విలువైనదిగా ఉండే సమాజాలను ఊహిస్తున్నాము, దీని వల్ల పౌర సమస్యల త్వరిత పరిష్కారం మరియు జీవన నాణ్యత మెరుగుపడుతుంది.',
    contactUs: 'మమ్మల్ని సంప్రదించండి',
    change: 'మార్చండి',
    welcomeToCity: 'మెరుగైన సమాజం కోసం మీ గొంతు. సమస్యలను నివేదించండి, పురోగతిని గమనించండి మరియు మీ పరిసర ప్రాంతాన్ని మెరుగుపరచడంలో సహాయపడండి.',
    yourReports: 'మీ నివేదికలు',
    seeAll: 'అన్నీ చూడండి',
    liveIssuesMap: 'లైవ్ ఇష్యూస్ మ్యాప్'
  },
  ta: {
    welcome: 'நிவரணுக்கு வரவேற்கிறோம்',
    signInWithGoogle: 'Google மூலம் உள்நுழைக',
    signInWithTwitter: 'Twitter மூலம் உள்நுழைக',
    continueAnonymously: 'அநாமதேயமாக தொடரவும்',
    or: 'அல்லது',
    home: 'முகப்பு',
    report: 'அறிக்கை',
    status: 'நிலை',
    profile: 'சுயவிவரம்',
    makeYourVoiceHeard: 'உங்கள் குரலை கேட்க செய்யுங்கள்',
    reportNewIssue: 'புதிய பிரச்சினையை அறிக்கையிடுங்கள்',
    communityImpact: 'சமூக தாக்கம்',
    issuesResolved: 'பிரச்சினைகள் தீர்க்கப்பட்டன',
    avgResponseTime: 'சராசரி பதில் நேரம்',
    recentUpdates: 'சமீபத்திய மேம்பாடுகள்',
    reportIssue: 'பிரச்சினையை அறிக்கையிடுங்கள்',
    title: 'தலைப்பு',
    briefDescription: 'சுருக்கமான விளக்கம்',
    imageUpload: 'படத்தை பதிவேற்றவும்',
    location: 'இடம்',
    category: 'வகை',
    submitReport: 'அறிக்கையை சமர்ப்பிக்கவும்',
    reportStatus: 'அறிக்கை நிலை',
    signInRequired: 'உள்நுழைவு தேவை',
    pleaseSignIn: 'உங்கள் சுயவிவரம் மற்றும் விருப்பங்களை அணுக தயவுசெய்து உள்நுழையவும்.',
    signIn: 'உள்நுழைக',
    personalInformation: 'தனிப்பட்ட தகவல்',
    email: 'மின்னஞ்சல்',
    phone: 'தொலைபேசி',
    password: 'கடவுச்சொல்',
    notificationPreferences: 'அறிவிப்பு விருப்பங்கள்',
    pushNotifications: 'புஷ் அறிவிப்புகள்',
    emailNotifications: 'மின்னஞ்சல் அறிவிப்புகள்',
    appSettings: 'ஆப் அமைப்புகள்',
    language: 'மொழி',
    theme: 'தீம்',
    about: 'பற்றி',
    logout: 'வெளியேறு',
    aboutJalBandhu: 'ஜலபந்து பற்றி',
    aboutDescription: 'நிவரணம் என்பது குடிமக்கள் மற்றும் உள்ளூர் அதிகாரிகளிடையே உள்ள தொடர்பு இடைவெளியை இணைப்பதற்காக வடிவமைக்கப்பட்ட குடிமக்களை மையமாகக் கொண்ட குடிமை பிரச்சினை அறிக்கையிடும் தளமாகும்.',
    mission: 'எங்கள் பணி குடிமக்கள் தங்கள் சமூகங்களை மேம்படுத்துவதில் செயலில் பங்கேற்க அனுமதிக்க குடிமை பிரச்சனைகளை அறிக்கையிடுவதற்கும் கண்காணிப்பதற்கும் ஒரு சீரான தளத்தை வழங்குவதாகும்.',
    vision: 'ஒவ்வொரு குடிமகனின் குரலும் கேட்கப்பட்டு மதிப்பளிக்கப்படும் சமூகங்களை நாங்கள் கண்டுபிடிக்கிறோம், இது குடிமை பிரச்சனைகளின் விரைவான தீர்வு மற்றும் வாழ்க்கை தரத்தை மேம்படுத்துகிறது.',
    contactUs: 'எங்களை தொடர்பு கொள்ள',
    change: 'மாற்று',
    welcomeToCity: 'ஒரு சிறந்த சமூகத்திற்கான உங்கள் குரல். பிரச்சினைகளை அறிக்கையிடுங்கள், முன்னேற்றத்தைக் கண்காணிக்கவும், உங்கள் சுற்றுப்புறத்தை மேம்படுத்த உதவுங்கள்.',
    yourReports: 'உங்கள் அறிக்கைகள்',
    seeAll: 'அனைத்தையும் பார்',
    liveIssuesMap: 'லைவ் இஷ்யூஸ் மேப்'
  },
  mr: {
    welcome: 'निवरणमध्ये आपले स्वागत आहे',
    signInWithGoogle: 'Google सह साइन इन करा',
    signInWithTwitter: 'Twitter सह साइन इन करा',
    continueAnonymously: 'अनामिकपणे सुरू ठेवा',
    or: 'किंवा',
    home: 'होम',
    report: 'रिपोर्ट',
    status: 'स्थिती',
    profile: 'प्रोफाइल',
    makeYourVoiceHeard: 'तुमचा आवाज ऐकवा',
    reportNewIssue: 'नवीन समस्या रिपोर्ट करा',
    communityImpact: 'समुदाय प्रभाव',
    issuesResolved: 'समस्या सोडवल्या',
    avgResponseTime: 'सरासरी प्रतिसाद वेळ',
    recentUpdates: 'अलीकडील अपडेट्स',
    reportIssue: 'समस्या रिपोर्ट करा',
    title: 'शीर्षक',
    briefDescription: 'संक्षिप्त वर्णन',
    imageUpload: 'प्रतिमा अपलोड करा',
    location: 'स्थान',
    category: 'श्रेणी',
    submitReport: 'रिपोर्ट सबमिट करा',
    reportStatus: 'रिपोर्ट स्थिती',
    signInRequired: 'साइन इन आवश्यक आहे',
    pleaseSignIn: 'आपल्या प्रोफाइल आणि प्राधान्यांमध्ये प्रवेश करण्यासाठी कृपया साइन इन करा.',
    signIn: 'साइन इन',
    personalInformation: 'वैयक्तिक माहिती',
    email: 'ईमेल',
    phone: 'फोन',
    password: 'पासवर्ड',
    notificationPreferences: 'सूचना प्राधान्ये',
    pushNotifications: 'पुश सूचना',
    emailNotifications: 'ईमेल सूचना',
    appSettings: 'अॅप सेटिंग्ज',
    language: 'भाषा',
    theme: 'थीम',
    about: 'बद्दल',
    logout: 'लॉगआउट',
    aboutJalBandhu: 'जलबंधु बद्दल',
    aboutDescription: 'निवारण हे नागरिक-केंद्रित नागरी समस्या रिपोर्टिंग प्लॅटफॉर्म आहे जे नागरिक आणि स्थानिक अधिकाऱ्यांमधील संवादाचा अंतर भरून काढण्यासाठी डिझाइन केले आहे.',
    mission: 'आमचे उद्दिष्ट नागरिकांना नागरी समस्यांची रिपोर्टिंग आणि ट्रॅकिंगसाठी एक सुरळीत प्लॅटफॉर्म प्रदान करून त्यांच्या समुदायांना चांगले बनवण्यात सक्रियपणे सहभागी होण्यास सक्षम करणे आहे.',
    vision: 'आम्ही अशा समुदायांची कल्पना करतो जिथे प्रत्येक नागरिकाचा आवाज ऐकला जातो आणि त्याचे मूल्य केले जाते, ज्यामुळे नागरी समस्यांचे द्रुत निराकरण आणि जीवनाची गुणवत्ता सुधारते.',
    contactUs: 'आमच्याशी संपर्क साधा',
    change: 'बदला',
    welcomeToCity: 'एक चांगला समुदाय साठी तुमचा आवाज. समस्या रिपोर्ट करा, प्रगती ट्रॅक करा, आणि तुमच्या परिसराला चांगले बनवण्यास मदत करा.',
    yourReports: 'तुमच्या रिपोर्ट',
    seeAll: 'सर्व पहा',
    liveIssuesMap: 'लाइव्ह इश्यूज मॅप'
  },
  kn: {
    welcome: 'ನಿವರಣ್‌ಗೆ ಸುಸ್ವಾಗತ',
    signInWithGoogle: 'Google ನೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
    signInWithTwitter: 'Twitter ನೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
    continueAnonymously: 'ಅನಾಮಧೇಯವಾಗಿ ಮುಂದುವರಿಸಿ',
    or: 'ಅಥವಾ',
    home: 'ಮುಖಪುಟ',
    report: 'ವರದಿ',
    status: 'ಸ್ಥಿತಿ',
    profile: 'ಪ್ರೊಫೈಲ್',
    makeYourVoiceHeard: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಕೇಳಿಸಿ',
    reportNewIssue: 'ಹೊಸ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ',
    communityImpact: 'ಸಮುದಾಯ ಪ್ರಭಾವ',
    issuesResolved: 'ಸಮಸ್ಯೆಗಳು ಪರಿಹರಿಸಲ್ಪಟ್ಟಿವೆ',
    avgResponseTime: 'ಸರಾಸರಿ ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ',
    recentUpdates: 'ಇತ್ತೀಚಿನ ನವೀಕರಣಗಳು',
    reportIssue: 'ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ',
    title: 'ಶೀರ್ಷಿಕೆ',
    briefDescription: 'ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆ',
    imageUpload: 'ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    location: 'ಸ್ಥಳ',
    category: 'ವರ್ಗ',
    submitReport: 'ವರದಿ ಸಲ್ಲಿಸಿ',
    reportStatus: 'ವರದಿ ಸ್ಥಿತಿ',
    signInRequired: 'ಸೈನ್ ಇನ್ ಅಗತ್ಯವಿದೆ',
    pleaseSignIn: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ಪ್ರವೇಶಿಸಲು ದಯವಿಟ್ಟು ಸೈನ್ ಇನ್ ಮಾಡಿ.',
    signIn: 'ಸೈನ್ ಇನ್',
    personalInformation: 'ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ',
    email: 'ಇಮೇಲ್',
    phone: 'ಫೋನ್',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    notificationPreferences: 'ಅಧಿಸೂಚನೆ ಆದ್ಯತೆಗಳು',
    pushNotifications: 'ಪುಶ್ ಅಧಿಸೂಚನೆಗಳು',
    emailNotifications: 'ಇಮೇಲ್ ಅಧಿಸೂಚನೆಗಳು',
    appSettings: 'ಅಪ್ಲಿಕೇಶನ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    language: 'ಭಾಷೆ',
    theme: 'ಥೀಮ್',
    about: 'ಬಗ್ಗೆ',
    logout: 'ಲಾಗ್ ಔಟ್',
    aboutJalBandhu: 'ಜಲಬಂಧು ಬಗ್ಗೆ',
    aboutDescription: 'ನಿವಾರಣ ಎನ್ನುವುದು ಪೌರರು ಮತ್ತು ಸ್ಥಳೀಯ ಅಧಿಕಾರಿಗಳ ನಡುವೆ ಸಂವಹನದ ಅಂತರವನ್ನು ಸೇತುವೆ ಮಾಡಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ಪೌರ-ಕೇಂದ್ರಿತ ನಾಗರಿಕ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡುವ ವೇದಿಕೆಯಾಗಿದೆ.',
    mission: 'ನಮ್ಮ ಮಿಷನ್ ಎಂದರೆ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಲು ಮತ್ತು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಸುಲಲಿತ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಒದಗಿಸುವ ಮೂಲಕ ಪೌರರು ತಮ್ಮ ಸಮುದಾಯಗಳನ್ನು ಉತ್ತಮಗೊಳಿಸುವಲ್ಲಿ ಸಕ್ರಿಯವಾಗಿ ಭಾಗವಹಿಸಲು ಶಕ್ತಗೊಳಿಸುವುದು.',
    vision: 'ಪ್ರತಿ ಪೌರನ ಧ್ವನಿಯನ್ನು ಕೇಳಿಸಿಕೊಳ್ಳುವ ಮತ್ತು ಮೌಲ್ಯಯುತವಾದ ಸಮುದಾಯಗಳನ್ನು ನಾವು ಕಲ್ಪಿಸುತ್ತೇವೆ, ಇದರಿಂದಾಗಿ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳ ವೇಗದ ಪರಿಹಾರ ಮತ್ತು ಜೀವನದ ಗುಣಮಟ್ಟ ಸುಧಾರಿಸುತ್ತದೆ.',
    contactUs: 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ',
    change: 'ಬದಲಾಯಿಸಿ',
    welcomeToCity: 'ಉತ್ತಮ ಸಮುದಾಯಕ್ಕಾಗಿ ನಿಮ್ಮ ಧ್ವನಿ. ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಿ, ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ನೆರೆಹೊರೆಯನ್ನು ಉತ್ತಮವಾಗಿಸಲು ಸಹಾಯ ಮಾಡಿ.',
    yourReports: 'ನಿಮ್ಮ ವರದಿಗಳು',
    seeAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ',
    liveIssuesMap: 'ಲೈವ್ ಇಷ್ಯೂಸ್ ಮ್ಯಾಪ್'
  },
  bn: {
    welcome: 'নিবরণে স্বাগতম',
    signInWithGoogle: 'Google দিয়ে সাইন ইন করুন',
    signInWithTwitter: 'Twitter দিয়ে সাইন ইন করুন',
    continueAnonymously: 'বেনামে চালিয়ে যান',
    or: 'অথবা',
    home: 'হোম',
    report: 'রিপোর্ট',
    status: 'স্ট্যাটাস',
    profile: 'প্রোফাইল',
    makeYourVoiceHeard: 'আপনার কণ্ঠ শোনান',
    reportNewIssue: 'নতুন সমস্যা রিপোর্ট করুন',
    communityImpact: 'কমিউনিটি প্রভাব',
    issuesResolved: 'সমাধানকৃত সমস্যা',
    avgResponseTime: 'গড় প্রতিক্রিয়া সময়',
    recentUpdates: 'সাম্প্রতিক আপডেট',
    reportIssue: 'সমস্যা রিপোর্ট করুন',
    title: 'শিরোনাম',
    briefDescription: 'সংক্ষিপ্ত বিবরণ',
    imageUpload: 'ছবি আপলোড করুন',
    location: 'অবস্থান',
    category: 'বিভাগ',
    submitReport: 'রিপোর্ট জমা দিন',
    reportStatus: 'রিপোর্টের অবস্থা',
    signInRequired: 'সাইন ইন প্রয়োজন',
    pleaseSignIn: 'আপনার প্রোফাইল এবং পছন্দসমূহ অ্যাক্সেস করতে অনুগ্রহ করে সাইন ইন করুন।',
    signIn: 'সাইন ইন',
    personalInformation: 'ব্যক্তিগত তথ্য',
    email: 'ইমেইল',
    phone: 'ফোন',
    password: 'পাসওয়ার্ড',
    notificationPreferences: 'নোটিফিকেশন পছন্দসমূহ',
    pushNotifications: 'পুশ নোটিফিকেশন',
    emailNotifications: 'ইমেইল নোটিফিকেশন',
    appSettings: 'অ্যাপ সেটিংস',
    language: 'ভাষা',
    theme: 'থিম',
    about: 'সম্পর্কে',
    logout: 'লগআউট',
    aboutJalBandhu: 'জলবন্ধু সম্পর্কে',
    aboutDescription: 'নিবারণ হল একটি নাগরিক-কেন্দ্রিক সিভিক ইস্যু রিপোর্টিং প্ল্যাটফর্ম যা নাগরিক এবং স্থানীয় কর্তৃপক্ষের মধ্যে যোগাযোগের ব্যবধান পূরণ করার জন্য ডিজাইন করা হয়েছে।',
    mission: 'আমাদের মিশন হল নাগরিকদের তাদের সম্প্রদায়গুলিকে আরও ভালো করতে সক্রিয়ভাবে অংশগ্রহণ করতে সক্ষম করা, সিভিক সমস্যাগুলি রিপোর্ট করা এবং ট্র্যাক করার জন্য একটি নিরবিচ্ছিন্ন প্ল্যাটফর্ম প্রদান করে।',
    vision: 'আমরা এমন সম্প্রদায়ের কল্পনা করি যেখানে প্রতিটি নাগরিকের কণ্ঠ শোনা যায় এবং মূল্যবান করা হয়, যা সিভিক সমস্যাগুলির দ্রুত সমাধান এবং জীবনের মান উন্নত করে।',
    contactUs: 'যোগাযোগ করুন',
    change: 'পরিবর্তন করুন',
    welcomeToCity: 'একটি উন্নত কমিউনিটির জন্য আপনার কণ্ঠস্বর। সমস্যা রিপোর্ট করুন, অগ্রগতি ট্র্যাক করুন, এবং আপনার আশপাশকে আরও ভালো করতে সাহায্য করুন।',
    yourReports: 'আপনার রিপোর্টগুলি',
    seeAll: 'সবগুলি দেখুন',
    analyzing: 'ছবি বিশ্লেষণ করা হচ্ছে...',
    aiDetected: 'AI নিম্নলিখিত সনাক্ত করেছে:',
    reportSubmitted: 'রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে!',
    yourReferenceNumber: 'আপনার রেফারেন্স নম্বর হল:',
    statusUpdateNotification: 'আপনার রিপোর্টের স্থিতি পরিবর্তন হলে আপনি বিজ্ঞপ্তি পাবেন।',
    viewStatus: 'স্টেটাস দেখুন',
    close: 'বন্ধ করুন',
    takePhoto: 'ছবি তুলুন',
    useLocation: 'বর্তমান অবস্থান ব্যবহার করুন',
    currentLocation: 'বর্তমান অবস্থান',
    changeLocation: 'অবস্থান পরিবর্তন করুন',
    previewReport: 'রিপোর্ট প্রিভিউ করুন',
    confirmSubmit: 'নিশ্চিত করুন এবং জমা দিন',
    processingImage: 'ছবি প্রক্রিয়া করা হচ্ছে...',
    clickToAdjustLocation: 'অবস্থান সামঞ্জস্য করতে ক্লিক করুন',
    liveIssuesMap: 'লাইভ ইস্যু ম্যাপ'
  }
};

// Make sure all languages have the same keys as English
// Use English translations as fallback for missing keys
Object.keys(translations).forEach(lang => {
  if (lang !== 'en') {
    // For each language other than English
    Object.keys(translations.en).forEach(key => {
      // Check if translation exists
      if (!(key in translations[lang])) {
        // Use English as fallback for missing keys
        translations[lang][key] = translations.en[key];
      }
    });
  }
});

const languages = {
  en: 'English',
  hi: 'हिन्दी (Hindi)',
  te: 'తెలుగు (Telugu)',
  ta: 'தமிழ் (Tamil)',
  mr: 'मराठी (Marathi)',
  kn: 'ಕನ್ನಡ (Kannada)',
  bn: 'বাংলা (Bengali)'
};

export { translations, languages };
export type { TranslationKeys };
