import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, Trash2, Star, X, Loader2 } from 'lucide-react';
import { propertyApi } from '@/services/api';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://api.homeduk.property';
const BASE_URL = API_BASE_URL.replace('/api', '');

const PROPERTY_TYPES = ['detached', 'semi-detached', 'terraced', 'flat', 'bungalow', 'cottage', 'studio', 'other'];
const LISTING_TYPES = ['sale', 'rent'];
const ENERGY_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const COUNCIL_TAX_BANDS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const TENURE_TYPES = ['freehold', 'leasehold', 'share of freehold'];

interface PropertyImage {
  id: number;
  url: string;
  is_primary: boolean;
  alt_text?: string;
}

interface EditFormData {
  title: string;
  description: string;
  price: number | '';
  bedrooms: number | '';
  bathrooms: number | '';
  receptions: number | '';
  property_type: string;
  listing_type: string;
  street: string;
  city: string;
  postcode: string;
  county: string;
  tenure: string;
  square_footage: number | '';
  land_size: number | '';
  year_built: number | '';
  energy_rating: string;
  council_tax_band: string;
}

interface EditPropertyDialogProps {
  property: any | null;
  open: boolean;
  onClose: () => void;
  onSaved?: (updated: any) => void;
}

export const EditPropertyDialog = ({ property, open, onClose, onSaved }: EditPropertyDialogProps) => {
  const [formData, setFormData] = useState<EditFormData>({
    title: '', description: '', price: '', bedrooms: '', bathrooms: '', receptions: '',
    property_type: '', listing_type: '', street: '', city: '', postcode: '', county: '',
    tenure: '', square_footage: '', land_size: '', year_built: '', energy_rating: '', council_tax_band: '',
  });
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !property) return;

    setFormData({
      title: property.title ?? '',
      description: property.description ?? '',
      price: property.price ?? '',
      bedrooms: property.bedrooms ?? '',
      bathrooms: property.bathrooms ?? '',
      receptions: property.receptions ?? '',
      property_type: property.property_type ?? '',
      listing_type: property.listing_type ?? '',
      street: property.street ?? '',
      city: property.city ?? '',
      postcode: property.postcode ?? '',
      county: property.county ?? '',
      tenure: property.tenure ?? '',
      square_footage: property.square_footage ?? '',
      land_size: property.land_size ?? '',
      year_built: property.year_built ?? '',
      energy_rating: property.energy_rating ?? '',
      council_tax_band: property.council_tax_band ?? '',
    });
    setNewImageFiles([]);

    setImagesLoading(true);
    propertyApi.getPropertyImages({ propertyId: property.id, perPage: 50 })
      .then(res => {
        if (res.success && res.data) {
          setExistingImages(
            (res.data.images ?? []).map((img: any) => ({
              id: img.id ?? img.image_id,
              url: img.url ?? img.image_url ?? img.file_url ?? '',
              is_primary: img.is_primary ?? false,
              alt_text: img.alt_text ?? '',
            }))
          );
        } else {
          setExistingImages([]);
        }
      })
      .catch(() => setExistingImages([]))
      .finally(() => setImagesLoading(false));
  }, [open, property]);

  const handleClose = () => {
    setExistingImages([]);
    setNewImageFiles([]);
    onClose();
  };

  const setStr = (key: keyof EditFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const setNum = (key: keyof EditFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormData(prev => ({ ...prev, [key]: e.target.value === '' ? '' : Number(e.target.value) }));

  const setSel = (key: keyof EditFormData) =>
    (value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!property) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      const strKeys: (keyof EditFormData)[] = [
        'title', 'description', 'property_type', 'listing_type',
        'street', 'city', 'postcode', 'county', 'tenure', 'energy_rating', 'council_tax_band',
      ];
      const numKeys: (keyof EditFormData)[] = [
        'price', 'bedrooms', 'bathrooms', 'receptions', 'square_footage', 'land_size', 'year_built',
      ];
      for (const k of strKeys) if (formData[k] !== '') payload[k] = formData[k];
      for (const k of numKeys) if (formData[k] !== '') payload[k] = Number(formData[k]);
      payload.address = [payload.street, payload.city, payload.county, payload.postcode]
        .filter(Boolean).join(', ');

      const res = await propertyApi.updateProperty(property.id, payload);
      if (!res.success) {
        toast.error(res.error || 'Failed to update property');
        setSaving(false);
        return;
      }
      toast.success('Property updated');
      onSaved?.({ ...property, ...payload, ...(res.data?.property ?? {}) });

      if (newImageFiles.length > 0) {
        setUploadingImages(true);
        const hasPrimary = existingImages.some(i => i.is_primary);
        for (let i = 0; i < newImageFiles.length; i++) {
          try {
            const imgRes = await propertyApi.uploadPropertyImage(property.id, newImageFiles[i], {
              isPrimary: !hasPrimary && i === 0,
            });
            if (imgRes.success && imgRes.data?.image) {
              const img = imgRes.data.image;
              setExistingImages(prev => [
                ...prev,
                {
                  id: img.id ?? img.image_id,
                  url: img.url ?? img.image_url ?? img.file_url ?? '',
                  is_primary: img.is_primary ?? false,
                },
              ]);
            }
          } catch (err) {
            console.error(`Image upload failed:`, err);
            toast.error(`Failed to upload "${newImageFiles[i].name}"`);
          }
        }
        setNewImageFiles([]);
        setUploadingImages(false);
        toast.success('Images uploaded');
      }

      handleClose();
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update property');
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      const res = await propertyApi.deletePropertyImage(imageId);
      if (res.success) {
        setExistingImages(prev => prev.filter(i => i.id !== imageId));
        toast.success('Image removed');
      } else {
        toast.error('Failed to remove image');
      }
    } catch {
      toast.error('Failed to remove image');
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      const res = await propertyApi.setPrimaryImage(imageId);
      if (res.success) {
        setExistingImages(prev => prev.map(i => ({ ...i, is_primary: i.id === imageId })));
        toast.success('Primary image updated');
      } else {
        toast.error('Failed to set primary image');
      }
    } catch {
      toast.error('Failed to set primary image');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/'));
    setNewImageFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={isOpen => { if (!isOpen) handleClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="address" className="flex-1">Address</TabsTrigger>
            <TabsTrigger value="images" className="flex-1">
              Images{existingImages.length > 0 ? ` (${existingImages.length})` : ''}
            </TabsTrigger>
          </TabsList>

          {/* Details */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="ep-title">Title *</Label>
              <Input id="ep-title" value={formData.title} onChange={setStr('title')} />
            </div>
            <div>
              <Label htmlFor="ep-desc">Description</Label>
              <Textarea id="ep-desc" value={formData.description} onChange={setStr('description')} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ep-price">Price (£) *</Label>
                <Input id="ep-price" type="number" value={formData.price} onChange={setNum('price')} />
              </div>
              <div>
                <Label>Listing Type</Label>
                <Select value={formData.listing_type} onValueChange={setSel('listing_type')}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ep-bed">Bedrooms</Label>
                <Input id="ep-bed" type="number" min={0} value={formData.bedrooms} onChange={setNum('bedrooms')} />
              </div>
              <div>
                <Label htmlFor="ep-bath">Bathrooms</Label>
                <Input id="ep-bath" type="number" min={0} value={formData.bathrooms} onChange={setNum('bathrooms')} />
              </div>
              <div>
                <Label htmlFor="ep-rec">Receptions</Label>
                <Input id="ep-rec" type="number" min={0} value={formData.receptions} onChange={setNum('receptions')} />
              </div>
            </div>
            <div>
              <Label>Property Type</Label>
              <Select value={formData.property_type} onValueChange={setSel('property_type')}>
                <SelectTrigger><SelectValue placeholder="Select property type" /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tenure</Label>
                <Select value={formData.tenure} onValueChange={setSel('tenure')}>
                  <SelectTrigger><SelectValue placeholder="Select tenure" /></SelectTrigger>
                  <SelectContent>
                    {TENURE_TYPES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ep-sqft">Floor Area (sq ft)</Label>
                <Input id="ep-sqft" type="number" min={0} value={formData.square_footage} onChange={setNum('square_footage')} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ep-yr">Year Built</Label>
                <Input id="ep-yr" type="number" min={1800} max={new Date().getFullYear()} value={formData.year_built} onChange={setNum('year_built')} />
              </div>
              <div>
                <Label>Energy Rating</Label>
                <Select value={formData.energy_rating} onValueChange={setSel('energy_rating')}>
                  <SelectTrigger><SelectValue placeholder="Rating" /></SelectTrigger>
                  <SelectContent>
                    {ENERGY_RATINGS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Council Tax Band</Label>
                <Select value={formData.council_tax_band} onValueChange={setSel('council_tax_band')}>
                  <SelectTrigger><SelectValue placeholder="Band" /></SelectTrigger>
                  <SelectContent>
                    {COUNCIL_TAX_BANDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Address */}
          <TabsContent value="address" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="ep-street">Street Address</Label>
              <Input id="ep-street" value={formData.street} onChange={setStr('street')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ep-city">City</Label>
                <Input id="ep-city" value={formData.city} onChange={setStr('city')} />
              </div>
              <div>
                <Label htmlFor="ep-county">County</Label>
                <Input id="ep-county" value={formData.county} onChange={setStr('county')} />
              </div>
            </div>
            <div>
              <Label htmlFor="ep-post">Postcode</Label>
              <Input id="ep-post" value={formData.postcode} onChange={setStr('postcode')} className="max-w-xs" />
            </div>
          </TabsContent>

          {/* Images */}
          <TabsContent value="images" className="space-y-4 mt-4">
            {imagesLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />Loading images…
              </div>
            ) : existingImages.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Current Images ({existingImages.length})
                  <span className="text-xs text-gray-500 ml-2">— hover to manage</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {existingImages.map(img => {
                    const src = img.url.startsWith('http') ? img.url : `${BASE_URL}${img.url}`;
                    return (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50">
                        <img src={src} alt={img.alt_text || ''} className="w-full h-28 object-cover" onError={e => { e.currentTarget.src = '/placeholder.svg'; }} />
                        {img.is_primary && (
                          <div className="absolute top-1 left-1 bg-yellow-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PRIMARY</div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!img.is_primary && (
                            <button type="button" onClick={() => handleSetPrimary(img.id)} title="Set as primary" className="p-1.5 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full">
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button type="button" onClick={() => handleDeleteImage(img.id)} title="Delete" className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No images uploaded yet.</p>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add New Images</p>
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => imageInputRef.current?.click()}
              >
                <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Click to select images</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP (max 5 MB each)</p>
                <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />
              </div>

              {newImageFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {newImageFiles.map((file, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-28 object-cover" />
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded">NEW</div>
                      <button
                        type="button"
                        onClick={() => setNewImageFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="p-1.5 bg-white"><p className="text-[10px] text-gray-500 truncate">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || uploadingImages}>
            {saving || uploadingImages
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
              : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
