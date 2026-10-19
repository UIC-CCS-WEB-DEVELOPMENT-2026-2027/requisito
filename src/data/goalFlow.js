export const goals = [
  {
    id: 'study',
    title: 'Stay on top of coursework',
    description: 'Build a steady study routine and keep assignments moving.',
    questions: [
      {
        text: 'What would you most like to improve?',
        options: ['Starting assignments sooner', 'Studying consistently', 'Keeping track of deadlines'],
      },
      {
        text: 'How much time can you set aside on a typical day?',
        options: ['15 minutes', '30 minutes', 'About an hour'],
      },
      {
        text: 'When do you focus best?',
        options: ['In the morning', 'In the afternoon', 'In the evening'],
      },
      {
        text: 'What usually gets in your way?',
        options: ['Distractions', 'Not knowing where to start', 'A busy schedule'],
      },
    ],
    checklist: [
      'Write down upcoming assignments and due dates',
      'Choose one priority task for your next study session',
      'Break that task into a small first step',
      'Set aside a regular, distraction-light study block',
      'Review your progress and plan the next session',
    ],
  },
  {
    id: 'learn',
    title: 'Learn a new skill',
    description: 'Turn something you are curious about into a practical learning plan.',
    questions: [
      {
        text: 'What kind of skill are you interested in?',
        options: ['Creative', 'Technical', 'Communication or life skills'],
      },
      {
        text: 'What would you like to be able to do?',
        options: ['Complete a small project', 'Use it in class or work', 'Explore and build confidence'],
      },
      {
        text: 'How much time can you practice each week?',
        options: ['About an hour', 'Two to three hours', 'Four or more hours'],
      },
      {
        text: 'How do you prefer to learn?',
        options: ['Short guided lessons', 'Hands-on practice', 'A mix of both'],
      },
    ],
    checklist: [
      'Describe one practical thing you want to be able to do',
      'Find one beginner-friendly learning resource',
      'Choose a small practice project',
      'Schedule a first focused practice session',
      'Record what you learned and choose the next step',
    ],
  },
  {
    id: 'routine',
    title: 'Create a more balanced routine',
    description: 'Make everyday plans feel manageable with a few consistent habits.',
    questions: [
      {
        text: 'Which part of your routine needs the most support?',
        options: ['Planning my day', 'Making time for breaks', 'Following through on tasks'],
      },
      {
        text: 'What would a better routine help you feel?',
        options: ['More organized', 'Less rushed', 'More consistent'],
      },
      {
        text: 'When is the easiest time to plan your day?',
        options: ['The night before', 'At the start of the day', 'During a midday break'],
      },
      {
        text: 'How would you like to start?',
        options: ['One small daily habit', 'A short weekly plan', 'A simple morning or evening routine'],
      },
    ],
    checklist: [
      'Choose one part of your day to make more predictable',
      'Pick a small habit that supports that change',
      'Decide when and where you will do it',
      'Add a realistic break to your daily plan',
      'Check in at the end of the week and adjust',
    ],
  },
]

export function getGoal(goalId) {
  return goals.find((goal) => goal.id === goalId)
}
