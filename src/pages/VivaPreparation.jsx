import { Navigate } from 'react-router-dom';

function VivaPreparation() {
  return <Navigate to={{ pathname: '/study-notes', search: '?section=viva' }} replace />;
}

export default VivaPreparation;
