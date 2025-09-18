import * as ReactDOMClient from 'react-dom/client';
import App from './App';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Failed to find the root element');

const rootElement = ReactDOMClient.createRoot(root);
rootElement.render(<App />);