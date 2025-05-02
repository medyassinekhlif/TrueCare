import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { Toaster, toast } from "sonner";
import { getMedicalBulletinDetails } from "../services/api";

function ClientBulletinDetails() {
  const [bulletin, setBulletin] = useState(null);
  const [loading, setLoading] = useState(true);
  const { bulletinId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBulletinDetails = async () => {
      setLoading(true);
      try {
        const response = await getMedicalBulletinDetails(bulletinId);
        setBulletin(response.data);
        if (!response.data.estimation) {
          toast.info(
            "Your insurance company has not yet estimated this medical bulletin.",
            { duration: 5000 }
          );
        }
      } catch (error) {
        toast.error(`Failed to load bulletin details: ${error.message}`, {
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBulletinDetails();
  }, [bulletinId]);

  if (loading) {
    return <Loading />;
  }

  if (!bulletin) {
    return (
      <div className="min-h-screen bg-gray-100 py-4">
        <div className="max-w-4xl mx-auto px-4 my-10">
          <h2 className="text-2xl text-gray-800 mb-4">Bulletin Not Found</h2>
          <button
            onClick={() => navigate("/bulletins")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-300"
          >
            Back to Bulletins
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <Toaster richColors position="top-right" />
      <div className="max-w-4xl mx-auto px-4 my-10">
        <h2 className="text-3xl text-gray-800 mb-6">
          Medical Bulletin Details
        </h2>

        <div className="bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <div className="py-4 px-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Treatment Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">
                    Doctor Name
                  </span>
                  <span>{bulletin.doctorName}</span>
                </div>
                <div className="flex mt-2">
                  <span className="font-medium text-gray-900 w-32">
                    Specialty
                  </span>
                  <span>{bulletin.doctorSpecialty}</span>
                </div>
                <div className="flex mt-2">
                  <span className="font-medium text-gray-900 w-32">
                    Doctor Email
                  </span>
                  <span>
                    {bulletin.doctorEmail && bulletin.doctorEmail !== "N/A" ? (
                      <a
                        href={`mailto:${bulletin.doctorEmail}`}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        {bulletin.doctorEmail}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </span>
                </div>
                <div className="flex mt-2">
                  <span className="font-medium text-gray-900 w-32">
                    Insurer
                  </span>
                  <span>{bulletin.insurer.companyName}</span>
                </div>
                <div className="flex mt-2">
                  <span className="font-medium text-gray-900 w-32">
                    Insurer Email
                  </span>
                  <span>
                    {bulletin.insurer.email &&
                    bulletin.insurer.email !== "N/A" ? (
                      <a
                        href={`mailto:${bulletin.insurer.email}`}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        {bulletin.insurer.email}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </span>
                </div>
                <div className="flex mt-2">
                  <span className="font-medium text-gray-900 w-32">Date</span>
                  <span>
                    {bulletin.createdAt
                      ? new Date(bulletin.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">
                    Diagnosis
                  </span>
                  <span>{bulletin.treatmentDetails.diagnosis}</span>
                </div>
                <div className="flex mt-2">
                  <span className="font-medium text-gray-900 w-32">
                    Sessions
                  </span>
                  <span>{bulletin.treatmentDetails.sessionsAttended}</span>
                </div>
                <div className="flex mt-2">
                  <span className="font-medium text-gray-900 w-32">
                    Duration
                  </span>
                  <span>{bulletin.treatmentDetails.treatmentDuration}</span>
                </div>
                <div className="flex mt-2">
                  <span className="font-medium text-gray-900 w-32">Type</span>
                  <span>{bulletin.treatmentDetails.treatmentType}</span>
                </div>
                <div className="flex mt-2">
                  <span className="font-medium text-gray-900 w-32">
                    Severity
                  </span>
                  <span>{bulletin.treatmentDetails.caseSeverity}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <div className="py-4 px-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Financial Information
            </h3>
            <div className="text-sm text-gray-700">
              <div className="flex">
                <span className="font-medium text-gray-900 w-32">
                  Total Amount Paid
                </span>
                <span>
                  ${bulletin.financialInfo.totalAmountPaid.toFixed(2)}{" "}
                  {bulletin.financialInfo.currency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {bulletin.estimation ? (
          <div className="bg-gray-50 rounded-lg border border-gray-200 mb-6">
            <div className="py-4 px-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Reimbursement Estimation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Reimbursement Class
                    </span>
                    <span>{bulletin.estimation.reimbursementClass}</span>
                  </div>
                  <div className="flex mt-2">
                    <span className="font-medium text-gray-900 w-32">
                      Confidence
                    </span>
                    <span>{bulletin.estimation.confidence}</span>
                  </div>
                </div>
                <div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Reimbursement Amount
                    </span>
                    <span>
                      ${bulletin.estimation.reimbursementAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex mt-2">
                    <span className="font-medium text-gray-900 w-32">
                      Model Version
                    </span>
                    <span>{bulletin.estimation.modelVersion}</span>
                  </div>
                  <div className="flex mt-2">
                    <span className="font-medium text-gray-900 w-32">
                      Estimation Date
                    </span>
                    <span>
                      {bulletin.estimation.createdAt
                        ? new Date(
                            bulletin.estimation.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                If you object to this estimation, please contact your insurance
                company at{" "}
                {bulletin.insurer.email && bulletin.insurer.email !== "N/A" ? (
                  <a
                    href={`mailto:${bulletin.insurer.email}`}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    {bulletin.insurer.email}
                  </a>
                ) : (
                  "the provided contact"
                )}
                .
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg border border-gray-200 mb-6">
            <div className="py-4 px-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Reimbursement Estimation
              </h3>
              <p className="text-sm text-gray-600">
                Your insurance company has not yet estimated this medical
                bulletin.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-300"
        >
          Back to Bulletins
        </button>
      </div>
    </div>
  );
}

export default ClientBulletinDetails;
