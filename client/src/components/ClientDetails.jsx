import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient, updateClient } from '../services/api';

function ClientDetails() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const [medicalDocs, setMedicalDocs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    retired: false,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const { data } = await getClient(clientId);
      setClientData(data.client);
      setMedicalDocs(data.medicalDocs);
      setFormData({
        fullName: data.client.fullName,
        dateOfBirth: data.client.dateOfBirth,
        retired: data.client.retired,
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching client data:', error);
      setError('Failed to load client data. Please try again.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateClient(clientId, formData);
      setClientData({ ...clientData, ...formData });
      setEditMode(false);
      setError(null);
    } catch (error) {
      console.error('Error updating client:', error);
      setError('Failed to update client. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-[#006A6A] rounded-lg">
            {error}
            <button
              onClick={() => navigate('/insurer/dashboard')}
              className="mt-4 block w-full md:w-auto px-6 py-2 bg-[#006A6A] hover:bg-[#008080] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#006A6A] focus:ring-offset-2 transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {!clientData && !error ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : (
          <>
            <button
              onClick={() => navigate('/insurer/dashboard')}
              className="mb-6 px-6 py-2 bg-[#006A6A] hover:bg-[#008080] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#006A6A] focus:ring-offset-2 transition duration-200"
            >
              Back to Dashboard
            </button>

            <h2 className="text-2xl md:text-3xl font-bold text-[#1B4965] mb-6">
              Client Details - {clientData.fullName}
            </h2>

            {editMode ? (
              <form
                onSubmit={handleUpdate}
                className="mb-8 bg-white p-6 rounded-lg shadow-md max-w-md"
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
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
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
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({ ...formData, dateOfBirth: e.target.value })
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
                        checked={formData.retired}
                        onChange={(e) =>
                          setFormData({ ...formData, retired: e.target.checked })
                        }
                        className="mr-2 h-4 w-4 text-[#1B4965] focus:ring-[#1B4965] border-gray-300 rounded"
                      />
                      Client is Retired
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#1B4965] hover:bg-[#2A5A7A] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:ring-offset-2 transition duration-200"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-8 bg-white p-6 rounded-lg shadow-md max-w-md">
                <p className="mb-2 text-gray-700">
                  <strong>Client ID:</strong> {clientId}
                </p>
                <p className="mb-2 text-gray-700">
                  <strong>Full Name:</strong> {clientData.fullName}
                </p>
                <p className="mb-2 text-gray-700">
                  <strong>Date of Birth:</strong> {clientData.dateOfBirth}
                </p>
                <p className="mb-4 text-gray-700">
                  <strong>Status:</strong>{' '}
                  {clientData.retired ? 'Retired' : 'Active'}
                </p>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-6 py-2 bg-[#1B4965] hover:bg-[#2A5A7A] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:ring-offset-2 transition duration-200"
                >
                  Edit Client
                </button>
              </div>
            )}

            <div>
              <h3 className="text-lg md:text-xl font-semibold text-[#1B4965] mb-4">
                Medical Documents
              </h3>
              {medicalDocs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {medicalDocs.map((doc) => (
                    <div
                      key={doc._id}
                      className="bg-white p-4 rounded-lg shadow-md"
                    >
                      <p className="mb-2 text-gray-700">
                        <strong>Diagnosis:</strong>{' '}
                        {doc.treatmentDetails.diagnosis}
                      </p>
                      <p className="text-gray-700">
                        <strong>Total Amount:</strong> $
                        {doc.financialInfo.totalAmountPaid}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No medical documents available.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ClientDetails;