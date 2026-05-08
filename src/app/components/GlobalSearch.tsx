import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, FileText, Pill, X } from 'lucide-react';
import { API_BASE, getAuthHeaders } from '../../lib/supabase';

interface SearchResult {
  type: 'member' | 'prescription' | 'medicine';
  id: string;
  title: string;
  subtitle: string;
  icon: JSX.Element;
  data: any;
}

interface GlobalSearchProps {
  onSelectResult?: (result: SearchResult) => void;
}

export default function GlobalSearch({ onSelectResult }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search family members
      const membersResponse = await fetch(`${API_BASE}/family/members`, {
        headers: getAuthHeaders(),
      });
      const membersData = await membersResponse.json();

      if (membersResponse.ok && membersData.members) {
        membersData.members.forEach((member: any) => {
          if (
            member.name.toLowerCase().includes(query.toLowerCase()) ||
            member.nickname.toLowerCase().includes(query.toLowerCase())
          ) {
            searchResults.push({
              type: 'member',
              id: member.id,
              title: member.nickname,
              subtitle: member.name,
              icon: <User size={20} className="text-blue-600" />,
              data: member,
            });
          }
        });

        // Search prescriptions for each member
        for (const member of membersData.members) {
          const presResponse = await fetch(`${API_BASE}/prescription/member/${member.id}`, {
            headers: getAuthHeaders(),
          });
          const presData = await presResponse.json();

          if (presResponse.ok && presData.prescriptions) {
            presData.prescriptions.forEach((pres: any) => {
              // Search by hospital or doctor name
              if (
                pres.hospitalName?.toLowerCase().includes(query.toLowerCase()) ||
                pres.doctorName?.toLowerCase().includes(query.toLowerCase())
              ) {
                searchResults.push({
                  type: 'prescription',
                  id: pres.id,
                  title: pres.hospitalName || 'Prescription',
                  subtitle: `Dr. ${pres.doctorName} - ${member.nickname}`,
                  icon: <FileText size={20} className="text-purple-600" />,
                  data: pres,
                });
              }

              // Search by medicine name
              pres.medicines?.forEach((med: any) => {
                if (med.name?.toLowerCase().includes(query.toLowerCase())) {
                  searchResults.push({
                    type: 'medicine',
                    id: `${pres.id}-${med.name}`,
                    title: med.name,
                    subtitle: `${med.dosage} - ${member.nickname}`,
                    icon: <Pill size={20} className="text-green-600" />,
                    data: { ...med, prescription: pres, member },
                  });
                }
              });
            });
          }
        }
      }

      setResults(searchResults.slice(0, 10)); // Limit to 10 results
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    onSelectResult?.(result);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search members, prescriptions, or medicines..."
          className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
        />
        {query && (
          <button
  onClick={() => {
    setQuery('');
    setResults([]);
  }}
  aria-label="Clear search"

            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50"
          >
            {results.map((result, index) => (
              <motion.button
                key={result.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectResult(result)}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {result.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {result.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.subtitle}
                  </p>
                </div>
                <div className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400 capitalize">
                  {result.type}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {isOpen && query.length >= 2 && results.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-8 text-center z-50"
        >
          <Search size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">No results found for "{query}"</p>
        </motion.div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
