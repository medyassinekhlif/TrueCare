import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { createMedicalBulletin } from "../services/api";
import PropTypes from "prop-types";

function CountdownToast({ onUndo, initialSeconds }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between gap-2 w-full bg-gray-100 border border-gray-300 text-gray-800 rounded-lg p-3">
      <p className="text-sm">
        Bulletin will be submitted in{" "}
        <span className="font-semibold">{seconds}</span> seconds. Click undo to
        cancel.
      </p>
      <button
        onClick={onUndo}
        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors whitespace-nowrap"
      >
        Undo
      </button>
    </div>
  );
}

CountdownToast.propTypes = {
  onUndo: PropTypes.func.isRequired,
  initialSeconds: PropTypes.number.isRequired,
};

function AddMedicalBulletin() {
  const [bulletin, setBulletin] = useState({
    clientEmail: "",
    treatmentDetails: {
      diagnosis: "",
      sessionsAttended: "",
      treatmentDuration: "",
      treatmentType: "",
      caseSeverity: "0",
    },
    financialInfo: {
      totalAmountPaid: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const severityOptions = [
    { value: "0", label: "Mild (0)" },
    { value: "1", label: "Moderate (1)" },
    { value: "2", label: "Severe (2)" },
    { value: "3", label: "Very Severe (3)" },
    { value: "4", label: "Critical (4)" },
    { value: "5", label: "Extreme (5)" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedBulletin = {
      ...bulletin,
      treatmentDetails: {
        ...bulletin.treatmentDetails,
        sessionsAttended: Number(bulletin.treatmentDetails.sessionsAttended),
        caseSeverity: Number(bulletin.treatmentDetails.caseSeverity),
      },
      financialInfo: {
        ...bulletin.financialInfo,
        totalAmountPaid: Number(bulletin.financialInfo.totalAmountPaid),
      },
    };

    const toastId = toast.custom(
      () => (
        <CountdownToast
          initialSeconds={10}
          onUndo={() => {
            toast.dismiss(toastId);
            toast.info("Submission canceled.", { duration: 3000 });
            setIsSubmitting(false);
          }}
        />
      ),
      {
        duration: 10000,
        position: "bottom-left",
        onAutoClose: () => {
          const loadingToastId = toast.loading("Submitting bulletin...");
          createMedicalBulletin(formattedBulletin)
            .then(() => {
              toast.success("Medical bulletin created successfully!", {
                id: loadingToastId,
              });
              setBulletin({
                clientEmail: "",
                treatmentDetails: {
                  diagnosis: "",
                  sessionsAttended: "",
                  treatmentDuration: "",
                  treatmentType: "",
                  caseSeverity: "0",
                },
                financialInfo: { totalAmountPaid: "" },
              });
            })
            .finally(() => setIsSubmitting(false));
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-200 px-16 py-8 sm:px-18 lg:px-20">
      <Toaster richColors position="top-right" />
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-100 rounded-lg p-6 mx-4 border border-gray-300 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Client Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="clientEmail"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Client Email
                  </label>
                  <input
                    id="clientEmail"
                    type="email"
                    placeholder="Enter Client Email"
                    value={bulletin.clientEmail}
                    onChange={(e) =>
                      setBulletin({ ...bulletin, clientEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                    required
                    aria-required="true"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Treatment Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="diagnosis"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                        treatmentDetails: {
                          ...bulletin.treatmentDetails,
                          diagnosis: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label
                    htmlFor="sessionsAttended"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                        treatmentDetails: {
                          ...bulletin.treatmentDetails,
                          sessionsAttended: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label
                    htmlFor="treatmentDuration"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                        treatmentDetails: {
                          ...bulletin.treatmentDetails,
                          treatmentDuration: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label
                    htmlFor="treatmentType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                        treatmentDetails: {
                          ...bulletin.treatmentDetails,
                          treatmentType: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                    required
                    aria-required="true"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Severity
                  </label>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {severityOptions.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          id={`severity-${option.value}`}
                          name="caseSeverity"
                          value={option.value}
                          checked={
                            bulletin.treatmentDetails.caseSeverity ===
                            option.value
                          }
                          onChange={(e) =>
                            setBulletin({
                              ...bulletin,
                              treatmentDetails: {
                                ...bulletin.treatmentDetails,
                                caseSeverity: e.target.value,
                              },
                            })
                          }
                          className="h-4 w-4 text-gray-600 focus:ring-gray-400 border-gray-300"
                          required
                          aria-required="true"
                        />
                        <label
                          htmlFor={`severity-${option.value}`}
                          className="ml-2 text-sm text-gray-600"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Financial Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="totalAmountPaid"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
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
                        financialInfo: {
                          ...bulletin.financialInfo,
                          totalAmountPaid: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                    required
                    aria-required="true"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-3 bg-gray-200 text-black rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-300"
                }`}
                aria-label="Create medical bulletin"
              >
                {isSubmitting ? "Submitting..." : "Create Medical Bulletin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddMedicalBulletin;
