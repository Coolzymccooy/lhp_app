export const site = {
  name: 'The Lighthouse Church RCCG',
  shortName: 'The Lighthouse Church',
  locality: 'Bury, Manchester',
  designation: 'Region 1 · Province 1 · Zone 2',
  tagline: 'Reaching out, saving souls, making disciples through love',
  address: 'The Rock Shopping Centre, Vue Cinema, The Rock, Bury, BL9 0ND',
  phone: '+44 790 863 5374',
  email: 'info@lighthousechurchburyrccg.co.uk',
  services: [
    { day: 'Sunday', name: 'Sunday Service', time: '10:00 AM' },
    { day: 'Sunday', name: 'Thanksgiving Service', time: '10:00 AM', note: '1st Sunday' },
    { day: 'Wednesday', name: 'Virtual Prayer Night', time: '5:30 PM' },
    { day: 'Thursday', name: 'Digging Deep Word Study', time: '5:30 PM' },
    { day: 'Friday', name: 'Virtual Vigil', time: '11:00 PM', note: 'Last Friday' },
  ],
  social: {
    facebook: 'https://www.facebook.com/rccgtlp1',
    instagram: 'https://www.instagram.com/rccgtlp1/',
    youtube: 'https://www.youtube.com/@rccgtlp1',
    x: 'https://x.com/rccgtlp1',
  },
  fellowshipImages: {
    youngAdults: '/assets/youngadults.webp',
    teens: '/assets/teenfellowship.webp',
    men: '/assets/mensfellowship.webp',
    women: '/assets/womenfellowship.webp',
  },
} as const;

export type ServiceTime = (typeof site.services)[number];
