import { FaInfo } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { getInsuranceDetails } from "../services/api";
import ClientBulletinHistory from "../components/ClientBulletinHistory";
import Loading from "../components/Loading";

function ClientDashboard() {
  const [insurance, setInsurance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInsuranceCollapsed, setIsInsuranceCollapsed] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const insuranceRes = await getInsuranceDetails();
        setInsurance(insuranceRes.data);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load insurance details.",
          {
            duration: 3000,
          }
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <Toaster richColors position="top-right" />
      <div className="max-w-4xl mx-auto px-4 my-10">
        <div className="flex items-center mb-8">
          {insurance?.user?.image ? (
            <img
              src={insurance.user.image}
              alt="Profile"
              className="w-24 h-24 rounded-full mr-4 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 mr-4 flex items-center justify-center">
              <span className="text-gray-600">No Image</span>
            </div>
          )}
          <div>
            <h2 className="text-sm text-blue-600 font-semibold ">
              TrueCare is here to save your time and protect your rights.
            </h2>
            <h1 className="text-2xl md:text-3xl text-gray-800">
              Hi dear client, Welcome to your Dashboard!
            </h1>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center py-4 px-6">
            <h2 className="text-xl text-gray-800">Your Insurance Details</h2>
            <button
              onClick={() => setIsInsuranceCollapsed(!isInsuranceCollapsed)}
              className="p-2 text-indigo-950 rounded-full hover:bg-indigo-50 hover:rotate-12 transform transition-transform duration-300"
              title={
                isInsuranceCollapsed
                  ? "Show Insurance Details"
                  : "Hide Insurance Details"
              }
              aria-label={
                isInsuranceCollapsed
                  ? "Show Insurance Details"
                  : "Hide Insurance Details"
              }
            >
              <FaInfo className="w-5 h-5" />
            </button>
          </div>
          {!isInsuranceCollapsed && insurance && (
            <div className="py-4 px-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">
                    Company
                  </span>
                  <span>{insurance.companyName || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">
                    Address
                  </span>
                  <span>{insurance.address || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">
                    Website
                  </span>
                  <span>
                    {insurance.website ? (
                      <a
                        href={insurance.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        {insurance.website}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">Email</span>
                  <span>
                    {insurance.email && insurance.email !== "N/A" ? (
                      <a
                        href={`mailto:${insurance.email}`}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        {insurance.email}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">
                    Plan Range
                  </span>
                  <span>
                    {insurance.clientPlan?.range
                      ? `${insurance.clientPlan.range.min}% - ${insurance.clientPlan.range.max}%`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-full my-15">
        <ClientBulletinHistory />
      </div>
    </div>
  );
}

export default ClientDashboard;
