import PropTypes from "prop-types";

function EditClientForm({ formData, setFormData, handleUpdate, setEditMode }) {
  const handleHealthChange = (field, value) => {
    setFormData({
      ...formData,
      health: {
        ...formData.health,
        [field]: value,
      },
    });
  };

  const handlePlanChange = (field, value) => {
    setFormData({
      ...formData,
      plan: {
        ...formData.plan,
        range: {
          ...formData.plan.range,
          [field]: Math.max(0, Math.min(100, Number(value))),
        },
      },
    });
  };

  return (
    <form
      onSubmit={handleUpdate}
      className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            placeholder="Enter Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) =>
              setFormData({ ...formData, birthDate: e.target.value })
            }
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Job</label>
          <input
            type="text"
            placeholder="Enter Job"
            value={formData.job}
            onChange={(e) => setFormData({ ...formData, job: e.target.value })}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Health Conditions
          </label>
          <textarea
            placeholder="Enter Health Conditions"
            value={formData.health.conditions}
            onChange={(e) => handleHealthChange("conditions", e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={formData.health.smoker}
              onChange={(e) => handleHealthChange("smoker", e.target.checked)}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-gray-200 rounded"
            />
            Smoker
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Exercise Frequency
          </label>
          <div className="flex space-x-4 mt-2">
            {["Often", "Sometimes", "Never"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="exercise"
                  value={option}
                  checked={formData.health.exercise === option}
                  onChange={(e) =>
                    handleHealthChange("exercise", e.target.value)
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-gray-200"
                  required
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Plan Min Range (%)
          </label>
          <input
            type="number"
            value={formData.plan.range.min}
            onChange={(e) => handlePlanChange("min", e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            min="0"
            max="100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Plan Max Range (%)
          </label>
          <input
            type="number"
            value={formData.plan.range.max}
            onChange={(e) => handlePlanChange("max", e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            min="0"
            max="100"
            required
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <button
          type="submit"
          className="px-3 py-1 border border-gray-300 font-semibold text-indigo-800 rounded-md hover:bg-indigo-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditMode(false)}
          className="px-3 py-1 bg-gray-200 border border-gray-300 font-semibold text-black rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

EditClientForm.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    birthDate: PropTypes.string.isRequired,
    nationalId: PropTypes.string.isRequired,
    job: PropTypes.string.isRequired,
    health: PropTypes.shape({
      conditions: PropTypes.string,
      smoker: PropTypes.bool.isRequired,
      exercise: PropTypes.oneOf(["Often", "Sometimes", "Never"]).isRequired,
    }).isRequired,
    plan: PropTypes.shape({
      range: PropTypes.shape({
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  setEditMode: PropTypes.func.isRequired,
};

export default EditClientForm;