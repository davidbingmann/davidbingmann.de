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
      'A small voice-first tool for writing prompts faster: speak naturally and get clean text in your prompt box.',
    body: [
      "I built EchoType because I was looking for a faster way to write prompts in agents like Codex or Claude Code.",
      'Then I noticed something obvious: speaking is the natural way to get thoughts out quickly.',
      "So EchoType lets you talk, and it turns your speech into text you can use right away as a prompt.",
      "I used Groq's Whisper transcription because they run special servers where transcribing is super, super fast. You don't really notice any delay.",
    ],
  },
];
