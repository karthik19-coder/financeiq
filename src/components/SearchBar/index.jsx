import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiSearchLine, RiCloseLine } from 'react-icons/ri';
import useDebounce from '../../hooks/useDebounce';
import PropTypes from 'prop-types';

export default function SearchBar({ value, onChange, placeholder = "Search transactions..." }) {
  const [localValue, setLocalValue] = useState(value || '');
  const debouncedValue = useDebounce(localValue, 400);

  useEffect(() => {
    onChange(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  // Handle external clears
  useEffect(() => {
    if (value === '') {
      setLocalValue('');
    }
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <RiSearchLine className="text-slate-400" size={18} />
      </div>
      
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.2)] focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
      />
      
      <AnimatePresence>
        {localValue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
          >
            <button
              onClick={handleClear}
              className="rounded-full bg-white/5 p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Clear search"
            >
              <RiCloseLine size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
