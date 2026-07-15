'use client'

import { useEffect, useState } from 'react'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROLE_LABELS, TECH_FIELD_GROUPS, TECH_FIELD_LABELS } from '@/lib/constants/buzzwords'
import type { GenerationField, GenerationVoice, TechField } from '@/lib/types/buzzword'

const VOICES: GenerationVoice[] = ['random', 'ceo', 'sales', 'tech']

const voiceLabel = (voice: GenerationVoice): string => (voice === 'random' ? 'RANDOM' : ROLE_LABELS[voice])

interface GenerationProfileControlProps {
  voice: GenerationVoice
  field: GenerationField
  onApply: (voice: GenerationVoice, field: GenerationField) => void
}

export function GenerationProfileControl({ voice, field, onApply }: GenerationProfileControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draftVoice, setDraftVoice] = useState<GenerationVoice>(voice)
  const [draftField, setDraftField] = useState<GenerationField>(field)

  useEffect(() => {
    if (!isOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  const applyProfile = () => {
    onApply(draftVoice, draftField)
    setIsOpen(false)
  }

  const toggleProfile = () => {
    if (isOpen) {
      setIsOpen(false)
      return
    }

    setDraftVoice(voice)
    setDraftField(field)
    setIsOpen(true)
  }

  const resetProfile = () => {
    onApply('random', 'all')
    setIsOpen(false)
  }

  const selectField = (nextField: TechField) => setDraftField(nextField)

  return (
    <section className="generation-profile" aria-labelledby="generation-profile-heading">
      <div className="generation-profile-summary">
        <div>
          <p id="generation-profile-heading" className="generation-profile-label">Generation profile</p>
          <p className="generation-profile-current">
            <span>VOICE / {voiceLabel(voice)}</span>
            <span>SCOPE / {field === 'all' ? 'ALL STACKS' : TECH_FIELD_LABELS[field]}</span>
          </p>
        </div>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="generation-profile-panel"
          onClick={toggleProfile}
          className="profile-toggle"
        >
          <SlidersHorizontal aria-hidden="true" />
          Tune
        </button>
      </div>

      {isOpen ? (
        <div id="generation-profile-panel" className="generation-profile-panel" role="region" aria-label="Tune generation">
          <fieldset className="profile-fieldset">
            <legend>Department voice</legend>
            <p>Choose a tone or let the system pick one for each brief.</p>
            <div className="profile-option-grid profile-option-grid--voice">
              {VOICES.map((candidateVoice) => (
                <button
                  key={candidateVoice}
                  type="button"
                  aria-pressed={draftVoice === candidateVoice}
                  onClick={() => setDraftVoice(candidateVoice)}
                  className="profile-option"
                >
                  {voiceLabel(candidateVoice)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="profile-fieldset profile-fieldset--stack">
            <legend>Technology focus</legend>
            <p>All stacks keeps each new brief unexpected. Select one field when you need a specific angle.</p>
            <button
              type="button"
              aria-pressed={draftField === 'all'}
              onClick={() => setDraftField('all')}
              className="profile-all-stacks"
            >
              <span>ALL STACKS</span>
              <small>SURPRISE ME</small>
            </button>

            <div className="profile-field-groups">
              {TECH_FIELD_GROUPS.map((group) => (
                <section key={group.id} className="profile-field-group" aria-labelledby={`${group.id}-fields`}>
                  <h3 id={`${group.id}-fields`}>{group.label}</h3>
                  <div className="profile-option-grid profile-option-grid--fields">
                    {group.fields.map((candidateField) => (
                      <button
                        key={candidateField}
                        type="button"
                        aria-pressed={draftField === candidateField}
                        onClick={() => selectField(candidateField)}
                        className="profile-option"
                      >
                        {TECH_FIELD_LABELS[candidateField]}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </fieldset>

          <div className="profile-actions">
            <button type="button" onClick={resetProfile} className="profile-reset">
              <RotateCcw aria-hidden="true" />
              Reset to random
            </button>
            <Button type="button" variant="outline" size="lg" onClick={applyProfile} className="cyber-action cyber-action--primary profile-apply">
              Apply &amp; generate
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
