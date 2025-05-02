import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMedicalBulletin, estimateReimbursement, getEstimationByBulletin } from '../services/api';
import Loading from '../components/Loading';
import { Toaster, toast } from 'sonner';

function MedicalBulletinDetails() {
  const { medicalBulletinId } = useParams();
  const navigate = useNavigate();
  const [bulletin, setBulletin] = useState(null);
  const [estimation, setEstimation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingEstimation, setLoadingEstimation] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: bulletinData } = await getMedicalBulletin(medicalBulletinId);
      setBulletin(bulletinData);

      const { data: estimationData } = await getEstimationByBulletin(medicalBulletinId);
      setEstimation(estimationData.estimation || null);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load data. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [medicalBulletinId]);

  const handleEstimate = async () => {
    if (!bulletin || !bulletin.clientId) {
      toast.error('Cannot estimate: Bulletin data not loaded');
      return;
    }

    setLoadingEstimation(true);
    try {
      const { data } = await estimateReimbursement({
        clientId: bulletin.clientId,
        medicalBulletinId,
      });
      setEstimation(data.estimation);
      toast.success('Reimbursement estimated successfully');
    } catch (error) {
      console.error('Error estimating reimbursement:', error);
      const errorMessage = error.response?.data?.message || 'Failed to estimate reimbursement.';
      toast.error(errorMessage);
    } finally {
      setLoadingEstimation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <Toaster richColors position="top-right" />
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
                onClick={() => navigate(-1)}
                className="px-3 py-1 bg-gray-200 border border-gray-300 font-semibold text-black rounded-md hover:bg-gray-300"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <Loading />
        ) : bulletin ? (
          <>
            <button
              onClick={() => navigate(-1)}
              className="mb-6 px-3 py-1 bg-gray-200 border border-gray-300 font-semibold text-black rounded-md hover:bg-gray-300"
            >
              Back
            </button>

            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
              Medical Bulletin Details
            </h2>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">Client Name:</span>
                  <span>{bulletin.clientName || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">Diagnosis:</span>
                  <span>{bulletin.treatmentDetails?.diagnosis || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">Sessions Attended:</span>
                  <span>{bulletin.treatmentDetails?.sessionsAttended || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">Treatment Duration:</span>
                  <span>{bulletin.treatmentDetails?.treatmentDuration || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">Treatment Type:</span>
                  <span>{bulletin.treatmentDetails?.treatmentType || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">Case Severity:</span>
                  <span>{bulletin.treatmentDetails?.caseSeverity || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">Total Amount Paid:</span>
                  <span>${bulletin.financialInfo?.totalAmountPaid?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-900 w-32">Created At:</span>
                  <span>{bulletin.createdAt ? new Date(bulletin.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
              </div>

              {estimation ? (
                <div className="mt-6 p-4 bg-gray-100 border rounded-lg">
                  <h3 className="text-lg font-semibold text-green-700 mb-2">Reimbursement Estimation</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex">
                      <span className="font-medium text-gray-900 w-32">Reimbursement Amount:</span>
                      <span>${estimation.reimbursementAmount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-900 w-32">Reimbursement Class:</span>
                      <span>{estimation.reimbursementClass || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-900 w-32">Confidence:</span>
                      <span>{(estimation.confidence * 100)?.toFixed(2) || '0.00'}%</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-900 w-32">Model Version:</span>
                      <span>{estimation.modelVersion || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <button
                    onClick={handleEstimate}
                    disabled={loadingEstimation || !bulletin}
                    className={`px-3 py-1 border border-gray-300 font-semibold text-indigo-800 rounded-md ${
                      loadingEstimation || !bulletin ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50'
                    }`}
                  >
                    {loadingEstimation ? 'Estimating...' : 'Estimate Reimbursement'}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default MedicalBulletinDetails;