import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getClientDetails } from '../services/api'; 

function ClientPage() {
  const { clientId } = useParams();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const { data } = await getClientDetails(clientId);
        setClientData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load client data');
        setLoading(false);
      }
    };

    fetchClientData();
  }, [clientId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Client Details</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold">Personal Information</h3>
        <p><strong>Full Name:</strong> {clientData.client.fullName}</p>
        <p><strong>Client ID:</strong> {clientData.client.clientId}</p>
        <p><strong>Date of Birth:</strong> {new Date(clientData.client.dateOfBirth).toLocaleDateString()}</p>
        <p><strong>Retired:</strong> {clientData.client.retired ? 'Yes' : 'No'}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold">Medical Documents</h3>
        {clientData.medicalDocs.length === 0 ? (
          <p>No medical documents available for this client.</p>
        ) : (
          clientData.medicalDocs.map(doc => (
            <div key={doc._id} className="border-b py-4">
              <p><strong>Diagnosis:</strong> {doc.treatmentDetails.diagnosis}</p>
              <p><strong>Total Amount Paid:</strong> ${doc.financialInfo.totalAmountPaid}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ClientPage;
