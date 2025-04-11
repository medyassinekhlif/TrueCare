import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

function ClientCard({ client }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-gray-200 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg border border-gray-300 hover:border-[#006A6A] transition-all duration-200"
      onClick={() => navigate(`/insurer/client/${client.clientId}`)}
    >
      <h4 className="text-xl font-bold text-gray-800 mb-2">{client.fullName}</h4>
      <div className="space-y-1 text-sm">
        <p className="text-gray-700">
          <span className="text-gray-600">Client ID:</span> {client.clientId}
        </p>
        <p className="text-gray-700">
          <span className="text-gray-600">Date of Birth:</span> {client.dateOfBirth}
        </p>
        <p className="text-gray-700">
          <span className="text-gray-600">Status:</span>{' '}
          {client.retired ? 'Retired' : 'Active'}
        </p>
      </div>
    </div>
  );
}

ClientCard.propTypes = {
  client: PropTypes.shape({
    fullName: PropTypes.string.isRequired,
    clientId: PropTypes.string.isRequired,
    dateOfBirth: PropTypes.string.isRequired,
    retired: PropTypes.bool.isRequired,
  }).isRequired,
};

export default ClientCard;