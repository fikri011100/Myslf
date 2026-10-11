import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormField } from "@/app/actions/forms";
import { FormFiller } from "./form-filler";

export default async function FormDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("id, title, schema")
    .eq("id", params.id)
    .maybeSingle();

  if (!form) notFound();

  const { data: submissions } = await supabase
    .from("form_submissions")
    .select("id, data, created_at")
    .eq("form_id", params.id)
    .order("created_at", { ascending: false });

  const fields =
    ((form.schema as unknown as { fields?: FormField[] })?.fields) ?? [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/forms" className="hover:text-foreground">
          Forms
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{form.title}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <FormFiller formId={form.id} fields={fields} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Respons ({submissions?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {(submissions?.length ?? 0) === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Belum ada respons.
            </p>
          )}
          {(submissions ?? []).map((s) => (
            <div key={s.id} className="rounded-xl border border-border p-3 text-sm">
              {Object.entries((s.data as Record<string, unknown>) ?? {}).map(
                ([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="font-medium">{k}:</span>
                    <span className="text-muted-foreground">{String(v)}</span>
                  </div>
                )
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
