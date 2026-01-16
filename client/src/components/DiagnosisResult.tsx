import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Wrench, Info, AlertOctagon } from "lucide-react";
import { useState } from "react";
import type { DiagnoseResponse } from "@shared/routes";
import { clsx } from "clsx";

interface DiagnosisResultProps {
  result: DiagnoseResponse;
  code: string;
}

export function DiagnosisResult({ result, code }: DiagnosisResultProps) {
  const [activeTab, setActiveTab] = useState<'simple' | 'technical'>('simple');

  const severityColor = {
    low: "text-severity-low border-severity-low/30 bg-severity-low/10",
    medium: "text-severity-medium border-severity-medium/30 bg-severity-medium/10",
    high: "text-severity-high border-severity-high/30 bg-severity-high/10",
    critical: "text-severity-critical border-severity-critical/30 bg-severity-critical/10",
  };

  const severityLabel = {
    low: "بسيط",
    medium: "متوسط",
    high: "خطير",
    critical: "حرج جداً",
  };

  const driveStatus = result.canDrive
    ? { icon: CheckCircle, text: "يمكن القيادة بحذر", color: "text-severity-low" }
    : { icon: AlertOctagon, text: "لا ينصح بالقيادة", color: "text-severity-critical" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header Card */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-lg relative overflow-hidden">
        <div className={clsx(
          "absolute top-0 right-0 w-1 h-full", 
          result.severity === 'low' ? "bg-severity-low" :
          result.severity === 'medium' ? "bg-severity-medium" :
          result.severity === 'high' ? "bg-severity-high" : "bg-severity-critical"
        )} />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-3xl font-bold text-primary">{code}</span>
              <span className={clsx("px-3 py-1 rounded-full text-xs font-bold border", severityColor[result.severity])}>
                {severityLabel[result.severity]}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-foreground/90">{result.meaning}</h2>
          </div>

          <div className={clsx("flex items-center gap-2 px-4 py-2 rounded-xl bg-background border", driveStatus.color)}>
            <driveStatus.icon className="size-6" />
            <span className="font-bold">{driveStatus.text}</span>
          </div>
        </div>

        {/* Warnings */}
        {result.warnings && result.warnings.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
            <h4 className="flex items-center gap-2 text-orange-400 font-bold mb-2">
              <AlertTriangle className="size-4" />
              تنبيهات هامة
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-orange-200/80">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Causes */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-background/50 rounded-xl p-4 border border-border/50">
            <h3 className="font-bold text-primary flex items-center gap-2 mb-3">
              <Info className="size-4" />
              الأسباب المحتملة
            </h3>
            <ul className="space-y-2">
              {result.causes.map((cause, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="block mt-1.5 size-1.5 rounded-full bg-primary/50 shrink-0" />
                  {cause}
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions Tabs */}
          <div className="bg-background/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-2">
              <button
                onClick={() => setActiveTab('simple')}
                className={clsx(
                  "flex-1 pb-2 -mb-2.5 text-sm font-bold transition-colors",
                  activeTab === 'simple' 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                حلول أولية (للسائق)
              </button>
              <button
                onClick={() => setActiveTab('technical')}
                className={clsx(
                  "flex-1 pb-2 -mb-2.5 text-sm font-bold transition-colors",
                  activeTab === 'technical' 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                حلول تقنية (للفني)
              </button>
            </div>

            <div className="min-h-[150px]">
              {activeTab === 'simple' ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  {result.solutions.simple.length > 0 ? result.solutions.simple.map((sol, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-foreground/80 bg-card/50 p-2 rounded-lg">
                      <CheckCircle className="size-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{sol}</span>
                    </div>
                  )) : (
                    <p className="text-muted-foreground text-sm italic">لا توجد حلول أولية مقترحة لهذا العطل.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
                  {result.solutions.technical.length > 0 ? result.solutions.technical.map((sol, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-foreground/80 bg-card/50 p-2 rounded-lg">
                      <Wrench className="size-4 text-blue-500 mt-0.5 shrink-0" />
                      <span>{sol}</span>
                    </div>
                  )) : (
                     <p className="text-muted-foreground text-sm italic">لا توجد حلول تقنية متاحة.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
