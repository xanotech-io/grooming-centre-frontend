import { Route } from 'react-router-dom';
import DocumentsPage from './DocumentsPage';

export const DocumentsPageRoute = ({ ...rest }) => {
  return <Route {...rest} component={DocumentsPage} />;
};
