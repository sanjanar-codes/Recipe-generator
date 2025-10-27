import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Clock, Users, ChefHat, Trash2 } from "lucide-react";

interface Recipe {
  id?: string;
  title: string;
  ingredients: string[];
  instructions: string;
  cuisineType?: string;
  prepTime?: string;
  servings?: number;
}

interface RecipeCardProps {
  recipe: Recipe;
  onDelete?: () => void;
}

export const RecipeCard = ({ recipe, onDelete }: RecipeCardProps) => {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const saveRecipe = async () => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save recipes",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("recipes").insert({
        user_id: user.id,
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cuisine_type: recipe.cuisineType,
        prep_time: recipe.prepTime,
        servings: recipe.servings,
      });

      if (error) throw error;

      toast({
        title: "Recipe saved!",
        description: "Added to your collection",
      });
    } catch (error: any) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save recipe",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteRecipe = async () => {
    if (!recipe.id) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase.from("recipes").delete().eq("id", recipe.id);

      if (error) throw error;

      toast({
        title: "Recipe deleted",
        description: "Removed from your collection",
      });
      
      if (onDelete) onDelete();
    } catch (error: any) {
      console.error("Error deleting recipe:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete recipe",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-soft)] bg-gradient-to-br from-card to-muted/20 transition-all duration-300 hover:shadow-[var(--shadow-glow)]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <h3 className="text-2xl font-bold">{recipe.title}</h3>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {recipe.cuisineType && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Cuisine:</span> {recipe.cuisineType}
              </span>
            )}
            {recipe.prepTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {recipe.prepTime}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {recipe.servings} servings
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {!recipe.id && (
            <Button
              onClick={saveRecipe}
              disabled={saving}
              variant="outline"
              size="icon"
              className="transition-all duration-200 hover:text-primary hover:border-primary"
            >
              <Heart className="w-5 h-5" />
            </Button>
          )}
          {recipe.id && onDelete && (
            <Button
              onClick={deleteRecipe}
              disabled={deleting}
              variant="outline"
              size="icon"
              className="transition-all duration-200 hover:text-destructive hover:border-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-lg mb-2 text-primary">Ingredients</h4>
          <ul className="space-y-1">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-2 text-primary">Instructions</h4>
          <p className="whitespace-pre-line leading-relaxed">{recipe.instructions}</p>
        </div>
      </div>
    </Card>
  );
};