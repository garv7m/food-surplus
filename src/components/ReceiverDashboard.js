import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Map from './Map';

const API_URL = 'http://localhost:5000/api';

function ReceiverDashboard({ token }) {
  const [donations, setDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [filters, setFilters] = useState({ city: '', state: '' });
  const [selectedDonation, setSelectedDonation] = useState(null);

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchDonations();
    fetchMyRequests();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await axios.get(`${API_URL}/donations`, {
        params: filters
      });
      setDonations(response.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/requests/sent`, config);
      setMyRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSearch = () => {
    fetchDonations();
  };

  const sendRequest = async (donationId) => {
    try {
      await axios.post(`${API_URL}/requests`, { donation_id: donationId }, config);
      alert('Request sent successfully!');
      fetchMyRequests();
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Error sending request');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Receiver Dashboard</h2>

      {/* Search Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-bold mb-4">Search Food Donations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="City"
            value={filters.city}
            onChange={(e) => setFilters({...filters, city: e.target.value})}
            className="p-3 border border-gray-300 rounded"
          />
          
          <input
            type="text"
            placeholder="State"
            value={filters.state}
            onChange={(e) => setFilters({...filters, state: e.target.value})}
            className="p-3 border border-gray-300 rounded"
          />
          
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Donations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Available Donations</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {donations.map((donation) => (
              <div key={donation.id} className="border p-4 rounded">
                <h4 className="font-semibold">{donation.food_type}</h4>
                <p>Quantity: {donation.quantity}</p>
                <p>Shelf Life: {donation.shelf_life}</p>
                <p>Donor: {donation.donor_name}</p>
                <p>Location: {donation.city}, {donation.state}</p>
                <p>Address: {donation.address}</p>
                
                {donation.photo_url && (
                  <img 
                    src={`http://localhost:5000${donation.photo_url}`}
                    alt="Food"
                    className="w-20 h-20 object-cover rounded mt-2"
                  />
                )}
                
                <div className="mt-3 space-x-2">
                  <button
                    onClick={() => sendRequest(donation.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Request
                  </button>
                  <button
                    onClick={() => setSelectedDonation(donation)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    View on Map
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Requests */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">My Requests</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {myRequests.map((request) => (
              <div key={request.id} className="border p-4 rounded">
                <h4 className="font-semibold">{request.food_type}</h4>
                <p>Donor: {request.donor_name}</p>
                <p>Phone: {request.donor_phone}</p>
                <p>Status: <span className={`font-bold ${
                  request.status === 'accepted' ? 'text-green-600' :
                  request.status === 'rejected' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>{request.status}</span></p>
                
                {request.status === 'accepted' && (
                  <div className="mt-2 p-2 bg-green-50 rounded">
                    <p className="font-bold">Pickup Details:</p>
                    <p>Address: {request.address}</p>
                    {request.otp && (
                      <p className="font-bold text-green-600">OTP: {request.otp}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Donor Location</h3>
              <button
                onClick={() => setSelectedDonation(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold">{selectedDonation.food_type}</h4>
              <p>Donor: {selectedDonation.donor_name}</p>
              <p>Address: {selectedDonation.address}</p>
            </div>
            
            <Map address={selectedDonation.address} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceiverDashboard;