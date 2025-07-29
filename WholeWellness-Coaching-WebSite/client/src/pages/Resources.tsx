import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, Play, FileText, Headphones } from "lucide-react";
import type { Resource } from "@shared/schema";

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const filteredResources = resources?.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || resource.type === filterType;
    const matchesCategory = filterCategory === "all" || resource.category === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  }) || [];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "article": return <FileText className="w-6 h-6" />;
      case "video": return <Play className="w-6 h-6" />;
      case "worksheet": return <Download className="w-6 h-6" />;
      case "podcast": return <Headphones className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "article": return "bg-blue-100 text-blue-800";
      case "video": return "bg-green-100 text-green-800";
      case "worksheet": return "bg-purple-100 text-purple-800";
      case "podcast": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const categories = Array.from(new Set(resources?.map(r => r.category) || []));
  const types = Array.from(new Set(resources?.map(r => r.type) || []));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-secondary mb-6">
            Resource Library
          </h1>
          <p className="text-xl text-gray-700 leading-relaxed">
            Access our comprehensive collection of articles, videos, worksheets, and podcasts 
            designed to support your personal growth journey.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}s
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Resource Tabs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-5 mb-8">
              <TabsTrigger value="all">All Resources</TabsTrigger>
              <TabsTrigger value="article">Articles</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
              <TabsTrigger value="worksheet">Worksheets</TabsTrigger>
              <TabsTrigger value="podcast">Podcasts</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ResourceGrid resources={filteredResources} isLoading={isLoading} />
            </TabsContent>
            
            {types.map(type => (
              <TabsContent key={type} value={type}>
                <ResourceGrid 
                  resources={filteredResources.filter(r => r.type === type)} 
                  isLoading={isLoading} 
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-4">Featured This Month</h2>
            <p className="text-lg text-gray-600">
              Hand-picked resources from our experts to help you on your journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources?.slice(0, 3).map((resource) => (
              <Card key={resource.id} className="bg-gradient-to-br from-primary to-secondary text-white">
                <CardContent className="p-8">
                  <div className="bg-white text-primary rounded-full p-3 w-12 h-12 flex items-center justify-center mb-6">
                    {getResourceIcon(resource.type)}
                  </div>
                  <Badge className="bg-white text-primary mb-4">
                    Featured
                  </Badge>
                  <h3 className="text-xl font-semibold mb-4">{resource.title}</h3>
                  <p className="opacity-90 mb-6">{resource.content}</p>
                  <Button className="bg-white text-primary hover:bg-gray-100">
                    Access Resource
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-warm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Our coaches are here to help you find the right resources and support for your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-secondary">
              Request a Resource
            </Button>
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ResourceGridProps {
  resources: Resource[];
  isLoading: boolean;
}

function ResourceGrid({ resources, isLoading }: ResourceGridProps) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "article": return <FileText className="w-6 h-6" />;
      case "video": return <Play className="w-6 h-6" />;
      case "worksheet": return <Download className="w-6 h-6" />;
      case "podcast": return <Headphones className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "article": return "bg-blue-100 text-blue-800";
      case "video": return "bg-green-100 text-green-800";
      case "worksheet": return "bg-purple-100 text-purple-800";
      case "podcast": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-xl mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Search className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No resources found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <Card key={resource.id} className="bg-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-primary text-white rounded-xl p-3 mr-4">
                {getResourceIcon(resource.type)}
              </div>
              <div className="flex-1">
                <Badge className={getTypeColor(resource.type)}>
                  {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                </Badge>
                <div className="text-sm text-gray-500 mt-1">{resource.category}</div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-secondary mb-3">{resource.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-3">{resource.content}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {resource.isFree && (
                  <Badge variant="secondary" className="text-green-700 bg-green-100">
                    Free
                  </Badge>
                )}
              </div>
              <Button size="sm" className="bg-primary hover:bg-secondary">
                Access
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
