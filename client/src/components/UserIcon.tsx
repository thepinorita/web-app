import React from 'react';

interface UserIconProps {
  name: string;
}

const UserIcon: React.FC<UserIconProps> = ({ name }) => {
  const getInitials = (userName: string) => {
    const parts = userName.trim().split(' ');
    if (parts.length === 1) return (parts[0][0] || '?').toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold shadow-sm">
      {getInitials(name)}
    </div>
  );
};

export default UserIcon;
