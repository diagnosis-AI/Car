import { Header } from "@/components/Header";
import { useDiagnosisHistory } from "@/hooks/use-diagnose";
import { motion } from "framer-motion";
import { Calendar, SearchX, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function History() {
  const { data: history, isLoading } = useDiagnosisHistory();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">سجل الفحص</h1>
            <Link href="/" className="text-primary hover:underline text-sm flex items-center gap-1">
               فحص جديد <ArrowRight className="size-4 rotate-180" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin size-8 text-primary" />
            </div>
          ) : history?.length === 0 ? (
            <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
              <SearchX className="size-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">السجل فارغ</h3>
              <p className="text-muted-foreground mb-6">لم تقم بأي عمليات فحص بعد.</p>
              <Link href="/">
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors">
                  ابدأ الفحص الآن
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {history?.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card hover:bg-card/80 border border-border p-5 rounded-xl transition-colors group cursor-default"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-xl font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                        {item.make && (
                          <span className="text-xs font-medium text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                            {item.make} {item.model} {item.year}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground/80 line-clamp-1">
                        {/* 
                           Assuming 'result' in DB is stored as the generic JSONB, 
                           we need to cast it or access it safely. 
                           For scan history list, we might just show basic info.
                        */}
                        {(item.result as any)?.meaning || "تم الفحص"}
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 justify-end">
                        <Calendar className="size-3" />
                        <span>{new Date(item.createdAt!).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
