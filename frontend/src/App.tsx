import { useEffect, useState, type ChangeEvent } from 'react'
import { translations, type Language } from './translations'
import BreastAwareness from './BreastAwareness'
import SymptomGuidance from './SymptomGuidance'
import RiskFactors from './RiskFactors'
import './App.css'

const PUBLIC_EDUCATION_ONLY = import.meta.env.PROD

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

function App() {
  const [language, setLanguage] = useState<Language>('en')
  const t = translations[language]

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
  const [predictionErrorCode, setPredictionErrorCode] = useState(0)

  const [gradcamState, setGradcamState] = useState<ProcessState>('idle')
  const [gradcamUrl, setGradcamUrl] = useState<string | null>(null)
  const [gradcamErrorCode, setGradcamErrorCode] = useState(0)

  // Help screen readers use the correct language.
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const isUploading = uploadState === 'loading'
  const isPredicting = predictionState === 'loading'
  const isExplaining = gradcamState === 'loading'
  const busy = isUploading || isPredicting || isExplaining
  const canAnalyze = Boolean(
    !PUBLIC_EDUCATION_ONLY &&
    selectedImage &&
    confirmedUltrasound &&
    (analysisMode === 'demo' || researchAcknowledged) &&
    !busy
  )
  const aiQuery = analysisMode === 'research' ? '?research_acknowledged=true' : ''

  const modules = [
    { title: t.aiModuleTitle, description: t.aiModuleDescription, status: t.inDevelopment },
    { title: t.explainModuleTitle, description: t.explainModuleDescription, status: t.inDevelopment },
    { title: t.awarenessModuleTitle, description: t.awarenessModuleDescription, status: t.planned },
    { title: t.languageModuleTitle, description: t.languageModuleDescription, status: t.inDevelopment },
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
    if (PUBLIC_EDUCATION_ONLY || !selectedImage || busy) return
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
    if (PUBLIC_EDUCATION_ONLY) return

    const controller = new AbortController()
    fetch('/api/health', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Backend health check failed')
        return response.json()
      })
      .then((data) => {
        setBackendState(data.status === 'healthy' ? 'connected' : 'unavailable')
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setBackendState('offline')
      })
    return () => controller.abort()
  }, [])

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">+</div>
          <div>
            <strong>{t.title}</strong>
            <small>{t.brandSubtitle}</small>
          </div>
        </div>

        <nav aria-label={t.modulesHeading}>
          <a href="#overview">{t.overview}</a>
          <a href="#upload">{t.upload}</a>
          <a href="#modules">{t.modules}</a>
          <a href="#about">{t.about}</a>
        </nav>

        <p className="sidebar-footer">{t.sidebarFooter}</p>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <span>{t.title}</span>
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
            <span className="status">
              {PUBLIC_EDUCATION_ONLY ? 'Education-only version' : statusLabel}
            </span>
          </div>
        </header>

        <section className="hero">
          <span className="eyebrow">{t.heroTag}</span>
          <h1>{t.heroTitle}</h1>
          <p>{t.heroDescription}</p>
          <a className="primary-link" href="#modules">{t.exploreModules}</a>
        </section>

        <section
          className="upload-section"
          id="upload"
          style={PUBLIC_EDUCATION_ONLY ? { display: 'none' } : undefined}
        >
          <div className="section-heading">
            <h2>{t.uploadHeading}</h2>
            <p>{t.uploadDescription}</p>
          </div>

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
                  <p>
                    <strong>{t.imageStored}:</strong>{' '}
                    {predictionResult.stored ? t.yes : t.no}
                  </p>
                  <p className="upload-disclaimer">{t.medicalNotice}</p>
                </div>
              )}
            </div>

            <div className="upload-preview">
              {previewUrl ? (
                <img src={previewUrl} alt={t.imagePreviewAlt} />
              ) : (
                <p>{t.previewPlaceholder}</p>
              )}
            </div>
          </div>
          <p className="upload-disclaimer">{t.aiUsageNotice}</p>
        </section>

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
                <span className="module-status">{module.status}</span>
              </article>
            ))}
          </div>
        </section>

        <BreastAwareness language={language} />
        <SymptomGuidance language={language} />
        <RiskFactors language={language} />

        <section className="notice" id="about">
          <strong>{t.projectNoticeTitle}</strong>
          <p>{t.projectNoticeText}</p>
        </section>
      </main>
    </div>
  )
}

export default App
