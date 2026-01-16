import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="mx-auto bg-destructive/10 size-24 rounded-full flex items-center justify-center">
          <AlertTriangle className="size-12 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">الصفحة غير موجودة</p>
        </div>

        <Link href="/">
          <button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all">
            العودة للرئيسية
          </button>
        </Link>
      </div>
    </div>
  );
}
