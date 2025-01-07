import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Itinerary {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export default function Dashboard() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchItineraries();
    }
  }, [user]);

  const fetchItineraries = async () => {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItineraries(data || []);
    } catch (error) {
      toast.error('Error fetching itineraries');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Itineraries</h1>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Itinerary</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itineraries.map((itinerary) => (
          <Link
            key={itinerary.id}
            to={`/itinerary/${itinerary.id}`}
            className="block group"
          >
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                {itinerary.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{itinerary.description}</p>
              <p className="text-sm text-gray-500">
                Created {new Date(itinerary.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {itineraries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No itineraries yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}