import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AppSettings } from '../../shared/ipc-types';

const SETTINGS_KEY = ['settings'] as const;

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => window.api.settings.get(),
    staleTime: Infinity,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<AppSettings>) => window.api.settings.set(updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: SETTINGS_KEY });
      const previous = queryClient.getQueryData<AppSettings>(SETTINGS_KEY);
      queryClient.setQueryData<AppSettings>(SETTINGS_KEY, (old) =>
        old ? { ...old, ...updates } : old
      );
      return { previous };
    },
    onError: (_err, _updates, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SETTINGS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
  });
}
