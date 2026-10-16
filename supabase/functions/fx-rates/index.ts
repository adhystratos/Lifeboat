// Supabase Edge Function (Deno): stores today's ECB reference rates from
// Frankfurter as EUR→IDR/USD/PLN. The app derives every other pair (e.g.
// USD→IDR) as a cross rate through EUR. Schedule it daily; see the README.
import { createClient } from 'npm:@supabase/supabase-js@2';

const QUOTES = ['IDR', 'USD', 'PLN'];

Deno.serve(async () => {
  const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${QUOTES.join(',')}`);
  if (!res.ok) return new Response(`Rates fetch failed: ${res.status}`, { status: 502 });
  const body: { date: string; rates: Record<string, number> } = await res.json();

  const rows = QUOTES.filter((q) => body.rates[q]).map((quote) => ({
    base: 'EUR',
    quote,
    rate: body.rates[quote],
    as_of: body.date,
  }));

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error } = await supabase.from('fx_rates').upsert(rows, { onConflict: 'base,quote,as_of' });
  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ stored: rows.length, as_of: body.date });
});
