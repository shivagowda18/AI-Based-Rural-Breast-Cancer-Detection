
import { useState } from 'react'

type Language = 'en' | 'kn' | 'hi'
type Answer = 'yes' | 'no' | 'unsure'

type GuidanceText = {
  title: string
  intro: string
  questions: string[]
  yes: string
  no: string
  unsure: string
  choose: string
  resultTitle: string
  seekCare: string
  noFlags: string
  disclaimer: string
  reset: string
}

const translations: Record<Language, GuidanceText> = {
  en: {
    title: 'Breast Symptom Guidance',
    intro:
      'Answer these questions to learn when you should seek medical advice. Your answers stay on this page.',
    questions: [
      'Have you noticed a new lump or swelling in your breast or armpit?',
      'Have you noticed unusual nipple discharge, particularly blood?',
      'Have you noticed a new change in breast skin, shape, or nipple appearance?',
      'Have you experienced new or persistent breast or armpit pain?',
    ],
    yes: 'Yes',
    no: 'No',
    unsure: 'Not sure',
    choose: 'Select an answer',
    resultTitle: 'General Guidance',
    seekCare:
      'Please arrange a medical consultation promptly to discuss these changes. Many breast changes are not cancer, but a healthcare professional should assess new or unusual symptoms.',
    noFlags:
      'You have not reported these particular warning signs. This does not rule out breast cancer or replace recommended screening. Continue breast self-awareness and consult a healthcare professional if you notice changes.',
    disclaimer:
      'This is educational symptom guidance, not a medical diagnosis or validated risk assessment. Do not use it to decide whether a medical examination is unnecessary.',
    reset: 'Clear answers',
  },

  kn: {
    title: 'ಸ್ತನದ ಲಕ್ಷಣಗಳ ಮಾರ್ಗದರ್ಶನ',
    intro:
      'ವೈದ್ಯಕೀಯ ಸಲಹೆಯನ್ನು ಯಾವಾಗ ಪಡೆಯಬೇಕು ಎಂದು ತಿಳಿಯಲು ಈ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ. ನಿಮ್ಮ ಉತ್ತರಗಳು ಈ ಪುಟದಲ್ಲೇ ಉಳಿಯುತ್ತವೆ.',
    questions: [
      'ಸ್ತನದಲ್ಲಿ ಅಥವಾ ಕಂಕುಳಿನಲ್ಲಿ ಹೊಸ ಗಡ್ಡೆ ಅಥವಾ ಊತವನ್ನು ಗಮನಿಸಿದ್ದೀರಾ?',
      'ಮೊಲೆತೊಟ್ಟಿನಿಂದ ಅಸಾಮಾನ್ಯ ಸ್ರಾವ, ವಿಶೇಷವಾಗಿ ರಕ್ತಸ್ರಾವವನ್ನು ಗಮನಿಸಿದ್ದೀರಾ?',
      'ಸ್ತನದ ಚರ್ಮ, ಆಕಾರ ಅಥವಾ ಮೊಲೆತೊಟ್ಟಿನ ರೂಪದಲ್ಲಿ ಹೊಸ ಬದಲಾವಣೆ ಕಂಡಿದ್ದೀರಾ?',
      'ಸ್ತನದಲ್ಲಿ ಅಥವಾ ಕಂಕುಳಿನಲ್ಲಿ ಹೊಸದಾಗಿ ಕಾಣಿಸಿಕೊಂಡ ಅಥವಾ ಮುಂದುವರಿಯುವ ನೋವು ಇದೆಯೇ?',
    ],
    yes: 'ಹೌದು',
    no: 'ಇಲ್ಲ',
    unsure: 'ಖಚಿತವಿಲ್ಲ',
    choose: 'ಉತ್ತರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    resultTitle: 'ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶನ',
    seekCare:
      'ಈ ಬದಲಾವಣೆಗಳ ಬಗ್ಗೆ ಚರ್ಚಿಸಲು ಶೀಘ್ರ ವೈದ್ಯಕೀಯ ಸಲಹೆ ಪಡೆಯಿರಿ. ಅನೇಕ ಸ್ತನ ಬದಲಾವಣೆಗಳು ಕ್ಯಾನ್ಸರ್ ಆಗಿರುವುದಿಲ್ಲ. ಆದರೆ ಹೊಸ ಅಥವಾ ಅಸಾಮಾನ್ಯ ಲಕ್ಷಣಗಳನ್ನು ಆರೋಗ್ಯ ವೃತ್ತಿಪರರು ಪರಿಶೀಲಿಸಬೇಕು.',
    noFlags:
      'ಈ ನಿರ್ದಿಷ್ಟ ಎಚ್ಚರಿಕೆಯ ಲಕ್ಷಣಗಳನ್ನು ನೀವು ವರದಿ ಮಾಡಿಲ್ಲ. ಆದರೆ ಇದರಿಂದ ಸ್ತನ ಕ್ಯಾನ್ಸರ್ ಇಲ್ಲವೆಂದು ಖಚಿತಪಡಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ಶಿಫಾರಸು ಮಾಡಿದ ಸ್ಕ್ರೀನಿಂಗ್‌ಗೆ ಇದು ಪರ್ಯಾಯವಲ್ಲ. ಬದಲಾವಣೆಗಳನ್ನು ಗಮನಿಸಿ ಮತ್ತು ಅಗತ್ಯವಿದ್ದರೆ ವೈದ್ಯಕೀಯ ಸಲಹೆ ಪಡೆಯಿರಿ.',
    disclaimer:
      'ಇದು ಶೈಕ್ಷಣಿಕ ಲಕ್ಷಣಗಳ ಮಾರ್ಗದರ್ಶನ ಮಾತ್ರ. ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯ ಅಥವಾ ಪ್ರಮಾಣೀಕೃತ ಅಪಾಯ ಮೌಲ್ಯಮಾಪನವಲ್ಲ. ವೈದ್ಯಕೀಯ ತಪಾಸಣೆ ಅಗತ್ಯವಿಲ್ಲ ಎಂದು ನಿರ್ಧರಿಸಲು ಇದನ್ನು ಬಳಸಬೇಡಿ.',
    reset: 'ಉತ್ತರಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ',
  },

  hi: {
    title: 'स्तन लक्षण मार्गदर्शन',
    intro:
      'चिकित्सा सलाह कब लेनी चाहिए, यह समझने के लिए इन प्रश्नों के उत्तर दें। आपके उत्तर इसी पेज पर रहते हैं।',
    questions: [
      'क्या आपने स्तन या बगल में नई गाँठ या सूजन देखी है?',
      'क्या आपने निप्पल से असामान्य स्राव, विशेषकर खून आना, देखा है?',
      'क्या आपने स्तन की त्वचा, आकार या निप्पल की बनावट में नया बदलाव देखा है?',
      'क्या आपको स्तन या बगल में नया या लगातार रहने वाला दर्द है?',
    ],
    yes: 'हाँ',
    no: 'नहीं',
    unsure: 'पता नहीं',
    choose: 'उत्तर चुनें',
    resultTitle: 'सामान्य मार्गदर्शन',
    seekCare:
      'इन बदलावों के बारे में जल्द डॉक्टर से सलाह लें। स्तन के कई बदलाव कैंसर नहीं होते, लेकिन नए या असामान्य लक्षणों की जाँच स्वास्थ्य विशेषज्ञ से करवानी चाहिए।',
    noFlags:
      'आपने इन विशेष चेतावनी संकेतों की जानकारी नहीं दी है। इसका मतलब यह नहीं है कि स्तन कैंसर नहीं हो सकता। यह अनुशंसित स्क्रीनिंग का विकल्प नहीं है। बदलावों पर ध्यान दें और जरूरत पड़ने पर डॉक्टर से सलाह लें।',
    disclaimer:
      'यह केवल शैक्षणिक लक्षण मार्गदर्शन है, चिकित्सा निदान या प्रमाणित जोखिम आकलन नहीं। इसके आधार पर चिकित्सा जाँच को अनावश्यक न समझें।',
    reset: 'उत्तर साफ करें',
  },
}

type Props = {
  language: string
}

export default function SymptomGuidance({ language }: Props) {
  const [answers, setAnswers] = useState<Record<number, Answer>>({})

  const normalized = language.toLowerCase()

  const selectedLanguage: Language =
    normalized === 'kn' || normalized === 'kannada'
      ? 'kn'
      : normalized === 'hi' || normalized === 'hindi'
        ? 'hi'
        : 'en'

  const t = translations[selectedLanguage]

  const completed = t.questions.every(
    (_, index) => answers[index] !== undefined
  )

  const needsConsultation = Object.values(answers).some(
    (answer) => answer === 'yes' || answer === 'unsure'
  )

  return (
    <section
      id="symptom-guidance"
      aria-labelledby="symptom-heading"
      style={{ padding: '28px 0' }}
    >
      <h2 id="symptom-heading" style={{ color: '#14314a' }}>
  {t.title}
</h2>

      <p style={{ lineHeight: 1.7 }}>{t.intro}</p>

      <div
        style={{
          display: 'grid',
          gap: '16px',
          marginTop: '22px',
        }}
      >
        {t.questions.map((question, index) => (
          <div
            key={index}
            style={{
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid rgba(128,128,128,0.25)',
              background: 'rgba(128,128,128,0.05)',
            }}
          >
            <label
              htmlFor={`symptom-${index}`}
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '12px',
              }}
            >
              {index + 1}. {question}
            </label>

            <select
              id={`symptom-${index}`}
              value={answers[index] ?? ''}
              onChange={(event) => {
                const answer = event.target.value as Answer

                setAnswers((previous) => ({
                  ...previous,
                  [index]: answer,
                }))
              }}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #888',
                background: '#fff',
                color: '#111',
              }}
            >
              <option value="" disabled>
                {t.choose}
              </option>

              <option value="yes">{t.yes}</option>
              <option value="no">{t.no}</option>
              <option value="unsure">{t.unsure}</option>
            </select>
          </div>
        ))}
      </div>

      {completed && (
        <div
          role="status"
          style={{
            marginTop: '24px',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #d97706',
            background: 'rgba(217,119,6,0.08)',
          }}
        >
          <h3>{t.resultTitle}</h3>

          <p style={{ lineHeight: 1.8 }}>
            {needsConsultation ? t.seekCare : t.noFlags}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAnswers({})}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          cursor: 'pointer',
          borderRadius: '8px',
          border: '1px solid #888',
        }}
      >
        {t.reset}
      </button>

      <p
        role="note"
        style={{
          marginTop: '20px',
          fontSize: '14px',
          lineHeight: 1.7,
        }}
      >
        ⚠️ {t.disclaimer}
      </p>
    </section>
  )
}
