export const projects = [
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
      'I built EchoType because I was looking for a faster and more intuitive way to write prompts for AI agents like Codex or Claude Code, especially longer prompts that are tedious to type.',
    body: [
      'I built EchoType because I was looking for a faster and more intuitive way to write prompts for AI agents like Codex or Claude Code, especially longer prompts that are tedious to type.',
      'While experimenting, I realized something obvious: speaking is the most natural way to get ideas out of your head quickly. When you talk, thoughts flow without friction, whereas typing often slows you down or interrupts your thinking.',
      'That insight led to EchoType. Instead of typing, you simply speak, and EchoType turns your voice into clean, usable text that you can immediately paste into an AI agent as a prompt.',
      'To make this experience feel instant, I use the whisper-large model over the Groq API, running on infrastructure optimized for ultra-fast speech-to-text.',
    ],
  },
];
