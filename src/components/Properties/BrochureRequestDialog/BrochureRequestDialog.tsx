
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Property } from '@/types';
import BrochureRequestForm from './BrochureRequestForm';
import BrochureSuccessMessage from './BrochureSuccessMessage';

interface BrochureRequestDialogProps {
  children: React.ReactNode;
  property: Property;
}

const BrochureRequestDialog = ({ children, property }: BrochureRequestDialogProps) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsSuccess(true);
    
    // Reset form after 2 seconds and close dialog
    setTimeout(() => {
      setIsSuccess(false);
      setIsOpen(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Property Brochure</DialogTitle>
          <DialogDescription>
            Get detailed information about {property.title}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <BrochureSuccessMessage />
        ) : (
          <BrochureRequestForm 
            property={property} 
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BrochureRequestDialog;
