
type Language = 'en' | 'kn' | 'hi'

type RiskContent = {
  title: string
  intro: string
  fixedTitle: string
  fixedFactors: string[]
  lifestyleTitle: string
  lifestyleFactors: string[]
  familyTitle: string
  familyText: string
  doctorTitle: string
  doctorText: string
  sourcesTitle: string
  notice: string
}

const translations: Record<Language, RiskContent> = {
  en: {
    title: 'Breast Cancer Risk Awareness',
    intro:
      'Learn about factors associated with breast cancer risk and ways to discuss your health with a medical professional.',

    fixedTitle: 'Factors You Cannot Change',
    fixedFactors: [
      'Age: Breast cancer risk generally increases with age.',
      'Family history: Breast or ovarian cancer in close relatives may increase risk.',
      'Genetics: Certain inherited gene changes, including BRCA1 and BRCA2, increase risk.',
      'Personal medical history: Certain breast conditions or previous chest radiation may increase risk.',
      'Breast density: Dense breast tissue is associated with higher risk.',
    ],

    lifestyleTitle: 'Factors You May Influence',
    lifestyleFactors: [
      'Regular physical activity can support breast health.',
      'Limiting or avoiding alcohol can help reduce risk.',
      'Maintaining a healthy weight, particularly after menopause, may help reduce risk.',
      'Discuss hormone treatments and their risks with your doctor before making changes.',
    ],

    familyTitle: 'Family History and Genetics',
    familyText:
      'A history of breast or ovarian cancer on either side of your family may be relevant. Multiple affected relatives, cancer at a young age, or a known inherited gene change are reasons to discuss genetic risk with a healthcare professional.',

    doctorTitle: 'When Should You Seek Medical Advice?',
    doctorText:
      'Discuss your personal and family history with a qualified healthcare professional, especially if close relatives have had breast or ovarian cancer. A professional can advise whether further assessment, genetic counselling, or screening is appropriate.',

    sourcesTitle: 'Trusted Medical Sources',

    notice:
      'Educational information only. Risk factors do not determine whether you have cancer. Having no known risk factors does not mean zero risk. This module does not calculate individual cancer risk or replace medical consultation.',
  },

  kn: {
    title: 'ಸ್ತನ ಕ್ಯಾನ್ಸರ್ ಅಪಾಯದ ಬಗ್ಗೆ ಜಾಗೃತಿ',
    intro:
      'ಸ್ತನ ಕ್ಯಾನ್ಸರ್ ಅಪಾಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಅಂಶಗಳು ಮತ್ತು ಆರೋಗ್ಯ ವೃತ್ತಿಪರರೊಂದಿಗೆ ಚರ್ಚಿಸಬೇಕಾದ ವಿಷಯಗಳನ್ನು ತಿಳಿಯಿರಿ.',

    fixedTitle: 'ಬದಲಾಯಿಸಲಾಗದ ಅಪಾಯದ ಅಂಶಗಳು',
    fixedFactors: [
      'ವಯಸ್ಸು: ವಯಸ್ಸು ಹೆಚ್ಚಾದಂತೆ ಸ್ತನ ಕ್ಯಾನ್ಸರ್ ಅಪಾಯ ಸಾಮಾನ್ಯವಾಗಿ ಹೆಚ್ಚಾಗುತ್ತದೆ.',
      'ಕುಟುಂಬದ ಇತಿಹಾಸ: ಹತ್ತಿರದ ಸಂಬಂಧಿಕರಲ್ಲಿ ಸ್ತನ ಅಥವಾ ಅಂಡಾಶಯದ ಕ್ಯಾನ್ಸರ್ ಇದ್ದರೆ ಅಪಾಯ ಹೆಚ್ಚಾಗಬಹುದು.',
      'ಆನುವಂಶಿಕ ಅಂಶಗಳು: BRCA1 ಮತ್ತು BRCA2 ಸೇರಿದಂತೆ ಕೆಲವು ಜೀನ್ ಬದಲಾವಣೆಗಳು ಅಪಾಯವನ್ನು ಹೆಚ್ಚಿಸುತ್ತವೆ.',
      'ವೈಯಕ್ತಿಕ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ: ಕೆಲವು ಸ್ತನ ಸಂಬಂಧಿತ ಸ್ಥಿತಿಗಳು ಅಥವಾ ಹಿಂದೆ ಎದೆ ಭಾಗಕ್ಕೆ ನೀಡಿದ ವಿಕಿರಣ ಚಿಕಿತ್ಸೆ ಅಪಾಯವನ್ನು ಹೆಚ್ಚಿಸಬಹುದು.',
      'ಸ್ತನದ ಸಾಂದ್ರತೆ: ಹೆಚ್ಚು ಸಾಂದ್ರತೆಯ ಸ್ತನ ಅಂಗಾಂಶವು ಹೆಚ್ಚಿನ ಅಪಾಯದೊಂದಿಗೆ ಸಂಬಂಧಿಸಿದೆ.',
    ],

    lifestyleTitle: 'ನೀವು ಪ್ರಭಾವಿಸಬಹುದಾದ ಅಂಶಗಳು',
    lifestyleFactors: [
      'ನಿಯಮಿತ ದೈಹಿಕ ಚಟುವಟಿಕೆಯು ಸ್ತನ ಆರೋಗ್ಯಕ್ಕೆ ಸಹಾಯ ಮಾಡಬಹುದು.',
      'ಮದ್ಯಪಾನವನ್ನು ಕಡಿಮೆ ಮಾಡುವುದು ಅಥವಾ ತ್ಯಜಿಸುವುದು ಅಪಾಯವನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಸಹಾಯ ಮಾಡಬಹುದು.',
      'ವಿಶೇಷವಾಗಿ ಋತುಬಂಧದ ನಂತರ ಆರೋಗ್ಯಕರ ತೂಕವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳುವುದು ಪ್ರಯೋಜನಕಾರಿಯಾಗಬಹುದು.',
      'ಹಾರ್ಮೋನ್ ಚಿಕಿತ್ಸೆಯಲ್ಲಿ ಬದಲಾವಣೆ ಮಾಡುವ ಮೊದಲು ವೈದ್ಯರೊಂದಿಗೆ ಅದರ ಅಪಾಯಗಳ ಬಗ್ಗೆ ಚರ್ಚಿಸಿ.',
    ],

    familyTitle: 'ಕುಟುಂಬದ ಇತಿಹಾಸ ಮತ್ತು ಆನುವಂಶಿಕತೆ',
    familyText:
      'ತಾಯಿ ಅಥವಾ ತಂದೆಯ ಕುಟುಂಬದಲ್ಲಿ ಸ್ತನ ಅಥವಾ ಅಂಡಾಶಯದ ಕ್ಯಾನ್ಸರ್ ಇತಿಹಾಸವು ಮುಖ್ಯವಾಗಬಹುದು. ಹಲವಾರು ಸಂಬಂಧಿಕರಿಗೆ ಕ್ಯಾನ್ಸರ್ ಇರುವುದು, ಚಿಕ್ಕ ವಯಸ್ಸಿನಲ್ಲಿ ಕ್ಯಾನ್ಸರ್ ಪತ್ತೆಯಾಗಿರುವುದು ಅಥವಾ ಆನುವಂಶಿಕ ಜೀನ್ ಬದಲಾವಣೆ ಇರುವುದು ವೈದ್ಯಕೀಯ ಸಲಹೆ ಪಡೆಯಲು ಕಾರಣಗಳಾಗಿವೆ.',

    doctorTitle: 'ವೈದ್ಯಕೀಯ ಸಲಹೆಯನ್ನು ಯಾವಾಗ ಪಡೆಯಬೇಕು?',
    doctorText:
      'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮತ್ತು ಕುಟುಂಬದ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸದ ಬಗ್ಗೆ ಅರ್ಹ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರೊಂದಿಗೆ ಚರ್ಚಿಸಿ. ಅಗತ್ಯವಿದ್ದರೆ ಹೆಚ್ಚಿನ ಮೌಲ್ಯಮಾಪನ, ಆನುವಂಶಿಕ ಸಮಾಲೋಚನೆ ಅಥವಾ ಸೂಕ್ತ ಸ್ಕ್ರೀನಿಂಗ್ ಕುರಿತು ಅವರು ಸಲಹೆ ನೀಡಬಹುದು.',

    sourcesTitle: 'ವಿಶ್ವಾಸಾರ್ಹ ವೈದ್ಯಕೀಯ ಮೂಲಗಳು',

    notice:
      'ಇದು ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ. ಅಪಾಯದ ಅಂಶಗಳಿಂದ ಕ್ಯಾನ್ಸರ್ ಇದೆಯೇ ಎಂದು ನಿರ್ಧರಿಸಲಾಗುವುದಿಲ್ಲ. ತಿಳಿದಿರುವ ಅಪಾಯದ ಅಂಶಗಳಿಲ್ಲದಿದ್ದರೂ ಕ್ಯಾನ್ಸರ್ ಅಪಾಯ ಶೂನ್ಯವಾಗುವುದಿಲ್ಲ. ಈ ವಿಭಾಗವು ವೈಯಕ್ತಿಕ ಕ್ಯಾನ್ಸರ್ ಅಪಾಯವನ್ನು ಲೆಕ್ಕಹಾಕುವುದಿಲ್ಲ ಮತ್ತು ವೈದ್ಯಕೀಯ ಸಲಹೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.',
  },

  hi: {
    title: 'स्तन कैंसर जोखिम जागरूकता',
    intro:
      'स्तन कैंसर के जोखिम से जुड़े कारकों और स्वास्थ्य विशेषज्ञ से चर्चा करने योग्य विषयों के बारे में जानें।',

    fixedTitle: 'ऐसे कारक जिन्हें बदला नहीं जा सकता',
    fixedFactors: [
      'उम्र: बढ़ती उम्र के साथ स्तन कैंसर का जोखिम सामान्यतः बढ़ता है।',
      'पारिवारिक इतिहास: करीबी रिश्तेदारों में स्तन या अंडाशय का कैंसर होने से जोखिम बढ़ सकता है।',
      'आनुवंशिकता: BRCA1 और BRCA2 जैसे जीन में कुछ विरासत में मिले बदलाव जोखिम बढ़ाते हैं।',
      'चिकित्सा इतिहास: स्तन की कुछ स्थितियाँ या पहले छाती पर दी गई रेडिएशन थेरेपी जोखिम बढ़ा सकती है।',
      'स्तन घनत्व: अधिक घने स्तन ऊतक का संबंध अधिक जोखिम से है।',
    ],

    lifestyleTitle: 'ऐसे कारक जिन पर आप प्रभाव डाल सकते हैं',
    lifestyleFactors: [
      'नियमित शारीरिक गतिविधि स्तन स्वास्थ्य के लिए लाभकारी हो सकती है।',
      'शराब कम करने या उससे बचने से जोखिम कम करने में मदद मिल सकती है।',
      'विशेष रूप से रजोनिवृत्ति के बाद स्वस्थ वजन बनाए रखना लाभकारी हो सकता है।',
      'हार्मोन उपचार में कोई बदलाव करने से पहले डॉक्टर से उसके जोखिमों पर चर्चा करें।',
    ],

    familyTitle: 'पारिवारिक इतिहास और आनुवंशिकता',
    familyText:
      'माता या पिता के परिवार में स्तन या अंडाशय के कैंसर का इतिहास महत्वपूर्ण हो सकता है। कई रिश्तेदारों में कैंसर, कम उम्र में कैंसर या ज्ञात आनुवंशिक जीन बदलाव होने पर स्वास्थ्य विशेषज्ञ से आनुवंशिक जोखिम के बारे में चर्चा करें।',

    doctorTitle: 'डॉक्टर से कब सलाह लें?',
    doctorText:
      'अपने व्यक्तिगत और पारिवारिक चिकित्सा इतिहास के बारे में योग्य स्वास्थ्य विशेषज्ञ से चर्चा करें। वे बता सकते हैं कि आगे की जाँच, आनुवंशिक परामर्श या स्क्रीनिंग की आवश्यकता है या नहीं।',

    sourcesTitle: 'विश्वसनीय चिकित्सा स्रोत',

    notice:
      'यह केवल शैक्षणिक जानकारी है। जोखिम कारकों से यह निर्धारित नहीं होता कि आपको कैंसर है या नहीं। ज्ञात जोखिम कारक न होने का मतलब शून्य जोखिम नहीं है। यह मॉड्यूल व्यक्तिगत कैंसर जोखिम की गणना नहीं करता और चिकित्सा सलाह का विकल्प नहीं है।',
  },
}

type Props = {
  language: string
}

const cardStyle = {
  padding: '22px',
  borderRadius: '14px',
  border: '1px solid rgba(128,128,128,0.3)',
  backgroundColor: '#f1f3f6',
  color: '#14314a',
}

export default function RiskFactors({ language }: Props) {
  const normalized = language.toLowerCase()

  const selectedLanguage: Language =
    normalized === 'kn' || normalized === 'kannada'
      ? 'kn'
      : normalized === 'hi' || normalized === 'hindi'
        ? 'hi'
        : 'en'

  const t = translations[selectedLanguage]

  return (
    <section
      id="risk-awareness"
      aria-labelledby="risk-heading"
      style={{ padding: '28px 0', color: '#14314a' }}
    >
      <h2 id="risk-heading" style={{ color: '#14314a' }}>
        {t.title}
      </h2>

      <p style={{ lineHeight: 1.7 }}>
        {t.intro}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '18px',
          marginTop: '24px',
        }}
      >
        <article style={cardStyle}>
          <h3>🧬 {t.fixedTitle}</h3>

          <ul style={{ paddingLeft: '20px', lineHeight: 1.8 }}>
            {t.fixedFactors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </article>

        <article style={cardStyle}>
          <h3>🌿 {t.lifestyleTitle}</h3>

          <ul style={{ paddingLeft: '20px', lineHeight: 1.8 }}>
            {t.lifestyleFactors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </article>

        <article style={cardStyle}>
          <h3>👨‍👩‍👧 {t.familyTitle}</h3>

          <p style={{ lineHeight: 1.8 }}>
            {t.familyText}
          </p>
        </article>

        <article style={cardStyle}>
          <h3>🩺 {t.doctorTitle}</h3>

          <p style={{ lineHeight: 1.8 }}>
            {t.doctorText}
          </p>
        </article>

        <article style={cardStyle}>
          <h3>📚 {t.sourcesTitle}</h3>

          <ul style={{ paddingLeft: '20px', lineHeight: 2 }}>
            <li>
              <a
                href="https://www.cdc.gov/breast-cancer/risk-factors/index.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                CDC — Breast Cancer Risk Factors
              </a>
            </li>

            <li>
              <a
                href="https://www.who.int/news-room/fact-sheets/detail/breast-cancer"
                target="_blank"
                rel="noopener noreferrer"
              >
                World Health Organization
              </a>
            </li>

            <li>
              <a
                href="https://www.cancer.gov/types/breast/causes-risk-factors"
                target="_blank"
                rel="noopener noreferrer"
              >
                National Cancer Institute
              </a>
            </li>
          </ul>
        </article>
      </div>

      <p
        role="note"
        style={{
          marginTop: '22px',
          padding: '16px',
          borderLeft: '4px solid #d97706',
          borderRadius: '8px',
          backgroundColor: '#fff3e8',
          color: '#14314a',
          lineHeight: 1.8,
        }}
      >
        ⚠️ {t.notice}
      </p>
    </section>
  )
}
