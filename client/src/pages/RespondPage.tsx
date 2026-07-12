import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, HandHelping, BookOpen } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

const schema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  response_type: z.enum(['Salvation', 'Rededication', 'Water Baptism', 'Holy Spirit', 'Join Church', 'Other']),
  message: z.string().optional(),
  contact_me: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

const RESPONSES = [
  { icon: Heart, label: 'Salvation', desc: 'I gave my life to Jesus Christ today and I want to begin my new life in Him.' },
  { icon: HandHelping, label: 'Rededication', desc: 'I\'ve wandered from God but I\'m ready to recommit my life to following Jesus.' },
  { icon: BookOpen, label: 'Water Baptism', desc: 'I\'ve accepted Jesus as Lord and I\'m ready to take the step of water baptism.' },
];

export default function RespondPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { response_type: 'Salvation' },
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await api.post('/forms/respond', data);
      toast.success(res.data.message || 'Thank you for your response! A pastor will be in touch soon.');
      reset();
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }

  return (
    <main className="pt-20">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src="/assets/arise.webp" alt="Respond" className="img-cover" style={{ objectPosition: 'center 30%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Your Decision</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Respond to God</h1>
            <p className="text-white/80 mt-2 max-w-lg">Tell us about your decision and we'll walk with you from here</p>
          </div>
        </div>
      </div>

      {/* Affirmations */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-3xl mx-auto text-center">
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Take the Step</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Decision Matters</h2>
          <p className="text-gray-600 mb-10 leading-relaxed">
            Whether you've just given your life to Christ for the first time, or you're recommitting your heart to God, your decision is significant — and you don't have to walk this journey alone. Let us know where you are, and our pastoral team will be there to support you every step of the way.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-4">
            {RESPONSES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-pink-50 border border-pink-100 rounded-2xl p-5 text-left hover:border-pink-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-sm">{label}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section-pad bg-gray-50">
        <div className="container-max max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell Us About Your Decision</h2>
            <p className="text-gray-500 text-sm mb-6">Complete this form and a member of our pastoral team will contact you within 24–48 hours.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                <input {...register('full_name')} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input {...register('email')} type="email" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone (optional)</label>
                  <input {...register('phone')} type="tel" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">My Decision *</label>
                <select {...register('response_type')} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                  {['Salvation', 'Rededication', 'Water Baptism', 'Holy Spirit', 'Join Church', 'Other'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Anything you'd like to share? (optional)</label>
                <textarea {...register('message')} rows={4} placeholder="Tell us more about your decision or anything you'd like us to know..." className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input {...register('contact_me')} type="checkbox" className="mt-0.5 accent-pink-500 w-4 h-4" defaultChecked />
                <span className="text-sm text-gray-600">I'd like a pastor to contact me about my decision.</span>
              </label>

              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-60">
                {isSubmitting ? 'Submitting…' : 'Submit My Decision'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Scripture */}
      <section className="py-12 bg-white text-center">
        <div className="container-max max-w-2xl mx-auto">
          <p className="text-gray-600 italic leading-relaxed">
            "If you declare with your mouth, 'Jesus is Lord,' and believe in your heart that God raised him from the dead, you will be saved."
          </p>
          <p className="text-primary font-bold mt-3 text-sm">— Romans 10:9</p>
        </div>
      </section>
    </main>
  );
}
