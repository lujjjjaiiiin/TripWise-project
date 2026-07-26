import { Link } from "wouter";
import { useT } from "@/lib/i18n";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useT();
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
      <Compass className="w-24 h-24 text-primary/20 mb-8" />
      <h1 className="text-4xl font-bold text-primary mb-4">{t("pageNotFound")}</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        {t("pageNotFoundDesc")}
      </p>
      <Button asChild size="lg" className="rounded-full">
        <Link href="/">
          {t("backToHome")}
        </Link>
      </Button>
    </div>
  );
}
