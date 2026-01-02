// src/components/gacha/GachaBanner.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function GachaBanner({ bannerType, onPull }) {
  const { user } = useAuth();
  const [isPulling, setIsPulling] = useState(false);

  const handlePull = async () => {
    if (!user) {
      alert('Please sign in to pull');
      return;
    }

    setIsPulling(true);
    try {
      // Save pull to Supabase
      const { data, error } = await supabase
        .from('gacha_pulls')
        .insert([
          { 
            user_id: user.id,
            banner_type: bannerType,
            pull_time: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      // Call the original onPull with the new pull data
      onPull(data[0]);
    } catch (error) {
      console.error('Error saving pull:', error);
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <button
      onClick={handlePull}
      disabled={isPulling}
      className="px-6 py-3 bg-purple-600 text-white rounded-lg disabled:opacity-50"
    >
      {isPulling ? 'Pulling...' : `Pull on ${bannerType} Banner`}
    </button>
  );
}