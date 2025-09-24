"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@woothomes/store";
import { axiosBase } from "@woothomes/lib";
// import { toast } from "sonner";
import {
  Card,
  CardContent,
} from "@woothomes/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@woothomes/components/ui/select";
import { Button } from "@woothomes/components/ui/button";
import { Skeleton } from "@woothomes/components/ui/skeleton";
import { SafeImage } from "@woothomes/components/ui/SafeImage";
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  User, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Building
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@woothomes/components/ui/dialog";
import { Badge } from "@woothomes/components/ui/badge";
import { Input } from "@woothomes/components/ui/input";

interface Property {
  id: string;
  title: string;
  image_url?: string;
  images?: { image_url: string }[];
}

interface Offer {
  id: string;
  property_id: string;
  property: Property;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  proposed_price: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  counter_price?: number;
  created_at: string;
  check_in: string;
  check_out: string;
}

// Add fallback image constants
const FALLBACK_PROPERTY_IMAGE = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";

// // Helper function to get initials from name
// const getInitials = (name: string) => {
//   return name
//     .split(' ')
//     .map(word => word[0])
//     .join('')
//     .toUpperCase()
//     .slice(0, 2);
// };

export default function HostOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeStatus, setActiveStatus] = useState("pending");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuthStore((state) => state);
  const [counterModal, setCounterModal] = useState<{offerId: string, open: boolean}>({offerId: '', open: false});
  const [rejectModal, setRejectModal] = useState<{offerId: string, open: boolean}>({offerId: '', open: false});
  const [counterOffer, setCounterOffer] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch offers based on selected property and status
  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      // First verify that the selected property belongs to the current user
      if (selectedProperty !== "all") {
        const isUserProperty = properties.some(prop => prop.id === selectedProperty);
        if (!isUserProperty) {
          console.error("Invalid property selection");
          setOffers([]);
          return;
        }
      }

      const params: { status: string, count_only: boolean, property_id?: string } = { 
        status: activeStatus,
        count_only: false
      };

      // Only include property_id if a specific property is selected
      if (selectedProperty !== "all") {
        params.property_id = selectedProperty;
      }
      
      const response = await axiosBase.get('/offers/host', { params });

      console.log(`Response: ${response.data.data}`);
      if (!response.data?.data) {
        throw new Error('Invalid response format');
      }

      // Additional client-side filtering to ensure we only show offers for user's properties
      const userPropertyIds = properties.map(prop => prop.id);
      const filteredOffers = Array.isArray(response.data.data) 
        ? response.data.data.filter((offer: Offer) => userPropertyIds.includes(offer.property_id))
        : [];

      console.log('Filtered offers:', filteredOffers);

      setOffers(filteredOffers);
    } catch (error: unknown) {
      console.error('Error fetching offers:', error);
      console.error(error instanceof Error ? error.message : 'Failed to load offers');
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch host's properties
  const fetchProperties = async () => {
    try {
      const response = await axiosBase.get('/host/properties');
      if (
        !response ||
        !response.data ||
        response.data.success !== true ||
        !response.data.data ||
        !Array.isArray(response.data.data.properties)
      ) {
        console.error('Invalid API response structure:', response);
        throw new Error('Invalid API response structure');
      }
      const propertiesData = response?.data?.data?.properties;
      
      // Validate each property has required fields
      const validProperties = propertiesData.filter((property: { id?: string; title?: string }) => {
        const isValid = property && typeof property === 'object' && property.id && property.title;
        if (!isValid) {
          console.warn('Invalid property found:', property);
        }
        return isValid;
      });

      if (validProperties.length === 0) {
        console.warn('No valid properties found in response');
      }

      console.log('Valid properties:', validProperties);
      setProperties(validProperties);
      
      // If there's only one property, select it by default
      if (validProperties.length === 1) {
        setSelectedProperty(validProperties[0].id);
      } else if (validProperties.length > 0) {
        // If multiple properties exist, default to "all"
        setSelectedProperty("all");
      } else {
        // If no valid properties, set to "all"
        setSelectedProperty("all");
      }
    } catch (error: unknown) {
      console.error('Error fetching properties:', error);
      const errorMessage =
        (error && error instanceof Error && error.message) ||
        'Failed to load properties';
      console.error(errorMessage as string);
      setProperties([]);
      setSelectedProperty("all");
    }
  };

  // Counter Modal Submit
  const handleCounterSubmit = async () => {
    setFormError('');
    if (!counterOffer || isNaN(Number(counterOffer)) || Number(counterOffer) < 0) {
      setFormError('Counter offer must be a number greater than or equal to 0.');
      return;
    }
    if (counterMessage.length > 1000) {
      setFormError('Message must be less than 1000 characters.');
      return;
    }
    await handleOfferResponse(counterModal.offerId, 'counter', Number(counterOffer), counterMessage);
    setCounterModal({offerId: '', open: false});
    setCounterOffer('');
    setCounterMessage('');
  };

  // Reject Modal Submit
  const handleRejectSubmit = async () => {
    setFormError('');
    if (!rejectionReason || rejectionReason.length > 1000) {
      setFormError('Reason is required and must be less than 1000 characters.');
      return;
    }
    await handleOfferResponse(rejectModal.offerId, 'reject', undefined, undefined, rejectionReason);
    setRejectModal({offerId: '', open: false});
    setRejectionReason('');
  };

  // Update handleOfferResponse to accept extra params
  const handleOfferResponse = async (
    offerId: string,
    action: 'accept' | 'reject' | 'counter',
    counterPrice?: number,
    counterMessage?: string,
    rejectionReason?: string
  ) => {
    setIsProcessing(offerId);
    try {
      const endpoint = `/offers/${offerId}/${action}`;
      const data: { counter_offer?: number, counter_message?: string, reason?: string } = {};
      if (action === 'counter') {
        data.counter_offer = counterPrice;
        if (counterMessage) data.counter_message = counterMessage;
      }
      if (action === 'reject' && rejectionReason) {
        data.reason = rejectionReason;
      }
      await axiosBase.post(endpoint, data);
      // toast.success(`Offer ${action}ed successfully`);
      fetchOffers();
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : 'Failed to perform offer action');
    } finally {
      setIsProcessing(null);
    }
  };

  // Fetch properties only on mount or when user changes
  useEffect(() => {
    let isMounted = true;
    const loadProperties = async () => {
      setIsLoading(true);
      try {
        await fetchProperties();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (user?.roles?.includes('host')) {
      loadProperties();
    }
    return () => { isMounted = false; };
  }, [user]);

  // Fetch offers only when dependencies change and properties are loaded
  useEffect(() => {
    if (user?.roles?.includes('host') && properties.length > 0) {
      fetchOffers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProperty, activeStatus, properties.length]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter offers based on search term
  const filteredOffers = offers.filter(offer =>
    offer.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status configuration
  const statusConfig = {
    pending: { 
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Pending',
      icon: Clock,
      count: offers.filter(o => o.status === 'pending').length
    },
    accepted: { 
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Accepted',
      icon: CheckCircle,
      count: offers.filter(o => o.status === 'accepted').length
    },
    rejected: { 
      color: 'bg-red-50 text-red-700 border-red-200',
      label: 'Rejected',
      icon: XCircle,
      count: offers.filter(o => o.status === 'rejected').length
    },
    countered: { 
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Countered',
      icon: RefreshCw,
      count: offers.filter(o => o.status === 'countered').length
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge 
        variant="secondary" 
        className={`${config.color} border font-medium text-xs px-2 py-1`}
      >
        {config.label}
      </Badge>
    );
  };

  // Skeleton for header, select, tabs, and cards
  const renderSkeleton = () => (
    <div className="max-w-7xl mx-auto" aria-busy="true" aria-label="Loading offers">
        <div className="flex flex-col gap-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 mb-2"><Skeleton className="h-full w-full" /></div>
              <div className="h-4 w-32"><Skeleton className="h-full w-full" /></div>
            </div>
            <div className="h-10 w-72"><Skeleton className="h-full w-full rounded-md" /></div>
          </div>
          {/* Tabs skeleton */}
          <div className="mb-4 flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24"><Skeleton className="h-full w-full rounded-lg" /></div>
            ))}
          </div>
          {/* Card skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-stretch">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="overflow-hidden border border-gray-200 rounded-lg h-full bg-white">
                <div className="aspect-[4/3] relative">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-1/3 mb-2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );

  if (!user?.roles?.includes('host')) {
    return null;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {isLoading ? (
        renderSkeleton()
      ) : (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Property Offers</h1>
                  <p className="text-gray-600 mt-1">
                    {selectedProperty === "all" 
                      ? `Managing ${offers.length} offers across all properties`
                      : `Managing offers for selected property`}
                  </p>
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Property Filter */}
                <div className="flex-1 max-w-xs">
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="bg-white border-gray-200 shadow-sm">
                      <Building className="w-4 h-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="All Properties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div className="flex-1 max-w-xs">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search offers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white border-gray-200 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={status}
                      onClick={() => setActiveStatus(status)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
                        ${activeStatus === status 
                          ? `${config.color} border-current shadow-sm` 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{config.label}</span>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                        {config.count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Offers Grid */}
            {filteredOffers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOffers.map((offer) => (
                  <Card key={offer.id} className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                    {/* Property Image & Info */}
                    <div className="relative h-48">
                      <SafeImage
                        src={offer.property?.images?.[0]?.image_url ?? FALLBACK_PROPERTY_IMAGE}
                        alt={offer.property?.title ?? 'Property image'}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={offer.status} />
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-semibold text-lg line-clamp-1 mb-1">
                          {offer.property.title}
                        </h3>
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(offer.check_in)} - {formatDate(offer.check_out)}</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Guest Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                          {offer.user.avatar ? (
                            <SafeImage
                              src={offer.user.avatar}
                              alt={offer.user.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{offer.user.name}</p>
                          <p className="text-sm text-gray-500">{formatDate(offer.created_at)}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">Proposed Price</span>
                          <span className="text-xl font-bold text-gray-900">
                            ₦{offer.proposed_price.toLocaleString()}
                          </span>
                        </div>
                        {offer.status === 'countered' && offer.counter_price && (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                            <span className="text-blue-600 font-medium">Your Counter</span>
                            <span className="text-lg font-semibold text-blue-600">
                              ₦{offer.counter_price.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      {offer.message && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700 line-clamp-3">{offer.message}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {offer.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleOfferResponse(offer.id, 'accept')}
                            disabled={!!isProcessing}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {isProcessing === offer.id ? '...' : 'Accept'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setCounterModal({offerId: offer.id, open: true})}
                            disabled={!!isProcessing}
                            className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            Counter
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setRejectModal({offerId: offer.id, open: true})}
                            disabled={!!isProcessing}
                            className="border-red-600 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {offer.status === 'countered' && (
                        <Button
                          variant="outline"
                          onClick={() => setCounterModal({offerId: offer.id, open: true})}
                          disabled={!!isProcessing}
                          className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Update Counter Offer
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No {activeStatus} offers found
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm 
                    ? `No offers match your search "${searchTerm}"`
                    : selectedProperty !== "all" 
                      ? "There are no offers for this property yet."
                      : "You haven't received any offers yet."}
                </p>
              </div>
            )}
        </div>
      )}
      {/* Counter Modal */}
      <Dialog open={counterModal.open} onOpenChange={open => setCounterModal({offerId: counterModal.offerId, open})}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Counter Offer
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Propose a different price for this booking request
            </p>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Counter Offer Amount (₦)
              </label>
              <Input
                type="number"
                min={0}
                value={counterOffer}
                onChange={e => setCounterOffer(e.target.value)}
                placeholder="Enter your counter offer"
                className="text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optional)
              </label>
              <textarea
                maxLength={1000}
                value={counterMessage}
                onChange={e => setCounterMessage(e.target.value)}
                placeholder="Explain your counter offer..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                {counterMessage.length}/1000 characters
              </p>
            </div>
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCounterModal({offerId: '', open: false})}
            >
              Cancel
            </Button>
            <Button onClick={handleCounterSubmit} className="bg-blue-600 hover:bg-blue-700">
              Send Counter Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModal.open} onOpenChange={open => setRejectModal({offerId: rejectModal.offerId, open})}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Reject Offer
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Please provide a reason for rejecting this offer
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection
              </label>
              <textarea
                required
                maxLength={1000}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Please explain why you're rejecting this offer..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                {rejectionReason.length}/1000 characters
              </p>
            </div>
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setRejectModal({offerId: '', open: false})}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRejectSubmit} 
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 