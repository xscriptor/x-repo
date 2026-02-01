'use client';

import { useI18n } from '@/lib/i18n';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function ContactPage() {
  const { t } = useI18n();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    const subject = encodeURIComponent(`Contact Message: ${data.name}`);
    const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`);
    window.location.href = `mailto:x@xscriptor.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] pt-12 pb-32 px-4 bg-X-white dark:bg-X-dark flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-X-green/20 rounded-2xl flex items-center justify-center mx-auto text-X-green">
            <Mail size={32} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-X-dark dark:text-X-white">
            {t.contact.title}
          </h1>
          <p className="text-lg text-X-gray max-w-xl mx-auto">
            {t.contact.description}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-X-dark dark:text-X-white">{t.contact.form.name}</label>
              <input
                {...register("name", { required: true })}
                className="w-full px-4 py-2 rounded-lg bg-X-white/50 dark:bg-black/30 border border-X-gray/20 focus:border-X-green focus:ring-1 focus:ring-X-green outline-none transition-all"
              />
              {errors.name && <span className="text-xs text-X-pink">Required</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-X-dark dark:text-X-white">{t.contact.form.email}</label>
              <input
                {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                className="w-full px-4 py-2 rounded-lg bg-X-white/50 dark:bg-black/30 border border-X-gray/20 focus:border-X-green focus:ring-1 focus:ring-X-green outline-none transition-all"
              />
              {errors.email && <span className="text-xs text-X-pink">Valid email required</span>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-X-dark dark:text-X-white">{t.contact.form.message}</label>
            <textarea
              {...register("message", { required: true })}
              rows={5}
              className="w-full px-4 py-2 rounded-lg bg-X-white/50 dark:bg-black/30 border border-X-gray/20 focus:border-X-green focus:ring-1 focus:ring-X-green outline-none transition-all resize-none"
            />
            {errors.message && <span className="text-xs text-X-pink">Required</span>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-X-green hover:bg-X-green/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Send size={18} /> {t.contact.form.submit}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
