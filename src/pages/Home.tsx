import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '../components/Button';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Plan Your Perfect Trip Together
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create, collaborate, and organize your travel plans with ease
          </p>
          <Link to="/register">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <MapPin className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Plan Your Route</h3>
            <p className="text-gray-600">
              Create detailed itineraries with activities, locations, and timings
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Calendar className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Track Your Budget</h3>
            <p className="text-gray-600">
              Keep track of expenses and manage your travel budget effectively
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
            <p className="text-gray-600">
              Plan trips together with friends and family in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}