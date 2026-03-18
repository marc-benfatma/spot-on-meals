import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RestaurantForm } from '../RestaurantForm';
import { Restaurant } from '@/types/restaurant';

// Mock MapPicker (uses Leaflet which doesn't work in jsdom)
vi.mock('../MapPicker', () => ({
  MapPicker: ({ latitude, longitude }: { latitude: number; longitude: number; onChange: (lat: number, lng: number) => void }) =>
    React.createElement('div', { 'data-testid': 'map-picker' }, `Map: ${latitude}, ${longitude}`),
}));

// Mock AddressAutocomplete
vi.mock('../AddressAutocomplete', () => ({
  AddressAutocomplete: ({ value, onChange, id, required }: {
    value: string;
    onChange: (address: string, lat?: number, lng?: number) => void;
    id?: string;
    required?: boolean;
    placeholder?: string;
  }) =>
    React.createElement('input', {
      'data-testid': 'address-autocomplete',
      id,
      value,
      required,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    }),
}));

const mockRestaurant: Restaurant = {
  id: 'r1',
  name: 'Chez Luigi',
  address: '10 Rue de Paris',
  cuisine_type: 'Italian',
  latitude: 48.85,
  longitude: 2.35,
  price_level: 2,
  rating: 4.2,
  phone_number: '+33 1 23 45 67',
  photo_urls: ['https://example.com/photo.jpg'],
  opening_hours: { monday: '11:00-22:00' },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('RestaurantForm', () => {
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  it('renders empty form for new restaurant', () => {
    render(
      <RestaurantForm
        restaurant={null}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isLoading={false}
      />
    );

    expect(screen.getByText('Add Restaurant')).toBeInTheDocument();
    expect(screen.getByLabelText('Restaurant Name *')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('populates form with existing restaurant data', () => {
    render(
      <RestaurantForm
        restaurant={mockRestaurant}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isLoading={false}
      />
    );

    expect(screen.getByText('Edit Restaurant')).toBeInTheDocument();
    expect(screen.getByLabelText('Restaurant Name *')).toHaveValue('Chez Luigi');
    expect(screen.getByLabelText('Phone Number')).toHaveValue('+33 1 23 45 67');
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  });

  it('calls onSave with form data on submit', async () => {
    const user = userEvent.setup();

    render(
      <RestaurantForm
        restaurant={null}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isLoading={false}
      />
    );

    await user.type(screen.getByLabelText('Restaurant Name *'), 'New Place');
    await user.type(screen.getByTestId('address-autocomplete'), '5 Rue Neuve');

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Place',
          address: '5 Rue Neuve',
        })
      );
    });
  });

  it('filters out empty photo URLs on submit', async () => {
    const user = userEvent.setup();

    render(
      <RestaurantForm
        restaurant={null}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isLoading={false}
      />
    );

    await user.type(screen.getByLabelText('Restaurant Name *'), 'Test');
    await user.type(screen.getByTestId('address-autocomplete'), 'Addr');
    // Leave photo URL empty
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({ photo_urls: [] })
      );
    });
  });

  it('disables submit button when loading', () => {
    render(
      <RestaurantForm
        restaurant={null}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isLoading={true}
      />
    );

    expect(screen.getByRole('button', { name: /Create/i })).toBeDisabled();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();

    render(
      <RestaurantForm
        restaurant={null}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isLoading={false}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('resets form when switching from edit to new', async () => {
    const { rerender } = render(
      <RestaurantForm
        restaurant={mockRestaurant}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isLoading={false}
      />
    );

    expect(screen.getByLabelText('Restaurant Name *')).toHaveValue('Chez Luigi');

    rerender(
      <RestaurantForm
        restaurant={null}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isLoading={false}
      />
    );

    expect(screen.getByLabelText('Restaurant Name *')).toHaveValue('');
  });
});
