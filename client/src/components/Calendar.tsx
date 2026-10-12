import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import UserIcon from './UserIcon';
import { API_URL } from '../config';

const TRANSLATIONS = {
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

interface ShiftData { userName: string; date: string; shiftSlot: string; }

const Calendar: React.FC<{ userName: string; lang: string; setLang: (l: string) => void }> = ({ userName, lang }) => {
  const [allShifts, setAllShifts] = useState<ShiftData[]>([]);
  const [mySelections, setMySelections] = useState<{ [key: string]: string[] }>({});
  const [direction, setDirection] = useState(0);
  
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(date.setDate(diff));
    monday.setHours(0,0,0,0);
    return monday;
  };

  const [currentMonday, setCurrentMonday] = useState<Date>(getMonday(new Date()));
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS];

  useEffect(() => { fetchShifts(); }, []);

  const fetchShifts = async () => {
    try {
      const res = await axios.get(API_URL);
      setAllShifts(res.data);
    } catch (e) { console.error(e); }
  };

  const formatDate = (d: Date) => {
    const date = new Date(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisp = (d: Date) => {
    const date = new Date(d);
    return date.toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE');
  };

  const toggleShift = (date: string, slot: string) => {
    const current = mySelections[date] || [];
    let next = current.includes(slot) ? current.filter(s => s !== slot) : [...current, slot];
    if (next.length > 3) return;
    setMySelections({ ...mySelections, [date]: next });
  };

  const saveShifts = async () => {
    const selections: { date: string; slot: string; }[] = [];
    Object.entries(mySelections).forEach(([date, slots]) => {
      slots.forEach(slot => selections.push({ date, slot }));
    });
    try {
      await axios.post(API_URL, { userName, selections });
      await fetchShifts();
      toast.success(t.saved);
    } catch (e) { 
      toast.error(t.error); 
    }
  };

  const changeWeek = (off: number) => {
    setDirection(off > 0 ? 1 : -1);
    const nextM = new Date(currentMonday);
    nextM.setDate(currentMonday.getDate() + off * 7);
    setCurrentMonday(nextM);
  };

  const friday = new Date(currentMonday);
  friday.setDate(currentMonday.getDate() + 4);

  return (
    <div className="p-6 max-w-6xl mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">{t.title}</h2>
          <div className="bg-white px-4 py-1 rounded-full border text-sm font-medium text-gray-600 shadow-sm">
            {t.from} {formatDisp(currentMonday)} {t.to} {formatDisp(friday)}
          </div>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => changeWeek(-1)} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition text-sm">{t.prev}</button>
          <button onClick={() => changeWeek(1)} className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition text-sm">{t.next}</button>
          <button onClick={saveShifts} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md">{t.save}</button>
        </div>
      </div>

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
          {t.days.map((dayName, i) => {
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
                  {Object.entries(t.slots).map(([k, label]) => {
                    const isSel = mySelections[dStr]?.includes(k);
                    const users = allShifts.filter(s => s.date === dStr && s.shiftSlot === k);
                    return (
                      <div key={k} className="flex flex-col space-y-2">
                        <button onClick={() => toggleShift(dStr, k)} className={`text-xs py-2 px-2 rounded-lg transition ${isSel ? 'bg-blue-600 text-white shadow-inner' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {label}
                        </button>
                        <div className="flex flex-wrap gap-1 mt-1 min-h-[24px] justify-center">
                          {users.map((s, idx) => <UserIcon key={idx} name={s.userName} />)}
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
