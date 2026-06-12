export const projects = [
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
