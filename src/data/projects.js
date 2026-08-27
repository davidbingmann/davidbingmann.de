export const projects = [
  {
    slug: 'semestral',
    title: 'Semestral',
    type: 'software',
    headline: 'Your whole semester in one place: tasks, exams, deadlines, grades.',
    tags: ['swiftui', 'ios', 'macos', 'productivity'],
    repo: {
      href: 'https://apps.apple.com/de/app/semestral/id6782685471',
      linkText: 'apps.apple.com/de/app/semestral',
    },
    summary:
      'Semestral keeps tasks, exams, deadlines and grades for a semester in one place. It started as source code on GitHub and now runs natively on Mac, iPhone and iPad.',
    body: [
      'Semestral is the app I built to keep my semester in one place: tasks, exams, deadlines, grades.',
      "For a while it was source code on GitHub. It's now on the App Store and runs natively on Mac, iPhone and iPad.",
      'The distance between those two things was bigger than I expected.',
      'When I was the only user, I knew everything the app never said out loud. That a semester has to exist before a module can. Which button opens which sheet. Why an empty board is empty. The app could stay quiet because I already had the answers.',
      'Hand it to someone else and all of that turns into questions. Where do I start? What is this screen for? Why does this button do nothing? Answering those inside the app was most of the work after the GitHub version.',
      'The rest went into everything around the features: iCloud sync so your semester is the same on all three devices, layouts that hold up from an iPhone screen to a full-width Mac window, empty states that say what to do next, data written by version 1.0 that still has to open in whatever comes after it.',
      "Then the feel of it. Dragging a card should feel physical. Colours should mean something, so you recognise a module at a glance and a card tints redder as its deadline gets closer. I needed none of that while I was the only one looking at the screen. It's the reason I open the app in the morning without thinking about it.",
      "Working means the path I take runs. Production-ready means every other path runs too: the wrong order, the empty state, the device I don't own, the version I ship next year.",
      'Writing the features taught me SwiftUI. Shipping them taught me what it costs to hand software to someone else.',
      "If you're studying too, you can find Semestral on the App Store above.",
    ],
  },
  {
    slug: 'echotype',
    title: 'EchoType',
    type: 'software',
    headline: 'Speak your prompts instead of typing.',
    tags: ['agents', 'ai', 'productivity', 'voice'],
    repo: {
      href: 'https://github.com/davidbingmann/EchoType',
      linkText: 'github.com/davidbingmann/EchoType',
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
  {
    slug: 'paper-humanoid-robots-industry-5',
    title: 'Humanoid Robots in Industry 5.0',
    type: 'paper',
    headline: 'What potential do humanoid robots offer in Industry 5.0?',
    tags: ['industry-5.0', 'humanoid-robots', 'ai', 'paper'],
    repo: {
      href: '/papers/paper.pdf',
      linkText: 'paper.pdf',
    },
    summary:
      'My paper looks at whether humanoid robots can support the shift from Industry 4.0 to Industry 5.0: more resilient, more human-centered, and better suited to real factories.',
    body: [
      'As part of a seminar at the University of Trier, I wrote this paper on humanoid robots in the context of Industry 5.0: not as a replacement for humans, but as a possible way to make industrial work more resilient, flexible, and human-centered.',
      'The paper discusses why current automation still struggles in human-designed factories, what recent robot learning research makes possible, and where the technical, economic, and regulatory limits still are. You can read the public PDF version above.',
    ],
  },
];
