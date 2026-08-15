import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home page', () => {
  it('renders the Roomly admin placeholder heading', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { name: /roomly admin/i }),
    ).toBeInTheDocument();
  });
});
