import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Clock, Mail, Phone } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const res = await api.post('/forms/contact', data);
      toast.success(res.data.message);
      reset();
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }

  return (
    <main className="pt-20">
      <div className="relative h-56 overflow-hidden">
        <img src="/assets/auditoriumpic1.webp" alt="Contact Us" className="img-cover" style={{ objectPosition: 'center 60%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-max px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white">Contact Us</h1>
            <p className="text-white/80 mt-2">We'd love to hear from you</p>
          </div>
        </div>
      </div>

      <section className="section-pad">
        <div className="container-max grid lg:grid-cols-2 gap-12">
          {/* Info */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get In Touch</h2>
            <div className="space-y-5">
              {[
                { icon: MapPin, label: 'Address', value: 'The Rock Shopping Centre, Vue Cinema, The Rock, Bury, BL9 0ND, Manchester' },
                { icon: Mail, label: 'Email', value: 'info@lighthouseparish.org' },
                { icon: Phone, label: 'Phone', value: '+44 (0) 161 XXX XXXX' },
                { icon: Clock, label: 'Office Hours', value: 'Monday–Friday: 9:00am – 5:00pm' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{label}</div>
                    <div className="text-gray-600 text-sm mt-0.5">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="mt-8 rounded-2xl overflow-hidden border border-gray-200 h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2369.1!2d-2.296!3d53.593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487b3e2e6e9cfbb3%3A0x9f9e3a4af37d8a2b!2sThe%20Rock%20Shopping%20Centre!5e0!3m2!1sen!2suk!4v1"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Church location map"
              />
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <p className="text-gray-500 text-sm mb-4">Your message goes straight to our church office team, who aim to respond within 2 working days.</p>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                  <input {...register('phone')} type="tel" className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input {...register('subject')} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message *</label>
                <textarea {...register('message')} rows={5} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-60">
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
