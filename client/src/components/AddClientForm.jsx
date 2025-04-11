import { useState } from 'react';
import PropTypes from 'prop-types';
import { addClient } from '../services/api';

function AddClientForm({ fetchDashboard, setError }) {
  const [newClient, setNewClient] = useState({
    fullName: '',
    dateOfBirth: '',
    clientId: '',
    retired: false,
  });

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      if (!newClient.fullName || !newClient.dateOfBirth || !newClient.clientId) {
        setError('Please fill in all required fields.');
        return;
      }
      await addClient(newClient);
      fetchDashboard();
      setNewClient({
        fullName: '',
        dateOfBirth: '',
        clientId: '',
        retired: false,
      });
      setError(null);
    } catch (error) {
      console.error('Error adding client:', error);
      setError('Failed to add client. Please try again.');
    }
  };

  return (
    <div className="mb-8">
     
      <form
        onSubmit={handleAddClient}
        className="bg-white p-6 border border-gray-300 rounded-lg shadow-md max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter Full Name"
              value={newClient.fullName}
              onChange={(e) =>
                setNewClient({ ...newClient, fullName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              value={newClient.dateOfBirth}
              onChange={(e) =>
                setNewClient({ ...newClient, dateOfBirth: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label
              htmlFor="clientId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Client ID
            </label>
            <input
              id="clientId"
              type="text"
              placeholder="Enter Client ID"
              value={newClient.clientId}
              onChange={(e) =>
                setNewClient({ ...newClient, clientId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label
              htmlFor="retired"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <input
                id="retired"
                type="checkbox"
                checked={newClient.retired}
                onChange={(e) =>
                  setNewClient({ ...newClient, retired: e.target.checked })
                }
                className="mr-2 h-4 w-4 text-[#1B4965] focus:ring-[#1B4965] border-gray-300 rounded"
              />
              Client is Retired
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 w-full px-6 py-3 bg-[#1B4965] hover:bg-[#2A5A7A] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:ring-offset-2 transition duration-200"
        >
          Add Client
        </button>
      </form>
    </div>
  );
}

AddClientForm.propTypes = {
  fetchDashboard: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

export default AddClientForm;