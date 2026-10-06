import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-4">
        <Badge variant="secondary">Project scaffold</Badge>
        <h1 className="text-4xl font-semibold tracking-tight">Company Careers</h1>
        <p className="max-w-2xl text-muted-foreground">
          A starting point for one company&apos;s careers site. Applicants will browse this
          company&apos;s openings, while its HR team will review applications. Authentication,
          job listings, applications, and AI features are still to be built.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Planned first release</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>This company&apos;s categorized openings and one application per applicant per job</li>
            <li>HR-managed job listings, published for applicants on this careers site</li>
            <li>Text-only cover letters with applicant-controlled SoC LLM drafts</li>
            <li>HR review with SoC LLM summaries and human decisions</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
