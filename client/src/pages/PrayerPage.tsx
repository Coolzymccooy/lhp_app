import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Shield, Phone } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  category: z.enum(['Healing', 'Family', 'Finances', 'Career/Business', 'Relationships', 'Salvation', 'Thanksgiving', 'Other']),
  prayer_request: z.string().min(10, 'Please describe your prayer request (min 10 characters)'),
  contact_me: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function PrayerPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const res = await api.post('/forms/prayer', data);
      toast.success(res.data.message);
      reset();
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }

  return (
    <main className="pt-20">
      {/* Hero Banner */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img src="/assets/arise.webp" alt="Prayer" className="img-cover" style={{ objectPosition: 'center 30%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Reach Out</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Prayer Requests</h1>
          </div>
        </div>
      </div>

      <section className="section-pad">
        <div className="container-max max-w-5xl grid lg:grid-cols-3 gap-10">
          {/* Info */}
          <div className="space-y-6">
            <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100">
              <Heart className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">We Pray Daily</h3>
              <p className="text-gray-600 text-sm">Our dedicated prayer team lifts every request before God every day without fail.</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
              <Shield className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Completely Confidential</h3>
              <p className="text-gray-600 text-sm">All prayer requests are treated with complete confidentiality and pastoral care.</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <Phone className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">In Crisis?</h3>
              <p className="text-gray-600 text-sm mb-2">If you are in immediate danger, please call <strong>999</strong>. For urgent pastoral support, check the box below and we'll contact you.</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Request</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">First Name *</label>
                  <input {...register('first_name')} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                  <input {...register('last_name')} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Prayer Category *</label>
                <select {...register('category')} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                  {['Healing', 'Family', 'Finances', 'Career/Business', 'Relationships', 'Salvation', 'Thanksgiving', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Prayer Request *</label>
                <textarea {...register('prayer_request')} rows={5} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" placeholder="Share your prayer request with us..." />
                {errors.prayer_request && <p className="text-red-500 text-xs mt-1">{errors.prayer_request.message}</p>}
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input {...register('contact_me')} type="checkbox" className="mt-0.5 accent-pink-500 w-4 h-4" />
                <span className="text-sm text-gray-600">I'd like someone from the pastoral team to contact me about this request.</span>
              </label>
              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-60">
                {isSubmitting ? 'Submitting...' : 'Submit Prayer Request'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
