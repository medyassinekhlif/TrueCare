import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getClient, updateClient } from "../services/api";
import EditClientForm from "../components/EditClientForm";
import Loading from "../components/Loading";

function ClientDetails() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const [medicalDocs, setMedicalDocs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    nationalId: "",
    job: "",
    health: {
      conditions: "",
      smoker: false,
      exercise: "Sometimes",
    },
    plan: { range: { min: 50, max: 70 } },
  });
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const { data } = await getClient(clientId);
      setClientData(data.client);
      setMedicalDocs(data.medicalDocs);
      setFormData({
        name: data.client.name,
        birthDate:
          data.client.birthDate &&
          !isNaN(new Date(data.client.birthDate).getTime())
            ? new Date(data.client.birthDate).toISOString().split("T")[0]
            : "",
        nationalId: data.client.nationalId,
        job: data.client.job,
        health: data.client.health,
        plan: data.client.plan,
      });
      setError(null);
    } catch (error) {
      console.error("Error fetching client data:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load client data. Please try again."
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (formData.plan.range.min > formData.plan.range.max) {
        setError("Minimum range cannot exceed maximum.");
        return;
      }
      await updateClient(clientId, formData);
      setClientData({ ...clientData, ...formData });
      setEditMode(false);
      setError(null);
    } catch (error) {
      console.error("Error updating client:", error);
      setError(
        error.response?.data?.message ||
          "Failed to update client. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => {
                  setError(null);
                  fetchData();
                }}
                className="px-3 py-1 border border-gray-300 font-semibold text-indigo-800 rounded-md hover:bg-indigo-50"
              >
                Retry
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-3 py-1 bg-gray-200 border border-gray-300 font-semibold text-black rounded-md hover:bg-gray-300"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {!clientData && !error ? (
          <Loading />
        ) : clientData ? (
          <>
            <button
              onClick={() => navigate("/")}
              className="mb-6 px-3 py-1 bg-gray-200 border border-gray-300 font-semibold text-black rounded-md hover:bg-gray-300"
            >
              Back to Dashboard
            </button>

            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
              Client Details - {clientData.name}
            </h2>

            {editMode ? (
              <EditClientForm
                formData={formData}
                setFormData={setFormData}
                handleUpdate={handleUpdate}
                setEditMode={setEditMode}
              />
            ) : (
              <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex"></div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Name:
                    </span>
                    <span>{clientData.name}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Email:
                    </span>
                    <span>{clientData.email}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Insurance Company:
                    </span>
                    <span>{clientData.assuranceCompany}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Plan Range:
                    </span>
                    <span>
                      {clientData.plan.range.min}% - {clientData.plan.range.max}
                      %
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Date of Birth:
                    </span>
                    <span>
                      {new Date(clientData.birthDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      National ID:
                    </span>
                    <span>{clientData.nationalId}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">Job:</span>
                    <span>{clientData.job}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Health Conditions:
                    </span>
                    <span>{clientData.health.conditions || "None"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Smoker:
                    </span>
                    <span>{clientData.health.smoker ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Exercise Frequency:
                    </span>
                    <span>{clientData.health.exercise}</span>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-3 py-1 border border-gray-300 font-semibold text-indigo-800 rounded-md hover:bg-indigo-50"
                  >
                    Edit Client
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Medical Documents
              </h3>
              {medicalDocs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {medicalDocs.map((doc) => (
                    <div
                      key={doc._id}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                    >
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex">
                          <span className="font-medium text-gray-900 w-32">
                            Diagnosis:
                          </span>
                          <span>{doc.treatmentDetails.diagnosis}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-gray-900 w-32">
                            Total Amount Paid:
                          </span>
                          <span>
                            ${doc.financialInfo.totalAmountPaid.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-gray-900 w-32">
                            Created At:
                          </span>
                          <span>
                            {new Date(doc.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link
                          to={`/medical-bulletin/${doc._id}`}
                          className="px-3 py-1 border border-gray-300 font-semibold text-indigo-800 rounded-md hover:bg-indigo-50"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No medical documents available.</p>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default ClientDetails;
