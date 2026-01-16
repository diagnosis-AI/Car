import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api, type DiagnoseInput } from "@shared/routes";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { clsx } from "clsx";

// Use Zod schema from shared routes
const schema = api.diagnose.analyze.input;

interface ScanFormProps {
  onSubmit: (data: DiagnoseInput) => void;
  isLoading: boolean;
}

export function ScanForm({ onSubmit, isLoading }: ScanFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<DiagnoseInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      make: "",
      model: "",
      symptoms: "",
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl group-hover:bg-primary/30 transition-all duration-500 opacity-50" />
        <div className="relative bg-card border border-border rounded-2xl p-2 shadow-2xl flex items-center gap-2">
          <div className="pl-4 pr-3 text-primary">
            <Search className="size-6" />
          </div>
          <input
            {...register("code")}
            placeholder="أدخل كود العطل (مثلاً: P0171)"
            className="flex-1 bg-transparent border-none text-xl md:text-2xl font-mono placeholder:font-sans placeholder:text-muted-foreground/50 focus:ring-0 text-foreground py-4 outline-none"
            style={{ direction: "ltr", textAlign: "right" }} // Force LTR for code typing but align right
          />
          <button
            type="submit"
            disabled={isLoading}
            className={clsx(
              "px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200 flex items-center gap-2",
              isLoading 
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:translate-y-0.5"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin size-5" />
                <span>جاري الفحص...</span>
              </>
            ) : (
              <span>فحص</span>
            )}
          </button>
        </div>
      </div>
      
      {errors.code && (
        <p className="text-red-500 text-sm px-2 animate-in slide-in-from-top-1">
          {errors.code.message}
        </p>
      )}

      <div className="px-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors mx-auto md:mx-0"
        >
          {showAdvanced ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          <span>تفاصيل إضافية (اختياري)</span>
        </button>
      </div>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid md:grid-cols-3 gap-4 p-4 bg-card/30 border border-border/50 rounded-xl">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">الشركة المصنعة</label>
                <input 
                  {...register("make")}
                  placeholder="تويوتا، فورد..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">الموديل</label>
                <input 
                  {...register("model")}
                  placeholder="كورولا، إف-150..."
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">سنة الصنع</label>
                <input 
                  {...register("year", { valueAsNumber: true })}
                  type="number"
                  placeholder="2018"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors font-mono"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-muted-foreground mb-1">أعراض إضافية تلاحظها</label>
                <textarea 
                  {...register("symptoms")}
                  placeholder="اهتزاز عند الوقوف، صوت طقطقة، دخان أسود..."
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
