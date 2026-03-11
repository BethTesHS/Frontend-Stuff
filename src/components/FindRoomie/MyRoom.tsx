import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, DollarSign, Edit2, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface MyRoomData {
  title: string;
  description: string;
  location: string;
  price: string;
  roomType: string;
  amenities: string[];
  maxOccupants: number;
  images: string[];
  isPublished: boolean;
}

export function MyRoom() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasListing, setHasListing] = useState(false);

  const [roomData, setRoomData] = useState<MyRoomData>({
    title: "",
    description: "",
    location: "",
    price: "",
    roomType: "shared",
    amenities: [],
    maxOccupants: 1,
    images: [],
    isPublished: false,
  });

  const [editData, setEditData] = useState<MyRoomData>(roomData);

  const amenitiesOptions = [
    "WiFi",
    "Kitchen",
    "Bathroom",
    "Balcony",
    "AC",
    "Heating",
    "Parking",
    "Laundry",
    "Gaming Setup",
    "Home Theater",
  ];

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(roomData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(roomData);
  };

  const handleInputChange = (field: keyof MyRoomData, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setEditData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSave = async () => {
    if (!editData.title || !editData.location || !editData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setRoomData(editData);
      setHasListing(true);
      setIsEditing(false);
      toast.success("Room listing saved successfully!");
    } catch (error) {
      toast.error("Failed to save room listing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateListing = () => {
    setHasListing(false);
    setEditData({
      title: "",
      description: "",
      location: "",
      price: "",
      roomType: "shared",
      amenities: [],
      maxOccupants: 1,
      images: [],
      isPublished: false,
    });
    setIsEditing(true);
  };

  if (!hasListing && !isEditing) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Room Listing
          </h1>

          <Card className="p-12 text-center">
            <div className="mb-6">
              <Plus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Room Listing Yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a listing to let potential roommates know about your available room or space.
              </p>
              <Button
                onClick={handleCreateListing}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Plus className="w-4 h-4 mr-2" /> Create Room Listing
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Room Listing
          </h1>
          {!isEditing && (
            <Button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Edit2 className="w-4 h-4 mr-2" /> Edit Listing
            </Button>
          )}
        </div>

        <Card className="p-8">
          {isEditing ? (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Listing Title *
                </label>
                <Input
                  value={editData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Cozy Room in Downtown"
                />
              </div>

              {/* Location and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <Input
                    value={editData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="City, Neighborhood"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range *
                  </label>
                  <Input
                    value={editData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="e.g., $900 - $1200"
                  />
                </div>
              </div>

              {/* Room Type and Occupants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room Type
                  </label>
                  <select
                    value={editData.roomType}
                    onChange={(e) => handleInputChange("roomType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="single">Single Room</option>
                    <option value="shared">Shared Room</option>
                    <option value="apartment">Full Apartment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Occupants
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={editData.maxOccupants}
                    onChange={(e) =>
                      handleInputChange("maxOccupants", parseInt(e.target.value))
                    }
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your room, house rules, what you're looking for in a roommate..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenitiesOptions.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editData.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {amenity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end border-t border-gray-200 dark:border-gray-700 pt-6">
                <Button onClick={handleCancel} variant="outline">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" /> Save Listing
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Listing Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {roomData.title}
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    {roomData.location}
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    {roomData.price}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    roomData.isPublished
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}>
                    {roomData.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Room Type
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">
                    {roomData.roomType}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Max Occupants
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {roomData.maxOccupants} person(s)
                  </p>
                </div>
              </div>

              {/* Description */}
              {roomData.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {roomData.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {roomData.amenities.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {roomData.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
