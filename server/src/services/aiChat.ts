interface KbEntry {
  title: string;
  text: string;
  url: string;
  keywords?: string[];
}

const KNOWLEDGE_BASE: KbEntry[] = [
  // Service Times
  { title: 'Sunday Services', text: 'We have two Sunday services: Sunrise Service at 7:30am and Sunshine Service at 10:30am. Both services are held at The Rock Shopping Centre, Bury.', url: '/watch-live', keywords: ['sunday', 'service', 'time', 'when', 'morning', 'worship'] },
  { title: 'Weekday Services', text: 'Carpe Diem (Wednesday) at 6:30am. Open Heavens (Thursday) at 6:00pm. Praise Hour (Friday) at 12:00pm.', url: '/faq', keywords: ['wednesday', 'thursday', 'friday', 'weekday', 'midweek'] },
  // Location
  { title: 'Church Location & Address', text: 'RCCG Lighthouse Parish meets at The Rock Shopping Centre, Vue Cinema, The Rock, Bury, BL9 0ND, Manchester, United Kingdom. Easily accessible by public transport and with free parking available.', url: '/contact', keywords: ['location', 'address', 'where', 'find', 'bury', 'manchester', 'rock'] },
  { title: 'Getting Here', text: 'We are located inside The Rock Shopping Centre in Bury town centre. Look for the Vue Cinema entrance. There is ample free parking at The Rock. Bury Metrolink station is a 5-minute walk away.', url: '/contact', keywords: ['parking', 'transport', 'bus', 'tram', 'metrolink', 'directions', 'drive'] },
  // Online
  { title: 'Watch Online / Live Stream', text: 'All our services are streamed live on YouTube. Visit our Watch Live page to join from anywhere in the world. Previous sermon recordings are also available to watch any time.', url: '/watch-live', keywords: ['online', 'live', 'stream', 'youtube', 'watch', 'virtual', 'remote'] },
  // About
  { title: 'About Lighthouse Parish', text: 'RCCG Lighthouse Parish is a vibrant, Spirit-filled church in Bury, Manchester. We are part of the Redeemed Christian Church of God (RCCG), a global Pentecostal denomination. Our mission is to make heaven, take as many people as possible, and to have a member of RCCG in every family of all nations.', url: '/about', keywords: ['about', 'rccg', 'church', 'history', 'pentecostal', 'denomination', 'mission'] },
  { title: 'Senior Pastors', text: 'Lighthouse Parish is led by Pastor Paul Olujobi and his wife. They are anointed men and women of God with a heart for the community of Bury and Greater Manchester. They are supported by a team of dedicated assistant pastors and deacons.', url: '/senior-pastors', keywords: ['pastor', 'leader', 'senior', 'olujobi'] },
  // Prayer
  { title: 'Prayer Support', text: 'Our dedicated prayer team prays for all submitted requests every day. You can submit a confidential prayer request online and optionally request that someone from the team contacts you. All requests are treated with complete confidentiality.', url: '/prayer', keywords: ['prayer', 'pray', 'intercession', 'request', 'needs'] },
  { title: 'Emergency Prayer', text: 'If you are in an urgent situation or crisis, please call us directly or submit an urgent prayer request online. Our pastoral team will respond as a priority. For life-threatening emergencies always call 999.', url: '/prayer', keywords: ['urgent', 'crisis', 'emergency', 'immediate'] },
  // Counselling
  { title: 'Counselling Services', text: 'We offer free, confidential Christian counselling in six areas: Pre-Marital Counselling, Marriage Counselling, Family Counselling, Individual Counselling, Spiritual Guidance, and Grief Support. All sessions are completely free of charge.', url: '/counselling', keywords: ['counselling', 'counseling', 'therapy', 'support', 'help', 'talking'] },
  { title: 'Marriage & Pre-Marital Counselling', text: 'We offer dedicated pre-marital and marriage counselling sessions led by trained pastoral counsellors. Book a session online and a member of our team will contact you to arrange an appointment.', url: '/counselling', keywords: ['marriage', 'wedding', 'pre-marital', 'couple', 'relationship'] },
  { title: 'Grief & Bereavement Support', text: 'Losing a loved one is one of life\'s hardest moments. Our grief support counselling provides a safe, compassionate space to process loss through the lens of faith and community.', url: '/counselling', keywords: ['grief', 'bereavement', 'loss', 'death', 'died', 'mourning'] },
  // Membership
  { title: 'How to Join / Become a Member', text: 'We welcome everyone! To become a member, register via our E-Membership form and attend our next Membership Class. These classes are held regularly and help you understand the vision, values, and community of Lighthouse Parish.', url: '/membership', keywords: ['join', 'member', 'membership', 'register', 'new', 'become'] },
  { title: 'Membership Class', text: 'Our Membership Class (also called Foundation Class) is designed for new visitors and those considering membership. You\'ll learn about our church history, doctrinal beliefs, and how to get connected with a group or ministry.', url: '/membership', keywords: ['class', 'foundation', 'new believer', 'visitor'] },
  // Giving
  { title: 'How to Give / Tithes & Offerings', text: 'You can give securely online via card payment or bank transfer on our Give page. We accept one-off gifts and regular giving. Gift Aid is available for UK taxpayers, allowing the church to claim an additional 25p for every £1 you give.', url: '/give', keywords: ['give', 'giving', 'tithe', 'offering', 'donate', 'donation', 'money'] },
  { title: 'Gift Aid', text: 'If you are a UK taxpayer, please complete a Gift Aid declaration when giving. This allows Lighthouse Parish to reclaim 25% extra on your donation from HMRC at no cost to you.', url: '/give', keywords: ['gift aid', 'tax', 'hmrc', 'uk'] },
  { title: 'Bank Transfer Details', text: 'To give by bank transfer, visit our Give page for our bank account details. Please use your name as the payment reference so we can record your gift correctly.', url: '/give', keywords: ['bank transfer', 'bacs', 'sort code', 'account'] },
  // Groups & Ministries
  { title: 'Groups & Ministries', text: 'We have a wide range of ministries for every age and stage of life: Children\'s Ministry, Teen Fellowship, Young Adults, Men\'s Fellowship, Women\'s Fellowship, and various service teams including Choir, Ushers, Media, and more.', url: '/groups', keywords: ['group', 'ministry', 'fellowship', 'team', 'connect'] },
  { title: 'Children\'s Ministry', text: 'Our Children\'s Ministry provides a safe, fun, and engaging environment for children during Sunday services. Children join their parents for worship and then head to their own dedicated session with age-appropriate teaching.', url: '/groups', keywords: ['children', 'kids', 'child', 'sunday school', 'young'] },
  { title: 'Teen Fellowship', text: 'Teen Fellowship is for young people aged 13-17. We meet regularly for Bible study, fun activities, and discipleship. It\'s a great space for teenagers to grow in faith and build lifelong friendships.', url: '/groups', keywords: ['teen', 'teenager', 'youth', '13', '14', '15', '16', '17'] },
  { title: 'Young Adults', text: 'Our Young Adults ministry is for those aged 18-35. We run regular meet-ups, Bible studies, social events, and serve opportunities. A great community to connect, grow, and make a real difference.', url: '/groups', keywords: ['young adult', '18', '20s', '30s', 'university', 'student'] },
  { title: 'Men\'s Fellowship', text: 'Men\'s Fellowship meets regularly for prayer, Bible study, and brotherly accountability. We run annual retreats, sporting events, and community outreach projects. All men are welcome.', url: '/groups', keywords: ['men', 'man', 'brothers', 'male', 'father'] },
  { title: 'Women\'s Fellowship', text: 'Women\'s Fellowship is a vibrant community of women who meet for worship, prayer, mentoring, and mutual support. We host regular events, retreats, and outreach initiatives. All women are warmly welcome.', url: '/groups', keywords: ['women', 'woman', 'sisters', 'female', 'mother', 'ladies'] },
  // iCare
  { title: 'iCare Ministry', text: 'iCare is our pastoral care and visitation ministry. We visit the sick, the elderly, and those who cannot attend church in person. If you or someone you know would benefit from a visit or phone call, please contact us.', url: '/icare', keywords: ['icare', 'care', 'visit', 'sick', 'elderly', 'pastoral'] },
  // Contact
  { title: 'Contact Us', text: 'You can reach us via our Contact page, by email, or by phone. Our office is open Monday-Friday. For urgent pastoral matters, please use the prayer request form which is monitored daily.', url: '/contact', keywords: ['contact', 'email', 'phone', 'call', 'reach', 'office'] },
  // New Visitors
  { title: 'First-Time Visitors', text: 'Welcome! We are so glad you are considering joining us. Our Sunday Sunshine Service at 10:30am is a great service to visit first. Just come as you are — there is no dress code and everyone is warmly welcomed.', url: '/about', keywords: ['first time', 'new', 'visitor', 'visit', 'first visit', 'come', 'attending'] },
  { title: 'What to Expect', text: 'Expect vibrant worship, powerful preaching, and a warm, friendly congregation. Services typically last 1.5-2 hours. There are no expectations on first-time visitors — just relax, enjoy, and experience the love of God.', url: '/about', keywords: ['expect', 'what is it like', 'dress code', 'how long', 'duration'] },
  // Beliefs
  { title: 'Our Beliefs / Doctrine', text: 'We believe in the Holy Trinity (Father, Son, Holy Spirit), the authority of Scripture, salvation through faith in Jesus Christ, water baptism, and the baptism of the Holy Spirit with the evidence of speaking in tongues. We hold to the Apostolic faith.', url: '/about', keywords: ['believe', 'doctrine', 'faith', 'theology', 'pentecostal', 'trinity', 'baptism', 'tongues'] },
  // Events
  { title: 'Special Events & Programmes', text: 'Lighthouse Parish hosts regular special services including Thanksgiving Sunday, Crossover Night (New Year), Harvest, Easter, and Christmas services. Check our social media and announcements for upcoming events.', url: '/', keywords: ['event', 'special', 'christmas', 'easter', 'thanksgiving', 'crossover', 'programme'] },
];

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
}

function score(query: string, entry: KbEntry): number {
  const qTokens = tokenize(query);
  const eTokens = tokenize(entry.title + ' ' + entry.text);
  const keywords = entry.keywords || [];
  const ql = query.toLowerCase();

  let s = 0;
  // Keyword exact match (highest weight)
  for (const kw of keywords) {
    if (ql.includes(kw)) s += 5;
  }
  // Token overlap
  for (const qt of qTokens) {
    if (eTokens.includes(qt)) s += 1;
  }
  return s;
}

export function chatResponse(query: string): { answer: string; url: string | null } {
  if (!query.trim()) {
    return { answer: 'Please ask me anything about Lighthouse Parish — service times, location, ministries, prayer, counselling and more!', url: null };
  }

  const scored = KNOWLEDGE_BASE.map(entry => ({ entry, score: score(query, entry) }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (best.score < 1) {
    return {
      answer: 'I\'m not sure about that, but our team would love to help! Please use the Contact page or call the church office directly. You can also submit a prayer request or counselling booking if you need pastoral support.',
      url: '/contact',
    };
  }

  return {
    answer: best.entry.text,
    url: best.entry.url,
  };
}

export function getNextStep(lifeStage: string, need: string): { message: string; url: string } {
  const map: Record<string, Record<string, { message: string; url: string }>> = {
    new: {
      community: { message: 'Welcome! Our Sunday Sunshine Service (10:30am) is the perfect place to start. Come as you are!', url: '/about' },
      prayer: { message: 'We\'d love to pray with you. Submit a prayer request and our team will pray for you today.', url: '/prayer' },
      counselling: { message: 'We offer free, confidential counselling. Book a session and someone will reach out to you.', url: '/counselling' },
      learning: { message: 'Join our next Membership Class to learn about faith, church, and how to grow spiritually.', url: '/membership' },
    },
    growing: {
      community: { message: 'Get deeper! Join one of our fellowship groups — Young Adults, Men\'s or Women\'s Fellowship.', url: '/groups' },
      prayer: { message: 'Grow your prayer life. Join our Open Heavens prayer meeting every Thursday at 6pm.', url: '/prayer' },
      counselling: { message: 'Our pastoral team is here for you. Book a confidential counselling session today.', url: '/counselling' },
      learning: { message: 'Deepen your faith through our midweek Bible study. Check our services page for details.', url: '/watch-live' },
    },
    serving: {
      community: { message: 'Join a ministry team! We have opportunities in Media, Choir, Ushers, Children\'s Ministry and more.', url: '/groups' },
      prayer: { message: 'Consider joining our intercessory prayer team. Email us to find out more.', url: '/contact' },
      counselling: { message: 'If you\'re going through a difficult time while serving, our pastoral team is here for you.', url: '/counselling' },
      learning: { message: 'Explore leadership development opportunities within the church. Speak to your pastor.', url: '/contact' },
    },
    family: {
      community: { message: 'We have activities for the whole family! Children\'s ministry on Sundays and family events throughout the year.', url: '/groups' },
      prayer: { message: 'Bring your family needs to God. Submit a prayer request and let us stand with you.', url: '/prayer' },
      counselling: { message: 'We offer family and marriage counselling. Book a free, confidential session today.', url: '/counselling' },
      learning: { message: 'Our Membership Class is family-friendly and a great first step for everyone.', url: '/membership' },
    },
  };

  const result = map[lifeStage]?.[need];
  if (!result) {
    return { message: 'We\'re here for you! Visit us on Sunday or reach out via our Contact page.', url: '/contact' };
  }
  return result;
}
