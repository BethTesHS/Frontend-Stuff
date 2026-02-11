
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, MapPin, Video, Home } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { buyerApi } from '@/services/buyerApi';
import { toast } from 'sonner';

interface ScheduleViewingDialogProps {
  children: React.ReactNode;
  propertyId: number;
  propertyTitle?: string;
  propertyAddress?: string;
  onSuccess?: () => void;
}

const ScheduleViewingDialog = ({ children, propertyId, propertyTitle, propertyAddress, onSuccess }: ScheduleViewingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    timeSlot: '',
    viewingType: 'in_person' as 'in_person' | 'virtual' | 'video_call',
    notes: ''
  });

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const viewingTypes = [
    { value: 'in_person', label: 'In-Person Viewing', icon: Home },
    { value: 'virtual', label: 'Virtual Tour', icon: Video },
    { value: 'video_call', label: 'Video Call', icon: Video }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !formData.timeSlot) {
      toast.error('Please select a date and time');
      return;
    }

    if (!propertyId || isNaN(propertyId)) {
      toast.error('Invalid property ID');
      console.error('Property ID is missing or invalid:', propertyId);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Scheduling viewing with data:', {
        property_id: propertyId,
        viewing_date: format(date, 'yyyy-MM-dd'),
        viewing_time: formData.timeSlot,
        viewing_type: formData.viewingType,
        notes: formData.notes || undefined
      });

      const response = await buyerApi.scheduleViewing({
        property_id: propertyId,
        viewing_date: format(date, 'yyyy-MM-dd'),
        viewing_time: formData.timeSlot,
        viewing_type: formData.viewingType,
        notes: formData.notes || undefined
      });

      if (response.success) {
        toast.success('Viewing scheduled successfully! The property owner will be notified.');

        // Reset form and close dialog
        setFormData({
          timeSlot: '',
          viewingType: 'in_person',
          notes: ''
        });
        setDate(undefined);
        setOpen(false);

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(response.error || 'Failed to schedule viewing');
      }
    } catch (error: any) {
      console.error('Error scheduling viewing:', error);
      toast.error(error.message || 'An error occurred while scheduling the viewing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="w-6 h-6 mr-3 text-green-600" />
            Schedule Property Viewing
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Information Section */}
          {(propertyTitle || propertyAddress) && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Property Details
              </h3>
              {propertyTitle && (
                <p className="text-sm font-medium text-gray-800">{propertyTitle}</p>
              )}
              {propertyAddress && (
                <p className="text-sm text-gray-600">{propertyAddress}</p>
              )}
            </div>
          )}

          {/* Viewing Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Viewing Type *
            </Label>
            <Select value={formData.viewingType} onValueChange={(value: any) => handleInputChange('viewingType', value)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select viewing type" />
              </SelectTrigger>
              <SelectContent>
                {viewingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center">
                      <type.icon className="w-4 h-4 mr-2" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Information Section */}
          <div className="bg-green-50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-green-600" />
              Schedule Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Viewing Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-11 justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Time Slot *
                </Label>
                <Select value={formData.timeSlot} onValueChange={(value) => handleInputChange('timeSlot', value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any special requirements or notes about the viewing..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="px-6"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 bg-green-600 hover:bg-green-700"
              disabled={!date || !formData.timeSlot || isSubmitting}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Viewing'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleViewingDialog;
