import { useEffect, useState, type ChangeEvent } from 'react'
import { translations, type Language } from './translations'
import BreastAwareness from './BreastAwareness'
import SymptomGuidance from './SymptomGuidance'
import RiskFactors from './RiskFactors'
import './App.css'

type PredictionResult = {
  analysis_performed: boolean
  stored: boolean
  predicted_class: string
  model_scores: Record<string, number>
  medical_notice: string
}

type AnalysisMode = 'demo' | 'research'
type ProcessState = 'idle' | 'loading' | 'success' | 'error'
type BackendState = 'checking' | 'connected' | 'unavailable' | 'offline'
type ValidationDetails = { format: string; width: number; height: number }

const noImageText: Record<Language, {
  title: string
  description: string
  awareness: string
  symptoms: string
  risk: string
}> = {
  en: {
    title: "Don't have an ultrasound image?",
    description: "You can explore breast-health information without uploading an image. If you notice symptoms or have concerns, consult a qualified healthcare professional.",
    awareness: "Breast Health Awareness",
    symptoms: "Symptom Guidance",
    risk: "Risk Factors",
  },
  kn: {
    title: "ಅಲ್ಟ್ರಾಸೌಂಡ್ ಚಿತ್ರ ಇಲ್ಲವೇ?",
    description: "ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡದೆಯೇ ಸ್ತನ ಆರೋಗ್ಯದ ಮಾಹಿತಿಯನ್ನು ತಿಳಿದುಕೊಳ್ಳಬಹುದು. ಯಾವುದೇ ಲಕ್ಷಣಗಳು ಅಥವಾ ಕಳವಳಗಳಿದ್ದರೆ ಅರ್ಹ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    awareness: "ಸ್ತನ ಆರೋಗ್ಯ ಜಾಗೃತಿ",
    symptoms: "ಲಕ್ಷಣಗಳ ಮಾರ್ಗದರ್ಶನ",
    risk: "ಅಪಾಯದ ಅಂಶಗಳು",
  },
  hi: {
    title: "अल्ट्रासाउंड की तस्वीर नहीं है?",
    description: "आप बिना तस्वीर अपलोड किए स्तन स्वास्थ्य की जानकारी प्राप्त कर सकते हैं। कोई लक्षण या चिंता होने पर योग्य स्वास्थ्य विशेषज्ञ से परामर्श लें।",
    awareness: "स्तन स्वास्थ्य जागरूकता",
    symptoms: "लक्षणों पर मार्गदर्शन",
    risk: "जोखिम कारक",
  },
}

// New graph helper text is localized without changing any existing translation keys.
const scoreChartText: Record<Language, {
  instruction: string
  detailTitle: string
  detailPrefix: string
  detailSuffix: string
  zeroNote: string
}> = {
  en: {
    instruction: 'Hover over, focus on, or tap a bar to understand its classification score.',
    detailTitle: 'What does this classification score mean?',
    detailPrefix: 'For this image, the experimental AI model assigned this dataset category a score of',
    detailSuffix: 'on its 0–1 output scale. Higher scores show which category the model favors more strongly; they are not medically validated cancer probabilities or a diagnosis.',
    zeroNote: 'A displayed score of 0.0000 may reflect rounding. It does not mean zero cancer risk.',
  },
  kn: {
    instruction: 'ವರ್ಗೀಕರಣ ಅಂಕದ ಅರ್ಥ ತಿಳಿಯಲು ಪಟ್ಟಿಯ ಮೇಲೆ ಕರ್ಸರ್ ಇರಿಸಿ, ಕೀಬೋರ್ಡ್‌ನಿಂದ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಸ್ಪರ್ಶಿಸಿ.',
    detailTitle: 'ಈ ವರ್ಗೀಕರಣ ಅಂಕದ ಅರ್ಥವೇನು?',
    detailPrefix: 'ಈ ಚಿತ್ರಕ್ಕಾಗಿ ಪ್ರಯೋಗಾತ್ಮಕ AI ಮಾದರಿಯು ಈ ದತ್ತಾಂಶ ವರ್ಗಕ್ಕೆ ನೀಡಿರುವ ಅಂಕ',
    detailSuffix: 'ಇದು 0–1 ಮಾಪಕದಲ್ಲಿನ ಮಾದರಿಯ ಅಂಕವಾಗಿದೆ. ಹೆಚ್ಚಿನ ಅಂಕವು ಮಾದರಿ ಆ ವರ್ಗಕ್ಕೆ ಹೆಚ್ಚು ಆದ್ಯತೆ ನೀಡಿದೆ ಎಂಬುದನ್ನು ಮಾತ್ರ ಸೂಚಿಸುತ್ತದೆ; ಇದು ವೈದ್ಯಕೀಯವಾಗಿ ದೃಢೀಕರಿಸಿದ ಕ್ಯಾನ್ಸರ್ ಸಂಭವನೀಯತೆ ಅಥವಾ ರೋಗನಿರ್ಣಯವಲ್ಲ.',
    zeroNote: '0.0000 ಎಂದು ಕಾಣುವ ಅಂಕವು ಪೂರ್ಣಾಂಕೀಕರಣದಿಂದ ಆಗಿರಬಹುದು. ಇದರ ಅರ್ಥ ಕ್ಯಾನ್ಸರ್ ಅಪಾಯ ಶೂನ್ಯ ಎಂದಲ್ಲ.',
  },
  hi: {
    instruction: 'वर्गीकरण स्कोर समझने के लिए किसी बार पर माउस ले जाएँ, कीबोर्ड से चुनें या टैप करें।',
    detailTitle: 'इस वर्गीकरण स्कोर का क्या अर्थ है?',
    detailPrefix: 'इस छवि के लिए प्रयोगात्मक AI मॉडल ने इस डेटासेट श्रेणी को',
    detailSuffix: 'का स्कोर दिया है, जो मॉडल के 0–1 आउटपुट पैमाने पर है। अधिक स्कोर केवल यह दर्शाता है कि मॉडल उस श्रेणी को अधिक महत्व देता है; यह चिकित्सकीय रूप से मान्य कैंसर संभावना या निदान नहीं है।',
    zeroNote: 'दिखाया गया 0.0000 स्कोर राउंडिंग के कारण भी हो सकता है। इसका अर्थ कैंसर का जोखिम शून्य नहीं है।',
  },
}

// Guidance below the uploaded preview explains only verified file facts and existing AI outputs.
// It does not interpret ultrasound anatomy or claim a medical diagnosis.
type ImageInsight = 'file' | 'prediction' | 'gradcam'
const imageInsightText: Record<Language, {
  journeyTitle: string
  instruction: string
  fileTitle: string
  predictionTitle: string
  gradcamTitle: string
  pending: string
  fileDescription: string
  predictionPending: string
  gradcamPending: string
  boundaries: string
}> = {
  en: {
    journeyTitle: 'Understanding this uploaded image',
    instruction: 'Choose one of the three connected steps for an explanation.',
    fileTitle: 'Image details',
    predictionTitle: 'AI classification',
    gradcamTitle: 'Grad-CAM explanation',
    pending: 'Not generated yet',
    fileDescription: 'The selected file is shown above. Selecting an image is not the same as verifying its format or confirming it is an ultrasound.',
    predictionPending: 'No experimental AI classification has been generated for this image yet.',
    gradcamPending: 'No Grad-CAM heatmap has been generated for this image yet.',
    boundaries: 'These steps explain the file and the model outputs, not the medical meaning of specific structures in the ultrasound.',
  },
  kn: {
    journeyTitle: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಚಿತ್ರದ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ',
    instruction: 'ವಿವರಣೆಗಾಗಿ ಸಂಪರ್ಕಿತ ಮೂರು ಹಂತಗಳಲ್ಲಿ ಒಂದನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    fileTitle: 'ಚಿತ್ರದ ವಿವರಗಳು',
    predictionTitle: 'AI ವರ್ಗೀಕರಣ',
    gradcamTitle: 'Grad-CAM ವಿವರಣೆ',
    pending: 'ಇನ್ನೂ ರಚಿಸಲಾಗಿಲ್ಲ',
    fileDescription: 'ಆಯ್ಕೆಮಾಡಿದ ಕಡತವನ್ನು ಮೇಲೆ ತೋರಿಸಲಾಗಿದೆ. ಚಿತ್ರವನ್ನು ಆರಿಸುವುದರಿಂದ ಅದರ ಸ್ವರೂಪ ಪರಿಶೀಲನೆಯಾಗುವುದಿಲ್ಲ ಅಥವಾ ಅದು ಅಲ್ಟ್ರಾಸೌಂಡ್ ಎಂದು ದೃಢವಾಗುವುದಿಲ್ಲ.',
    predictionPending: 'ಈ ಚಿತ್ರದ ಪ್ರಯೋಗಾತ್ಮಕ AI ವರ್ಗೀಕರಣವನ್ನು ಇನ್ನೂ ರಚಿಸಲಾಗಿಲ್ಲ.',
    gradcamPending: 'ಈ ಚಿತ್ರದ Grad-CAM ಹೀಟ್‌ಮ್ಯಾಪ್ ಅನ್ನು ಇನ್ನೂ ರಚಿಸಲಾಗಿಲ್ಲ.',
    boundaries: 'ಈ ಹಂತಗಳು ಕಡತ ಮತ್ತು ಮಾದರಿಯ ಫಲಿತಾಂಶಗಳನ್ನು ಮಾತ್ರ ವಿವರಿಸುತ್ತವೆ; ಅಲ್ಟ್ರಾಸೌಂಡ್‌ನ ನಿರ್ದಿಷ್ಟ ಭಾಗಗಳ ವೈದ್ಯಕೀಯ ಅರ್ಥವನ್ನಲ್ಲ.',
  },
  hi: {
    journeyTitle: 'अपलोड की गई छवि को समझें',
    instruction: 'जानकारी देखने के लिए जुड़े हुए तीन चरणों में से एक चुनें।',
    fileTitle: 'छवि का विवरण',
    predictionTitle: 'AI वर्गीकरण',
    gradcamTitle: 'Grad-CAM की व्याख्या',
    pending: 'अभी तैयार नहीं',
    fileDescription: 'चुनी गई फ़ाइल ऊपर दिखाई गई है। फ़ाइल चुनना उसके प्रारूप की जाँच या उसके अल्ट्रासाउंड होने की पुष्टि नहीं है।',
    predictionPending: 'इस छवि के लिए अभी कोई प्रयोगात्मक AI वर्गीकरण तैयार नहीं हुआ है।',
    gradcamPending: 'इस छवि के लिए अभी कोई Grad-CAM हीटमैप तैयार नहीं हुआ है।',
    boundaries: 'ये चरण फ़ाइल और मॉडल के आउटपुट समझाते हैं, अल्ट्रासाउंड की विशिष्ट संरचनाओं का चिकित्सकीय अर्थ नहीं।',
  },
}

// General next-step guidance accompanies the ultrasound preview, never the predicted
// category. The experimental research score must not determine medical advice.
const careGuidanceText: Record<Language, {
  heading: string
  description: string
  reminder: string
  exploreSymptoms: string
  cards: Array<{ title: string; summary: string; points: string[] }>
}> = {
  en: {
    heading: 'What should you do next?',
    description: 'General breast-health guidance, not a recommendation based on the AI classification.',
    reminder: 'An AI result labelled Benign, Normal or Malignant cannot confirm or rule out cancer. Only a qualified healthcare professional can assess your health concerns.',
    exploreSymptoms: 'Open Symptom Guidance',
    cards: [
      {
        title: 'Next Steps',
        summary: 'Know when to seek professional assessment.',
        points: [
          'If you notice a new or unusual breast change, contact a qualified healthcare professional promptly.',
          'Do not treat a Benign or Normal AI label as reassurance that no medical assessment is needed.',
          'A clinician can decide whether a physical examination, imaging or follow-up is appropriate.',
        ],
      },
      {
        title: 'Warning Signs',
        summary: 'Recognize changes that deserve medical attention.',
        points: [
          'Watch for a new lump or swelling in the breast or armpit.',
          'Seek assessment for new nipple discharge, especially blood, skin dimpling, nipple changes or unusual changes in breast shape.',
          'Discuss persistent pain or any other new breast change with a healthcare professional. These changes can have non-cancer causes, but should still be checked.',
        ],
      },
      {
        title: 'Prepare for a Visit',
        summary: 'Gather useful information before speaking to a clinician.',
        points: [
          'Note when the change began, where it is, and whether it has persisted or changed over time.',
          'Bring any available previous ultrasound scans, clinical imaging reports and relevant medical history.',
          'Ask what the findings mean and whether further assessment or follow-up is needed. This experimental AI output is not a clinical report.',
        ],
      },
    ],
  },
  kn: {
    heading: 'ಮುಂದೇನು ಮಾಡಬೇಕು?',
    description: 'ಇದು ಸಾಮಾನ್ಯ ಸ್ತನ ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ; AI ವರ್ಗೀಕರಣದ ಆಧಾರದ ಮೇಲಿನ ವೈಯಕ್ತಿಕ ವೈದ್ಯಕೀಯ ಸಲಹೆಯಲ್ಲ.',
    reminder: 'AI ಫಲಿತಾಂಶದಲ್ಲಿ Benign, Normal ಅಥವಾ Malignant ಎಂದು ಬಂದರೂ ಕ್ಯಾನ್ಸರ್ ಇದೆ ಅಥವಾ ಇಲ್ಲ ಎಂದು ದೃಢಪಡಿಸಲಾಗುವುದಿಲ್ಲ. ನಿಮ್ಮ ಆರೋಗ್ಯ ಕಳವಳಗಳನ್ನು ಅರ್ಹ ವೈದ್ಯಕೀಯ ವೃತ್ತಿಪರರು ಮಾತ್ರ ಮೌಲ್ಯಮಾಪನ ಮಾಡಬಹುದು.',
    exploreSymptoms: 'ಲಕ್ಷಣಗಳ ಮಾರ್ಗದರ್ಶನವನ್ನು ತೆರೆಯಿರಿ',
    cards: [
      {
        title: 'ಮುಂದಿನ ಕ್ರಮಗಳು',
        summary: 'ಯಾವಾಗ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ ಪಡೆಯಬೇಕು ಎಂದು ತಿಳಿಯಿರಿ.',
        points: [
          'ಸ್ತನದಲ್ಲಿ ಹೊಸ ಅಥವಾ ಅಸಾಮಾನ್ಯ ಬದಲಾವಣೆ ಕಂಡುಬಂದರೆ ಶೀಘ್ರವಾಗಿ ಅರ್ಹ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
          'AI ಫಲಿತಾಂಶದಲ್ಲಿ Benign ಅಥವಾ Normal ಎಂದಿದ್ದರೂ ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ ಅಗತ್ಯವಿಲ್ಲ ಎಂದು ಭಾವಿಸಬೇಡಿ.',
          'ದೈಹಿಕ ಪರೀಕ್ಷೆ, ಚಿತ್ರಣ ಪರೀಕ್ಷೆ ಅಥವಾ ಮುಂದಿನ ತಪಾಸಣೆ ಬೇಕೇ ಎಂಬುದನ್ನು ವೈದ್ಯರು ನಿರ್ಧರಿಸಬಹುದು.',
        ],
      },
      {
        title: 'ಎಚ್ಚರಿಕೆ ಲಕ್ಷಣಗಳು',
        summary: 'ವೈದ್ಯರ ಗಮನಕ್ಕೆ ತರಬೇಕಾದ ಬದಲಾವಣೆಗಳನ್ನು ತಿಳಿಯಿರಿ.',
        points: [
          'ಸ್ತನ ಅಥವಾ ಕಂಕುಳಿನಲ್ಲಿ ಹೊಸ ಗಡ್ಡೆ ಅಥವಾ ಊತ ಇದೆಯೇ ಎಂದು ಗಮನಿಸಿ.',
          'ಮೊಲೆತೊಟ್ಟಿನಿಂದ ಹೊಸ ಸ್ರಾವ (ವಿಶೇಷವಾಗಿ ರಕ್ತ), ಚರ್ಮದಲ್ಲಿ ಕುಳಿ, ಮೊಲೆತೊಟ್ಟಿನ ಬದಲಾವಣೆ ಅಥವಾ ಸ್ತನದ ಆಕಾರದಲ್ಲಿ ಅಸಾಮಾನ್ಯ ಬದಲಾವಣೆ ಇದ್ದರೆ ತಪಾಸಣೆ ಮಾಡಿಸಿಕೊಳ್ಳಿ.',
          'ನಿರಂತರ ನೋವು ಅಥವಾ ಸ್ತನದಲ್ಲಿ ಇತರ ಹೊಸ ಬದಲಾವಣೆಗಳಿದ್ದರೆ ವೈದ್ಯರೊಂದಿಗೆ ಚರ್ಚಿಸಿ. ಇವು ಕ್ಯಾನ್ಸರ್ ಅಲ್ಲದ ಕಾರಣಗಳಿಂದಲೂ ಉಂಟಾಗಬಹುದು, ಆದರೂ ಪರಿಶೀಲನೆ ಅಗತ್ಯ.',
        ],
      },
      {
        title: 'ವೈದ್ಯರ ಭೇಟಿಗೆ ಸಿದ್ಧತೆ',
        summary: 'ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡುವ ಮೊದಲು ಉಪಯುಕ್ತ ಮಾಹಿತಿಯನ್ನು ಸಿದ್ಧಪಡಿಸಿ.',
        points: [
          'ಬದಲಾವಣೆ ಯಾವಾಗ ಆರಂಭವಾಯಿತು, ಎಲ್ಲಿ ಇದೆ ಮತ್ತು ಸಮಯದೊಂದಿಗೆ ಹೇಗೆ ಬದಲಾಗಿದೆ ಎಂಬುದನ್ನು ದಾಖಲಿಸಿ.',
          'ಲಭ್ಯವಿದ್ದರೆ ಹಿಂದಿನ ಅಲ್ಟ್ರಾಸೌಂಡ್ ಚಿತ್ರಗಳು, ವೈದ್ಯಕೀಯ ಚಿತ್ರಣ ವರದಿಗಳು ಮತ್ತು ಸಂಬಂಧಿತ ಆರೋಗ್ಯ ಇತಿಹಾಸವನ್ನು ತೆಗೆದುಕೊಂಡು ಹೋಗಿ.',
          'ಫಲಿತಾಂಶದ ಅರ್ಥ ಮತ್ತು ಮುಂದಿನ ಪರೀಕ್ಷೆ ಬೇಕೇ ಎಂದು ವೈದ್ಯರನ್ನು ಕೇಳಿ. ಈ ಪ್ರಯೋಗಾತ್ಮಕ AI ಫಲಿತಾಂಶ ವೈದ್ಯಕೀಯ ವರದಿಯಲ್ಲ.',
        ],
      },
    ],
  },
  hi: {
    heading: 'अब आगे क्या करें?',
    description: 'यह स्तन स्वास्थ्य संबंधी सामान्य जानकारी है, AI वर्गीकरण के आधार पर व्यक्तिगत चिकित्सकीय सलाह नहीं।',
    reminder: 'AI परिणाम में Benign, Normal या Malignant आने से कैंसर होने या न होने की पुष्टि नहीं होती। आपकी स्वास्थ्य संबंधी चिंताओं का मूल्यांकन केवल योग्य स्वास्थ्य पेशेवर कर सकते हैं।',
    exploreSymptoms: 'लक्षणों का मार्गदर्शन खोलें',
    cards: [
      {
        title: 'अगले कदम',
        summary: 'जानें कि चिकित्सकीय जाँच कब करवानी चाहिए।',
        points: [
          'स्तन में कोई नया या असामान्य बदलाव दिखे तो जल्द किसी योग्य स्वास्थ्य पेशेवर से संपर्क करें।',
          'AI में Benign या Normal दिखने का अर्थ यह नहीं है कि चिकित्सकीय जाँच की आवश्यकता नहीं है।',
          'डॉक्टर तय कर सकते हैं कि शारीरिक परीक्षण, इमेजिंग या आगे की जाँच की जरूरत है या नहीं।',
        ],
      },
      {
        title: 'चेतावनी के संकेत',
        summary: 'जानें किन बदलावों पर डॉक्टर से बात करनी चाहिए।',
        points: [
          'स्तन या बगल में नई गाँठ या सूजन पर ध्यान दें।',
          'निप्पल से नया स्राव, खासकर खून, त्वचा पर गड्ढे, निप्पल में बदलाव या स्तन के आकार में असामान्य बदलाव होने पर जाँच करवाएँ।',
          'लगातार दर्द या स्तन में किसी अन्य नए बदलाव के बारे में डॉक्टर से बात करें। इनके गैर-कैंसर कारण भी हो सकते हैं, फिर भी जाँच जरूरी है।',
        ],
      },
      {
        title: 'डॉक्टर से मिलने की तैयारी',
        summary: 'अपनी मुलाकात के लिए जरूरी जानकारी तैयार रखें।',
        points: [
          'लिखें कि बदलाव कब शुरू हुआ, कहाँ है और समय के साथ कैसे बदला है।',
          'यदि उपलब्ध हों, तो पिछले अल्ट्रासाउंड, मेडिकल इमेजिंग रिपोर्ट और संबंधित स्वास्थ्य इतिहास साथ ले जाएँ।',
          'डॉक्टर से पूछें कि जाँच का क्या अर्थ है और आगे कोई परीक्षण या फॉलो-अप चाहिए या नहीं। यह प्रयोगात्मक AI आउटपुट चिकित्सकीय रिपोर्ट नहीं है।',
        ],
      },
    ],
  },
}

type Page = 'welcome' | 'overview' | 'awareness' | 'symptom-guidance' | 'risk-awareness' | 'upload' | 'modules' | 'about'

// Labels for the new mobile navigation controls; existing translation keys are unchanged.
const mobileNavigationLabels: Record<Language, { open: string; close: string }> = {
  en: { open: 'Open navigation', close: 'Close navigation' },
  kn: { open: 'ನ್ಯಾವಿಗೇಶನ್ ತೆರೆಯಿರಿ', close: 'ನ್ಯಾವಿಗೇಶನ್ ಮುಚ್ಚಿರಿ' },
  hi: { open: 'नेविगेशन खोलें', close: 'नेविगेशन बंद करें' },
}

// Preserve the original #section links as direct, bookmarkable navigation.
const getPageFromHash = (hash: string): Page => {
  switch (hash) {
    case '#overview':
      return 'overview'
    case '#awareness':
      return 'awareness'
    case '#symptom-guidance':
      return 'symptom-guidance'
    case '#risk-awareness':
      return 'risk-awareness'
    case '#upload':
      return 'upload'
    case '#modules':
      return 'modules'
    case '#about':
      return 'about'
    default:
      return 'welcome'
  }
}

function App() {
  const [language, setLanguage] = useState<Language>('en')
  const [activePage, setActivePage] = useState<Page>(() => getPageFromHash(window.location.hash))
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const t = translations[language]
  const noImage = noImageText[language]
  const mobileNavText = mobileNavigationLabels[language]
  const chartText = scoreChartText[language]
  const insightText = imageInsightText[language]
  const careText = careGuidanceText[language]

  const [backendState, setBackendState] = useState<BackendState>('checking')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState<'type' | 'size' | ''>('')
  const [confirmedUltrasound, setConfirmedUltrasound] = useState(false)
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('demo')
  const [researchAcknowledged, setResearchAcknowledged] = useState(false)

  const [uploadState, setUploadState] = useState<ProcessState>('idle')
  const [validatedDetails, setValidatedDetails] = useState<ValidationDetails | null>(null)
  const [uploadErrorCode, setUploadErrorCode] = useState(0)

  const [predictionState, setPredictionState] = useState<ProcessState>('idle')
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
  const [selectedScoreCategory, setSelectedScoreCategory] = useState<string | null>(null)
  const [activeImageInsight, setActiveImageInsight] = useState<ImageInsight | null>(null)
  const [predictionErrorCode, setPredictionErrorCode] = useState(0)

  const [gradcamState, setGradcamState] = useState<ProcessState>('idle')
  const [gradcamUrl, setGradcamUrl] = useState<string | null>(null)
  const [gradcamErrorCode, setGradcamErrorCode] = useState(0)

  // Help screen readers use the correct language.
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  // Hash links preserve browser history, existing deep links, and refreshes.
  useEffect(() => {
    const syncPage = () => {
      setActivePage(getPageFromHash(window.location.hash))
      setMobileNavOpen(false)
    }
    window.addEventListener('hashchange', syncPage)
    window.addEventListener('popstate', syncPage)
    return () => {
      window.removeEventListener('hashchange', syncPage)
      window.removeEventListener('popstate', syncPage)
    }
  }, [])

  // Let mobile users dismiss the navigation without changing their current page.
  useEffect(() => {
    if (!mobileNavOpen) return
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', dismissOnEscape)
    return () => window.removeEventListener('keydown', dismissOnEscape)
  }, [mobileNavOpen])

  // A target may be mounted only after its view becomes active.
  useEffect(() => {
    const targetId = window.location.hash.substring(1)
    if (!targetId) {
      window.scrollTo(0, 0)
      return
    }
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'auto', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [activePage])

  const isUploading = uploadState === 'loading'
  const isPredicting = predictionState === 'loading'
  const isExplaining = gradcamState === 'loading'
  const busy = isUploading || isPredicting || isExplaining
  const canAnalyze = Boolean(
    selectedImage && confirmedUltrasound &&
    (analysisMode === 'demo' || researchAcknowledged) && !busy
  )
  const aiQuery = analysisMode === 'research' ? '?research_acknowledged=true' : ''

  const modules = [
    { title: t.aiModuleTitle, description: t.aiModuleDescription },
    { title: t.explainModuleTitle, description: t.explainModuleDescription },
    { title: t.awarenessModuleTitle, description: t.awarenessModuleDescription },
    { title: t.languageModuleTitle, description: t.languageModuleDescription },
  ]

  const statusLabel = {
    checking: t.backendChecking,
    connected: t.backendConnected,
    unavailable: t.backendUnavailable,
    offline: t.backendOffline,
  }[backendState]


  const requestErrorText = (code: number, forAI = false) => {
    if (code === 503) return t.serviceUnavailable
    if (code === 413) return t.imageTooLarge
    if (code === 422 && forAI) {
      return analysisMode === 'research' ? t.researchRejected : t.demoRejected
    }
    if (code === 400 || code === 422) return t.invalidImage
    return t.requestFailed
  }

  const translatedClass = (label: string) => {
    switch (label.toLowerCase()) {
      case 'benign': return t.benign
      case 'malignant': return t.malignant
      case 'normal': return t.normal
      default: return label
    }
  }

  const categoryExplanation = (label: string) => {
    switch (label.toLowerCase()) {
      case 'benign': return t.benignCategory
      case 'malignant': return t.malignantCategory
      case 'normal': return t.normalCategory
      default: return t.notADiagnosis
    }
  }

  const resetAnalysis = () => {
    setPredictionState('idle')
    setPredictionResult(null)
    setSelectedScoreCategory(null)
    setActiveImageInsight(null)
    setPredictionErrorCode(0)
    setGradcamState('idle')
    setGradcamUrl(null)
    setGradcamErrorCode(0)
  }

  const changeAnalysisMode = (mode: AnalysisMode) => {
    if (busy) return
    setAnalysisMode(mode)
    setResearchAcknowledged(false)
    setConfirmedUltrasound(false)
    setUploadState('idle')
    setUploadErrorCode(0)
    setValidatedDetails(null)
    resetAnalysis()
  }

  // Release browser preview URLs when changed or when the component unmounts.
  useEffect(() => {
    if (!previewUrl) return

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Release Grad-CAM image URLs when changed or when the component unmounts.
  useEffect(() => {
    return () => {
      if (gradcamUrl) URL.revokeObjectURL(gradcamUrl)
    }
  }, [gradcamUrl])

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || busy) return

    setPreviewUrl(null)
    setUploadState('idle')
    setValidatedDetails(null)
    setPredictionState('idle')
    setPredictionResult(null)
    setSelectedScoreCategory(null)
    setActiveImageInsight(null)
    setGradcamState('idle')
    setGradcamUrl(null)
    setConfirmedUltrasound(false)
    setResearchAcknowledged(false)
    setImageError('')

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setImageError('type')
      setSelectedImage(null)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError('size')
      setSelectedImage(null)
      return
    }
    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const uploadToBackend = async () => {
    if (!selectedImage || busy) return
    setUploadState('loading')
    setValidatedDetails(null)
    setUploadErrorCode(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedImage)
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        setUploadErrorCode(response.status)
        setUploadState('error')
        return
      }
      const data: ValidationDetails = await response.json()
      setValidatedDetails(data)
      setUploadState('success')
    } catch {
      setUploadErrorCode(0)
      setUploadState('error')
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage || !canAnalyze) return
    setPredictionState('loading')
    setPredictionResult(null)
    setSelectedScoreCategory(null)
    setPredictionErrorCode(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedImage)
      const response = await fetch(`/api/predict${aiQuery}`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        setPredictionErrorCode(response.status)
        setPredictionState('error')
        return
      }
      const data: PredictionResult = await response.json()
      if (
        data.analysis_performed !== true ||
        !data.predicted_class ||
        !data.model_scores ||
        !data.medical_notice
      ) {
        setPredictionErrorCode(-1)
        setPredictionState('error')
        return
      }
      setPredictionResult(data)
      setPredictionState('success')
    } catch {
      setPredictionErrorCode(0)
      setPredictionState('error')
    }
  }

  const generateGradcam = async () => {
    if (!selectedImage || !canAnalyze) return
    setGradcamState('loading')
    setGradcamUrl(null)
    setGradcamErrorCode(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedImage)
      const response = await fetch(`/api/explain${aiQuery}`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        setGradcamErrorCode(response.status)
        setGradcamState('error')
        return
      }
      const imageBlob = await response.blob()
      if (!imageBlob.type.includes('image/png') || imageBlob.size === 0) {
        setGradcamErrorCode(-1)
        setGradcamState('error')
        return
      }
      setGradcamUrl(URL.createObjectURL(imageBlob))
      setGradcamState('success')
    } catch {
      setGradcamErrorCode(0)
      setGradcamState('error')
    }
  }

  useEffect(() => {
    let active = true
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let controller: AbortController | undefined

    const checkBackend = async () => {
      controller = new AbortController()

      try {
        const response = await fetch('/api/health', {
          signal: controller.signal,
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Backend health check failed')
        }

        const data: { status?: string } = await response.json()

        if (!active) return

        setBackendState(
          data.status === 'healthy'
            ? 'connected'
            : 'unavailable'
        )
      } catch {
        if (!active) return
        setBackendState('offline')
      }

      if (active) {
        retryTimer = setTimeout(() => {
          void checkBackend()
        }, 30000)
      }
    }

    void checkBackend()

    return () => {
      active = false
      if (retryTimer !== undefined) {
        clearTimeout(retryTimer)
      }
      controller?.abort()
    }
  }, [])

  return (
    <div className="app-layout">
      <aside className={`sidebar${mobileNavOpen ? ' is-open' : ''}`} id="main-sidebar">
        <button
          type="button"
          className="mobile-menu-close"
          aria-label={mobileNavText.close}
          onClick={() => setMobileNavOpen(false)}
        >
          <span aria-hidden="true">×</span>
        </button>
        <a className="brand" href="#home" aria-label={t.title} onClick={() => setMobileNavOpen(false)}>
          <div className="brand-icon">+</div>
          <div>
            <strong>{t.title}</strong>
            <small>{t.brandSubtitle}</small>
          </div>
        </a>

        <nav aria-label={t.modulesHeading}>
          <a href="#overview" onClick={() => setMobileNavOpen(false)} aria-current={['overview', 'awareness', 'symptom-guidance', 'risk-awareness'].includes(activePage) ? 'page' : undefined}>{t.overview}</a>
          <a href="#upload" onClick={() => setMobileNavOpen(false)} aria-current={activePage === 'upload' ? 'page' : undefined}>{t.upload}</a>
          <a href="#modules" onClick={() => setMobileNavOpen(false)} aria-current={activePage === 'modules' ? 'page' : undefined}>{t.modules}</a>
          <a href="#about" onClick={() => setMobileNavOpen(false)} aria-current={activePage === 'about' ? 'page' : undefined}>{t.about}</a>
        </nav>

        <p className="sidebar-footer">{t.sidebarFooter}</p>
      </aside>

      {mobileNavOpen && (
        <button
          type="button"
          className="mobile-nav-backdrop"
          aria-label={mobileNavText.close}
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <button
              type="button"
              className="mobile-menu-toggle"
              aria-label={mobileNavText.open}
              aria-controls="main-sidebar"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
            >
              <span aria-hidden="true">☰</span>
            </button>
            <span>{t.title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label htmlFor="language-select">{t.languageLabel}:</label>
            <select
              id="language-select"
              value={language}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setLanguage(event.target.value as Language)}
              aria-label={t.languageLabel}
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="hi">हिन्दी</option>
            </select>
            <span className="status">{statusLabel}</span>
          </div>
        </header>

        {activePage === 'welcome' && (
          <section className="welcome-screen" id="home" aria-label={t.title}>
            <div className="welcome-screen-content">
              <span className="eyebrow">{t.heroTag}</span>
              <h1>{t.heroTitle}</h1>
              <p>{t.heroDescription}</p>
              <a className="primary-link" href="#overview">{t.overview}</a>
              <nav className="welcome-quick-links" aria-label={t.modulesHeading}>
                <a href="#upload">{t.upload}<span aria-hidden="true"> ↗</span></a>
                <a href="#modules">{t.modules}<span aria-hidden="true"> ↗</span></a>
                <a href="#about">{t.about}<span aria-hidden="true"> ↗</span></a>
              </nav>
            </div>
          </section>
        )}

        {activePage === 'overview' && (
          <div className="overview-view" id="overview">
            <section className="hero">
              <span className="eyebrow">{t.heroTag}</span>
              <h1>{t.heroTitle}</h1>
              <p>{t.heroDescription}</p>
              <a className="primary-link" href="#modules">{t.exploreModules}</a>
            </section>

            <section
              className="no-image-section"
              aria-labelledby="no-image-heading"
            >
              <h2 id="no-image-heading">{noImage.title}</h2>
              <p>{noImage.description}</p>

              <div className="no-image-links">
                <a className="overview-topic-card" href="#awareness">
                  <span className="topic-card-symbol" aria-hidden="true">♡</span>
                  <span className="topic-card-label">{noImage.awareness}</span>
                  <span className="topic-card-arrow" aria-hidden="true">→</span>
                </a>
                <a className="overview-topic-card" href="#symptom-guidance">
                  <span className="topic-card-symbol" aria-hidden="true">✦</span>
                  <span className="topic-card-label">{noImage.symptoms}</span>
                  <span className="topic-card-arrow" aria-hidden="true">→</span>
                </a>
                <a className="overview-topic-card" href="#risk-awareness">
                  <span className="topic-card-symbol" aria-hidden="true">◎</span>
                  <span className="topic-card-label">{noImage.risk}</span>
                  <span className="topic-card-arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </section>

          </div>
        )}

        {activePage === 'awareness' && (
          <div className="guidance-view">
            <a className="guidance-back" href="#overview">← {t.overview}</a>
            <BreastAwareness language={language} />
          </div>
        )}

        {activePage === 'symptom-guidance' && (
          <div className="guidance-view">
            <a className="guidance-back" href="#overview">← {t.overview}</a>
            <SymptomGuidance language={language} />
          </div>
        )}

        {activePage === 'risk-awareness' && (
          <div className="guidance-view">
            <a className="guidance-back" href="#overview">← {t.overview}</a>
            <RiskFactors language={language} />
          </div>
        )}

        {activePage === 'upload' && (
          <section className="upload-section" id="upload">
            <div className="section-heading">
              <h2>{t.uploadHeading}</h2>
              <p>{t.uploadDescription}</p>
            </div>

            <ol className="upload-journey" aria-label={t.uploadHeading}>
              <li className={selectedImage ? 'is-complete' : ''}>
                <span className="upload-journey-number" aria-hidden="true">01</span>
                <span>{t.selectImage}</span>
              </li>
              <li className={uploadState === 'success' ? 'is-complete' : ''}>
                <span className="upload-journey-number" aria-hidden="true">02</span>
                <span>{t.validateImage}</span>
              </li>
              <li className={predictionState === 'success' ? 'is-complete' : ''}>
                <span className="upload-journey-number" aria-hidden="true">03</span>
                <span>{t.analyze}</span>
              </li>
              <li className={gradcamState === 'success' ? 'is-complete' : ''}>
                <span className="upload-journey-number" aria-hidden="true">04</span>
                <span>{t.explain}</span>
              </li>
            </ol>

            <div className="upload-card">
              <div className="upload-controls">
                <fieldset className="analysis-mode-selector" disabled={busy}>
                  <legend>{t.analysisModeTitle}</legend>
                  <div className="analysis-mode-options">
                    <label className="analysis-mode-option">
                      <input
                        type="radio"
                        name="analysis-mode"
                        value="demo"
                        checked={analysisMode === 'demo'}
                        onChange={() => changeAnalysisMode('demo')}
                      />
                      <span>{t.demoMode}</span>
                    </label>
                    <label className="analysis-mode-option">
                      <input
                        type="radio"
                        name="analysis-mode"
                        value="research"
                        checked={analysisMode === 'research'}
                        onChange={() => changeAnalysisMode('research')}
                      />
                      <span>{t.researchMode}</span>
                    </label>
                  </div>
                  <p className="analysis-mode-help">
                    {analysisMode === 'demo' ? t.demoModeHelp : t.researchModeHelp}
                  </p>
                </fieldset>

                <label htmlFor="medical-image">{t.selectImage}</label>
                <input
                  id="medical-image"
                  className="upload-input"
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleImageChange}
                  disabled={busy}
                />
                <p className="upload-hint">{t.acceptedFormats}</p>

                {imageError && (
                  <p className="upload-error" role="alert">
                    {imageError === 'type' ? t.invalidFileType : t.imageTooLarge}
                  </p>
                )}

                {selectedImage && (
                  <div className="file-details">
                    <p><strong>{t.file}:</strong> {selectedImage.name}</p>
                    <p><strong>{t.size}:</strong> {(selectedImage.size / 1024).toFixed(2)} KB</p>
                    <span className="upload-success">{t.imageSelected}</span>

                    <label
                      htmlFor="confirm-ultrasound"
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '12px 0' }}
                    >
                      <input
                        id="confirm-ultrasound"
                        type="checkbox"
                        checked={confirmedUltrasound}
                        disabled={busy}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setConfirmedUltrasound(event.target.checked)
                          if (!event.target.checked) resetAnalysis()
                        }}
                      />
                      <span>{t.confirmUltrasound}</span>
                    </label>

                    {analysisMode === 'research' && (
                      <div className="research-acknowledgement">
                        <p className="research-warning">{t.researchWarning}</p>
                        <label htmlFor="research-acknowledge" className="research-check-label">
                          <input
                            id="research-acknowledge"
                            type="checkbox"
                            checked={researchAcknowledged}
                            disabled={busy}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                              setResearchAcknowledged(event.target.checked)
                              resetAnalysis()
                            }}
                          />
                          <span>{t.researchConsent}</span>
                        </label>
                      </div>
                    )}

                    <button
                      type="button"
                      className="upload-button"
                      onClick={uploadToBackend}
                      disabled={busy}
                    >
                      {isUploading ? t.validating : t.validateImage}
                    </button>

                    <button
                      type="button"
                      className="upload-button"
                      onClick={analyzeImage}
                      disabled={!canAnalyze}
                    >
                      {isPredicting ? t.analyzing : t.analyze}
                    </button>

                    <button
                      type="button"
                      className="upload-button"
                      onClick={generateGradcam}
                      disabled={!canAnalyze}
                    >
                      {isExplaining ? t.generatingHeatmap : t.explain}
                    </button>
                  </div>
                )}

                {uploadState === 'loading' && <p className="upload-feedback" role="status">{t.validatingStatus}</p>}
                {uploadState === 'success' && validatedDetails && (
                  <p className="upload-feedback" role="status">
                    {t.fileFormatVerified} {t.fileFormat}: {validatedDetails.format}.{' '}
                    {t.dimensions}: {validatedDetails.width} × {validatedDetails.height}.{' '}
                    {t.validationOnlyNotice}
                  </p>
                )}
                {uploadState === 'error' && (
                  <p className="upload-error" role="alert">{requestErrorText(uploadErrorCode)}</p>
                )}

                {predictionState === 'loading' && <p className="upload-feedback" role="status">{t.analyzingStatus}</p>}
                {predictionState === 'success' && <p className="upload-feedback" role="status">{t.analysisCompleted}</p>}
                {predictionState === 'error' && (
                  <p className="upload-error" role="alert">
                    {predictionErrorCode === -1 ? t.invalidPredictionResponse : requestErrorText(predictionErrorCode, true)}
                  </p>
                )}

                {gradcamState === 'loading' && <p className="upload-feedback" role="status">{t.heatmapStatus}</p>}
                {gradcamState === 'success' && <p className="upload-feedback" role="status">{t.heatmapCompleted}</p>}
                {gradcamState === 'error' && (
                  <p className="upload-error" role="alert">
                    {gradcamErrorCode === -1 ? t.invalidHeatmapResponse : requestErrorText(gradcamErrorCode, true)}
                  </p>
                )}

                {gradcamUrl && (
                  <div className="gradcam-result">
                    <h3>{t.gradcamHeading}</h3>
                    <img
                      src={gradcamUrl}
                      alt={t.gradcamAlt}
                      style={{ width: '100%', maxWidth: '224px', height: 'auto', borderRadius: '8px' }}
                    />
                    <p className="upload-disclaimer">{t.gradcamNotice}</p>
                  </div>
                )}

                {predictionResult && (
                  <div className="file-details" aria-label={t.analysisResult}>
                    <h3>{t.analysisResult}</h3>
                    <p className="result-mode-tag">{analysisMode === 'research' ? t.researchMode : t.demoMode}</p>
                    <p>
                      <strong>{t.predictedClass}:</strong>{' '}
                      {translatedClass(predictionResult.predicted_class)}
                      <span className="category-explanation">
                        {' '}— {categoryExplanation(predictionResult.predicted_class)}
                      </span>
                    </p>
                    <p><strong>{t.modelScores}:</strong></p>
                    {Object.entries(predictionResult.model_scores).map(([label, score]) => (
                      <p key={label}>{translatedClass(label)}: {Number(score).toFixed(4)}</p>
                    ))}

                    {/* A score chart for the current backend result. Bars are not cancer-risk probabilities. */}
                    <div className="score-chart" role="group" aria-label={t.modelScores}>
                      <p className="score-chart-hint">{chartText.instruction}</p>
                      <div className="score-chart-rows">
                        {Object.entries(predictionResult.model_scores).map(([label, score]) => {
                          const value = Number(score)
                          const displayedValue = value.toFixed(4)
                          const barWidth = Number.isFinite(value)
                            ? Math.max(0, Math.min(value, 1)) * 100
                            : 0
                          const isSelected = selectedScoreCategory === label
                          return (
                            <button
                              key={label}
                              type="button"
                              className={`score-chart-row${isSelected ? ' is-selected' : ''}`}
                              aria-pressed={isSelected}
                              aria-label={`${translatedClass(label)}: ${displayedValue}. ${chartText.detailTitle}`}
                              onClick={() => setSelectedScoreCategory(label)}
                              onMouseEnter={() => setSelectedScoreCategory(label)}
                              onFocus={() => setSelectedScoreCategory(label)}
                            >
                              <span className="score-chart-row-header">
                                <span className="score-chart-name">{translatedClass(label)}</span>
                                <span className="score-chart-value">{displayedValue}</span>
                              </span>
                              <span className="score-chart-track" aria-hidden="true">
                                <span className="score-chart-fill" style={{ width: `${barWidth}%` }} />
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      <div className="score-chart-axis" aria-hidden="true">
                        <span>0.0</span><span>1.0</span>
                      </div>
                      {selectedScoreCategory != null &&
                        Object.prototype.hasOwnProperty.call(predictionResult.model_scores, selectedScoreCategory) && (
                          <div className="score-chart-explanation" aria-live="polite" aria-atomic="true">
                            <strong>{chartText.detailTitle}</strong>
                            <p>
                              <strong>{translatedClass(selectedScoreCategory)}: {Number(predictionResult.model_scores[selectedScoreCategory]).toFixed(4)}</strong>
                              {' — '}{categoryExplanation(selectedScoreCategory)}
                            </p>
                            <p>
                              {chartText.detailPrefix}{' '}
                              <strong>{Number(predictionResult.model_scores[selectedScoreCategory]).toFixed(4)}</strong>{' '}
                              {chartText.detailSuffix}
                            </p>
                            {Number(predictionResult.model_scores[selectedScoreCategory]).toFixed(4) === '0.0000' && (
                              <p>{chartText.zeroNote}</p>
                            )}
                          </div>
                        )}
                    </div>
                    <p>
                      <strong>{t.imageStored}:</strong>{' '}
                      {predictionResult.stored ? t.yes : t.no}
                    </p>
                    <p className="upload-disclaimer">{t.medicalNotice}</p>
                  </div>
                )}
              </div>

              <div className="upload-preview">
                {previewUrl && selectedImage ? (
                  <div className="image-explainer">
                    <div className="image-explainer-original">
                      <img src={previewUrl} alt={t.imagePreviewAlt} />
                    </div>
                    <div className="image-explainer-flow" role="group" aria-label={insightText.journeyTitle}>
                      <h3>{insightText.journeyTitle}</h3>
                      <p className="image-explainer-hint">{insightText.instruction}</p>
                      <div className="image-explainer-branches" aria-label={insightText.journeyTitle}>
                        {([
                          { key: 'file', title: insightText.fileTitle,
                            state: uploadState === 'success' ? t.fileFormatVerified : uploadState === 'loading' ? t.validating : t.imageSelected },
                          { key: 'prediction', title: insightText.predictionTitle,
                            state: predictionResult ? t.analysisCompleted : predictionState === 'loading' ? t.analyzing : insightText.pending },
                          { key: 'gradcam', title: insightText.gradcamTitle,
                            state: gradcamUrl ? t.heatmapCompleted : gradcamState === 'loading' ? t.generatingHeatmap : insightText.pending },
                        ] as const).map((step, index) => (
                          <button
                            key={step.key}
                            type="button"
                            className={`image-explainer-node${activeImageInsight === step.key ? ' is-selected' : ''}`}
                            onClick={() => setActiveImageInsight(activeImageInsight === step.key ? null : step.key)}
                            aria-expanded={activeImageInsight === step.key}
                            aria-controls="image-explainer-detail"
                          >
                            <span className="image-explainer-node-number">0{index + 1}</span>
                            <span className="image-explainer-node-title">{step.title}</span>
                            <span className="image-explainer-node-state">{step.state}</span>
                          </button>
                        ))}
                      </div>
                      <div id="image-explainer-detail" className="image-explainer-detail" aria-live="polite">
                        {activeImageInsight === 'file' && (
                          <>
                            <h4>{insightText.fileTitle}</h4>
                            <p><strong>{t.file}:</strong> {selectedImage.name}</p>
                            <p><strong>{t.size}:</strong> {(selectedImage.size / 1024).toFixed(2)} KB</p>
                            {uploadState === 'success' && validatedDetails && (
                              <p>{t.fileFormatVerified} <strong>{t.fileFormat}:</strong> {validatedDetails.format}.{' '}
                                <strong>{t.dimensions}:</strong> {validatedDetails.width} × {validatedDetails.height}.</p>
                            )}
                            <p>{insightText.fileDescription}</p>
                            {uploadState === 'success' && validatedDetails && <p>{t.validationOnlyNotice}</p>}
                          </>
                        )}
                        {activeImageInsight === 'prediction' && (
                          <>
                            <h4>{insightText.predictionTitle}</h4>
                            {predictionResult ? (
                              <>
                                <p><strong>{t.predictedClass}:</strong> {translatedClass(predictionResult.predicted_class)}{' '}
                                  — {categoryExplanation(predictionResult.predicted_class)}</p>
                                {Object.entries(predictionResult.model_scores)
                                  .filter(([label]) => label.toLowerCase() === predictionResult.predicted_class.toLowerCase())
                                  .map(([label, value]) => (
                                    <p key={label}><strong>{t.modelScores} — {translatedClass(label)}:</strong>{' '}
                                      {Number(value).toFixed(4)}</p>
                                  ))}
                                <p>{t.medicalNotice}</p>
                              </>
                            ) : (
                              <p>{predictionState === 'loading' ? t.analyzingStatus
                                : predictionState === 'error' ? requestErrorText(predictionErrorCode, true)
                                : insightText.predictionPending}</p>
                            )}
                          </>
                        )}
                        {activeImageInsight === 'gradcam' && (
                          <>
                            <h4>{insightText.gradcamTitle}</h4>
                            {gradcamUrl ? (
                              <p>{t.gradcamNotice}</p>
                            ) : (
                              <p>{gradcamState === 'loading' ? t.heatmapStatus
                                : gradcamState === 'error' ? (gradcamErrorCode === -1 ? t.invalidHeatmapResponse : requestErrorText(gradcamErrorCode, true))
                                : insightText.gradcamPending}</p>
                            )}
                          </>
                        )}
                      </div>
                      <p className="image-explainer-boundary">{insightText.boundaries}</p>
                    </div>

                    {/* General, non-diagnostic guidance: never changes based on model output. */}
                    <section className="care-guidance" aria-labelledby="care-guidance-heading">
                      <div className="care-guidance-intro">
                        <h3 id="care-guidance-heading">{careText.heading}</h3>
                        <p>{careText.description}</p>
                      </div>
                      <div className="care-guidance-grid">
                        {careText.cards.map((card, index) => (
                          <details
                            key={index}
                            className={`care-guidance-card${index === 2 ? ' care-guidance-card-wide' : ''}`}
                          >
                            <summary className="care-guidance-summary">
                              <span className="care-guidance-number" aria-hidden="true">0{index + 1}</span>
                              <span className="care-guidance-summary-copy">
                                <strong>{card.title}</strong>
                                <span>{card.summary}</span>
                              </span>
                              <span className="care-guidance-toggle" aria-hidden="true">⌄</span>
                            </summary>
                            <div className="care-guidance-details">
                              <ul>
                                {card.points.map((point, pointIndex) => (
                                  <li key={pointIndex}>{point}</li>
                                ))}
                              </ul>
                              {index === 1 && (
                                <a className="care-guidance-link" href="#symptom-guidance">
                                  {careText.exploreSymptoms}<span aria-hidden="true"> →</span>
                                </a>
                              )}
                            </div>
                          </details>
                        ))}
                      </div>
                      <p className="care-guidance-reminder">{careText.reminder}</p>
                    </section>
                  </div>
                ) : (
                  <p>{t.previewPlaceholder}</p>
                )}
              </div>
            </div>
            <p className="upload-disclaimer">{t.aiUsageNotice}</p>
          </section>
        )}

        {activePage === 'modules' && (
          <section id="modules" className="modules-section">
            <div className="section-heading">
              <h2>{t.modulesHeading}</h2>
              <p>{t.modulesDescription}</p>
            </div>
            <div className="module-grid">
              {modules.map((module, index) => (
                <article className="module-card" key={index}>
                  <span className="module-number">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </article>
              ))}
            </div>
          </section>

        )}

        {activePage === 'about' && (
          <section className="notice" id="about">
            <strong>{t.projectNoticeTitle}</strong>
            <p>{t.projectNoticeText}</p>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
