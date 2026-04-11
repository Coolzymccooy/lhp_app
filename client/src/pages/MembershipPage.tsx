import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, Users, Heart, BookOpen } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

const schema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number is required'),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  marital_status: z.enum(['Single', 'Married', 'Widowed', 'Divorced']),
  occupation: z.string().optional(),
  how_heard: z.string().optional(),
  existing_member: z.boolean().optional(),
  water_baptised: z.boolean().optional(),
  message: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const PERKS = [
  { icon: Users, title: 'Community', desc: 'Be fully integrated into our church family with access to all small groups and ministries.' },
  { icon: Heart, title: 'Pastoral Care', desc: 'Receive dedicated pastoral support and care from our ministry team.' },
  { icon: BookOpen, title: 'Foundation Class', desc: 'Join our New Members Foundation Class to get grounded in the faith and vision of our church.' },
  { icon: CheckCircle, title: 'Serve & Lead', desc: 'Discover your gifts and serve in a ministry that matches your passion and calling.' },
];

export default function MembershipPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { marital_status: 'Single' },
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await api.post('/forms/membership', data);
      toast.success(res.data.message || 'Membership application submitted! We\'ll be in touch soon.');
      reset();
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }

  return (
    <main className="pt-20">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src="/assets/auditoriumpic1.webp" alt="Membership" className="img-cover" style={{ objectPosition: 'center 40%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Join the Family</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Church Membership</h1>
            <p className="text-white/80 mt-2 max-w-lg">Make Lighthouse Parish your church home</p>
          </div>
        </div>
      </div>

      {/* Why Membership */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-3xl mx-auto text-center">
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Why Join</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Belonging Changes Everything</h2>
          <p className="text-gray-600 leading-relaxed">
            Membership isn't about a name on a register — it's about making a commitment to a community of believers, to grow together, serve together, and journey through life together. When you become a member of Lighthouse Parish, you become part of a family that will stand with you through every season.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="section-pad bg-gray-50">
        <div className="container-max">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all text-center">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="section-pad bg-white">
        <div className="container-max max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Membership Application</h2>
            <p className="text-gray-500 text-sm mb-6">Complete this form and a pastor will contact you within 3–5 business days to welcome you and discuss next steps.</p>

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

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
                  <input {...register('date_of_birth')} type="date" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Marital Status *</label>
                  <select {...register('marital_status')} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white">
                    {['Single', 'Married', 'Widowed', 'Divorced'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Home Address</label>
                <input {...register('address')} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Street, City, Postcode" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Occupation</label>
                <input {...register('occupation')} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">How did you hear about us?</label>
                <input {...register('how_heard')} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Friend, social media, walk-in, etc." />
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input {...register('existing_member')} type="checkbox" className="mt-0.5 accent-pink-500 w-4 h-4" />
                  <span className="text-sm text-gray-600">I am transferring membership from another RCCG or Christian church</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input {...register('water_baptised')} type="checkbox" className="mt-0.5 accent-pink-500 w-4 h-4" />
                  <span className="text-sm text-gray-600">I have been baptised in water</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Anything you'd like us to know? (optional)</label>
                <textarea {...register('message')} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-60">
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
