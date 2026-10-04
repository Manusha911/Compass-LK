import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList } from "@/components/ReviewsList";
import { Separator } from "@/components/ui/separator";

type Destination = {
  id: string;
  name: string;
  description: string | null;
  location_lat: number | null;
  location_lng: number | null;
  opening_hours: string | null;
  average_rating: number;
  total_reviews: number;
  provinces: {
    name: string;
  };
  destination_categories: Array<{
    categories: {
      name: string;
      icon: string | null;
    };
  }>;
  destination_images: Array<{
    image_url: string;
    caption: string | null;
    is_primary: boolean;
  }>;
};

const DestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchDestination();
    }
  }, [id]);

  const fetchDestination = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("destinations")
        .select(`
          *,
          provinces (name),
          destination_categories (
            categories (name, icon)
          ),
          destination_images (image_url, caption, is_primary)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setDestination(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load destination details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-muted-foreground">Destination not found</p>
          <Link to="/destinations">
            <Button variant="outline" className="mt-4">
              Back to Destinations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage = destination.destination_images.find((img) => img.is_primary);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Hero Image */}
        <div className="relative h-96 bg-gradient-tropical">
          {primaryImage && (
            <img
              src={primaryImage.image_url}
              alt={destination.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 -mt-32 relative z-10 pb-12">
          <Link to="/destinations">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Destinations
            </Button>
          </Link>

          <Card className="shadow-card">
            <CardContent className="p-8">
              <div className="mb-6">
                <h1 className="text-4xl font-bold mb-3">{destination.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{destination.provinces.name}</span>
                  </div>
                  {destination.opening_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{destination.opening_hours}</span>
                    </div>
                  )}
                  {destination.total_reviews > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-secondary fill-secondary" />
                      <span className="font-semibold text-foreground">
                        {destination.average_rating.toFixed(1)}
                      </span>
                      <span>({destination.total_reviews} reviews)</span>
                    </div>
                  )}
                </div>
              </div>

              {destination.destination_categories.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {destination.destination_categories.map((cat, idx) => (
                      <Badge key={idx} variant="secondary">
                        {cat.categories.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {destination.description && (
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold mb-3">About</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {destination.description}
                  </p>
                </div>
              )}

              {destination.destination_images.length > 1 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {destination.destination_images
                      .filter((img) => !img.is_primary)
                      .map((image, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={image.image_url}
                            alt={image.caption || `Gallery image ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <Separator className="my-8" />

              {/* Reviews Section */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Reviews & Ratings</h2>
                
                <div className="mb-8">
                  <ReviewForm
                    destinationId={id}
                    existingReview={editingReview}
                    onSuccess={() => {
                      setEditingReview(null);
                      fetchDestination();
                    }}
                  />
                </div>

                <ReviewsList
                  destinationId={id}
                  onEditReview={(review) => setEditingReview(review)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
