import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompany } from "@/lib/company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { FormBuilder } from "./form-builder";

export default async function FormsPage() {
  const supabase = createClient();
  const active = await getActiveCompany();

  const { data: forms } = active
    ? await supabase
        .from("forms")
        .select("id, title, is_public, created_at")
        .eq("company_id", active.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cyan/10">
          <FileText className="h-6 w-6 text-brand-cyan" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold">Forms</h1>
          <p className="text-muted-foreground">Form builder & pengumpulan respons</p>
        </div>
      </div>

      <FormBuilder />

      {(forms?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center">
          <p className="font-medium">Belum ada form</p>
          <p className="text-sm text-muted-foreground">
            Buat form pertama Anda di atas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(forms ?? []).map((f) => (
            <Link key={f.id} href={`/forms/${f.id}`}>
              <Card className="transition-transform hover:-translate-y-1 hover:shadow-soft">
                <CardHeader>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cyan/10">
                    <FileText className="h-5 w-5 text-brand-cyan" />
                  </span>
                  <CardTitle className="mt-2">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {f.is_public ? "Publik" : "Internal"}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
