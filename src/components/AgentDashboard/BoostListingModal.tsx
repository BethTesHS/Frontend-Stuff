// src/components/AgentDashboard/BoostListingModal.tsx
import { useState, useEffect } from 'react';
import { Zap, MapPin, CheckCircle, CreditCard, ArrowLeft, Loader2, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { propertyApi } from '@/services/api';
import { toast } from 'sonner';

interface BoostListingModalProps {
  open: boolean;
  onClose: () => void;
}

const BOOST_PLANS = [
  {
    id: 'basic',
    name: 'Basic Boost',
    price: 500,
    duration: '7 days',
    badge: null as string | null,
    badgeColor: '',
    borderSelected: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
    features: ['Priority in search results', 'Bold listing title', '2x more visibility'],
  },
  {
    id: 'standard',
    name: 'Standard Boost',
    price: 1200,
    duration: '14 days',
    badge: 'Popular' as string | null,
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    borderSelected: 'border-purple-500 bg-purple-50 dark:bg-purple-950',
    features: ['Everything in Basic', 'Featured on homepage', 'Email to 500+ leads', '5x more visibility'],
  },
  {
    id: 'premium',
    name: 'Premium Boost',
    price: 2500,
    duration: '30 days',
    badge: 'Best Value' as string | null,
    badgeColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    borderSelected: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    features: ['Everything in Standard', 'Homepage banner placement', 'SMS campaigns', 'Dedicated agent badge', '10x more visibility'],
  },
];

type Step = 'property' | 'plan' | 'payment' | 'success';

interface SlimProperty {
  id: string | number;
  title: string;
  location: string;
  status: string;
  image: string | null;
}

export const BoostListingModal = ({ open, onClose }: BoostListingModalProps) => {
  const [step, setStep] = useState<Step>('property');
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<SlimProperty | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<typeof BOOST_PLANS[0] | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const getLocationString = (p: any): string => {
    const loc = p.location;
    if (loc && typeof loc === 'object') {
      return loc.full || loc.city || loc.street || loc.county || '—';
    }
    if (typeof loc === 'string' && loc.trim()) return loc;
    if (typeof p.address === 'string' && p.address.trim()) return p.address;
    if (typeof p.city === 'string' && p.city.trim()) return p.city;
    return '—';
  };

  const fetchProperties = async () => {
    setLoadingProperties(true);
    try {
      const res = await propertyApi.getMyProperties({ page: 1, per_page: 100 });
      if (res.success && res.data) {
        setProperties(res.data.properties);
      }
    } catch (err) {
      toast.error('Failed to load your properties');
    } finally {
      setLoadingProperties(false);
    }
  };

  useEffect(() => {
    if (open) {
      setStep('property');
      setSelectedProperty(null);
      setSelectedPlan(null);
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardErrors({});
      fetchProperties();
    }
  }, [open]);

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const validateCard = () => {
    const errors: Record<string, string> = {};
    if (!cardName.trim()) errors.name = 'Cardholder name is required';
    if (cardNumber.replace(/\s/g, '').length !== 16) errors.number = 'Enter a valid 16-digit card number';
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      errors.expiry = 'Enter expiry as MM/YY';
    } else {
      const [mm, yy] = cardExpiry.split('/').map(Number);
      const expDate = new Date(2000 + yy, mm - 1);
      if (mm < 1 || mm > 12 || expDate < new Date()) errors.expiry = 'Card has expired or invalid month';
    }
    if (!/^\d{3,4}$/.test(cardCvv)) errors.cvv = 'Enter a valid CVV';
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateCard()) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    setStep('success');
  };

  const stepIndex = ['property', 'plan', 'payment'].indexOf(step);
  const steps = ['Select Property', 'Choose Plan', 'Payment'];

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] flex flex-col gap-0 p-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <Zap className="text-yellow-500" size={18} />
            Boost a Listing
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        {step !== 'success' && (
          <div className="px-6 pt-4 pb-2 shrink-0">
            <div className="flex items-center gap-1">
              {steps.map((label, i) => {
                const isDone = i < stepIndex;
                const isActive = i === stepIndex;
                return (
                  <div key={label} className="flex items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isDone ? 'bg-green-500 text-white' : isActive ? 'bg-yellow-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                      {isDone ? <CheckCircle size={12} /> : i + 1}
                    </div>
                    <span className={`text-xs font-medium ${isActive ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400'}`}>
                      {label}
                    </span>
                    {i < 2 && <div className="w-5 h-px bg-gray-200 dark:bg-gray-700 mx-1" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">

          {/* Step 1 — Select Property */}
          {step === 'property' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose the property you want to boost.</p>

              {loadingProperties ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex gap-3 p-3 border border-gray-100 dark:border-gray-800 rounded-xl">
                      <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Building size={36} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-medium">No properties found</p>
                  <p className="text-sm">List a property first to boost it.</p>
                </div>
              ) : (
                properties.map(p => {
                  const title = p.title || p.name || p.room_title || p.property_title || 'Untitled';
                  const location = getLocationString(p);
                  const image = p.primary_image_url || p.image_url || null;
                  const isSelected = selectedProperty?.id === p.id;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProperty({ id: p.id, title, location, status: p.status || 'unknown', image })}
                      className={`w-full flex items-center gap-3 p-3 border-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                          : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                        {image ? (
                          <img src={image} alt={title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building size={22} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-100 truncate text-sm">{title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-gray-400 shrink-0" />
                          <p className="text-xs text-gray-500 truncate">{location}</p>
                        </div>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {p.status || 'unknown'}
                        </span>
                      </div>
                      {isSelected && <CheckCircle size={18} className="text-yellow-500 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Step 2 — Choose Plan */}
          {step === 'plan' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Boosting: <span className="font-semibold text-gray-800 dark:text-gray-100">{selectedProperty?.title}</span>
              </p>
              {BOOST_PLANS.map(plan => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full text-left border-2 rounded-xl p-4 transition-all relative ${
                      isSelected ? plan.borderSelected : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {plan.badge && (
                      <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full ${plan.badgeColor}`}>
                        {plan.badge}
                      </span>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2 pr-16">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{plan.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{plan.duration}</p>
                      </div>
                      <p className="text-lg font-bold text-gray-800 dark:text-gray-100 shrink-0">
                        KES {plan.price.toLocaleString()}
                      </p>
                    </div>
                    <ul className="space-y-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                          <CheckCircle size={11} className="text-green-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3 — Payment */}
          {step === 'payment' && selectedPlan && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Order Summary</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{selectedPlan.name}</p>
                    <p className="text-xs text-gray-500">{selectedProperty?.title} · {selectedPlan.duration}</p>
                  </div>
                  <p className="font-bold text-gray-800 dark:text-gray-100">KES {selectedPlan.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={15} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Card Details</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Cardholder Name</label>
                  <Input
                    placeholder="John Doe"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className={cardErrors.name ? 'border-red-400' : ''}
                  />
                  {cardErrors.name && <p className="text-xs text-red-500">{cardErrors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Card Number</label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    className={`font-mono tracking-widest ${cardErrors.number ? 'border-red-400' : ''}`}
                    maxLength={19}
                  />
                  {cardErrors.number && <p className="text-xs text-red-500">{cardErrors.number}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600 dark:text-gray-400">Expiry (MM/YY)</label>
                    <Input
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                      className={cardErrors.expiry ? 'border-red-400' : ''}
                      maxLength={5}
                    />
                    {cardErrors.expiry && <p className="text-xs text-red-500">{cardErrors.expiry}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600 dark:text-gray-400">CVV</label>
                    <Input
                      placeholder="123"
                      type="password"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className={cardErrors.cvv ? 'border-red-400' : ''}
                      maxLength={4}
                    />
                    {cardErrors.cvv && <p className="text-xs text-red-500">{cardErrors.cvv}</p>}
                  </div>
                </div>

                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Secured with 256-bit SSL encryption
                </p>
              </div>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">Listing Boosted!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-200">{selectedProperty?.title}</span> is now
                boosted with the{' '}
                <span className="font-medium text-gray-700 dark:text-gray-200">{selectedPlan?.name}</span>.
              </p>
              <p className="text-xs text-gray-400">Your listing will receive increased visibility for {selectedPlan?.duration}.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
          {step === 'property' && (
            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              disabled={!selectedProperty}
              onClick={() => setStep('plan')}
            >
              Continue to Plans
            </Button>
          )}
          {step === 'plan' && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('property')}>
                <ArrowLeft size={14} className="mr-1" /> Back
              </Button>
              <Button
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                disabled={!selectedPlan}
                onClick={() => setStep('payment')}
              >
                Continue to Payment
              </Button>
            </div>
          )}
          {step === 'payment' && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('plan')} disabled={processing}>
                <ArrowLeft size={14} className="mr-1" /> Back
              </Button>
              <Button
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <><Loader2 size={15} className="animate-spin mr-1" /> Processing...</>
                ) : (
                  <><CreditCard size={15} className="mr-1" /> Pay KES {selectedPlan?.price.toLocaleString()}</>
                )}
              </Button>
            </div>
          )}
          {step === 'success' && (
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
