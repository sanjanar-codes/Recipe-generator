import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ChefHat } from "lucide-react";

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string;
  cuisineType?: string;
  prepTime?: string;
  servings?: number;
}

interface RecipeGeneratorProps {
  onRecipeGenerated: (recipe: Recipe) => void;
}

export const RecipeGenerator = ({ onRecipeGenerated }: RecipeGeneratorProps) => {
  const [ingredients, setIngredients] = useState("");
  const [dietary, setDietary] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateRecipe = async () => {
    if (!ingredients.trim()) {
      toast({
        title: "Missing ingredients",
        description: "Please enter at least one ingredient",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-recipe", {
        body: { ingredients, dietary, cuisine },
      });

      if (error) throw error;

      if (data?.recipe) {
        onRecipeGenerated(data.recipe);
        toast({
          title: "Recipe generated!",
          description: "Your personalized recipe is ready",
        });
      }
    } catch (error: any) {
      console.error("Error generating recipe:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate recipe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-soft)] bg-gradient-to-br from-card to-muted/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-glow)]">
          <ChefHat className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Generate Recipe</h2>
          <p className="text-sm text-muted-foreground">AI-powered recipe creation</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="ingredients" className="text-sm font-medium">
            Ingredients *
          </label>
          <Textarea
            id="ingredients"
            placeholder="e.g., chicken, tomatoes, garlic, pasta..."
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="min-h-[100px] resize-none transition-all duration-200 focus:shadow-[var(--shadow-soft)]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="dietary" className="text-sm font-medium">
              Dietary Requirements
            </label>
            <Input
              id="dietary"
              placeholder="e.g., vegetarian, gluten-free..."
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="transition-all duration-200 focus:shadow-[var(--shadow-soft)]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="cuisine" className="text-sm font-medium">
              Cuisine Type
            </label>
            <Input
              id="cuisine"
              placeholder="e.g., Italian, Mexican..."
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="transition-all duration-200 focus:shadow-[var(--shadow-soft)]"
            />
          </div>
        </div>

        <Button
          onClick={generateRecipe}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-[var(--shadow-soft)]"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Recipe...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Recipe
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};