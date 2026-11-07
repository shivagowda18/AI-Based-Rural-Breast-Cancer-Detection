
type Language = 'en' | 'kn' | 'hi'

type AwarenessContent = {
  title: string
  intro: string
  warningTitle: string
  warningSigns: string[]
  awarenessTitle: string
  awarenessSteps: string[]
  doctorTitle: string
  doctorText: string
  sourcesTitle: string
  notice: string
}

const translations: Record<Language, AwarenessContent> = {
  en: {
    title: 'Breast Health Awareness',
    intro:
      'Understand breast health, recognize possible warning signs, and learn when to seek medical advice.',

    warningTitle: 'Possible Warning Signs',
    warningSigns: [
      'A new lump or swelling in the breast or armpit.',
      'A change in breast size or shape.',
      'Dimpling, redness, or other unusual skin changes.',
      'Nipple changes or unexpected discharge, especially blood.',
      'New or persistent pain in the breast or armpit.',
    ],

    awarenessTitle: 'Breast Self-Awareness',
    awarenessSteps: [
      'Become familiar with how your breasts normally look and feel.',
      'Notice any unusual changes in the breast, nipple, or underarm.',
      'You may look in a mirror and gently feel the breast and underarm areas.',
      'Report new or unusual changes to a healthcare professional.',
    ],

    doctorTitle: 'When Should You Consult a Doctor?',
    doctorText:
      'Seek medical advice promptly if you notice a new lump, nipple discharge, or another unusual breast change. Many breast changes are not cancer, but a healthcare professional can assess them.',

    sourcesTitle: 'Trusted Medical Resources',

    notice:
      'Educational information only. Breast self-awareness does not replace professional screening, examination, or diagnosis. Some breast cancers have no noticeable symptoms.',
  },

  kn: {
    title: 'ಸ್ತನ ಆರೋಗ್ಯ ಜಾಗೃತಿ',
    intro:
      'ಸ್ತನ ಆರೋಗ್ಯ, ಸಂಭವನೀಯ ಎಚ್ಚರಿಕೆಯ ಲಕ್ಷಣಗಳು ಮತ್ತು ವೈದ್ಯಕೀಯ ಸಲಹೆಯನ್ನು ಯಾವಾಗ ಪಡೆಯಬೇಕು ಎಂಬುದನ್ನು ತಿಳಿಯಿರಿ.',

    warningTitle: 'ಸಂಭವನೀಯ ಎಚ್ಚರಿಕೆಯ ಲಕ್ಷಣಗಳು',
    warningSigns: [
      'ಸ್ತನದಲ್ಲಿ ಅಥವಾ ಕಂಕುಳಿನಲ್ಲಿ ಹೊಸ ಗಡ್ಡೆ ಅಥವಾ ಊತ.',
      'ಸ್ತನದ ಗಾತ್ರ ಅಥವಾ ಆಕಾರದಲ್ಲಿ ಬದಲಾವಣೆ.',
      'ಸ್ತನದ ಚರ್ಮದಲ್ಲಿ ಕುಳಿಗಳು, ಕೆಂಪಾಗುವಿಕೆ ಅಥವಾ ಅಸಾಮಾನ್ಯ ಬದಲಾವಣೆಗಳು.',
      'ಮೊಲೆತೊಟ್ಟಿನಲ್ಲಿ ಬದಲಾವಣೆ ಅಥವಾ ರಕ್ತ ಸೇರಿದಂತೆ ಅಸಾಮಾನ್ಯ ಸ್ರಾವ.',
      'ಸ್ತನ ಅಥವಾ ಕಂಕುಳಿನಲ್ಲಿ ಹೊಸದಾಗಿ ಕಾಣಿಸಿಕೊಳ್ಳುವ ಅಥವಾ ಮುಂದುವರಿಯುವ ನೋವು.',
    ],

    awarenessTitle: 'ಸ್ತನದ ಸ್ವಯಂ ಅರಿವು',
    awarenessSteps: [
      'ನಿಮ್ಮ ಸ್ತನಗಳು ಸಾಮಾನ್ಯವಾಗಿ ಹೇಗೆ ಕಾಣುತ್ತವೆ ಮತ್ತು ಹೇಗಿರುತ್ತವೆ ಎಂಬುದನ್ನು ತಿಳಿದುಕೊಳ್ಳಿ.',
      'ಸ್ತನ, ಮೊಲೆತೊಟ್ಟು ಅಥವಾ ಕಂಕುಳಿನ ಭಾಗದಲ್ಲಿನ ಅಸಾಮಾನ್ಯ ಬದಲಾವಣೆಗಳನ್ನು ಗಮನಿಸಿ.',
      'ಕನ್ನಡಿಯಲ್ಲಿ ನೋಡಿ ಮತ್ತು ಸ್ತನ ಹಾಗೂ ಕಂಕುಳಿನ ಭಾಗಗಳನ್ನು ಮೃದುವಾಗಿ ಸ್ಪರ್ಶಿಸಿ ಪರಿಶೀಲಿಸಬಹುದು.',
      'ಹೊಸ ಅಥವಾ ಅಸಾಮಾನ್ಯ ಬದಲಾವಣೆ ಕಂಡರೆ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರಿಗೆ ತಿಳಿಸಿ.',
    ],

    doctorTitle: 'ವೈದ್ಯರನ್ನು ಯಾವಾಗ ಸಂಪರ್ಕಿಸಬೇಕು?',
    doctorText:
      'ಹೊಸ ಗಡ್ಡೆ, ಮೊಲೆತೊಟ್ಟಿನಿಂದ ಅಸಾಮಾನ್ಯ ಸ್ರಾವ ಅಥವಾ ಸ್ತನದಲ್ಲಿ ಬೇರೆ ಅಸಾಮಾನ್ಯ ಬದಲಾವಣೆ ಕಂಡರೆ ಶೀಘ್ರ ವೈದ್ಯಕೀಯ ಸಲಹೆ ಪಡೆಯಿರಿ. ಅನೇಕ ಬದಲಾವಣೆಗಳು ಕ್ಯಾನ್ಸರ್ ಆಗಿರುವುದಿಲ್ಲ, ಆದರೆ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರು ಅವುಗಳನ್ನು ಪರಿಶೀಲಿಸಬಹುದು.',

    sourcesTitle: 'ವಿಶ್ವಾಸಾರ್ಹ ವೈದ್ಯಕೀಯ ಮಾಹಿತಿ',

    notice:
      'ಇದು ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ. ಸ್ತನದ ಸ್ವಯಂ ಅರಿವು ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ, ಶಿಫಾರಸು ಮಾಡಿದ ಸ್ಕ್ರೀನಿಂಗ್ ಅಥವಾ ರೋಗನಿರ್ಣಯಕ್ಕೆ ಪರ್ಯಾಯವಲ್ಲ. ಕೆಲವು ಸ್ತನ ಕ್ಯಾನ್ಸರ್‌ಗಳಲ್ಲಿ ಸ್ಪಷ್ಟ ಲಕ್ಷಣಗಳು ಇರುವುದಿಲ್ಲ.',
  },

  hi: {
    title: 'स्तन स्वास्थ्य जागरूकता',
    intro:
      'स्तन स्वास्थ्य, संभावित चेतावनी संकेतों और डॉक्टर से कब सलाह लेनी चाहिए, इसके बारे में जानें।',

    warningTitle: 'संभावित चेतावनी संकेत',
    warningSigns: [
      'स्तन या बगल में नई गाँठ या सूजन।',
      'स्तन के आकार या बनावट में बदलाव।',
      'स्तन की त्वचा में गड्ढे, लालिमा या असामान्य बदलाव।',
      'निप्पल में बदलाव या असामान्य स्राव, विशेषकर खून आना।',
      'स्तन या बगल में नया या लगातार रहने वाला दर्द।',
    ],

    awarenessTitle: 'स्तन के प्रति स्वयं जागरूकता',
    awarenessSteps: [
      'जानें कि आपके स्तन सामान्य रूप से कैसे दिखते और महसूस होते हैं।',
      'स्तन, निप्पल या बगल में होने वाले असामान्य बदलावों पर ध्यान दें।',
      'आप आईने में देख सकती हैं और स्तन तथा बगल को धीरे से महसूस कर सकती हैं।',
      'कोई नया या असामान्य बदलाव होने पर स्वास्थ्य विशेषज्ञ को बताएँ।',
    ],

    doctorTitle: 'डॉक्टर से कब संपर्क करें?',
    doctorText:
      'नई गाँठ, निप्पल से असामान्य स्राव या स्तन में अन्य असामान्य बदलाव होने पर जल्द चिकित्सा सलाह लें। कई बदलाव कैंसर नहीं होते, लेकिन स्वास्थ्य विशेषज्ञ उनकी जाँच कर सकते हैं।',

    sourcesTitle: 'विश्वसनीय चिकित्सा संसाधन',

    notice:
      'यह केवल शैक्षणिक जानकारी है। स्वयं जागरूकता, चिकित्सकीय जाँच, अनुशंसित स्क्रीनिंग या निदान का विकल्प नहीं है। कुछ स्तन कैंसर में कोई स्पष्ट लक्षण नहीं होते।',
  },
}

type Props = {
  language: string
}

const cardStyle = {
  padding: '22px',
  border: '1px solid rgba(128, 128, 128, 0.25)',
  borderRadius: '14px',
  backgroundColor: 'rgba(128, 128, 128, 0.05)',
}

export default function BreastAwareness({ language }: Props) {
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
      id="awareness"
      aria-labelledby="awareness-title"
      style={{ padding: '28px 0' }}
    >
      <header style={{ marginBottom: '24px' }}>
        <h2 id="awareness-title">{t.title}</h2>
        <p>{t.intro}</p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '18px',
        }}
      >
        <article style={cardStyle}>
          <h3>🔍 {t.warningTitle}</h3>
          <ul style={{ paddingLeft: '22px', lineHeight: 1.8 }}>
            {t.warningSigns.map((sign) => (
              <li key={sign}>{sign}</li>
            ))}
          </ul>
        </article>

        <article style={cardStyle}>
          <h3>❤️ {t.awarenessTitle}</h3>
          <ol style={{ paddingLeft: '22px', lineHeight: 1.8 }}>
            {t.awarenessSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article style={cardStyle}>
          <h3>🩺 {t.doctorTitle}</h3>
          <p style={{ lineHeight: 1.8 }}>
            {t.doctorText}
          </p>
        </article>

        <article style={cardStyle}>
          <h3>📚 {t.sourcesTitle}</h3>
          <ul style={{ paddingLeft: '22px', lineHeight: 2 }}>
            <li>
              <a
                href="https://www.who.int/news-room/fact-sheets/detail/breast-cancer"
                target="_blank"
                rel="noopener noreferrer"
              >
                World Health Organization (WHO)
              </a>
            </li>
            <li>
              <a
                href="https://www.cdc.gov/breast-cancer/symptoms/index.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                CDC — Breast Cancer Symptoms
              </a>
            </li>
            <li>
              <a
                href="https://www.nhs.uk/tests-and-treatments/how-to-check-your-breasts-or-chest/"
                target="_blank"
                rel="noopener noreferrer"
              >
                NHS — Breast Awareness
              </a>
            </li>
          </ul>
        </article>
      </div>

      <p
        role="note"
        style={{
          marginTop: '20px',
          padding: '16px',
          borderLeft: '4px solid #d97706',
          borderRadius: '6px',
          backgroundColor: 'rgba(217, 119, 6, 0.08)',
          lineHeight: 1.7,
        }}
      >
        ⚠️ {t.notice}
      </p>
    </section>
  )
}
