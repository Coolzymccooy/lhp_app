import { useEffect, useState } from 'react';
import { Search, BookOpen, FileDown } from 'lucide-react';
import api from '../api/client';

function YoutubeSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface Sermon {
  id: string; title: string; topic: string; speaker: string;
  summary: string; scriptures: string[]; youtube_url: string; notes_url: string; date: string;
}

interface LatestVideo {
  videoId: string | null;
  channelId: string | null;
}

export default function WatchLivePage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [latest, setLatest] = useState<LatestVideo>({ videoId: null, channelId: null });
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/ai/sermons').then(r => setSermons(r.data.data)).catch(() => null);
    api.get('/ai/latest-video').then(r => setLatest(r.data)).catch(() => null);
  }, []);

  const filtered = query
    ? sermons.filter(s =>
        [s.title, s.topic, s.summary, ...(s.scriptures ?? [])].some(t =>
          String(t).toLowerCase().includes(query.toLowerCase())
        )
      )
    : sermons;

  const embedSrc = latest.videoId
    ? `https://www.youtube.com/embed/${latest.videoId}?rel=0&autoplay=0`
    : latest.channelId
      ? `https://www.youtube.com/embed/live_stream?channel=${latest.channelId}`
      : null;

  const channelHandle = 'rccgtlp1';

  return (
    <main className="pt-20">
      {/* Hero */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img src="/assets/auditoriumpic1.webp" alt="Watch Live" className="img-cover" style={{ objectPosition: 'center 40%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Join Us Online</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Watch Live & Sermons</h1>
          </div>
        </div>
      </div>

      {/* Live / Latest Video */}
      <section className="section-pad bg-gray-900">
        <div className="container-max max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE SUNDAYS 10:00 AM
            </div>
            <h2 className="text-3xl font-bold text-white">
              {latest.videoId ? 'Latest Video' : 'Live Stream'}
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              {latest.videoId
                ? 'Showing our most recent upload — join live every Sunday at 10:00 AM'
                : 'Join us every Sunday at 10:00 AM for our Sunday Service'}
            </p>
          </div>

          <div className="aspect-video rounded-2xl overflow-hidden bg-black">
            {embedSrc ? (
              <iframe
                src={embedSrc}
                title="Latest Video"
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/50">
                <YoutubeSvg className="w-16 h-16" />
                <p className="text-sm">Configure YOUTUBE_CHANNEL_ID in server .env to load videos</p>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <a
              href={`https://youtube.com/@${channelHandle}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors text-sm"
            >
              <YoutubeSvg className="w-5 h-5" /> Subscribe on YouTube
            </a>
          </div>
        </div>
      </section>

      {/* Sermon Library */}
      <section className="section-pad bg-white">
        <div className="container-max">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Sermon Library</h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by title, topic, scripture..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No sermons found.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all overflow-hidden">
                {s.youtube_url ? (
                  <div className="aspect-video overflow-hidden bg-gray-900">
                    <iframe src={s.youtube_url} title={s.title} className="w-full h-full" allowFullScreen />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-brand flex items-center justify-center">
                    <YoutubeSvg className="w-10 h-10 text-white/50" />
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">{s.topic}</span>
                  <h3 className="font-bold text-gray-900 mt-1 mb-2 text-sm leading-snug">{s.title}</h3>
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2">{s.summary}</p>
                  <div className="text-xs text-gray-400 font-medium">{(s.scriptures ?? []).join(' · ')}</div>
                  {s.date && (
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(s.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  )}
                  {s.notes_url && (
                    <a
                      href={s.notes_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary hover:underline"
                    >
                      <FileDown className="w-3.5 h-3.5" /> Sermon Notes
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
