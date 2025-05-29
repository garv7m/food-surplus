import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function DonorDashboard({ token }) {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    food_type: '',
    quantity: '',
    shelf_life: '',
    address: '',
    city: '',
    state: '',
    photo: null
  });

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchDonations();
    fetchRequests();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await axios.get(`${API_URL}/donations/my`, config);
      setDonations(response.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/requests/received`, config);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataObj = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) formDataObj.append(key, formData[key]);
    });

    try {
      await axios.post(`${API_URL}/donations`, formDataObj, {
        ...config,
        headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
      });
      
      setShowForm(false);
      setFormData({
        food_type: '',
        quantity: '',
        shelf_life: '',
        address: '',
        city: '',
        state: '',
        photo: null
      });
      fetchDonations();
    } catch (error) {
      console.error('Error creating donation:', error);
    }
  };

  const handleRequestAction = async (requestId, status, donationId) => {
    try {
      await axios.put(`${API_URL}/requests/${requestId}/accept`, { 
        status, 
        donation_id: donationId 
      }, config);
      fetchRequests();
      fetchDonations();
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Donor Dashboard</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {showForm ? 'Cancel' : 'Add Donation'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-bold mb-4">Add Food Donation</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Food Type"
              value={formData.food_type}
              onChange={(e) => setFormData({...formData, food_type: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
            
            <input
              type="text"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
            
            <input
              type="text"
              placeholder="Shelf Life"
              value={formData.shelf_life}
              onChange={(e) => setFormData({...formData, shelf_life: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
            
            <textarea
              placeholder="Address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded"
                required
              />
              
              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded"
                required
              />
            </div>
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({...formData, photo: e.target.files[0]})}
              className="w-full p-3 border border-gray-300 rounded"
            />
            
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              Create Donation
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Donations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">My Donations</h3>
          <div className="space-y-4">
            {donations.map((donation) => (
              <div key={donation.id} className="border p-4 rounded">
                <h4 className="font-semibold">{donation.food_type}</h4>
                <p>Quantity: {donation.quantity}</p>
                <p>Status: {donation.status}</p>
                <p>City: {donation.city}</p>
                {donation.photo_url && (
                  <img 
                    src={`http://localhost:5000${donation.photo_url}`}
                    alt="Food"
                    className="w-20 h-20 object-cover rounded mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Requests */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Incoming Requests</h3>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border p-4 rounded">
                <h4 className="font-semibold">{request.food_type}</h4>
                <p>Receiver: {request.receiver_name}</p>
                <p>Phone: {request.receiver_phone}</p>
                <p>Status: {request.status}</p>
                
                {request.status === 'pending' && (
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => handleRequestAction(request.id, 'accepted', request.donation_id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequestAction(request.id, 'rejected', request.donation_id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
                
                {request.otp && (
                  <p className="mt-2 font-bold text-green-600">OTP: {request.otp}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonorDashboard;