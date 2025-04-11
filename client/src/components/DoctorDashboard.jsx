import { useState } from 'react';
import { createMedicalBulletin } from '../services/api';

function DoctorDashboard() {
  const [bulletin, setBulletin] = useState({
    clientId: '',
    patientInfo: {
      fullName: '',
      dateOfBirth: '',
      retired: false,
      assuranceCompany: ''
    },
    treatmentDetails: {
      diagnosis: '',
      sessionsAttended: '',
      treatmentDuration: '',
      treatmentType: '',
      caseSeverity: 'Moderate'
    },
    financialInfo: {
      totalAmountPaid: ''
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMedicalBulletin(bulletin);
      setBulletin({
        clientId: '',
        patientInfo: { fullName: '', dateOfBirth: '', retired: false, assuranceCompany: '' },
        treatmentDetails: { diagnosis: '', sessionsAttended: '', treatmentDuration: '', treatmentType: '', caseSeverity: 'Moderate' },
        financialInfo: { totalAmountPaid: '' }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1B4965] text-center mb-6">
          Doctor Dashboard
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#1B4965] mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                  Client ID
                </label>
                <input
                  id="clientId"
                  type="text"
                  placeholder="Enter Client ID"
                  value={bulletin.clientId}
                  onChange={(e) => setBulletin({ ...bulletin, clientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter Full Name"
                  value={bulletin.patientInfo.fullName}
                  onChange={(e) =>
                    setBulletin({
                      ...bulletin,
                      patientInfo: { ...bulletin.patientInfo, fullName: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={bulletin.patientInfo.dateOfBirth}
                  onChange={(e) =>
                    setBulletin({
                      ...bulletin,
                      patientInfo: { ...bulletin.patientInfo, dateOfBirth: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="assuranceCompany" className="block text-sm font-medium text-gray-700 mb-1">
                  Assurance Company
                </label>
                <input
                  id="assuranceCompany"
                  type="text"
                  placeholder="Enter Assurance Company"
                  value={bulletin.patientInfo.assuranceCompany}
                  onChange={(e) =>
                    setBulletin({
                      ...bulletin,
                      patientInfo: { ...bulletin.patientInfo, assuranceCompany: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="retired" className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    id="retired"
                    type="checkbox"
                    checked={bulletin.patientInfo.retired}
                    onChange={(e) =>
                      setBulletin({
                        ...bulletin,
                        patientInfo: { ...bulletin.patientInfo, retired: e.target.checked }
                      })
                    }
                    className="mr-2 h-4 w-4 text-[#1B4965] focus:ring-[#1B4965] border-gray-300 rounded"
                  />
                  Patient is Retired
                </label>
              </div>
            </div>
          </div>

          {/* Treatment Details */}
          <div>
            <h3 className="text-lg font-semibold text-[#1B4965] mb-4">Treatment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis
                </label>
                <input
                  id="diagnosis"
                  type="text"
                  placeholder="Enter Diagnosis"
                  value={bulletin.treatmentDetails.diagnosis}
                  onChange={(e) =>
                    setBulletin({
                      ...bulletin,
                      treatmentDetails: { ...bulletin.treatmentDetails, diagnosis: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="sessionsAttended" className="block text-sm font-medium text-gray-700 mb-1">
                  Sessions Attended
                </label>
                <input
                  id="sessionsAttended"
                  type="number"
                  min="0"
                  placeholder="Enter Sessions Attended"
                  value={bulletin.treatmentDetails.sessionsAttended}
                  onChange={(e) =>
                    setBulletin({
                      ...bulletin,
                      treatmentDetails: { ...bulletin.treatmentDetails, sessionsAttended: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="treatmentDuration" className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Duration
                </label>
                <input
                  id="treatmentDuration"
                  type="text"
                  placeholder="e.g., 6 weeks"
                  value={bulletin.treatmentDetails.treatmentDuration}
                  onChange={(e) =>
                    setBulletin({
                      ...bulletin,
                      treatmentDetails: { ...bulletin.treatmentDetails, treatmentDuration: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="treatmentType" className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Type
                </label>
                <input
                  id="treatmentType"
                  type="text"
                  placeholder="Enter Treatment Type"
                  value={bulletin.treatmentDetails.treatmentType}
                  onChange={(e) =>
                    setBulletin({
                      ...bulletin,
                      treatmentDetails: { ...bulletin.treatmentDetails, treatmentType: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="caseSeverity" className="block text-sm font-medium text-gray-700 mb-1">
                  Case Severity
                </label>
                <select
                  id="caseSeverity"
                  value={bulletin.treatmentDetails.caseSeverity}
                  onChange={(e) =>
                    setBulletin({
                      ...bulletin,
                      treatmentDetails: { ...bulletin.treatmentDetails, caseSeverity: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div>
            <h3 className="text-lg font-semibold text-[#1B4965] mb-4">Financial Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="totalAmountPaid" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount Paid
                </label>
                <input
                  id="totalAmountPaid"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter Total Amount Paid"
                  value={bulletin.financialInfo.totalAmountPaid}
                  onChange={(e) =>
                    setBulletin({
                      ...bulletin,
                      financialInfo: { ...bulletin.financialInfo, totalAmountPaid: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-[#1B4965] hover:bg-[#2A5A7A] text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#1B4965] focus:ring-offset-2 transition duration-200"
            >
              Create Medical Bulletin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DoctorDashboard;