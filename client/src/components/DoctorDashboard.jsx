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
    <div className="dashboard">
      <h2>Doctor Dashboard</h2>
      <form onSubmit={handleSubmit}>
        <h3>Patient Information</h3>
        <input
          placeholder="Client ID"
          value={bulletin.clientId}
          onChange={(e) => setBulletin({ ...bulletin, clientId: e.target.value })}
        />
        <input
          placeholder="Full Name"
          value={bulletin.patientInfo.fullName}
          onChange={(e) => setBulletin({
            ...bulletin,
            patientInfo: { ...bulletin.patientInfo, fullName: e.target.value }
          })}
        />
        <input
          type="date"
          value={bulletin.patientInfo.dateOfBirth}
          onChange={(e) => setBulletin({
            ...bulletin,
            patientInfo: { ...bulletin.patientInfo, dateOfBirth: e.target.value }
          })}
        />
        <input
          placeholder="Assurance Company"
          value={bulletin.patientInfo.assuranceCompany}
          onChange={(e) => setBulletin({
            ...bulletin,
            patientInfo: { ...bulletin.patientInfo, assuranceCompany: e.target.value }
          })}
        />

        <h3>Treatment Details</h3>
        <input
          placeholder="Diagnosis"
          value={bulletin.treatmentDetails.diagnosis}
          onChange={(e) => setBulletin({
            ...bulletin,
            treatmentDetails: { ...bulletin.treatmentDetails, diagnosis: e.target.value }
          })}
        />
        <input
          type="number"
          placeholder="Sessions Attended"
          value={bulletin.treatmentDetails.sessionsAttended}
          onChange={(e) => setBulletin({
            ...bulletin,
            treatmentDetails: { ...bulletin.treatmentDetails, sessionsAttended: e.target.value }
          })}
        />
        <input
          placeholder="Treatment Duration"
          value={bulletin.treatmentDetails.treatmentDuration}
          onChange={(e) => setBulletin({
            ...bulletin,
            treatmentDetails: { ...bulletin.treatmentDetails, treatmentDuration: e.target.value }
          })}
        />
        <input
          placeholder="Treatment Type"
          value={bulletin.treatmentDetails.treatmentType}
          onChange={(e) => setBulletin({
            ...bulletin,
            treatmentDetails: { ...bulletin.treatmentDetails, treatmentType: e.target.value }
          })}
        />
        <select
          value={bulletin.treatmentDetails.caseSeverity}
          onChange={(e) => setBulletin({
            ...bulletin,
            treatmentDetails: { ...bulletin.treatmentDetails, caseSeverity: e.target.value }
          })}
        >
          <option value="Mild">Mild</option>
          <option value="Moderate">Moderate</option>
          <option value="Severe">Severe</option>
        </select>

        <h3>Financial Info</h3>
        <input
          type="number"
          placeholder="Total Amount Paid"
          value={bulletin.financialInfo.totalAmountPaid}
          onChange={(e) => setBulletin({
            ...bulletin,
            financialInfo: { ...bulletin.financialInfo, totalAmountPaid: e.target.value }
          })}
        />

        <button type="submit">Create Medical Bulletin</button>
      </form>
    </div>
  );
}

export default DoctorDashboard;