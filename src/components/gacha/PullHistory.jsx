// src/components/gacha/PullHistory.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function PullHistory() {
  const { user } = useAuth();
  const [pulls, setPulls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchPulls = async () => {
      try {
        const { data, error } = await supabase
          .from('gacha_pulls')
          .select('*')
          .eq('user_id', user.id)
          .order('pull_time', { ascending: false });

        if (error) throw error;
        setPulls(data || []);
      } catch (error) {
        console.error('Error fetching pulls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPulls();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('pulls_changes')
      .on('postgres_changes', 
        { 
          event: '*',
          schema: 'public',
          table: 'gacha_pulls',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPulls(prev => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-white mb-4">Your Pull History</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-2">
          {pulls.map((pull) => (
            <div key={pull.id} className="bg-gray-800 p-4 rounded-lg">
              <p>Banner: {pull.banner_type}</p>
              <p className="text-sm text-gray-400">
                {new Date(pull.pull_time).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}