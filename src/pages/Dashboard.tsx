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
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isEditModalOpen, setEditModalOpen] = useState(false);

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

  const openEditModal = (itinerary: Itinerary) => {
    setEditingItinerary(itinerary);
    setEditTitle(itinerary.title);
    setEditDescription(itinerary.description);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingItinerary(null);
    setEditTitle('');
    setEditDescription('');
    setEditModalOpen(false);
  };

  const saveChanges = async () => {
    if (!editingItinerary) return;    
    try {
      const { error } = await supabase
        .from('itineraries')
        .update({
          title: editTitle,
          description: editDescription,
        })
        .eq('id', editingItinerary.id);

      if (error) throw error;
      toast.success('Itinerary updated successfully');
      fetchItineraries();
      closeEditModal();
    } catch (error) {
      toast.error('Error updating itinerary');
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
          <div key={itinerary.id} className="group">
            <Link to={`/itinerary/${itinerary.id}`} className="block">
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
            <button
              onClick={() => openEditModal(itinerary)}
              className="text-blue-500 hover:underline mt-2"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {itineraries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No itineraries yet. Create your first one!</p>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Itinerary</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border rounded-md p-2 mb-4"
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full border rounded-md p-2 mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeEditModal}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
