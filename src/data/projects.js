export const projects = [
  {
    slug: 'semestral',
    title: 'Semestral',
    type: 'software',
    headline: 'Your whole semester in one place: tasks, exams, deadlines and grades.',
    link: {
      href: 'https://apps.apple.com/de/app/semestral/id6782685471',
      label: 'apps.apple.com/de/app/semestral',
    },
    summary:
      'Semestral keeps your tasks, exams, deadlines and grades for the semester in one place. What began as source code on GitHub now runs natively on Mac, iPhone and iPad.',
    body: [
      'I built Semestral to keep my semester in one place: tasks, exams, deadlines and grades.',
      "For a while it only existed as source code on GitHub. Now it's on the App Store and runs natively on Mac, iPhone and iPad.",
      'The gap between those two turned out to be much bigger than I expected.',
      'As long as I was the only user, I knew everything the app never said out loud: that a semester has to exist before you can add a module, which button opens which sheet, why an empty board is empty. The app could stay quiet because I already knew the answers.',
      "Once someone else uses it, all of that turns into questions. Where do I start? What is this screen for? Why doesn't this button do anything? Answering those questions inside the app was most of the work after the GitHub version.",
      'The rest went into everything around the features: iCloud sync so your semester looks the same on all three devices, layouts that hold up from an iPhone screen to a full-width Mac window, empty states that tell you what to do next, and data saved by version 1.0 that still has to open in every version after it.',
      "Then there's how it feels. Dragging a card should feel physical. Colours should carry meaning, so you recognise a module at a glance and a card turns redder as its deadline approaches. None of that mattered while I was the only one using it, but it's the reason I open the app every morning without thinking twice.",
      "Working means the path I take works. Production-ready means every other path works too: the wrong order, the empty state, the device I don't own, the version I'll ship next year.",
      'Writing the features taught me SwiftUI. Shipping them taught me what it takes to hand software over to someone else.',
      "If you're a student too, you can get Semestral on the App Store via the link above.",
    ],
  },
  {
    slug: 'echotype',
    title: 'EchoType',
    type: 'software',
    headline: 'Speak your prompts instead of typing them.',
    link: {
      href: 'https://github.com/davidbingmann/EchoType',
      label: 'github.com/davidbingmann/EchoType',
    },
    summary:
      'EchoType lets you speak your prompts instead of typing them. It turns your voice into clean text and inserts it right where you are typing, which is especially handy for long prompts to AI agents like Codex or Claude Code.',
    body: [
      'I wanted a faster, more natural way to write prompts for AI agents like Codex or Claude Code, especially the long ones that are tedious to type out.',
      'While experimenting, I realised something obvious: speaking is the quickest way to get ideas out of your head. When you talk, your thoughts flow freely. When you type, you keep slowing down and losing your train of thought.',
      "That's where EchoType came from. Instead of typing, you just speak, and EchoType turns your voice into clean, usable text and inserts it straight into the field you're working in, with no copying and pasting.",
      'To make it feel instant, EchoType uses the Whisper Large model through the Groq API, which runs on infrastructure built for very fast speech-to-text.',
      "If you'd like to try EchoType, you'll find the installation instructions in the GitHub repository.",
    ],
  },
  {
    slug: 'paper-humanoid-robots-industry-5',
    title: 'Humanoid Robots in Industry 5.0',
    type: 'paper',
    venue: 'Seminar paper, University of Trier',
    headline: 'What potential do humanoid robots hold for Industry 5.0?',
    link: {
      href: '/papers/bingmann-humanoid-robots-industry-5-0.pdf',
      label: 'Read the paper (PDF)',
    },
    body: [
      'I wrote this paper for a seminar at the University of Trier. It looks at humanoid robots in the context of Industry 5.0, not as a replacement for people, but as a way to make industrial work more resilient, flexible and human-centred.',
      "It covers why today's automation still struggles in factories designed around humans, what recent advances in robot learning make possible, and where the technical, economic and regulatory limits still lie. You can read the full paper as a PDF above.",
    ],
  },
];
