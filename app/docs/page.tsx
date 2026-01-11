'use client';

import BlackHoleBackground from '@/components/BlackHoleBackground';
import { useI18n } from '@/lib/i18n';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

export default function DocsPage() {
    const { t } = useI18n();

    return (
        <div className="relative min-h-screen bg-xos-white dark:bg-black transition-colors duration-500">
            <BlackHoleBackground />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/20 dark:from-black/80 dark:via-transparent dark:to-black/20 z-10 pointer-events-none transition-colors duration-500" />

            <div className="relative z-30 pt-24 pb-24 px-6 md:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto glass-panel p-8 md:p-12 text-black dark:text-white"
                >
                    <div className="prose prose-lg dark:prose-invert max-w-none font-serif">

                        <ReactMarkdown>
                            {t.docs.content}
                        </ReactMarkdown>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
