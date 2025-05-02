import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getInsurerDashboard, updateDashboard } from "../services/api";
import { FaSearch, FaPlus } from "react-icons/fa";
import ClientCard from "../components/ClientCard";
import AddClientForm from "../components/AddClientForm";
import InsuranceInfoSection from "../components/InsuranceInfoSection";
import Loading from "../components/Loading";
import { Toaster, toast } from "sonner";

function InsurerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchDashboard = useCallback(
    async (searchTerm = "", pageNum = 1, lim = 10) => {
      try {
        const { data } = await getInsurerDashboard({
          search: searchTerm,
          page: pageNum,
          limit: lim,
        });
        const clientsWithUniqueKeys = data.clients.map((client) => ({
          ...client,
          uniqueKey: client._id.toString(),
          clientId: client._id.toString(),
        }));
        setDashboardData({ ...data, clients: clientsWithUniqueKeys });
        setTotal(data.total);
        setPage(data.page);
        setLimit(data.limit);
        if (data.clients.length === 0 && searchTerm) {
          toast.info("No clients found for the search term.", {
            duration: 3000,
          });
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to load dashboard data.";
        toast.error(errorMessage);
      }
    },
    []
  );

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const searchTerm = query.get("search") || "";
    const pg = parseInt(query.get("page")) || 1;
    const lim = parseInt(query.get("limit")) || 10;

    setSearch(searchTerm);
    setPage(pg);
    setLimit(lim);
    fetchDashboard(searchTerm, pg, lim);
  }, [location.search, fetchDashboard]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`?search=${encodeURIComponent(search)}&page=1&limit=${limit}`);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    navigate(`?search=${encodeURIComponent(search)}&page=1&limit=${value}`);
  };

  const handleUpdate = async (updatedData) => {
    try {
      await updateDashboard(updatedData);
      toast.success("Information updated successfully");
      setDashboardData((prev) => ({
        ...prev,
        ...updatedData,
        plans: updatedData.plans,
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update information"
      );
    }
  };

  const limitOptions = [10, 20, 50];

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <Toaster richColors position="top-right" />
      <div className="max-w-6xl mx-auto px-4">
        {!dashboardData ? (
          <Loading />
        ) : (
          <>
            <div className="flex items-center mb-8">
              {dashboardData.profilePicture ? (
                <img
                  src={dashboardData.profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mr-4 object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 mr-4 flex items-center justify-center">
                  <span className="text-gray-600">No Image</span>
                </div>
              )}
              <h1 className="text-2xl md:text-3xl text-gray-800">
                Welcome to your dashboard, {dashboardData.companyName}. Let’s
                get started!
              </h1>
            </div>
            <InsuranceInfoSection
              companyName={dashboardData.companyName}
              email={dashboardData.email || ""}
              phoneNumber={dashboardData.phoneNumber || ""}
              address={dashboardData.address || ""}
              website={dashboardData.website || ""}
              plans={dashboardData.plans || []}
              onUpdate={handleUpdate}
              defaultOpen={true} // Ensure the section is open by default
            />
            <div className="mt-8 mb-20">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Add New Client
                </h2>
                <button
                  onClick={() => setIsFormVisible(!isFormVisible)}
                  className="p-2 text-indigo-950 hover:text-indigo-900 hover:rotate-12 transform transition-transform duration-300"
                  title={isFormVisible ? "Hide Form" : "Show Form"}
                  aria-label={isFormVisible ? "Hide Form" : "Show Form"}
                >
                  <FaPlus className="w-5 h-5" />
                </button>
              </div>
              {isFormVisible && (
                <AddClientForm
                  fetchDashboard={fetchDashboard}
                  setError={(message) => {
                    toast.error(message);
                  }}
                />
              )}
            </div>
            <form
              onSubmit={handleSearchSubmit}
              className="relative mb-8 flex items-center w-full max-w-4xl mx-auto"
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients by name or email..."
                className="block w-full rounded-md border border-gray-200 px-2.5 py-2.5 text-base text-gray-700 placeholder-gray-400 focus:border-indigo-600 focus:ring-indigo-600"
              />
              <button
                type="submit"
                className="absolute right-3 text-indigo-950 hover:text-indigo-900 hover:rotate-12 transform transition-transform duration-300"
                aria-label="Search"
              >
                <FaSearch className="w-5 h-5" />
              </button>
            </form>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Clients
              </h2>
              <div className="flex items-center mb-4">
                <label className="mr-2 text-sm font-medium text-gray-700">
                  Items per page:
                </label>
                <div className="flex space-x-4">
                  {limitOptions.map((value) => (
                    <label key={value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="limit"
                        value={value}
                        checked={limit === value}
                        onChange={() => handleLimitChange(value)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-600"
                      />
                      <span className="text-sm text-gray-700">{value}</span>
                    </label>
                  ))}
                </div>
              </div>
              {dashboardData.clients.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {dashboardData.clients.map((client) => (
                    <ClientCard key={client.uniqueKey} client={client} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No clients available.</p>
              )}
              {total > 0 && (
                <div className="flex justify-between mt-4">
                  <button
                    className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                    disabled={page === 1}
                    onClick={() =>
                      navigate(
                        `?search=${encodeURIComponent(search)}&page=${
                          page - 1
                        }&limit=${limit}`
                      )
                    }
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {page} of {Math.ceil(total / limit)}
                  </span>
                  <button
                    className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                    disabled={page >= Math.ceil(total / limit)}
                    onClick={() =>
                      navigate(
                        `?search=${encodeURIComponent(search)}&page=${
                          page + 1
                        }&limit=${limit}`
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default InsurerDashboard;
