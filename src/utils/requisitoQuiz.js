export const requisitoQuizQuestions = Object.freeze([
  {
    id: 'goal',
    prompt: 'quiz.goal.prompt',
    options: ['quiz.goal.a', 'quiz.goal.b', 'quiz.goal.c'],
    answer: 0,
    explanation: 'quiz.goal.explanation',
  },
  {
    id: 'questions',
    prompt: 'quiz.questions.prompt',
    options: ['quiz.questions.a', 'quiz.questions.b', 'quiz.questions.c'],
    answer: 1,
    explanation: 'quiz.questions.explanation',
  },
  {
    id: 'completion',
    prompt: 'quiz.completion.prompt',
    options: ['quiz.completion.a', 'quiz.completion.b', 'quiz.completion.c'],
    answer: 2,
    explanation: 'quiz.completion.explanation',
  },
  {
    id: 'sources',
    prompt: 'quiz.sources.prompt',
    options: ['quiz.sources.a', 'quiz.sources.b', 'quiz.sources.c'],
    answer: 1,
    explanation: 'quiz.sources.explanation',
  },
])

export function scoreRequisitoQuiz(answers, questions = requisitoQuizQuestions) {
  return questions.reduce(
    (score, question) => score + (Number(answers[question.id]) === question.answer ? 1 : 0),
    0,
  )
}
