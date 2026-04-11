import { useState } from 'react';
import { Bell, Send } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function PushNotificationsPage() {
  const [form, setForm] = useState({ title: '', body: '', url: '/' });
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.body) { toast.error('Title and body are required'); return; }
    setSending(true);
    try {
      const { data } = await api.post('/admin/push-send', form);
      toast.success(`Notification sent to ${data.sent ?? 0} subscriber${data.sent !== 1 ? 's' : ''}`);
      setForm({ title: '', body: '', url: '/' });
    } catch {
      toast.error('Failed to send push notification');
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Push Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">Broadcast a message to all subscribed members</p>
      </div>

      <div className="max-w-lg">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-gray-600">Subscribers who have enabled notifications will receive this instantly.</p>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notification Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Sunday Service Reminder"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Message *</label>
              <textarea
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                rows={3}
                placeholder="e.g. Join us this Sunday at 10:30 AM for our Sunshine Service!"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Link (on click)</label>
              <input
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="/"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-60 text-sm"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending…' : 'Send Notification'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
