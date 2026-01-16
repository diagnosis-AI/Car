import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type DiagnoseInput, type DiagnoseResponse } from "@shared/routes";
import { type Diagnosis } from "@shared/schema";

// POST /api/diagnose
export function useDiagnose() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: DiagnoseInput) => {
      // Input validation using Zod
      const validated = api.diagnose.analyze.input.parse(data);
      
      const res = await fetch(api.diagnose.analyze.path, {
        method: api.diagnose.analyze.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.diagnose.analyze.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('فشل الفحص، يرجى المحاولة مرة أخرى');
      }

      // Validate response structure
      return api.diagnose.analyze.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate history query to show new scan immediately
      queryClient.invalidateQueries({ queryKey: [api.diagnose.history.path] });
    },
  });
}

// GET /api/diagnose/history
export function useDiagnosisHistory() {
  return useQuery({
    queryKey: [api.diagnose.history.path],
    queryFn: async () => {
      const res = await fetch(api.diagnose.history.path, { credentials: "include" });
      if (!res.ok) throw new Error('فشل تحميل السجل');
      
      const data = await res.json();
      return api.diagnose.history.responses[200].parse(data);
    },
  });
}
