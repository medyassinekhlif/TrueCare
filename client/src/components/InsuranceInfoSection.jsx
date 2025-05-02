import { useState } from "react";
import PropTypes from "prop-types";
import { FaInfo, FaRegEdit } from "react-icons/fa";

const InsuranceInfoSection = ({
  companyName,
  email,
  phoneNumber,
  address,
  website,
  plans,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    companyName,
    email,
    phoneNumber,
    address,
    website,
  });
  const [editPlans, setEditPlans] = useState(plans);
  const [isAboutCollapsed, setIsAboutCollapsed] = useState(false); // Changed to false to open by default
  const [isPlansCollapsed, setIsPlansCollapsed] = useState(true);
  const [editingPlanIndex, setEditingPlanIndex] = useState(null);
  const [urlError, setUrlError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "website") {
      setUrlError("");
      let formattedValue = value;
      if (value && !/^https?:\/\//i.test(value)) {
        formattedValue = `https://${value}`;
      }
      setEditForm((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePlanChange = (index, field, value) => {
    const updatedPlans = [...editPlans];
    if (field.includes("range")) {
      const [rangeField] = field.split(".");
      updatedPlans[index] = {
        ...updatedPlans[index],
        range: {
          ...updatedPlans[index].range,
          [rangeField]: parseFloat(value) || 0,
        },
      };
    } else {
      updatedPlans[index] = {
        ...updatedPlans[index],
        [field]: parseFloat(value) || 0,
      };
    }
    setEditPlans(updatedPlans);
  };

  const handlePlanSave = () => {
    onUpdate({ ...editForm, plans: editPlans });
    setEditingPlanIndex(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlPattern =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (editForm.website && !urlPattern.test(editForm.website)) {
      setUrlError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }
    onUpdate({ ...editForm, plans: editPlans });
    setIsEditing(false);
    setUrlError("");
  };

  const handleCancel = () => {
    setEditForm({ companyName, email, phoneNumber, address, website });
    setEditPlans(plans);
    setIsEditing(false);
    setUrlError("");
  };

  return (
    <div className="mb-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center py-4 px-6">
          <h2 className="text-xl font-semibold text-gray-800">About</h2>
          <button
            onClick={() => setIsAboutCollapsed(!isAboutCollapsed)}
            className="text-indigo-950 hover:text-indigo-900 hover:rotate-12 transform transition-transform duration-300 m-2"
            title={
              isAboutCollapsed ? "Show About Details" : "Hide About Details"
            }
            aria-label={
              isAboutCollapsed ? "Show About Details" : "Hide About Details"
            }
          >
            <FaInfo className="w-5 h-5" />
          </button>
        </div>
        {!isAboutCollapsed && (
          <div className="py-4 px-6 border-t border-gray-200">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Company Name",
                      name: "companyName",
                      type: "text",
                    },
                    { label: "Email", name: "email", type: "email" },
                    { label: "Phone Number", name: "phoneNumber", type: "tel" },
                    { label: "Address", name: "address", type: "text" },
                    { label: "Website", name: "website", type: "url" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={editForm[field.name]}
                        onChange={handleInputChange}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                      {field.name === "website" && urlError && (
                        <p className="text-red-500 text-sm mt-1">{urlError}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="submit"
                    className="px-3 py-1 m-1 border border-gray-300 font-semibold text-indigo-800 rounded-md hover:bg-indigo-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 py-1 m-1 bg-gray-200 border border-gray-300 font-semibold text-black rounded-md hover:bg-gray-300"
                    title="Cancel"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Email
                    </span>
                    <span>{email || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Phone
                    </span>
                    <span>{phoneNumber || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Address
                    </span>
                    <span>{address || "N/A"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-900 w-32">
                      Website
                    </span>
                    <span>
                      {website ? (
                        <a
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          {website}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-indigo-950 hover:text-indigo-900 hover:rotate-12 transform transition-transform duration-300 m-2"
                    title="Edit About"
                    aria-label="Edit About"
                  >
                    <FaRegEdit className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center py-4 px-6">
          <h2 className="text-xl font-semibold text-gray-800">Plans</h2>
          <button
            onClick={() => setIsPlansCollapsed(!isPlansCollapsed)}
            className="text-indigo-950 hover:text-indigo-900 hover:rotate-12 transform transition-transform duration-300 m-2"
            title={isPlansCollapsed ? "Show Plans" : "Hide Plans"}
            aria-label={isPlansCollapsed ? "Show Plans" : "Hide Plans"}
          >
            <FaInfo className="w-5 h-5" />
          </button>
        </div>
        {!isPlansCollapsed && (
          <div className="py-4 px-6 border-t border-gray-200">
            {editPlans.length === 0 ? (
              <p className="text-sm text-gray-600">No plans available.</p>
            ) : (
              <div className="space-y-4">
                {editPlans.map((plan, index) => (
                  <div key={plan.id || index}>
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">
                        Plan {index + 1}
                      </h4>
                      {editingPlanIndex !== index && (
                        <button
                          onClick={() => setEditingPlanIndex(index)}
                          className="text-indigo-950 hover:text-indigo-900 hover:rotate-12 transform transition-transform duration-300 m-2"
                          title="Edit Plan"
                          aria-label="Edit Plan"
                        >
                          <FaRegEdit className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                      {editingPlanIndex === index ? (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Range Min (%)
                            </label>
                            <input
                              type="number"
                              value={plan.range.min}
                              onChange={(e) =>
                                handlePlanChange(
                                  index,
                                  "range.min",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Range Max (%)
                            </label>
                            <input
                              type="number"
                              value={plan.range.max}
                              onChange={(e) =>
                                handlePlanChange(
                                  index,
                                  "range.max",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Max Coverage ($)
                            </label>
                            <input
                              type="number"
                              value={plan.maxCoverage}
                              onChange={(e) =>
                                handlePlanChange(
                                  index,
                                  "maxCoverage",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={() => handlePlanSave()}
                              className="px-3 py-1 m-1 border border-gray-300 font-semibold text-indigo-800 rounded-md hover:bg-indigo-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditPlans(plans);
                                setEditingPlanIndex(null);
                              }}
                              className="px-3 py-1 m-1 bg-gray-200 border border-gray-300 font-semibold text-black rounded-md hover:bg-gray-300"
                              title="Cancel"
                              aria-label="Cancel"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                          <div className="flex">
                            <span className="font-medium text-gray-900 w-32">
                              Range
                            </span>
                            <span>
                              {plan.range
                                ? `${plan.range.min}% - ${plan.range.max}%`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="font-medium text-gray-900 w-32">
                              Max Coverage
                            </span>
                            <span>
                              {plan.maxCoverage
                                ? `$${plan.maxCoverage.toLocaleString()}`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

InsuranceInfoSection.propTypes = {
  companyName: PropTypes.string.isRequired,
  email: PropTypes.string,
  phoneNumber: PropTypes.string,
  address: PropTypes.string,
  website: PropTypes.string,
  plans: PropTypes.arrayOf(
    PropTypes.shape({
      range: PropTypes.shape({
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
      }).isRequired,
      maxCoverage: PropTypes.number.isRequired,
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default InsuranceInfoSection;