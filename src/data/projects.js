export const projects = [
  {
    slug: 'semestral',
    title: 'Semestral',
    headline: 'A native macOS app for organizing university coursework.',
    tags: ['macos', 'swiftui', 'productivity', 'university'],
    repo: {
      label: 'davidbingmann/Semestral',
      href: 'https://github.com/davidbingmann/Semestral',
    },
    summary:
      "For a long time I was looking for an app to organize my university life — tasks, deadlines, exams, and grades all in one place — but I could never find one that did everything I wanted, so I built my own.",
    body: [
      "For a long time I was looking for an app to organize my university life — tasks, deadlines, exams, and grades all in one place. I tried plenty of to-do apps, calendar apps, and study planners, but none of them combined the features I actually needed without dragging in a lot of clutter I didn't.",
      "So I built my own. Semestral is a native macOS app, written in SwiftUI with SwiftData, designed around the way I actually plan a semester: organized by semester and module, with the same data flowing into a board, a calendar, an exam list, and a grade overview.",
      "The Board is a classic Kanban with three columns — To Do, In Progress, Done — but with drag-and-drop between columns, deadline-based sorting, urgency-tinted cards that get redder the closer the deadline is, and recurring tasks that automatically roll over to the next occurrence when completed.",
      "The Calendar is a month view of every task deadline and exam date, color-coded by module, so I can see at a glance where the heavy weeks are.",
      "The Exams tab keeps a per-module list of upcoming and past exam dates, with optional time-of-day precision for the ones that actually have a fixed slot, and a portfolio mode for modules that have several deadlines instead of a single exam.",
      "The Grades tab computes a German weighted average on the 1.0–5.0 scale, ECTS-weighted, with a Bachelor/Master toggle and per-semester breakdowns, so I always know where I stand.",
      "Semesters and modules are created inline from the toolbar and from the module pickers in each form, so adding a new module never pulls me out of whatever I'm doing. The active semester is remembered across launches, completed tasks are cleaned up automatically after a few days, and past exams disappear from the list on their own.",
      "If you want to try it or build it yourself, you can find the installation instructions in the GitHub repository.",
    ],
  },
  {
    slug: 'echotype',
    title: 'EchoType',
    headline: 'Speak your prompts instead of typing.',
    tags: ['agents', 'ai', 'productivity', 'voice'],
    repo: {
      label: 'davidbingmann/EchoType',
      href: 'https://github.com/davidbingmann/EchoType',
    },
    summary:
      'I was looking for a faster and more intuitive way to write prompts for AI agents like Codex or Claude Code, especially longer prompts that are tedious to type.',
    body: [
      'I was looking for a faster and more intuitive way to write prompts for AI agents like Codex or Claude Code, especially longer prompts that are tedious to type.',
      'While experimenting, I realized something obvious: speaking is the most natural way to get ideas out of your head quickly. When you talk, thoughts flow without friction, whereas typing often slows you down or interrupts your thinking.',
      "That insight led to EchoType. Instead of typing, you simply speak, and EchoType turns your voice into clean, usable text that's automatically inserted into the prompt you're currently focused on, so you don't have to copy and paste it manually.",
      'To make this experience feel instant, I use the whisper-large model over the Groq API, running on infrastructure optimized for ultra-fast speech-to-text.',
      'If you want to install EchoType, you can find the installation instructions in the GitHub repository.',
    ],
  },
];
