import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, dietary, cuisine } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a professional chef and recipe creator. Create delicious, practical recipes based on the ingredients provided. 
Always return recipes in this exact JSON format:
{
  "title": "Recipe name",
  "ingredients": ["ingredient 1", "ingredient 2"],
  "instructions": "Step-by-step cooking instructions",
  "cuisineType": "Cuisine type",
  "prepTime": "Preparation time",
  "servings": 4
}`;

    const userPrompt = `Create a recipe using these ingredients: ${ingredients}
${dietary ? `Dietary requirements: ${dietary}` : ''}
${cuisine ? `Cuisine type: ${cuisine}` : ''}`;

    console.log('Generating recipe with prompt:', userPrompt);

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const recipeText = data.choices[0].message.content;
    
    console.log('Generated recipe:', recipeText);

    // Extract JSON from markdown code block if present
    let recipeJson;
    try {
      const jsonMatch = recipeText.match(/```json\n([\s\S]*?)\n```/) || 
                       recipeText.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : recipeText;
      recipeJson = JSON.parse(jsonString.trim());
    } catch (e) {
      console.error('Failed to parse recipe JSON:', e);
      throw new Error("Failed to parse recipe format");
    }

    return new Response(
      JSON.stringify({ recipe: recipeJson }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-recipe:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate recipe";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});