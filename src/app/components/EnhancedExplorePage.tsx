import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart } from 'lucide-react';
import { ImageWithFallback } from './Figma/ImageWithFallback';
import ThemeToggle from './ThemeToggle';

interface EnhancedExplorePageProps {
  onBack: () => void;
}

const sections = [
  {
    title: 'Daily Wellness',
    description: 'Simple habits for a healthier family routine.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
  {
    title: 'Nutrition Tips',
    description: 'Balanced meal ideas for every age group.',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
  {
    title: 'Exercise Guides',
    description: 'Easy movement plans for all family members.',
    image: 'https://images.unsplash.com/photo-1554284126-aa88f22d8cca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
];

export default function EnhancedExplorePage({ onBack }: EnhancedExplorePageProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = sections[selectedIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Enhanced Explore</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Health intelligence for families</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((section, index) => (
            <button
              key={section.title}
              onClick={() => setSelectedIndex(index)}
              className={`rounded-3xl border p-5 text-left transition ${
                index === selectedIndex
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
              }`}
            >
              <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
              <p className="text-sm opacity-80">{section.description}</p>
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 rounded-3xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-6 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-semibold text-blue-600">
                <Heart size={18} /> Featured Section
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{selected.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">{selected.description}</p>
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-sm text-gray-700 dark:text-gray-200">Explore easy tools, daily plans, and family-friendly wellness ideas that keep everyone moving and feeling their best.</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl">
              <ImageWithFallback
                src={selected.image}
                alt={selected.title}
                className="h-96 w-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
