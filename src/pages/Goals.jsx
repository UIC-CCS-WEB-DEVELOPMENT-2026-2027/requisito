import { useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import GoalCard from '../components/GoalCard.jsx'
import { getGoals } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Props: none. Goal data comes from helpers.js.
function Goals() {
  const { t } = useLanguage()
  const goals = getGoals()
  const [searchText, setSearchText] = useState('')
  const query = searchText.trim().toLowerCase()
  const filteredGoals = goals.filter((goal) =>
    goal.title.toLowerCase().includes(query),
  )

  return (
    <section className="page-content flow-content" aria-labelledby="goals-title">
      <p className="eyebrow">Choose a goal</p>
      <h1 id="goals-title">{t('page.goals')}</h1>
      <p className="page-description">
        Choose what you want to accomplish. We'll show the documents you need,
        in order.
      </p>
      <div className="goal-search" role="search">
        <label htmlFor="goal-search">{t('label.searchGoals')}</label>
        <input
          id="goal-search"
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search goals"
          autoComplete="off"
        />
      </div>
      {filteredGoals.length > 0 ? (
        <ul className="goal-grid" aria-label="Available goals">
          {filteredGoals.map((goal) => (
            <li key={goal.id}>
              <Link className="goal-card-link" to={'/checklist?goal=' + goal.id}>
                <GoalCard
                  title={goal.title}
                  description={goal.description}
                  stepsCount={goal.stepsCount}
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState message="No records found" />
      )}
    </section>
  )
}

export default Goals
