// @ts-nocheck
// Supabase Edge Function: mbti-assess
// Deno runtime
// Proxy OpenRouter chat completion to keep API key on the server.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  } as Record<string, string>;
}

serve(async (req) => {
  const headers = corsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    // Minimal protection: require logged-in user
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized: missing bearer token" }), { status: 401, headers });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured: missing SUPABASE_URL or SUPABASE_ANON_KEY" }), { status: 500, headers });
    }

    const serverClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: authData, error: authError } = await serverClient.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized: invalid or expired token" }), { status: 401, headers });
    }

    const { prompt, model } = await req.json().catch(() => ({ prompt: "", model: undefined }));

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'prompt'" }), { status: 400, headers });
    }

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured: OPENROUTER_API_KEY not set." }), {
        status: 500,
        headers,
      });
    }

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://linguavoyage.app",
        "X-Title": "LinguaVoyage MBTI Assessment",
      },
      body: JSON.stringify({
        model: model ?? "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are an expert MBTI personality assessment AI focused on learning behavior analysis." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 8192,
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: `OpenRouter error ${resp.status}: ${text}` }), { status: 502, headers });
    }

    const data = await resp.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ content }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers });
  }
});
