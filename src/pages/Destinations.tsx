import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Province = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

type Destination = {
  id: string;
  name: string;
  description: string | null;
  province_id: string;
  location_lat: number | null;
  location_lng: number | null;
  average_rating: number;
  total_reviews: number;
  provinces: Province;
};

const Destinations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProvinces();
    fetchDestinations();
  }, []);

  const fetchProvinces = async () => {
    try {
      const { data, error } = await supabase
        .from("provinces")
        .select("*")
        .order("name");

      if (error) throw error;
      setProvinces(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load provinces",
        variant: "destructive",
      });
    }
  };

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("destinations")
        .select(`
          *,
          provinces (*)
        `)
        .order("name");

      if (error) throw error;
      setDestinations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load destinations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch = dest.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesProvince = selectedProvince
      ? dest.province_id === selectedProvince
      : true;
    return matchesSearch && matchesProvince;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Explore{" "}
              <span className="bg-gradient-tropical bg-clip-text text-transparent">
                Sri Lanka
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover amazing destinations across all provinces
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
            </div>
          </div>

          {/* Province Filter */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Filter by Province</h2>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedProvince === null ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setSelectedProvince(null)}
              >
                All Provinces
              </Badge>
              {provinces.map((province) => (
                <Badge
                  key={province.id}
                  variant={selectedProvince === province.id ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => setSelectedProvince(province.id)}
                >
                  {province.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Destinations Content */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading destinations...</p>
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No destinations found. Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((destination) => (
                <Link key={destination.id} to={`/destination/${destination.id}`}>
                  <Card className="overflow-hidden hover:shadow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    <div className="h-48 bg-gradient-tropical" />
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">
                        {destination.name}
                      </h3>
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{destination.provinces.name}</span>
                      </div>
                      {destination.description && (
                        <p className="text-muted-foreground line-clamp-2 mb-3">
                          {destination.description}
                        </p>
                      )}
                      {destination.total_reviews > 0 && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-secondary fill-secondary" />
                          <span className="font-semibold">
                            {destination.average_rating.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({destination.total_reviews} reviews)
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Destinations;
