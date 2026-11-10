import { useEffect, useState } from 'react'
import { fetchProjects } from '../lib/api'
import { PROJECTS } from '../lib/fallbackData'

export default function Projects() {
  const [projects, setProjects] = useState(PROJECTS)

  useEffect(() => {
    let active = true
    fetchProjects()
      .then((data) => { if (active && Array.isArray(data)) setProjects(data) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return (
    <section id="projects" className="projects" aria-label="Projects">
      <div className="projects-header">
        <span className="section-label">Projects</span>
        <h2 className="section-title">What I've Built</h2>
        <p className="section-subtitle">
          A selection of projects that showcase my skills and passion for building
        </p>
      </div>
      <div className="projects-grid" role="list">
        {projects.map((p, i) => (
          <a href={p.link || '#'} className="project-card" key={p.id ?? p.title} target="_blank" rel="noreferrer" role="listitem" aria-label={`${p.title} — ${p.description}`}>
            <div className="project-card-img">
              {p.image_url && (
                <img src={p.image_url} alt={`Screenshot of ${p.title}`} loading="lazy" width="600" height="375" />
              )}
              <span className="project-card-num" aria-hidden="true">0{i + 1}</span>
            </div>
            <div className="project-card-body">
              <h3 className="project-card-title">{p.title}</h3>
              <p className="project-card-desc">{p.description}</p>
              <ul className="project-card-tags">
                {(p.tags ?? []).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <span className="project-card-link">
                View Project
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
