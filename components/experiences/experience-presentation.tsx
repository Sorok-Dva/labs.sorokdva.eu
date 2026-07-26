"use client"

import { useEffect } from "react"
import { BookOpen, X, type LucideIcon } from "lucide-react"

export interface ExperiencePresentationStep {
  index: string
  icon: LucideIcon
  title: string
  body: string
}

interface ExperiencePresentationProps {
  id: string
  index: string
  eyebrow: string
  title: string
  body: string
  steps: ExperiencePresentationStep[]
  hint: string
  resumeLabel: string
  closeLabel: string
  onClose: () => void
}

export function ExperiencePresentation({
  id,
  index,
  eyebrow,
  title,
  body,
  steps,
  hint,
  resumeLabel,
  closeLabel,
  onClose,
}: ExperiencePresentationProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [onClose])

  const titleId = `${id}-title`

  return (
    <aside
      id={id}
      className="experience-presentation"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <header className="experience-presentation__header">
        <div className="experience-presentation__eyebrow">
          <BookOpen aria-hidden="true" />
          <span>{eyebrow}</span>
        </div>
        <button
          type="button"
          className="experience-presentation__close"
          aria-label={closeLabel}
          onClick={onClose}
          autoFocus
        >
          <X aria-hidden="true" />
        </button>
      </header>

      <div className="experience-presentation__intro">
        <span>{index}</span>
        <h2 id={titleId}>{title}</h2>
        <p>{body}</p>
      </div>

      <div className="experience-presentation__steps">
        {steps.map((step) => {
          const Icon = step.icon

          return (
            <article key={step.index}>
              <span>{step.index}</span>
              <Icon aria-hidden="true" />
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </article>
          )
        })}
      </div>

      <footer className="experience-presentation__footer">
        <span>{hint}</span>
        <button type="button" onClick={onClose}>
          {resumeLabel}
        </button>
      </footer>
    </aside>
  )
}
