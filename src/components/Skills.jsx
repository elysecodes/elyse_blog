import { useEffect, useState } from 'react'
import SkillsChart from './SkillsChart'
import { fetchSkills } from '../lib/api'
import { SKILLS } from '../lib/fallbackData'

export default function Skills() {
  const [skills, setSkills] = useState(SKILLS)
  const [selectedName, setSelectedName] = useState(SKILLS[0].name)

  useEffect(() => {
    let active = true
    fetchSkills()
      .then((data) => {
        if (!active || !Array.isArray(data)) return
        setSkills(data)
        if (data.length) {
          setSelectedName((prev) => (data.some((s) => s.name === prev) ? prev : data[0].name))
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  const selected = skills.find((s) => s.name === selectedName) ?? skills[0]
  if (!selected) return null

  return (
    <section id="skills" className="skills" aria-label="Skills">
      <div className="skills-header">
        <span className="section-label">Skills</span>
        <h2 className="section-title">My Stack</h2>
        <p className="section-subtitle">
          Click a skill on the graph to learn more
        </p>
      </div>
      <div className="skills-inner">
        <div className="skills-chart">
          <SkillsChart
            skills={skills}
            selected={selected.name}
            onSelect={setSelectedName}
          />
        </div>
        <aside className="skill-panel" aria-label={`Details about ${selected.name}`}>
          <div className="skill-panel-body" key={selected.name}>
            <span className="skill-panel-cat">{selected.category}</span>
            <h3 className="skill-panel-name">{selected.name}</h3>
            <div className="skill-panel-level">
              <span className="skill-panel-level-label">Proficiency</span>
              <span className="skill-panel-level-value">{selected.level}%</span>
            </div>
            <div className="skill-panel-bar" aria-hidden="true">
              <div
                className="skill-panel-bar-inner"
                style={{ width: `${selected.level}%` }}
              />
            </div>
            <p className="skill-panel-desc" aria-live="polite">
              {selected.description}
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
