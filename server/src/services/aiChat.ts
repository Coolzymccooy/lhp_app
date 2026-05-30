import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '../db/schema';

// ── Church facts (server-side source of truth; keep in step with client site.ts) ──
const CHURCH = {
  name: 'The Lighthouse Church RCCG',
  locality: 'Bury, Manchester',
  tagline: 'Reaching out, saving souls, making disciples through love',
  designation: 'Region 1 · Province 1 · Zone 2',
  address: 'The Rock Shopping Centre, Vue Cinema, The Rock, Bury, BL9 0ND',
  phone: '+44 790 863 5374',
  email: 'info@lighthousechurchburyrccg.co.uk',
  pastors: 'Pastor Yemi Olujobi and Pastor Paul Olujobi (a married couple), who serve together as Pastors in Charge',
  services: [
    'Sunday — Sunday Service at 10:00 AM (in person + streamed live)',
    'Sunday (1st of the month) — Thanksgiving Service at 10:00 AM',
    'Wednesday — Virtual Prayer Night at 5:30 PM',
    'Thursday — Digging Deep Word Study at 5:30 PM',
    'Friday (last of the month) — Virtual Vigil at 11:00 PM',
  ],
};

const PAGES =
  'Home /, About /about, Senior Pastors /senior-pastors, Groups & Ministries /groups, ' +
  'Watch Live & sermons /watch-live, Give /give, Prayer request /prayer, Counselling /counselling, ' +
  'Contact /contact, FAQ /faq, E-Membership /membership, iCare /icare, Events /events, ' +
  'First-time guests welcome form /connect.';

// ── Knowledge base (drives the no-LLM fallback AND the page-link picker) ──────────
interface KbEntry { title: string; text: string; url: string; keywords?: string[]; }

const KNOWLEDGE_BASE: KbEntry[] = [
  { title: 'Sunday Services', text: 'Our main Sunday Service is at 10:00am, held at The Rock Shopping Centre, Bury, and streamed live online. On the 1st Sunday of the month we also hold a Thanksgiving Service at 10:00am.', url: '/watch-live', keywords: ['sunday', 'service', 'time', 'when', 'morning', 'worship', 'thanksgiving'] },
  { title: 'Weekday Services', text: 'Virtual Prayer Night is on Wednesdays at 5:30pm. Digging Deep Word Study is on Thursdays at 5:30pm. On the last Friday of each month we hold a Virtual Vigil at 11:00pm.', url: '/faq', keywords: ['wednesday', 'thursday', 'friday', 'weekday', 'midweek', 'prayer night', 'vigil', 'word study'] },
  { title: 'Church Location & Address', text: 'The Lighthouse Church RCCG meets at The Rock Shopping Centre, Vue Cinema, The Rock, Bury, BL9 0ND, Manchester, UK. Easily reached by public transport with free parking available.', url: '/contact', keywords: ['location', 'address', 'where', 'find', 'bury', 'manchester', 'rock'] },
  { title: 'Getting Here', text: 'We are inside The Rock Shopping Centre in Bury town centre — look for the Vue Cinema entrance. There is ample free parking, and Bury Metrolink station is a 5-minute walk away.', url: '/contact', keywords: ['parking', 'transport', 'bus', 'tram', 'metrolink', 'directions', 'drive'] },
  { title: 'Watch Online / Live Stream', text: 'All our services are streamed live on YouTube. Visit the Watch Live page to join from anywhere, or browse previous sermon recordings any time.', url: '/watch-live', keywords: ['online', 'live', 'stream', 'youtube', 'watch', 'virtual', 'remote', 'sermon'] },
  { title: 'About the Church', text: 'The Lighthouse Church RCCG is a vibrant, Spirit-filled church in Bury, Manchester, part of the Redeemed Christian Church of God (RCCG). Our theme is "Reaching out, saving souls, making disciples through love."', url: '/about', keywords: ['about', 'rccg', 'church', 'history', 'pentecostal', 'denomination', 'mission', 'theme'] },
  { title: 'Senior Pastors', text: 'The church is led by Pastor Yemi Olujobi and Pastor Paul Olujobi, who serve together as Pastors in Charge (Region 1, Province 1, Zone 2).', url: '/senior-pastors', keywords: ['pastor', 'leader', 'senior', 'olujobi', 'yemi', 'paul'] },
  { title: 'Prayer Support', text: 'Our prayer team prays over every submitted request daily. You can submit a confidential prayer request online and optionally ask for someone to contact you.', url: '/prayer', keywords: ['prayer', 'pray', 'intercession', 'request', 'needs'] },
  { title: 'Emergency Prayer', text: 'If you are in crisis, please call us or submit an urgent prayer request and our pastoral team will respond as a priority. For life-threatening emergencies always call 999.', url: '/prayer', keywords: ['urgent', 'crisis', 'emergency', 'immediate'] },
  { title: 'Counselling Services', text: 'We offer free, confidential Christian counselling: Pre-Marital, Marriage, Family, Individual, Spiritual Guidance, and Grief Support. All sessions are free of charge.', url: '/counselling', keywords: ['counselling', 'counseling', 'therapy', 'support', 'help', 'talking'] },
  { title: 'Marriage & Pre-Marital Counselling', text: 'We offer dedicated pre-marital and marriage counselling led by trained pastoral counsellors. Book online and a team member will arrange an appointment.', url: '/counselling', keywords: ['marriage', 'wedding', 'pre-marital', 'couple', 'relationship'] },
  { title: 'Grief & Bereavement Support', text: 'Our grief support counselling provides a safe, compassionate space to process loss through the lens of faith and community.', url: '/counselling', keywords: ['grief', 'bereavement', 'loss', 'death', 'died', 'mourning'] },
  { title: 'Sarah\'s Heart', text: 'Sarah\'s Heart supports couples waiting on God for the fruit of the womb — offering spiritual and emotional support plus information on available medical options and signposting.', url: '/about', keywords: ['sarah', 'fruit of the womb', 'fertility', 'baby', 'conceive', 'children of our own'] },
  { title: 'How to Join / Become a Member', text: 'Everyone is welcome! To become a member, register via E-Membership and attend our next Membership Class, where you\'ll learn our vision, values, and community.', url: '/membership', keywords: ['join', 'member', 'membership', 'register', 'become'] },
  { title: 'First-Time Guests', text: 'Welcome! If it is your first time, fill in our quick welcome form so we can say hello and help you settle in. Our Sunday Service at 10:00am is a great place to start — just come as you are.', url: '/connect', keywords: ['first time', 'new', 'visitor', 'visit', 'first visit', 'come', 'attending', 'welcome', 'guest'] },
  { title: 'Giving / Tithes & Offerings', text: 'You can give securely online by card or bank transfer on the Give page. Gift Aid lets the church reclaim an extra 25% on gifts from UK taxpayers at no cost to you.', url: '/give', keywords: ['give', 'giving', 'tithe', 'offering', 'donate', 'donation', 'money', 'gift aid'] },
  { title: 'Groups & Ministries', text: 'We have ministries for every age: Children\'s Ministry, Teen Fellowship, Young Adults (Faith Igniters), Men\'s and Women\'s Fellowship, plus service teams including Worship, Media, Technical & Social Media, Ushering and more.', url: '/groups', keywords: ['group', 'ministry', 'fellowship', 'team', 'connect', 'children', 'teen', 'young adult', 'men', 'women'] },
  { title: 'iCare Ministry', text: 'iCare is our pastoral care and visitation ministry — visiting the sick, the elderly, and those who cannot attend in person. You can request support or volunteer through the iCare page.', url: '/icare', keywords: ['icare', 'care', 'visit', 'sick', 'elderly', 'pastoral', 'volunteer'] },
  { title: 'Contact Us', text: 'Reach us via the Contact page, by email, or by phone. For urgent pastoral matters, use the prayer request form which is monitored daily.', url: '/contact', keywords: ['contact', 'email', 'phone', 'call', 'reach', 'office'] },
  { title: 'Upcoming Events', text: 'We hold special services and events through the year. See the Events page for what\'s coming up and to RSVP.', url: '/events', keywords: ['event', 'events', 'programme', 'program', 'whats on', 'upcoming', 'special'] },
];

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
}

function scoreEntry(query: string, entry: KbEntry): number {
  const qTokens = tokenize(query);
  const eTokens = tokenize(entry.title + ' ' + entry.text);
  const ql = query.toLowerCase();
  let s = 0;
  for (const kw of (entry.keywords ?? [])) if (ql.includes(kw)) s += 5;
  for (const qt of qTokens) if (eTokens.includes(qt)) s += 1;
  return s;
}

/** Pick the most relevant page path for a piece of text, or null if nothing scores. */
function pickUrl(text: string): string | null {
  const best = KNOWLEDGE_BASE
    .map(entry => ({ entry, score: scoreEntry(text, entry) }))
    .sort((a, b) => b.score - a.score)[0];
  return best && best.score >= 5 ? best.entry.url : null;
}

// ── Live context (pulled from the DB each request → assistant auto-updates) ───────
function buildLiveContext(): string {
  const db = getDb();
  let events: Array<Record<string, unknown>> = [];
  let sermons: Array<Record<string, unknown>> = [];
  try {
    events = db.prepare(
      "SELECT title, date, time, location, description FROM events WHERE date >= date('now') ORDER BY date ASC LIMIT 8"
    ).all() as Array<Record<string, unknown>>;
  } catch { /* table may not exist yet */ }
  try {
    sermons = db.prepare(
      'SELECT title, topic, speaker, date FROM sermons ORDER BY date DESC LIMIT 6'
    ).all() as Array<Record<string, unknown>>;
  } catch { /* table may not exist yet */ }

  const eventLines = events.length
    ? events.map(e => `- ${e.title} on ${e.date}${e.time ? ` at ${e.time}` : ''}${e.location ? ` (${e.location})` : ''}${e.description ? ` — ${e.description}` : ''}`).join('\n')
    : '- (No upcoming events are currently listed.)';
  const sermonLines = sermons.length
    ? sermons.map(s => `- "${s.title}"${s.speaker ? ` by ${s.speaker}` : ''}${s.date ? ` (${s.date})` : ''}`).join('\n')
    : '- (No sermons are listed yet.)';

  return [
    `CHURCH: ${CHURCH.name} — ${CHURCH.locality}. Theme: "${CHURCH.tagline}". ${CHURCH.designation}.`,
    `LED BY: ${CHURCH.pastors}.`,
    `ADDRESS: ${CHURCH.address}. PHONE: ${CHURCH.phone}. EMAIL: ${CHURCH.email}.`,
    `SERVICE SCHEDULE:\n${CHURCH.services.map(s => `- ${s}`).join('\n')}`,
    `UPCOMING EVENTS:\n${eventLines}`,
    `RECENT SERMONS:\n${sermonLines}`,
    `WEBSITE PAGES: ${PAGES}`,
  ].join('\n\n');
}

function buildSystemPrompt(): string {
  return [
    `You are "Lighthouse AI", the warm, helpful assistant for ${CHURCH.name}'s website.`,
    'Answer visitors\' questions about the church using ONLY the facts in the CONTEXT below.',
    'Be concise (2-4 sentences), friendly, and welcoming. Never invent service times, events, names, or facts that are not in the context.',
    'If the answer is not in the context, warmly say you are not sure and suggest using the Contact page or calling the church.',
    'Do not include markdown, links, or URLs in your reply text — a relevant page link is added separately by the app.',
    '',
    'CONTEXT:',
    buildLiveContext(),
  ].join('\n');
}

// ── Anthropic client (lazy; null when no key → fallback) ──────────────────────────
let anthropic: Anthropic | null | undefined;
function getClient(): Anthropic | null {
  if (anthropic !== undefined) return anthropic;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  anthropic = apiKey ? new Anthropic({ apiKey }) : null;
  return anthropic;
}

/** Keyword fallback used when the LLM is unavailable. */
function fallbackResponse(query: string): { answer: string; url: string | null } {
  if (!query.trim()) {
    return { answer: `Hi! Ask me anything about ${CHURCH.name} — service times, location, events, ministries, prayer, counselling and more.`, url: null };
  }
  const best = KNOWLEDGE_BASE
    .map(entry => ({ entry, score: scoreEntry(query, entry) }))
    .sort((a, b) => b.score - a.score)[0];
  if (!best || best.score < 1) {
    return {
      answer: 'I\'m not certain about that one, but our team would love to help — please use the Contact page or call the church office. You can also submit a prayer request if you need pastoral support.',
      url: '/contact',
    };
  }
  return { answer: best.entry.text, url: best.entry.url };
}

/**
 * Smart, live-data-aware chat reply. Uses Claude (Haiku) grounded in current
 * church facts + upcoming events + recent sermons pulled from the DB, so it stays
 * accurate as content is added. Falls back to the keyword KB if the LLM is
 * unavailable or errors — it never throws.
 */
export async function chatResponse(query: string): Promise<{ answer: string; url: string | null }> {
  if (!query.trim()) return fallbackResponse(query);

  const client = getClient();
  if (!client) return fallbackResponse(query);

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      system: [{ type: 'text', text: buildSystemPrompt(), cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: query }],
    });
    const raw = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();
    if (!raw) return fallbackResponse(query);
    // The chat bubble renders plain text — strip any markdown the model added.
    const answer = raw.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^#+\s*/gm, '').replace(/`/g, '');
    return { answer, url: pickUrl(`${query} ${answer}`) };
  } catch (err) {
    console.error('[ai] chat failed, using fallback:', err);
    return fallbackResponse(query);
  }
}

export function getNextStep(lifeStage: string, need: string): { message: string; url: string } {
  const map: Record<string, Record<string, { message: string; url: string }>> = {
    new: {
      community: { message: 'Welcome! Our Sunday Service at 10:00am is the perfect place to start. Come as you are!', url: '/about' },
      prayer: { message: 'We\'d love to pray with you. Submit a prayer request and our team will pray for you today.', url: '/prayer' },
      counselling: { message: 'We offer free, confidential counselling. Book a session and someone will reach out to you.', url: '/counselling' },
      learning: { message: 'Join our next Membership Class to learn about faith, church, and how to grow spiritually.', url: '/membership' },
    },
    growing: {
      community: { message: 'Get deeper! Join one of our fellowship groups — Young Adults, Men\'s or Women\'s Fellowship.', url: '/groups' },
      prayer: { message: 'Grow your prayer life. Join our Virtual Prayer Night every Wednesday at 5:30pm.', url: '/prayer' },
      counselling: { message: 'Our pastoral team is here for you. Book a confidential counselling session today.', url: '/counselling' },
      learning: { message: 'Deepen your faith at Digging Deep Word Study, Thursdays at 5:30pm.', url: '/watch-live' },
    },
    serving: {
      community: { message: 'Join a ministry team! We have opportunities in Worship, Media, Technical & Social Media, Ushering, Children\'s Ministry and more.', url: '/groups' },
      prayer: { message: 'Consider joining our intercessory prayer team. Contact us to find out more.', url: '/contact' },
      counselling: { message: 'If you\'re going through a difficult time while serving, our pastoral team is here for you.', url: '/counselling' },
      learning: { message: 'Explore leadership development opportunities within the church. Speak to your pastor.', url: '/contact' },
    },
    family: {
      community: { message: 'We have activities for the whole family — Children\'s Ministry on Sundays and family events through the year.', url: '/groups' },
      prayer: { message: 'Bring your family needs to God. Submit a prayer request and let us stand with you.', url: '/prayer' },
      counselling: { message: 'We offer family and marriage counselling. Book a free, confidential session today.', url: '/counselling' },
      learning: { message: 'Our Membership Class is family-friendly and a great first step for everyone.', url: '/membership' },
    },
  };
  return map[lifeStage]?.[need] ?? { message: 'We\'re here for you! Visit us on Sunday or reach out via our Contact page.', url: '/contact' };
}
