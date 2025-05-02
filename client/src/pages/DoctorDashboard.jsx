import { useState, useEffect } from "react"; 
import { Toaster, toast } from "sonner";
import { getDoctorProfile, updateDoctorProfile } from "../services/api";
import BulletinHistory from "../components/BulletinHistory";
import EditDoctorProfile from "../components/EditDoctorProfile";
import { FaCogs } from "react-icons/fa";

function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [editProfile, setEditProfile] = useState({
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchDoctorProfile = async () => {
    try {
      const response = await getDoctorProfile();
      setDoctor(response.data.doctor);
      setEditProfile((prev) => ({
        ...prev,
        phoneNumber: response.data.doctor.phoneNumber,
      }));
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      toast.error("Failed to load doctor profile.", { duration: 3000 });
    }
  };

  const validateEditProfile = () => {
    if (!editProfile.phoneNumber && !editProfile.password) {
      toast.error("Please provide at least a phone number or password.");
      return false;
    }
    if (
      editProfile.password &&
      editProfile.password !== editProfile.confirmPassword
    ) {
      toast.error("Passwords do not match.");
      return false;
    }
    const phoneRegex = /^\+?\d{10,15}$/;
    if (editProfile.phoneNumber && !phoneRegex.test(editProfile.phoneNumber)) {
      toast.error("Please enter a valid phone number (10-15 digits).");
      return false;
    }
    return true;
  };

  const handleEditProfileSubmit = async () => {
    const updateData = {};
    if (editProfile.phoneNumber)
      updateData.phoneNumber = editProfile.phoneNumber;
    if (editProfile.password) updateData.password = editProfile.password;

    try {
      await updateDoctorProfile(updateData);
      setShowEditModal(false);
      fetchDoctorProfile();
      toast.success("Profile updated successfully.", { duration: 3000 });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.", { duration: 3000 });
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 px-4 py-8 sm:px-6 lg:px-8">
      <Toaster richColors position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-100 rounded-xl p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between border border-gray-300">
          <div className="flex items-center mb-4 sm:mb-0">
            {doctor?.image ? (
              <img
                src={doctor.image}
                alt="Doctor Profile"
                className="w-24 h-24 rounded-full object-cover mr-4"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                <span className="text-gray-600 text-xl">
                  {doctor?.fullName?.charAt(0) || "D"}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {doctor?.fullName || "Loading..."}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {doctor?.specialty || ""}
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-3 text-indigo-800 rounded-full hover:rotate-12 transform transition-transform duration-300"
              title="Edit Profile"
              aria-label="Edit Profile"
            >
              <FaCogs className="w-10 h-10" />
            </button>
          </div>
        </div>
        <EditDoctorProfile
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          editProfile={editProfile}
          setEditProfile={setEditProfile}
          onSubmit={handleEditProfileSubmit}
          validateEditProfile={validateEditProfile}
        />

        <BulletinHistory />
      </div>
    </div>
  );
}

export default DoctorDashboard;
