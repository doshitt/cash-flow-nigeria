import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getApiUrl, API_CONFIG } from "@/config/api";

interface CheckResult {
  name: string;
  url: string;
  ok: boolean;
  status: number | null;
  note?: string;
  error?: string;
}

const tests = [
  {
    name: "Auth: login.php executes",
    method: "POST",
    url: () => getApiUrl(API_CONFIG.ENDPOINTS.AUTH_LOGIN),
    body: {},
    expectPhpParsed: true,
  },
  {
    name: "Auth: session_check.php reachable",
    method: "POST",
    url: () => getApiUrl(API_CONFIG.ENDPOINTS.AUTH_SESSION_CHECK),
    body: { session_token: "invalid" },
    expectPhpParsed: true,
  },
  {
    name: "VAS: betting providers",
    method: "GET",
    url: () => `${getApiUrl("")}/coralpay/betting.php?action=providers`,
    expectPhpParsed: true,
  },
];

export default function BackendStatus() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);
  const base = useMemo(() => {
    const runtimeBase = typeof window !== "undefined" ? localStorage.getItem("tesapay_backend_url") || "" : "";
    return runtimeBase || API_CONFIG.BACKEND_BASE_URL;
  }, []);

  useEffect(() => {
    document.title = "Backend Status | TesaPay";
    runChecks();
  }, []);

  const runChecks = async () => {
    setRunning(true);
    const newResults: CheckResult[] = [];

    for (const t of tests) {
      const url = t.url();
      try {
        const res = await fetch(url, {
          method: t.method as any,
          headers: { "Content-Type": "application/json" },
          body: t.method === "POST" ? JSON.stringify(t.body || {}) : undefined,
        });

        const text = await res.clone().text();
        const looksLikePhpSource = text.trim().startsWith("<?php");
        const ok = res.ok && (!t.expectPhpParsed || !looksLikePhpSource);

        newResults.push({
          name: t.name,
          url,
          ok,
          status: res.status,
          note: looksLikePhpSource ? "PHP source returned — server not executing PHP at this URL" : undefined,
        });
      } catch (e: any) {
        newResults.push({ name: t.name, url, ok: false, status: null, error: e?.message || String(e) });
      }
    }

    setResults(newResults);
    setRunning(false);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-4">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Backend Status</h1>
            <p className="text-sm text-muted-foreground">Base URL in use: {base}</p>
            <div className="flex gap-2">
              <Button onClick={runChecks} disabled={running}>
                {running ? "Checking..." : "Run Health Check"}
              </Button>
            </div>
          </div>
        </Card>

        {results.map((r, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground break-all">{r.url}</div>
                {r.note && <div className="text-xs text-yellow-600 mt-1">{r.note}</div>}
                {r.error && <div className="text-xs text-destructive mt-1">{r.error}</div>}
              </div>
              <div className={`text-sm font-medium ${r.ok ? "text-green-600" : "text-destructive"}`}>
                {r.ok ? "OK" : `FAIL${r.status ? ` (${r.status})` : ""}`}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
