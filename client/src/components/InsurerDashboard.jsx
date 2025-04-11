import { useState, useEffect } from "react";
import { getInsurerDashboard } from "../services/api";
import { FaUserCheck } from "react-icons/fa";
import ClientCard from "./ClientCard";
import AddClientForm from "./AddClientForm";

function InsurerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await getInsurerDashboard();
      const clientsWithUniqueKeys = data.clients.map((client, index) => ({
        ...client,
        uniqueKey: client.clientId || `temp-${index}`,
      }));
      setDashboardData({ ...data, clients: clientsWithUniqueKeys });
      setError(null);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      setError("Failed to load dashboard data. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-[#006A6A] rounded-lg">
            {error}
          </div>
        )}

        {!dashboardData ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : (
          <>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1B4965] mb-8">
              Insurer Dashboard - {dashboardData.companyName}
            </h1>

            {/* Financial Info */}
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                Financial Info
              </h2>
              <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-md">
                <p className="mb-2 text-gray-700">
                  <span className="font-semibold text-gray-800">
                    Policy Reimbursement Margin:
                  </span>{" "}
                  {dashboardData.financialInfo.policyReimbursementMargin}%
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-800">
                    Final Reimbursement:
                  </span>{" "}
                  {dashboardData.financialInfo.finalReimbursementPercentage}%
                </p>
              </div>
            </div>

            {/* Add New Client */}
            <div className="mb-8">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setIsFormVisible(!isFormVisible)}
              >
                 <FaUserCheck
                  className={`text-gray-800 text-3xl relative top-[-6px] transition-transform duration-300 ${
                    isFormVisible ? "rotate-[-20deg]" : "rotate-0"
                  }`}
                /><h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 ml-2">
                  Add New Client
                </h2>
               
              </div>
              {isFormVisible && (
                <AddClientForm
                  fetchDashboard={fetchDashboard}
                  setError={setError}
                />
              )}
            </div>

            {/* Clients */}
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                Clients
              </h2>
              {dashboardData.clients.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.clients.map((client) => (
                    <ClientCard key={client.uniqueKey} client={client} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No clients available.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default InsurerDashboard;
