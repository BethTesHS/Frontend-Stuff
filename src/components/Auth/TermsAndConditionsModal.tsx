import React from 'react';
import { Download } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({ isOpen, onClose, onAgree }) => {
  if (!isOpen) {
    return null;
  }

  const handleAgree = () => {
    onAgree();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl h-5/6 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Terms & Conditions</h2>
          <div className="flex items-center gap-4">
            <a
              href="/document/Homed Website Privacy Policy V1.pdf"
              download="Homed-Privacy-Policy.pdf"
              className="text-gray-500 hover:text-gray-800"
              title="Download PDF"
            >
              <Download size={20} />
            </a>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
          <iframe
            src="/document/Homed Website Privacy Policy V1.pdf#toolbar=0"
            width="100%"
            height="100%"
            title="Terms & Conditions"
          ></iframe>
        </div>
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={handleAgree}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;
