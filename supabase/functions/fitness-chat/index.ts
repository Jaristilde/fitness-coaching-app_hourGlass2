import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  userId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, userId }: ChatRequest = await req.json();

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_user_context`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey!,
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ p_user_id: userId }),
    });

    let userContext = "";
    if (supabaseResponse.ok) {
      const contextData = await supabaseResponse.json();
      userContext = JSON.stringify(contextData);
    }

    const systemPrompt = `You are a professional fitness coach and nutrition expert integrated into a fitness tracking app. You have access to the user's workout history, nutrition profile, and progress data.

User Context:
${userContext}

Your role:
- Provide personalized workout and nutrition advice based on their data
- Answer questions about exercises, form, and technique
- Help interpret their macro calculations and meal plans
- Motivate and encourage based on their progress
- Suggest modifications or progressions for exercises
- Be supportive, knowledgeable, and concise
- Reference their specific data when relevant (e.g., "Based on your last leg workout...")

Keep responses clear, actionable, and encouraging.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in fitness-chat function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});