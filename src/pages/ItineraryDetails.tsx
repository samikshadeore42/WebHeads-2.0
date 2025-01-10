import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Calendar, MapPin, DollarSign } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Activity {
  id: string;
  name: string;
  date: string;
  location: string;
  cost: number;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
}

export default function ItineraryDetails() {
  const { id } = useParams<{ id: string }>();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (id) {
      fetchItineraryDetails();
    }
  }, [id]);

  const fetchItineraryDetails = async () => {
    try {
      // Fetch itinerary details
      const { data: itinerary, error: itineraryError } = await supabase
        .from('itineraries')
        .select('*')
        .eq('id', id)
        .single();

      if (itineraryError) throw itineraryError;
      
      setTitle(itinerary.title);
      setDescription(itinerary.description);

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('itinerary_id', id)
        .order('date', { ascending: true });

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('itinerary_id', id);

      if (expensesError) throw expensesError;
      setExpenses(expensesData || []);
    } catch (error) {
      toast.error('Error fetching itinerary details');
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(activities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setActivities(items);
  };

  const totalBudget = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Activities</h2>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="activities">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {activities.map((activity, index) => (
                      <Draggable
                        key={activity.id}
                        draggableId={activity.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-50 p-4 rounded-md mb-3"
                          >
                            <h3 className="font-medium mb-2">{activity.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(activity.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {activity.location}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {activity.cost}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Budget Tracker</h2>
            <div className="text-3xl font-bold text-blue-600 mb-4">
              ${totalBudget.toFixed(2)}
            </div>
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center">
                  <span className="text-gray-600">{expense.description}</span>
                  <span className="font-medium">${expense.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}