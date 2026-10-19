import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Checklist from './pages/Checklist.jsx'
import Goals from './pages/Goals.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import QuestionFlow from './pages/QuestionFlow.jsx'

function App() {
  const [selectedGoalId, setSelectedGoalId] = useState(null)
  const [answers, setAnswers] = useState({})
  const [completedTasks, setCompletedTasks] = useState({})
  const [questionnaireComplete, setQuestionnaireComplete] = useState(false)

  function selectGoal(goalId) {
    if (goalId !== selectedGoalId) {
      setAnswers({})
      setCompletedTasks({})
      setQuestionnaireComplete(false)
    }

    setSelectedGoalId(goalId)
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/goals"
          element={
            <Goals selectedGoalId={selectedGoalId} onSelectGoal={selectGoal} />
          }
        />
        <Route
          path="/questions"
          element={
            selectedGoalId ? (
              <QuestionFlow
                goalId={selectedGoalId}
                answers={answers}
                onAnswersChange={setAnswers}
                onComplete={() => setQuestionnaireComplete(true)}
              />
            ) : (
              <Navigate replace to="/goals" />
            )
          }
        />
        <Route
          path="/checklist"
          element={
            selectedGoalId && questionnaireComplete ? (
              <Checklist
                goalId={selectedGoalId}
                answers={answers}
                completedTasks={completedTasks}
                onCompletedTasksChange={setCompletedTasks}
                onStartOver={() => {
                  setSelectedGoalId(null)
                  setAnswers({})
                  setCompletedTasks({})
                  setQuestionnaireComplete(false)
                }}
              />
            ) : (
              <Navigate
                replace
                to={selectedGoalId ? '/questions' : '/goals'}
              />
            )
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
