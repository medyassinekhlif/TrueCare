import { useState } from "react";
import PropTypes from "prop-types";
import { addClient } from "../services/api";
import { Toaster, toast } from "sonner";
import { FaFingerprint } from "react-icons/fa";
import { FaCheckDouble } from "react-icons/fa6";

function AddClientForm({ fetchDashboard, setError }) {
  const [newClient, setNewClient] = useState({
    email: "",
    password: "",
    name: "",
    birthDate: "",
    nationalId: "",
    job: "",
    phoneNumber: "",
    image: null,
    health: {
      conditions: "",
      smoker: false,
      exercise: "Sometimes",
    },
    plan: { range: { min: 50, max: 70 } },
  });
  const [dragging, setDragging] = useState(false);

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789=-+_@$!%*?&";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewClient({ ...newClient, password });
  };

  const handlePlanChange = (field, value) => {
    setNewClient({
      ...newClient,
      plan: {
        ...newClient.plan,
        range: {
          ...newClient.plan.range,
          [field]: Math.max(0, Math.min(100, Number(value))),
        },
      },
    });
  };

  const handleHealthChange = (field, value) => {
    setNewClient({
      ...newClient,
      health: {
        ...newClient.health,
        [field]: value,
      },
    });
  };

  const handleFileInput = (e) => {
    const file = e.target.files ? e.target.files[0] : e.dataTransfer.files[0];
    if (!file) {
      setNewClient({ ...newClient, image: null });
      toast.error("No file selected. Please choose a JPEG or PNG image.");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Image must be JPEG or PNG.");
      toast.error("Image must be JPEG or PNG.");
      setNewClient({ ...newClient, image: null });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      toast.error("Image size must be less than 5MB.");
      setNewClient({ ...newClient, image: null });
      return;
    }
    setNewClient({ ...newClient, image: file });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileInput(e);
  };

  const validateForm = () => {
    if (
      !newClient.email ||
      !newClient.password ||
      !newClient.name ||
      !newClient.birthDate ||
      !newClient.nationalId ||
      !newClient.job ||
      !newClient.phoneNumber ||
      !newClient.image
    ) {
      return "Please fill in all required fields.";
    }
    if (!/^\d{8}$/.test(newClient.nationalId)) {
      return "National ID must be exactly 8 digits.";
    }
    if (!/^\d{8}$/.test(newClient.phoneNumber)) {
      return "Phone number must be exactly 8 digits.";
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newClient.password)) {
      return "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }
    if (
      newClient.plan.range &&
      newClient.plan.range.min > newClient.plan.range.max
    ) {
      return "Minimum range cannot exceed maximum.";
    }
    if (!(newClient.image instanceof File)) {
      return "Invalid image file. Please select a valid JPEG or PNG image.";
    }
    return null;
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setError(error);
      toast.error(error);
      return;
    }
    try {
      const data = new FormData();
      data.append("email", newClient.email);
      data.append("password", newClient.password);
      data.append("name", newClient.name);
      data.append("birthDate", newClient.birthDate);
      data.append("nationalId", newClient.nationalId);
      data.append("job", newClient.job);
      data.append("phoneNumber", newClient.phoneNumber);
      data.append("image", newClient.image);
      data.append("health", JSON.stringify(newClient.health));
      data.append("plan", JSON.stringify(newClient.plan));

      console.log("FormData entries:");
      for (let [key, value] of data.entries()) {
        console.log(key, value);
      }

      const response = await addClient(data);
      console.log("addClient response:", response.data);

      setNewClient({
        email: "",
        password: "",
        name: "",
        birthDate: "",
        nationalId: "",
        job: "",
        phoneNumber: "",
        image: null,
        health: {
          conditions: "",
          smoker: false,
          exercise: "Sometimes",
        },
        plan: { range: { min: 50, max: 70 } },
      });
      toast.success("Client added successfully");
      fetchDashboard();
    } catch (error) {
      console.error("Error adding client:", error.message, error.stack);
      console.log("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to add client. Please try again.";
      if (errorMessage) {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const renderFileInput = () => (
    <div
      className={`relative w-full px-4 py-2 border rounded-lg ${
        dragging ? "border-blue-500 bg-gray-50" : "border-gray-300"
      } flex items-center`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        name="image"
        accept="image/jpeg,image/png"
        onChange={handleFileInput}
        className="opacity-0 absolute w-full h-full cursor-pointer"
        required
      />
      <span className="text-gray-600 truncate">
        {newClient.image ? newClient.image.name : "Profile Image"}
      </span>
      {newClient.image && <FaCheckDouble className="w-5 h-5 text-green-800 ml-auto" />}
    </div>
  );

  return (
    <div className="mb-8">
      <Toaster richColors position="top-right" />
      <form
        onSubmit={handleAddClient}
        className="space-y-3 my-5 p-1"
        encType="multipart/form-data"
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="email"
            placeholder="Email"
            value={newClient.email}
            onChange={(e) =>
              setNewClient({ ...newClient, email: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="relative">
            <input
              type="text"
              placeholder="Password"
              value={newClient.password}
              onChange={(e) =>
                setNewClient({ ...newClient, password: e.target.value })
              }
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <FaFingerprint
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600 cursor-pointer"
              onClick={generatePassword}
            />
          </div>
          <input
            type="text"
            placeholder="Name"
            value={newClient.name}
            onChange={(e) =>
              setNewClient({ ...newClient, name: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="date"
            placeholder="Date of Birth"
            value={newClient.birthDate}
            onChange={(e) =>
              setNewClient({ ...newClient, birthDate: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="National ID (8 digits)"
            value={newClient.nationalId}
            onChange={(e) =>
              setNewClient({ ...newClient, nationalId: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={8}
            pattern="\d{8}"
            title="National ID must be exactly 8 digits"
          />
          <input
            type="text"
            placeholder="Job"
            value={newClient.job}
            onChange={(e) =>
              setNewClient({ ...newClient, job: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number (8 digits)"
            value={newClient.phoneNumber}
            onChange={(e) =>
              setNewClient({ ...newClient, phoneNumber: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={8}
            pattern="\d{8}"
            title="Phone number must be exactly 8 digits"
          />
          <div className="sm:col-span-2">{renderFileInput()}</div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">
              Health Conditions
            </label>
            <textarea
              placeholder="Enter Health Conditions"
              value={newClient.health.conditions}
              onChange={(e) => handleHealthChange("conditions", e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={newClient.health.smoker}
                onChange={(e) => handleHealthChange("smoker", e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              Smoker
            </label>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Exercise Frequency
            </label>
            <div className="flex space-x-4">
              {["Often", "Sometimes", "Never"].map((option) => (
                <label
                  key={option}
                  className="flex items-center text-sm text-gray-600"
                >
                  <input
                    type="radio"
                    name="exercise"
                    value={option}
                    checked={newClient.health.exercise === option}
                    onChange={(e) =>
                      handleHealthChange("exercise", e.target.value)
                    }
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    required
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Plan Min Range (%)
            </label>
            <input
              type="number"
              value={newClient.plan.range.min}
              onChange={(e) => handlePlanChange("min", e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Plan Max Range (%)
            </label>
            <input
              type="number"
              value={newClient.plan.range.max}
              onChange={(e) => handlePlanChange("max", e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            className="my-4 bg-indigo-100 px-3 py-1 m-1 border border-gray-300 font-semibold text-indigo-800 rounded-md hover:bg-indigo-200 transition duration-200"
          >
            Add Client
          </button>
        </div>
      </form>
    </div>
  );
}

AddClientForm.propTypes = {
  fetchDashboard: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

export default AddClientForm;