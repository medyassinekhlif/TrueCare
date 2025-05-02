import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { FaRunning } from "react-icons/fa";
import { Toaster, toast } from "sonner";
import { getMedicalBulletins } from "../services/api";

function ClientBulletinHistory() {
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [jumpPage, setJumpPage] = useState("1");

  const navigate = useNavigate();
  const location = useLocation();

  const fetchBulletins = useCallback(
    async (searchTerm = "", pageNum = 1, lim = 10) => {
      setLoading(true);
      try {
        const response = await getMedicalBulletins({
          search: searchTerm,
          page: pageNum,
          limit: lim,
        });
        setBulletins(response.data.bulletins);
        setTotal(response.data.total);
        setPage(response.data.page);
        setLimit(response.data.limit);
        setJumpPage(response.data.page.toString());
        if (response.data.bulletins.length === 0 && searchTerm) {
          toast.info("No bulletins found for the search term.", {
            duration: 3000,
          });
        }
      } catch (error) {
        toast.error(`Failed to load medical bulletins: ${error.message}`, {
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const pg = Math.max(1, parseInt(query.get("page")) || 1);
    const srch = query.get("search") || "";
    const lim = Math.max(1, parseInt(query.get("limit")) || 10);

    setPage(pg);
    setSearch(srch);
    setLimit(lim);
    setJumpPage(pg.toString());
    fetchBulletins(srch, pg, lim);
  }, [location.search, fetchBulletins]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newPage = 1;
    navigate(
      `?page=${newPage}&search=${encodeURIComponent(search)}&limit=${limit}`
    );
  };

  const handleJumpPageSubmit = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(jumpPage);
    if (pageNumber > 0 && pageNumber <= Math.ceil(total / limit)) {
      setPage(pageNumber);
      navigate(
        `?page=${pageNumber}&search=${encodeURIComponent(
          search
        )}&limit=${limit}`
      );
    } else {
      setJumpPage(page.toString());
      toast.error("Invalid page number.", { duration: 3000 });
    }
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setPage(1);
    navigate(`?page=1&search=${encodeURIComponent(search)}&limit=${value}`);
  };

  const handleRowClick = (bulletinId) => {
    if (!bulletinId) {
      toast.error("Bulletin ID is missing.", { duration: 3000 });
      return;
    }
    navigate(`/bulletin/${bulletinId}`);
  };

  const limitOptions = [10, 20, 50, 100];

  return (
    <div className="container mx-auto my-8 px-4">
      <Toaster richColors position="top-right" />
      <h2 className="text-3xl mb-4 text-gray-800 text-center">
        View Your Previous Medical Bulletins (Most Recent First)
      </h2>
      <form
        onSubmit={handleSearchSubmit}
        className="relative mb-5 flex items-center w-full max-w-md mx-auto"
      >
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by doctor name..."
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute right-3 text-blue-600 hover:text-blue-800"
          aria-label="Search"
        >
          <FaSearch className="text-1xl" />
        </button>
      </form>

      <div className="flex items-center mb-5 justify-center">
        <label
          htmlFor="limit"
          className="mr-2 text-sm font-medium text-gray-700"
        >
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
                className="h-4 w-4 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{value}</span>
            </label>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Doctor Name",
                  "Diagnosis",
                  "Sessions",
                  "Duration",
                  "Type",
                  "Severity",
                  "Amount Paid",
                  "Date",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-600"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: limit }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  {Array.from({ length: 8 }).map((__, idx2) => (
                    <td key={idx2} className="px-4 py-2 border border-gray-300">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : bulletins.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600 my-2">
            {search
              ? "No bulletins match your search."
              : "No medical bulletins available."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Doctor Name",
                  "Diagnosis",
                  "Sessions",
                  "Duration",
                  "Type",
                  "Severity",
                  "Amount Paid",
                  "Date",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-600"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bulletins.map((bulletin) => (
                <tr
                  key={bulletin._id || `bulletin-${Math.random()}`} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(bulletin._id)}
                >
                  <td className="px-4 py-1 border border-gray-300">
                    {bulletin.doctorName || 'N/A'}
                  </td>
                  <td className="px-4 py-1 border border-gray-300">
                    {bulletin.treatmentDetails.diagnosis || 'N/A'}
                  </td>
                  <td className="px-4 py-1 border border-gray-300">
                    {bulletin.treatmentDetails.sessionsAttended || '0'}
                  </td>
                  <td className="px-4 py-1 border border-gray-300">
                    {bulletin.treatmentDetails.treatmentDuration || 'N/A'}
                  </td>
                  <td className="px-4 py-1 border border-gray-300">
                    {bulletin.treatmentDetails.treatmentType || 'N/A'}
                  </td>
                  <td className="px-4 py-1 border border-gray-300">
                    {bulletin.treatmentDetails.caseSeverity || 'N/A'}
                  </td>
                  <td className="px-4 py-1 border border-gray-300">
                    ${bulletin.financialInfo.totalAmountPaid.toFixed(2)}
                  </td>
                  <td className="px-4 py-1 border border-gray-300">
                    {bulletin.createdAt ? new Date(bulletin.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && total > 0 && (
        <div className="flex flex-col sm:flex-row justify-between mt-5">
          <button
            className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 mb-2 sm:mb-0 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => {
              const newPage = page - 1;
              setPage(newPage);
              navigate(
                `?page=${newPage}&search=${encodeURIComponent(
                  search
                )}&limit=${limit}`
              );
            }}
          >
            Previous
          </button>
          <form
            onSubmit={handleJumpPageSubmit}
            className="flex items-center mb-2 sm:mb-0 justify-center"
          >
            <input
              type="number"
              min="1"
              max={Math.ceil(total / limit)}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              className="rounded-md border border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 mr-1 px-3 py-2"
              placeholder={`(1-${Math.ceil(total / limit)})`}
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-200"
            >
              GO!
              <FaRunning className="text-gray-800" />
            </button>
          </form>
          <button
            className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => {
              const newPage = page + 1;
              setPage(newPage);
              navigate(
                `?page=${newPage}&search=${encodeURIComponent(
                  search
                )}&limit=${limit}`
              );
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ClientBulletinHistory;