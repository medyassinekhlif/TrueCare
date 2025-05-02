import PropTypes from "prop-types";
import { toast } from "sonner";

function EditDoctorProfile({
  isOpen,
  onClose,
  editProfile,
  setEditProfile,
  onSubmit,
  validateEditProfile,
}) {
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditProfile()) return;
    try {
      await onSubmit(e);
      toast.success("Profile updated successfully!", { duration: 3000 });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage, { duration: 3000 });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-gray-100 rounded-lg p-6 w-full max-w-lg border border-gray-300"
        role="dialog"
        aria-labelledby="edit-profile-title"
        aria-modal="true"
      >
        <h2
          id="edit-profile-title"
          className="text-2xl text-gray-900 mb-6"
        >
          Edit Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="text"
                placeholder="Enter Phone Number"
                value={editProfile.phoneNumber}
                onChange={(e) =>
                  setEditProfile({
                    ...editProfile,
                    phoneNumber: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-required="false"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter New Password"
                value={editProfile.password}
                onChange={(e) =>
                  setEditProfile({
                    ...editProfile,
                    password: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-required="false"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm New Password"
                value={editProfile.confirmPassword}
                onChange={(e) =>
                  setEditProfile({
                    ...editProfile,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-required="false"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Cancel profile edit"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-50 border hover:bg-indigo-100 text-indigo-800 rounded-lg font-medium flex items-center justify-center space-x-2 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Save profile changes"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditDoctorProfile.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  editProfile: PropTypes.shape({
    phoneNumber: PropTypes.string,
    password: PropTypes.string,
    confirmPassword: PropTypes.string,
  }).isRequired,
  setEditProfile: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  validateEditProfile: PropTypes.func.isRequired,
};

export default EditDoctorProfile;