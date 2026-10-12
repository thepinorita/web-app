import React, { useState } from 'react';

interface NameEntryProps {
  onEnter: (name: string) => void;
}

const NameEntry: React.FC<NameEntryProps> = ({ onEnter }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onEnter(name);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">Welcome to Shift Planner</h1>
      <p className="text-gray-600">Please enter your full name to continue</p>
      <div className="flex space-x-2">
        <input 
          type="text" 
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="John Doe" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Enter
        </button>
      </div>
    </form>
  );
};

export default NameEntry;
