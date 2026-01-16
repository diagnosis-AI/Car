import { useState } from "react";
import { Header } from "@/components/Header";
import { ScanForm } from "@/components/ScanForm";
import { DiagnosisResult } from "@/components/DiagnosisResult";
import { useDiagnose } from "@/hooks/use-diagnose";
import type { DiagnoseResponse } from "@shared/routes";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Info } from "lucide-react";

export default function Home() {
  const { mutate, isPending } = useDiagnose();
  const [result, setResult] = useState<DiagnoseResponse | null>(null);
  const [currentCode, setCurrentCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleScan = (data: { code: string }) => {
    setCurrentCode(data.code);
    setResult(null);
    setError(null);
    
    mutate(data, {
      onSuccess: (data) => {
        setResult(data);
      },
      onError: (err) => {
        setError(err.message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Hero Section */}
          <section className="text-center space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-extrabold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent"
            >
              افحص أعطال سيارتك <br/>
              <span className="text-primary text-glow">بالذكاء الاصطناعي</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              أدخل كود العطل (OBD2) واحصل على تشخيص فوري دقيق، أسباب المشكلة، وخطوات الإصلاح المقترحة.
            </motion.p>
          </section>

          {/* Scanner Input */}
          <section>
            <ScanForm onSubmit={handleScan} isLoading={isPending} />
          </section>

          {/* Results / Scan Effect */}
          <section className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {isPending && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 space-y-8"
                >
                  <div className="relative size-32">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
                    <ScanLine className="absolute inset-0 m-auto text-primary animate-pulse size-12" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-foreground">جاري تحليل البيانات...</h3>
                    <p className="text-muted-foreground text-sm">يقوم الذكاء الاصطناعي بمراجعة قاعدة بيانات الأعطال</p>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center"
                >
                  <div className="bg-red-500/20 size-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="text-red-500 size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-red-500 mb-2">عذراً، حدث خطأ</h3>
                  <p className="text-red-200/70">{error}</p>
                </motion.div>
              )}

              {result && !isPending && (
                <DiagnosisResult result={result} code={currentCode} />
              )}
              
              {!isPending && !result && !error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                >
                  {["P0300", "P0420", "P0171", "P0442"].map((code) => (
                    <button
                      key={code}
                      onClick={() => handleScan({ code })}
                      className="p-4 bg-card/30 border border-border/50 hover:border-primary/50 hover:bg-card/50 rounded-xl transition-all group text-center"
                    >
                      <span className="block font-mono text-xl font-bold text-muted-foreground group-hover:text-primary transition-colors">
                        {code}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      <footer className="py-6 border-t border-border/40 text-center text-sm text-muted-foreground/60">
        <p>جميع المعلومات للإرشاد فقط ولا تغني عن استشارة فني مختص.</p>
      </footer>
    </div>
  );
}
