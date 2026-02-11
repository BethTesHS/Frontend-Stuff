
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Share, Facebook, Instagram, MessageCircle, Copy, Check } from 'lucide-react';
import { Property } from '@/types';

interface SharePropertyPopoverProps {
  property: Property;
  children: React.ReactNode;
}

const SharePropertyPopover = ({ property, children }: SharePropertyPopoverProps) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const propertyUrl = `${window.location.origin}/properties/${property.id}`;
  const shareText = `Check out this amazing ${property.type} for ${property.listingType} - ${property.title} at £${property.price.toLocaleString()}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setOpen(false);
  };

  const handleInstagramShare = () => {
    // Instagram doesn't support direct URL sharing, so we copy the link and open Instagram
    handleCopyLink();
    window.open('https://www.instagram.com/', '_blank');
    setOpen(false);
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${propertyUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="center">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-1">Share Property</h3>
            <p className="text-sm text-gray-600">Share this property with your network</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-20 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              onClick={handleFacebookShare}
            >
              <Facebook className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium">Facebook</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-20 hover:bg-pink-50 hover:border-pink-200 transition-colors"
              onClick={handleInstagramShare}
            >
              <Instagram className="w-6 h-6 text-pink-600" />
              <span className="text-xs font-medium">Instagram</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-20 hover:bg-green-50 hover:border-green-200 transition-colors"
              onClick={handleWhatsAppShare}
            >
              <MessageCircle className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium">WhatsApp</span>
            </Button>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 text-sm text-gray-600 bg-gray-50 rounded-md px-3 py-2 truncate">
                {propertyUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className={`flex items-center gap-1 ${copied ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SharePropertyPopover;
