import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

function ClientCard({ client }) {
  const navigate = useNavigate();
  const formattedDate = client.birthDate
    ? new Date(client.birthDate).toLocaleDateString()
    : 'N/A';
  const nationalId = client.nationalId || 'N/A';

  return (
    <div
      className="bg-gray-50 p-4 rounded-lg border border-gray-300 hover:border-indigo-100 cursor-pointer transition-all duration-200 w-full max-w-md"
      onClick={() => client.clientId && navigate(`/insurer/client/${client.clientId}`)}
    >
      <div className="flex items-center space-x-4 mb-3">
        {client.image ? (
          <img
            src={client.image}
            alt="Client"
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
            No Image
          </div>
        )}
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{client.name}</h4>
          <p className="text-sm text-gray-600">{client.email}</p>
        </div>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-semibold">Plan Range:</span> {client.plan.range.min}% - {client.plan.range.max}%
        </p>
        <p>
          <span className="font-semibold">Date of Birth:</span> {formattedDate}
        </p>
        <p>
          <span className="font-semibold">National ID:</span> {nationalId}
        </p>
        <p>
          <span className="font-semibold">Job:</span> {client.job}
        </p>
      </div>
    </div>
  );
}

ClientCard.propTypes = {
  client: PropTypes.shape({
    name: PropTypes.string.isRequired,
    clientId: PropTypes.string,
    email: PropTypes.string,
    image: PropTypes.string,
    plan: PropTypes.shape({
      range: PropTypes.shape({
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
    birthDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date)
    ]),
    nationalId: PropTypes.string,
    job: PropTypes.string.isRequired,
  }).isRequired,
};

export default ClientCard;