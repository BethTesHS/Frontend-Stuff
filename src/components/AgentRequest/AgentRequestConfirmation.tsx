
import { CheckCircle, User, Building, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AgentRequestConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  propertyTitle: string;
  onConfirm: () => void;
}

export const AgentRequestConfirmation = ({
  isOpen,
  onClose,
  agentName,
  propertyTitle,
  onConfirm
}: AgentRequestConfirmationProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Request Sent Successfully!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Status Cards */}
          <div className="space-y-3">
            {/* Property Listed Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Property Listed</h4>
                  <p className="text-sm text-blue-700">
                    "{propertyTitle}" is now live on the platform
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
            </div>

            {/* Agent Request Card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-emerald-900">Agent Request Sent</h4>
                  <p className="text-sm text-emerald-700">
                    Request sent to {agentName}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3 h-3 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-amber-900 mb-1">Verification Required</h4>
                <p className="text-sm text-amber-800">
                  The agent will get access to property management after you verify and approve their request. 
                  You'll be notified when they respond.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={onConfirm}
            className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
