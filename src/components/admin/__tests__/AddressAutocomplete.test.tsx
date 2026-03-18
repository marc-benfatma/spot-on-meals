import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressAutocomplete } from '../AddressAutocomplete';

// Mock geocoding service
const mockSearchAddress = vi.fn();
vi.mock('@/services/geocoding.service', () => ({
  searchAddress: (...args: unknown[]) => mockSearchAddress(...args),
}));

describe('AddressAutocomplete', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchAddress.mockResolvedValue([]);
  });

  it('renders with initial value', () => {
    render(
      <AddressAutocomplete value="10 Rue de Paris" onChange={mockOnChange} />
    );

    expect(screen.getByDisplayValue('10 Rue de Paris')).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();

    render(<AddressAutocomplete value="" onChange={mockOnChange} />);

    await user.type(screen.getByPlaceholderText('Search for an address...'), 'Par');
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('shows suggestions after debounce', async () => {
    const user = userEvent.setup();
    mockSearchAddress.mockResolvedValue([
      { display_name: 'Paris, France', lat: '48.856', lon: '2.352' },
      { display_name: 'Parc Montsouris', lat: '48.821', lon: '2.337' },
    ]);

    render(<AddressAutocomplete value="" onChange={mockOnChange} />);

    await user.type(screen.getByPlaceholderText('Search for an address...'), 'Paris');

    await waitFor(() => {
      expect(screen.getByText('Paris, France')).toBeInTheDocument();
      expect(screen.getByText('Parc Montsouris')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('selects a suggestion and calls onChange with coordinates', async () => {
    const user = userEvent.setup();
    mockSearchAddress.mockResolvedValue([
      { display_name: 'Paris, France', lat: '48.856', lon: '2.352' },
    ]);

    render(<AddressAutocomplete value="" onChange={mockOnChange} />);

    await user.type(screen.getByPlaceholderText('Search for an address...'), 'Paris');

    await waitFor(() => {
      expect(screen.getByText('Paris, France')).toBeInTheDocument();
    }, { timeout: 2000 });

    // mousedown is used in the component
    const suggestion = screen.getByText('Paris, France');
    await user.click(suggestion);

    expect(mockOnChange).toHaveBeenCalledWith('Paris, France', 48.856, 2.352);
  });

  it('does not search when query is too short', async () => {
    const user = userEvent.setup();

    render(<AddressAutocomplete value="" onChange={mockOnChange} />);

    await user.type(screen.getByPlaceholderText('Search for an address...'), 'ab');

    // Wait past the debounce
    await new Promise(r => setTimeout(r, 500));
    expect(mockSearchAddress).not.toHaveBeenCalled();
  });

  it('closes suggestions on Escape key', async () => {
    const user = userEvent.setup();
    mockSearchAddress.mockResolvedValue([
      { display_name: 'Paris, France', lat: '48.856', lon: '2.352' },
    ]);

    render(<AddressAutocomplete value="" onChange={mockOnChange} />);

    await user.type(screen.getByPlaceholderText('Search for an address...'), 'Paris');

    await waitFor(() => {
      expect(screen.getByText('Paris, France')).toBeInTheDocument();
    }, { timeout: 2000 });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('Paris, France')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    mockSearchAddress.mockRejectedValue(new Error('Network error'));

    render(<AddressAutocomplete value="" onChange={mockOnChange} />);

    await user.type(screen.getByPlaceholderText('Search for an address...'), 'Paris');

    // Wait for debounce + fetch
    await new Promise(r => setTimeout(r, 600));

    // Should not crash, no suggestions shown
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
