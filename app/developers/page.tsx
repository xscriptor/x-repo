'use client';

import { useI18n } from '@/lib/i18n';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Code, Send } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  skills: string;
  github: string;
};

export default function DevelopersPage() {
  const { t } = useI18n();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
    alert("Application sent! (Simulated)");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4 bg-xos-white dark:bg-xos-dark flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-xos-purple/20 rounded-2xl flex items-center justify-center mx-auto text-xos-purple">
            <Code size={32} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-xos-dark dark:text-xos-white">
            {t.developers.title}
          </h1>
          <p className="text-lg text-xos-gray max-w-xl mx-auto">
            {t.developers.description}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-panel p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-xos-dark dark:text-xos-white">{t.developers.form.name}</label>
              <input 
                {...register("name", { required: true })}
                className="w-full px-4 py-2 rounded-lg bg-xos-white/50 dark:bg-black/30 border border-xos-gray/20 focus:border-xos-purple focus:ring-1 focus:ring-xos-purple outline-none transition-all"
              />
              {errors.name && <span className="text-xs text-xos-pink">Required</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-xos-dark dark:text-xos-white">{t.developers.form.email}</label>
              <input 
                {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                className="w-full px-4 py-2 rounded-lg bg-xos-white/50 dark:bg-black/30 border border-xos-gray/20 focus:border-xos-purple focus:ring-1 focus:ring-xos-purple outline-none transition-all"
              />
              {errors.email && <span className="text-xs text-xos-pink">Valid email required</span>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-xos-dark dark:text-xos-white">{t.developers.form.skills}</label>
            <input 
              {...register("skills", { required: true })}
              className="w-full px-4 py-2 rounded-lg bg-xos-white/50 dark:bg-black/30 border border-xos-gray/20 focus:border-xos-purple focus:ring-1 focus:ring-xos-purple outline-none transition-all"
              placeholder="e.g. C, Python, System Design"
            />
            {errors.skills && <span className="text-xs text-xos-pink">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-xos-dark dark:text-xos-white">{t.developers.form.github}</label>
            <input 
              {...register("github", { required: true })}
              className="w-full px-4 py-2 rounded-lg bg-xos-white/50 dark:bg-black/30 border border-xos-gray/20 focus:border-xos-purple focus:ring-1 focus:ring-xos-purple outline-none transition-all"
              placeholder="github.com/username"
            />
            {errors.github && <span className="text-xs text-xos-pink">Required</span>}
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-xos-purple hover:bg-xos-purple/90 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Send size={18} /> {t.developers.form.submit}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
