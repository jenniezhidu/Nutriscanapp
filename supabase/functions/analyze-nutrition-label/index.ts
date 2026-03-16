import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NutritionData {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  servingSize: string;
  uncertain: boolean;
}

Deno.serve(async (req: Request) => {
  console.log("[SERVER] Request received - method:", req.method);

  if (req.method === "OPTIONS") {
    console.log("[SERVER] OPTIONS request - returning CORS headers");
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("[SERVER] Parsing request body...");
    const body = await req.json();
    const { image } = body;

    console.log("[SERVER] Image exists:", !!image);
    console.log("[SERVER] Image length:", image?.length);

    if (!image) {
      console.error("[SERVER] No image provided in request");
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("[SERVER] Checking for OPENAI_API_KEY...");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    console.log("[SERVER] OPENAI_API_KEY exists:", !!openaiApiKey);
    console.log("[SERVER] OPENAI_API_KEY length:", openaiApiKey?.length);

    if (!openaiApiKey) {
      console.error("[SERVER] OpenAI API key not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured - please set OPENAI_API_KEY secret in Supabase dashboard" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("[SERVER] Calling OpenAI API...");
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract the nutrition information from this label. Return ONLY valid JSON with this exact structure:
{
  "calories": "value with unit (e.g., 250 kcal)",
  "protein": "value with unit (e.g., 10g)",
  "carbs": "value with unit (e.g., 30g)",
  "fat": "value with unit (e.g., 8g)",
  "fiber": "value with unit (e.g., 3g)",
  "servingSize": "value with unit (e.g., 100g or 1 cup)",
  "uncertain": false
}

If you cannot clearly read any value, set "uncertain" to true and provide your best guess for each field. Do not include any explanation, only return the JSON object.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    console.log("[SERVER] OpenAI response status:", openaiResponse.status);
    console.log("[SERVER] OpenAI response ok:", openaiResponse.ok);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("[SERVER] OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error (${openaiResponse.status}): ${errorText}` }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    console.log("[SERVER] OpenAI response data:", JSON.stringify(openaiData));

    const content = openaiData.choices[0]?.message?.content;
    console.log("[SERVER] Extracted content:", content);

    if (!content) {
      console.error("[SERVER] No content in OpenAI response");
      return new Response(
        JSON.stringify({ error: "No response from OpenAI" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let nutritionData: NutritionData;
    try {
      nutritionData = JSON.parse(content);
      console.log("[SERVER] Parsed nutrition data:", nutritionData);
    } catch (parseError) {
      console.error("[SERVER] Failed to parse OpenAI response:", content, parseError);
      return new Response(
        JSON.stringify({ error: `Invalid response format from AI: ${content}` }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("[SERVER] Returning success response");
    return new Response(
      JSON.stringify(nutritionData),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[SERVER] Error in analyze-nutrition-label function:", error);
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
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
