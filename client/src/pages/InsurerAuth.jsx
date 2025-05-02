import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { insurerLogin, insurerSignup } from "../services/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import slide1 from "../assets/6.png";
import slide2 from "../assets/4.png";
import logo from "../assets/logo.png";
import { IoCheckmarkDone, IoArrowBack } from "react-icons/io5";
import { Toaster, toast } from "sonner";

function InsurerAuth() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
    taxId: "",
    address: "",
    website: "",
    phoneNumber: "",
    plans: [
      { range: { min: 50, max: 70 }, maxCoverage: 50000 },
      { range: { min: 70, max: 85 }, maxCoverage: 100000 },
      { range: { min: 85, max: 95 }, maxCoverage: 200000 },
    ],
    businessRegistration: null,
    insuranceLicense: null,
    photoId: null,
    authorizationLetter: null,
    image: null,
  });
  const [dragging, setDragging] = useState({});
  const navigate = useNavigate();

  const handleFileChange = (e, name) => {
    const file = e.target.files ? e.target.files[0] : e.dataTransfer.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }
    if (
      file &&
      !["image/jpeg", "image/png", "application/pdf"].includes(file.type)
    ) {
      toast.error("File must be JPEG, PNG, or PDF.");
      return;
    }
    setFormData({ ...formData, [name]: file });
  };

  const handleDragOver = (e, name) => {
    e.preventDefault();
    setDragging({ ...dragging, [name]: true });
  };

  const handleDragLeave = (e, name) => {
    e.preventDefault();
    setDragging({ ...dragging, [name]: false });
  };

  const handleDrop = (e, name) => {
    e.preventDefault();
    setDragging({ ...dragging, [name]: false });
    handleFileChange(e, name);
  };

  const handlePlanChange = (index, field, value) => {
    const updatedPlans = [...formData.plans];
    if (field === "min" || field === "max") {
      updatedPlans[index].range[field] = Math.max(
        0,
        Math.min(100, Number(value))
      );
    } else if (field === "maxCoverage") {
      updatedPlans[index].maxCoverage = Math.max(0, Number(value));
    }
    setFormData({ ...formData, plans: updatedPlans });
  };

  const validatePlans = () => {
    for (const plan of formData.plans) {
      if (plan.range.min > plan.range.max) {
        return "Minimum range cannot exceed maximum.";
      }
      if (plan.range.min < 0 || plan.range.max > 100) {
        return "Range must be between 0 and 100.";
      }
      if (plan.maxCoverage < 0) {
        return "Max coverage cannot be negative.";
      }
    }
    return null;
  };

  const validateForm = () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.companyName ||
      !formData.taxId ||
      !formData.address ||
      !formData.phoneNumber ||
      !formData.businessRegistration ||
      !formData.insuranceLicense ||
      !formData.photoId ||
      !formData.authorizationLetter ||
      !formData.image
    ) {
      return "All fields and files are required.";
    }
    if (!/^\d{8}$/.test(formData.phoneNumber)) {
      return "Phone number must be exactly 8 digits.";
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        formData.password
      )
    ) {
      return "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        const planError = validatePlans();
        if (planError) {
          toast.error(planError);
          return;
        }
        const formError = validateForm();
        if (formError) {
          toast.error(formError);
          return;
        }
        const data = new FormData();
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("companyName", formData.companyName);
        data.append("taxId", formData.taxId);
        data.append("address", formData.address);
        data.append("website", formData.website);
        data.append("phoneNumber", formData.phoneNumber);
        data.append("plans", JSON.stringify(formData.plans));
        data.append("businessRegistration", formData.businessRegistration);
        data.append("insuranceLicense", formData.insuranceLicense);
        data.append("photoId", formData.photoId);
        data.append("authorizationLetter", formData.authorizationLetter);
        data.append("image", formData.image);

        for (let [key, value] of data.entries()) {
          console.log(key, value);
        }
        await insurerSignup(data);
        toast.success("Account created successfully! Please log in.");
        setIsSignup(false);
        setFormData({
          email: "",
          password: "",
          companyName: "",
          taxId: "",
          address: "",
          website: "",
          phoneNumber: "",
          plans: [
            { range: { min: 50, max: 70 }, maxCoverage: 50000 },
            { range: { min: 70, max: 85 }, maxCoverage: 100000 },
            { range: { min: 85, max: 95 }, maxCoverage: 200000 },
          ],
          businessRegistration: null,
          insuranceLicense: null,
          photoId: null,
          authorizationLetter: null,
          image: null,
        });
      } else {
        const { data } = await insurerLogin({
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("token", data.token);
        toast.success("Logged in successfully!");
        navigate("/");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };
  const renderFileInput = ({ name, label }) => (
    <div
      className={`relative w-full px-4 py-2 border rounded-lg ${
        dragging[name] ? "border-blue-500 bg-gray-50" : "border-gray-300"
      } flex items-center`}
      onDragOver={(e) => handleDragOver(e, name)}
      onDragLeave={(e) => handleDragLeave(e, name)}
      onDrop={(e) => handleDrop(e, name)}
    >
      <input
        type="file"
        name={name}
        accept="image/jpeg,image/png,application/pdf"
        onChange={(e) => handleFileChange(e, name)}
        className="opacity-0 absolute w-full h-full cursor-pointer"
        required
      />
      <span className="text-gray-600 truncate">
        {formData[name] ? formData[name].name : `${label}`}
      </span>
      {formData[name] && (
        <IoCheckmarkDone className="w-5 h-5 text-green-800 ml-auto" />
      )}
    </div>
  );

  return (
    <div className="flex relative">
      <Toaster richColors position="top-right" />
      <a
        href="/"
        className="absolute mt-12 ml-12 flex items-center text-md tracking-tight text-blue-600 hover:text-blue-800 transition duration-200"
      >
        <IoArrowBack className="w-6 h-6 mr-2" />
        Back to Main
      </a>
      <div className="w-full lg:w-1/2 flex items-start justify-center bg-white min-h-screen">
        <div className="w-full max-w-lg space-y-4 overflow-y-auto overflow-x-hidden my-28">
          <div className="flex flex-col items-center">
            <img src={logo} alt="Company logo" className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-bold text-center text-gray-900">
            {isSignup ? "Sign Up" : "Sign In"}
          </h1>
          <p className="text-center text-sm text-gray-600">
            Hi <span className="text-indigo-500 font-bold">Insurer</span>!{" "}
            {isSignup
              ? "Sign up to manage your insurance clients efficiently."
              : "You're just a step away from managing claims faster."}
          </p>
          <form
            onSubmit={handleSubmit}
            className="space-y-3 p-1"
            encType="multipart/form-data"
          >
            <div
              className={`${
                isSignup ? "grid sm:grid-cols-2 gap-3" : "flex flex-col gap-3"
              }`}
            >
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {isSignup && (
                <>
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Tax ID"
                    value={formData.taxId}
                    onChange={(e) =>
                      setFormData({ ...formData, taxId: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Website (optional)"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <div className="col-span-2 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Plans</h3>
                    {formData.plans.map((plan, index) => (
                      <div
                        key={index}
                        className="border p-4 rounded-lg bg-gray-50"
                      >
                        <p className="font-semibold text-gray-900">
                          Plan {index + 1}
                        </p>
                        <div className="grid sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm text-gray-600">
                              Min Range (%)
                            </label>
                            <input
                              type="number"
                              value={plan.range.min}
                              onChange={(e) =>
                                handlePlanChange(index, "min", e.target.value)
                              }
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              max="100"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600">
                              Max Range (%)
                            </label>
                            <input
                              type="number"
                              value={plan.range.max}
                              onChange={(e) =>
                                handlePlanChange(index, "max", e.target.value)
                              }
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              max="100"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600">
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
                              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {renderFileInput({
                    name: "businessRegistration",
                    label: "Business Registration",
                  })}
                  {renderFileInput({
                    name: "insuranceLicense",
                    label: "Insurance License",
                  })}
                  {renderFileInput({ name: "photoId", label: "Photo ID" })}
                  {renderFileInput({
                    name: "authorizationLetter",
                    label: "Authorization Letter",
                  })}
                  {renderFileInput({ name: "image", label: "Profile Image" })}
                </>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-800 text-white py-1.5 rounded-lg font-semibold transition duration-200"
            >
              {isSignup ? "Sign Up" : "Login"}
            </button>
          </form>
          <p className="text-center text-xs text-gray-600">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 font-medium hover:underline"
            >
              {isSignup ? "Login here" : "Sign up here"}
            </button>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 bg-gray-100 sticky top-0 h-screen">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          className="h-full min-h-[200px]"
        >
          <SwiperSlide className="flex flex-col justify-center items-center text-center p-6">
            <img
              src={slide1}
              alt="Slide 1"
              className="max-w-[600px] h-auto rounded-lg mb-4"
            />
            <h2 className="text-lg text-gray-800 mb-2">
              Streamline Your Workflow
            </h2>
            <p className="text-sm text-gray-600">
              Focus on patient care while we simplify your claim management.
            </p>
          </SwiperSlide>
          <SwiperSlide className="flex flex-col justify-center items-center text-center p-6">
            <img
              src={slide2}
              alt="Slide 2"
              className="max-w-[600px] h-auto rounded-lg mb-4"
            />
            <h2 className="text-lg text-gray-800 mb-2">
              Effortless Claim Processing
            </h2>
            <p className="text-sm text-gray-600">
              Process claims with speed, precision, and peace of mind.
            </p>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}

export default InsurerAuth;
