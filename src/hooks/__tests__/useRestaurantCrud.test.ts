import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRestaurantCrud } from '../useRestaurantCrud';

// Mock the service layer
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
vi.mock('@/services/restaurant.service', () => ({
  createRestaurant: (...args: any[]) => mockCreate(...args),
  updateRestaurant: (...args: any[]) => mockUpdate(...args),
  deleteRestaurant: (...args: any[]) => mockDelete(...args),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useRestaurantCrud', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveRestaurant', () => {
    it('inserts a new restaurant', async () => {
      mockCreate.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRestaurantCrud(), { wrapper: createWrapper() });

      let success: boolean;
      await act(async () => {
        success = await result.current.saveRestaurant({
          name: 'Test',
          address: '123 St',
          cuisine_type: 'French',
          latitude: 48.85,
          longitude: 2.35,
          price_level: 2,
          rating: 4.0,
        });
      });

      expect(success!).toBe(true);
      expect(mockCreate).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Restaurant added' }));
    });

    it('updates an existing restaurant', async () => {
      mockUpdate.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRestaurantCrud(), { wrapper: createWrapper() });

      let success: boolean;
      await act(async () => {
        success = await result.current.saveRestaurant({ name: 'Updated' }, 'existing-id');
      });

      expect(success!).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith('existing-id', { name: 'Updated' });
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Restaurant updated' }));
    });

    it('handles save errors', async () => {
      mockCreate.mockRejectedValue(new Error('DB error'));

      const { result } = renderHook(() => useRestaurantCrud(), { wrapper: createWrapper() });

      let success: boolean;
      await act(async () => {
        success = await result.current.saveRestaurant({
          name: 'Test',
          address: '123',
          cuisine_type: 'French',
          latitude: 0,
          longitude: 0,
          price_level: 1,
          rating: 3,
        });
      });

      expect(success!).toBe(false);
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }));
    });
  });

  describe('deleteRestaurant', () => {
    it('deletes a restaurant', async () => {
      mockDelete.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRestaurantCrud(), { wrapper: createWrapper() });

      let success: boolean;
      await act(async () => {
        success = await result.current.deleteRestaurant({
          id: 'abc',
          name: 'To Delete',
        } as any);
      });

      expect(success!).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('abc');
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Restaurant deleted' }));
    });

    it('handles delete errors', async () => {
      mockDelete.mockRejectedValue(new Error('Not found'));

      const { result } = renderHook(() => useRestaurantCrud(), { wrapper: createWrapper() });

      let success: boolean;
      await act(async () => {
        success = await result.current.deleteRestaurant({ id: 'abc', name: 'X' } as any);
      });

      expect(success!).toBe(false);
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }));
    });
  });
});
