import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the app heading on the initial upload screen', () => {
  render(<App />);
  expect(screen.getByText('PDF Review App')).toBeInTheDocument();
});
