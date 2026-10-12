import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import UserIcon from './UserIcon';
import { API_URL } from '../config';

/**
 * TYPES & INTERFACES
 */
interface ShiftData {
  userName: string;
  date: string;
  shiftSlot: string;
}

interface CalendarProps {
  userName: string;
  lang: string;
  setLang: (l: string) => void;
}

type Language = 'en' | 'de';

const TRANSLATIONS: Record<Language, any> = {
  en: {
    title: 'Shift Schedule', from: 'From', to: 'To', prev: 'Prev Week', next: 'Next Week',
    save: 'Save My Shifts', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slots: { first: 'First', second: 'Second', third: 'Third' },
    saved: 'Shifts saved!', error: 'Error saving shifts'
  },
  de: {
    title: 'Schichtplan', from: 'Von', to: 'Bis', prev: 'Vorherige Woche', next: 'Nächste Woche',
    save: 'Schichten Speichern', days: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'],
    slots: { first: 'Erste', second: 'Zweite', third: 'Dritte' },
    saved: 'Schichten gespeichert!', error: 'Fehler beim Speichern'
  }
};

const Calendar: React.FC<CalendarProps> = ({ userName, lang }) => {
  // --- STATE ---
  const [allShifts, setAllShifts] = useState<ShiftData[]>([]);
  const [mySelections, setMySelections] = useState<Record<string, string[]>>({});
  const [direction, setDirection] = useState<number>(0);
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));

  const t = TRANSLATIONS[lang as Language];

  // --- HELPERS ---
  function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  const formatDate = (d: Date): string => {
    const date = new Date(d);
    return date.toISOString().split('T')[0];
  };

  const formatDisp = (d: Date): string => {
    return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE');
  };

  // --- API CALLS ---
  const fetchShifts = async () => {
    try {
      const { data } = await axios.get<ShiftData[]>(API_URL);
      setAllShifts(data);
    } catch (e) {
      console.error('Failed to fetch shifts:', e);
    }
  };

  const saveShifts = async () => {
    const selections = Object.entries(mySelections).flatMap(([date, slots]) =>
      slots.map(slot => ({ date, slot }))
    );

    try {
      await axios.post(API_URL, { userName, selections });
      await fetchShifts();
      toast.success(t.saved);
    } catch (e) {
      toast.error(t.error);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  // --- HANDLERS ---
  const toggleShift = (date: string, slot: string) => {
    setMySelections(prev => {
      const current = prev[date] || [];
      const next = current.includes(slot) 
        ? current.filter(s => s !== slot) 
        : [...current, slot];
      
      if (next.length > 3) {
        toast.error(lang === 'en' ? 'Max 3 shifts per day' : 'Max 3 Schichten pro Tag');
        return prev;
      }
      return { ...prev, [date]: next };
    });
  };

  const changeWeek = (off: number) => {
    setDirection(off > 0 ? 1 : -1);
    const nextM = new Date(currentMonday);
    nextM.setDate(currentMonday.getDate() + off * 7);
    setCurrentMonday(nextM);
  };

  // --- MEMOIZED VALUES ---
  const friday = useMemo(() => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + 4);
    return d;
  }, [currentMonday]);

  return (
    <div className="p-6 max-w-6xl mx-auto overflow-hidden">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
          <div className="bg-white px-4 py-1 rounded-full border text-sm font-medium text-gray-600 shadow-sm">
            {t.from} {formatDisp(currentMonday)} {t.to} {formatDisp(friday)}
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => changeWeek(-1)} 
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition text-sm shadow-sm"
          >
            {t.prev}
          </button>
          <button 
            onClick={() => changeWeek(1)} 
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition text-sm shadow-sm"
          >
            {t.next}
          </button>
          <button 
            onClick={saveShifts} 
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md transition"
          >
            {t.save}
          </button>
        </div>
      </header>

      {/* Calendar Grid */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div 
          key={currentMonday.getTime()}
          custom={direction}
          initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          {t.days.map((dayName: string, i: number) => {
            const dObj = new Date(currentMonday);
            dObj.setDate(currentMonday.getDate() + i);
            const dStr = formatDate(dObj);
            
            return (
              <div key={dStr} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="text-center mb-4 border-b pb-2">
                  <div className="font-bold text-gray-700">{dayName}</div>
                  <div className="text-xs text-gray-400">{dStr}</div>
                </div>
                <div className="space-y-4 flex-grow">
                  {Object.entries(t.slots).map(([slotKey, slotLabel]) => {
                    const isSelected = mySelections[dStr]?.includes(slotKey);
                    const usersInSlot = allShifts.filter(s => s.date === dStr && s.shiftSlot === slotKey);
                    
                    return (
                      <div key={slotKey} className="flex flex-col space-y-2">
                        <button 
                          onClick={() => toggleShift(dStr, slotKey)} 
                          className={`text-xs py-2 px-2 rounded-lg transition ${
                            isSelected 
                              ? 'bg-blue-600 text-white shadow-inner' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {slotLabel as string}
                        </button>
                        <div className="flex flex-wrap gap-1 mt-1 min-h-[24px] justify-center">
                          {usersInSlot.map((s, idx) => <UserIcon key={idx} name={s.userName} />)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Calendar;
