import { useState, useEffect } from "react";
import {
  getInsurerDashboard,
  addClient,
//   updateClient,
  getClientMedicalDocs,
} from "../services/api";

function InsurerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [newClient, setNewClient] = useState({
    fullName: "",
    dateOfBirth: "",
    clientId: "",
    retired: false,
  });
  const [selectedClient, setSelectedClient] = useState(null);
  const [medicalDocs, setMedicalDocs] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await getInsurerDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      await addClient(newClient);
      fetchDashboard();
      setNewClient({
        fullName: "",
        dateOfBirth: "",
        clientId: "",
        retired: false,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewMedicalDocs = async (clientId) => {
    try {
      const { data } = await getClientMedicalDocs(clientId);
      setMedicalDocs(data);
      setSelectedClient(clientId);
    } catch (error) {
      console.error(error);
    }
  };

  if (!dashboardData) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h2>Insurer Dashboard - {dashboardData.companyName}</h2>

      <div>
        <h3>Financial Info</h3>
        <p>
          Policy Reimbursement Margin:{" "}
          {dashboardData.financialInfo.policyReimbursementMargin}%
        </p>
        <p>
          Final Reimbursement:{" "}
          {dashboardData.financialInfo.finalReimbursementPercentage}%
        </p>
      </div>

      <div>
        <h3>Add New Client</h3>
        <form onSubmit={handleAddClient}>
          <input
            placeholder="Full Name"
            value={newClient.fullName}
            onChange={(e) =>
              setNewClient({ ...newClient, fullName: e.target.value })
            }
          />
          <input
            type="date"
            value={newClient.dateOfBirth}
            onChange={(e) =>
              setNewClient({ ...newClient, dateOfBirth: e.target.value })
            }
          />
          <input
            placeholder="Client ID"
            value={newClient.clientId}
            onChange={(e) =>
              setNewClient({ ...newClient, clientId: e.target.value })
            }
          />
          <label>
            Retired:
            <input
              type="checkbox"
              checked={newClient.retired}
              onChange={(e) =>
                setNewClient({ ...newClient, retired: e.target.checked })
              }
            />
          </label>
          <button type="submit">Add Client</button>
        </form>
      </div>

      <div>
        <h3>Clients</h3>
        {dashboardData.clients.map((client) => (
          <div key={client.clientId}>
            <p>
              {client.fullName} - {client.clientId}
            </p>
            <button onClick={() => handleViewMedicalDocs(client.clientId)}>
              View Medical Documents
            </button>
          </div>
        ))}
      </div>

      {selectedClient && (
        <div>
          <h3>Medical Documents</h3>
          {medicalDocs.map((doc) => (
            <div key={doc._id}>
              <p>Diagnosis: {doc.treatmentDetails.diagnosis}</p>
              <p>Total Amount: ${doc.financialInfo.totalAmountPaid}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InsurerDashboard;
