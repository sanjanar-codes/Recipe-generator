import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RecipeGenerator } from "@/components/RecipeGenerator";
import { RecipeCard } from "@/components/RecipeCard";
import { ChefHat, LogOut, BookOpen } from "lucide-react";
import heroImage from "@/assets/hero-cooking.jpg";
import type { User } from "@supabase/supabase-js";

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string;
  cuisineType?: string;
  prepTime?: string;
  servings?: number;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-glow)]">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Recipe AI
            </h1>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/my-recipes")}
                className="transition-all duration-200 hover:shadow-[var(--shadow-soft)]"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                My Recipes
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="transition-all duration-200 hover:shadow-[var(--shadow-soft)]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            AI-Powered Recipe Generator
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your ingredients into delicious meals with the power of AI.
            Get personalized recipes instantly!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <RecipeGenerator onRecipeGenerated={setGeneratedRecipe} />

          {generatedRecipe && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <RecipeCard recipe={generatedRecipe} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Powered by Lovable AI • Create amazing recipes with AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;