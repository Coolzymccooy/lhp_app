import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Users, Baby, User, Compass, Flower2 } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

const schema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number is required'),
  counselling_type: z.enum(['Pre-Marital', 'Marriage', 'Family', 'Individual', 'Spiritual Guidance', 'Grief Support']),
  preferred_date: z.string().optional(),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const SERVICES = [
  { icon: Heart, label: 'Pre-Marital', desc: 'Prepare for marriage with God-centred guidance.' },
  { icon: Users, label: 'Marriage', desc: 'Strengthen and restore your marriage relationship.' },
  { icon: Baby, label: 'Family', desc: 'Navigate family dynamics and parenting challenges.' },
  { icon: User, label: 'Individual', desc: 'Personal support for life\'s challenges.' },
  { icon: Compass, label: 'Spiritual Guidance', desc: 'Find direction and purpose for your faith journey.' },
  { icon: Flower2, label: 'Grief Support', desc: 'Compassionate care through loss and bereavement.' },
];

export default function CounsellingPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const res = await api.post('/forms/counselling', data);
      toast.success(res.data.message);
      reset();
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }

  return (
    <main className="pt-20">
      <div className="relative h-56 md:h-72 overflow-hidden">
        <img src="/assets/counseling.webp" alt="Counselling" className="img-cover" style={{ objectPosition: 'center 40%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">We're Here For You</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Counselling Services</h1>
            <p className="text-white/80 mt-2">Free · Confidential · Christ-Centred</p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <section className="section-pad bg-gray-50">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What We Offer</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">All sessions are completely free of charge and handled with the utmost care and confidentiality.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-pink-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{label}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Book a Session</h2>
            <p className="text-gray-500 text-sm mb-6">Complete this form and our team will contact you within 48 hours to arrange your appointment.</p>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                  <input {...register('phone')} type="tel" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type of Counselling *</label>
                <select {...register('counselling_type')} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                  {['Pre-Marital', 'Marriage', 'Family', 'Individual', 'Spiritual Guidance', 'Grief Support'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Date (optional)</label>
                <input {...register('preferred_date')} type="date" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Brief Description (optional)</label>
                <textarea {...register('description')} rows={4} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="You may briefly describe what you'd like support with..." />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-60">
                {isSubmitting ? 'Booking...' : 'Book My Session'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
