import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, metrics } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from user's financial metrics
    const financialContext = `
Current Financial Situation:
- Annual Income: $${metrics.totalAnnualIncome?.toFixed(2) || 0}
- Annual Expenses: $${metrics.totalAnnualExpenses?.toFixed(2) || 0}
- Annual Surplus: $${metrics.annualSurplus?.toFixed(2) || 0}
- Savings Rate: ${metrics.savingsRate?.toFixed(1) || 0}%
- Debt-to-Income Ratio: ${metrics.debtToIncomeRatio?.toFixed(1) || 0}%
- Total Assets: $${metrics.totalAssets?.toFixed(2) || 0}
- Total Debts: $${metrics.totalDebts?.toFixed(2) || 0}
- Net Worth: $${metrics.netWorth?.toFixed(2) || 0}
- Active Savings Goals: ${metrics.savingsGoalsCount || 0}
- Monthly Savings Contribution: $${metrics.monthlySavingsContribution?.toFixed(2) || 0}
- Savings Progress: ${metrics.savingsProgress?.toFixed(1) || 0}%
- Monthly Debt Payment: $${metrics.monthlyDebtPayment?.toFixed(2) || 0}
- Months to Debt Freedom: ${metrics.debtFreeMonths || 'N/A'}
`;

    const systemPrompt = `You are a knowledgeable financial advisor providing personalized advice based on the user's financial data. 

${financialContext}

Provide clear, actionable advice that:
- Addresses their specific financial situation
- Suggests concrete improvements they can make
- Compares their metrics to general financial best practices (e.g., 20% savings rate, 43% debt-to-income ratio threshold)
- Prioritizes debt reduction when DTI is high
- Encourages emergency fund building when savings are low
- Provides demographic comparisons when relevant (average Canadian household savings rates, net worth by age, etc.)

Keep responses concise, friendly, and focused on practical steps they can take.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("financial-advisor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
