/**
 * Prepaid Booking Page for Mobile Autoworks NZ
 * Mobile-first, SEO-optimized booking form with Stripe Checkout
 */

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  Clock, 
  Car, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  Zap,
  MapPinned,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import Header from '../../Header';
import Footer from '../../Footer';
import { Helmet } from 'react-helmet-async';

// Form validation schema
const bookingFormSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string().min(10, 'Please enter a complete address'),
  vehicleRego: z.string().min(1, 'Vehicle registration is required').max(10),
  notes: z.string().min(10, 'Please describe the issue or reason for service (min 10 characters)'),
  preferredDate: z.string().min(1, 'Please select a date'),
  preferredTime: z.string().min(1, 'Please select a time'),
  policyAgreed: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  serviceType: z.enum(['mobile_diagnostic', 'pre_purchase_inspection']),
  
  // Diagnostic fields
  wontStart: z.boolean().optional(),
  warningLights: z.boolean().optional(),
  batteryAge: z.string().optional(),
  
  // PPI fields
  sellerAddress: z.string().optional(),
  sellerContact: z.string().optional(),
  urgency: z.enum(['standard', 'urgent', 'flexible']).optional(),
  reportDeliveryEmail: z.string().email().optional().or(z.literal('')),
  
  // Add-ons
  prioritySameDay: z.boolean().optional(),
  outsideAreaSurcharge: z.boolean().optional(),
  afterHours: z.boolean().optional(),
  
  // Weekend
  weekendTimeWindow: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

// Service definitions
const SERVICES = {
  mobile_diagnostic: {
    id: 'mobile_diagnostic',
    name: 'Mobile Diagnostic (incl call-out)',
    description: 'Professional on-site vehicle diagnostic scan and fault finding. Includes call-out fee.',
    price: 140,
  },
  pre_purchase_inspection: {
    id: 'pre_purchase_inspection',
    name: 'Pre-Purchase Inspection',
    description: 'Comprehensive vehicle inspection before purchase. Full mechanical and visual assessment.',
    price: 180,
  },
};

// Add-on definitions
const ADD_ONS = {
  prioritySameDay: {
    id: 'priority_same_day',
    name: 'Priority Same-Day',
    description: 'Jump the queue for same-day service',
    price: 50,
    icon: Zap,
  },
  outsideAreaSurcharge: {
    id: 'outside_area_surcharge',
    name: 'Outside Core Area',
    description: 'Extended travel surcharge',
    price: 30,
    icon: MapPinned,
  },
  afterHours: {
    id: 'after_hours',
    name: 'After-Hours Service',
    description: 'Service outside business hours (requires approval)',
    price: 75,
    icon: Moon,
  },
};

// Time slots
const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'
];

export default function PrepaidBooking() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isWeekend, setIsWeekend] = useState(false);
  const [totalPrice, setTotalPrice] = useState(140);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      serviceType: 'mobile_diagnostic',
      policyAgreed: false,
      wontStart: false,
      warningLights: false,
      prioritySameDay: false,
      outsideAreaSurcharge: false,
      afterHours: false,
      urgency: 'standard',
    },
  });

  const watchServiceType = form.watch('serviceType');
  const watchPrioritySameDay = form.watch('prioritySameDay');
  const watchOutsideArea = form.watch('outsideAreaSurcharge');
  const watchAfterHours = form.watch('afterHours');

  // Calculate total price
  useEffect(() => {
    let total = SERVICES[watchServiceType]?.price || 140;
    if (watchPrioritySameDay) total += ADD_ONS.prioritySameDay.price;
    if (watchOutsideArea) total += ADD_ONS.outsideAreaSurcharge.price;
    if (watchAfterHours) total += ADD_ONS.afterHours.price;
    setTotalPrice(total);
  }, [watchServiceType, watchPrioritySameDay, watchOutsideArea, watchAfterHours]);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const day = date.getDay();
      const weekend = day === 0 || day === 6;
      setIsWeekend(weekend);
      form.setValue('preferredDate', format(date, 'yyyy-MM-dd'));
      if (weekend) {
        form.setValue('preferredTime', '');
      }
    }
  }, [form]);

  // Disable past dates and dates more than 60 days out
  const disabledDays = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    return date < today || date > maxDate;
  }, []);

  // Form submission
  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build add-ons array
      const addOns: string[] = [];
      if (data.prioritySameDay) addOns.push('priority_same_day');
      if (data.outsideAreaSurcharge) addOns.push('outside_area_surcharge');
      if (data.afterHours) addOns.push('after_hours');

      // Build request payload
      const payload = {
        customerName: data.customerName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        vehicleRego: data.vehicleRego.toUpperCase(),
        notes: data.notes,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime || '09:00',
        policyAgreed: data.policyAgreed,
        serviceType: data.serviceType as 'mobile_diagnostic' | 'pre_purchase_inspection',
        addOns: addOns as ('priority_same_day' | 'outside_area_surcharge' | 'after_hours')[],
        weekendTimeWindow: isWeekend ? data.weekendTimeWindow : undefined,
        diagnosticFields: data.serviceType === 'mobile_diagnostic' ? {
          wontStart: data.wontStart || false,
          warningLights: data.warningLights || false,
          batteryAge: data.batteryAge,
        } : undefined,
        ppiFields: data.serviceType === 'pre_purchase_inspection' ? {
          sellerAddress: data.sellerAddress,
          sellerContact: data.sellerContact,
          urgency: data.urgency || 'standard',
          reportDeliveryEmail: data.reportDeliveryEmail || undefined,
        } : undefined,
      };

      // Call API to create checkout session
      const response = await fetch('/api/trpc/prepaidBooking.createCheckoutSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.result?.data?.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.result.data.checkoutUrl;
      } else {
        throw new Error(result.error?.message || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Booking submission error:', error);
      setSubmitError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = SERVICES[watchServiceType];

  return (
    <>
      <Helmet>
        <title>Book Mobile Mechanic Auckland | Pay Online | Mobile Autoworks NZ</title>
        <meta name="description" content="Book your mobile mechanic service in Auckland online. Pay securely upfront with card, Apple Pay, Google Pay, or Afterpay. Same-day diagnostic and pre-purchase inspections available." />
        <meta name="keywords" content="book mobile mechanic auckland, mobile car diagnostic booking, pre purchase inspection auckland, pay online mechanic" />
        <link rel="canonical" href="https://mobileautoworksnz.com/booking" />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Book Your Mobile Mechanic
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-6">
                Professional service at your location. Pay securely online to confirm your booking.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Badge variant="secondary" className="bg-white/20 text-white border-0 px-4 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  Secure Payment
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 px-4 py-2">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Instant Confirmation
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-0 px-4 py-2">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Afterpay Available
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Service Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-blue-600" />
                      Select Your Service
                    </CardTitle>
                    <CardDescription>Choose the service you need</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.values(SERVICES).map((service) => (
                        <label
                          key={service.id}
                          className={cn(
                            "relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all",
                            watchServiceType === service.id
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <input
                            type="radio"
                            value={service.id}
                            {...form.register('serviceType')}
                            className="sr-only"
                          />
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-900">{service.name}</span>
                            <span className="text-xl font-bold text-blue-600">${service.price}</span>
                          </div>
                          <p className="text-sm text-gray-600">{service.description}</p>
                          {watchServiceType === service.id && (
                            <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-blue-600" />
                          )}
                        </label>
                      ))}
                    </div>

                    {/* Conditional Fields for Diagnostic */}
                    {watchServiceType === 'mobile_diagnostic' && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-4">
                        <h4 className="font-medium text-gray-900">Diagnostic Details</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <Label htmlFor="wontStart" className="cursor-pointer">
                              Vehicle won't start?
                            </Label>
                            <Switch
                              id="wontStart"
                              checked={form.watch('wontStart')}
                              onCheckedChange={(checked) => form.setValue('wontStart', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <Label htmlFor="warningLights" className="cursor-pointer">
                              Warning lights on?
                            </Label>
                            <Switch
                              id="warningLights"
                              checked={form.watch('warningLights')}
                              onCheckedChange={(checked) => form.setValue('warningLights', checked)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="batteryAge">Battery age (optional)</Label>
                          <Input
                            id="batteryAge"
                            placeholder="e.g., 2 years, unknown"
                            {...form.register('batteryAge')}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}

                    {/* Conditional Fields for PPI */}
                    {watchServiceType === 'pre_purchase_inspection' && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-4">
                        <h4 className="font-medium text-gray-900">Inspection Details</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="sellerAddress">Seller's address (if different)</Label>
                            <Input
                              id="sellerAddress"
                              placeholder="Where is the vehicle located?"
                              {...form.register('sellerAddress')}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="sellerContact">Seller's contact (optional)</Label>
                            <Input
                              id="sellerContact"
                              placeholder="Phone or email"
                              {...form.register('sellerContact')}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="urgency">Urgency</Label>
                            <Select
                              value={form.watch('urgency')}
                              onValueChange={(value) => form.setValue('urgency', value as any)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select urgency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="urgent">Urgent (ASAP)</SelectItem>
                                <SelectItem value="flexible">Flexible</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="reportDeliveryEmail">Report delivery email (optional)</Label>
                            <Input
                              id="reportDeliveryEmail"
                              type="email"
                              placeholder="Send report to different email"
                              {...form.register('reportDeliveryEmail')}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Your Details
                    </CardTitle>
                    <CardDescription>We'll use this to contact you about your booking</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="customerName">Full Name *</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="customerName"
                            placeholder="John Smith"
                            {...form.register('customerName')}
                            className="pl-10"
                          />
                        </div>
                        {form.formState.errors.customerName && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.customerName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="021 123 4567"
                            {...form.register('phone')}
                            className="pl-10"
                          />
                        </div>
                        {form.formState.errors.phone && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.phone.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          {...form.register('email')}
                          className="pl-10"
                        />
                      </div>
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="address">Service Address (Auckland only) *</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Textarea
                          id="address"
                          placeholder="123 Example Street, Suburb, Auckland"
                          {...form.register('address')}
                          className="pl-10 min-h-[80px]"
                        />
                      </div>
                      {form.formState.errors.address && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.address.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-blue-600" />
                      Vehicle Details
                    </CardTitle>
                    <CardDescription>Tell us about your vehicle</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="vehicleRego">Vehicle Registration *</Label>
                      <Input
                        id="vehicleRego"
                        placeholder="ABC123"
                        {...form.register('vehicleRego')}
                        className="mt-1 uppercase"
                        maxLength={10}
                      />
                      {form.formState.errors.vehicleRego && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.vehicleRego.message}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">We'll look up your vehicle details automatically</p>
                    </div>
                    <div>
                      <Label htmlFor="notes">Describe the issue or reason for service *</Label>
                      <div className="relative mt-1">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Textarea
                          id="notes"
                          placeholder="e.g., Check engine light is on, strange noise when braking, buying this car and need inspection..."
                          {...form.register('notes')}
                          className="pl-10 min-h-[100px]"
                        />
                      </div>
                      {form.formState.errors.notes && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.notes.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Date & Time Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-blue-600" />
                      Preferred Date & Time
                    </CardTitle>
                    <CardDescription>
                      Monday–Friday: 9am–5pm (last booking 3:30pm) | Weekends: By appointment only
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Date Picker */}
                      <div>
                        <Label>Select Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, 'EEEE, d MMMM yyyy') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleDateSelect}
                              disabled={disabledDays}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {form.formState.errors.preferredDate && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.preferredDate.message}</p>
                        )}
                      </div>

                      {/* Time Selection */}
                      <div>
                        <Label>Select Time *</Label>
                        {isWeekend ? (
                          <div className="mt-1">
                            <Alert className="bg-amber-50 border-amber-200">
                              <AlertCircle className="h-4 w-4 text-amber-600" />
                              <AlertDescription className="text-amber-800">
                                <strong>Weekend – By Appointment Only</strong>
                                <br />
                                Please describe your preferred time window below. We'll contact you to confirm.
                              </AlertDescription>
                            </Alert>
                            <Textarea
                              placeholder="e.g., Saturday morning between 9-11am, or Sunday afternoon..."
                              {...form.register('weekendTimeWindow')}
                              className="mt-3"
                            />
                          </div>
                        ) : (
                          <Select
                            value={form.watch('preferredTime')}
                            onValueChange={(value) => form.setValue('preferredTime', value)}
                            disabled={!selectedDate}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder={selectedDate ? "Select a time" : "Select date first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {time}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {form.formState.errors.preferredTime && !isWeekend && (
                          <p className="text-sm text-red-600 mt-1">{form.formState.errors.preferredTime.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Add-ons */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      Optional Add-ons
                    </CardTitle>
                    <CardDescription>Enhance your booking with these options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      {Object.entries(ADD_ONS).map(([key, addon]) => {
                        const Icon = addon.icon;
                        const isChecked = form.watch(key as keyof BookingFormData);
                        return (
                          <label
                            key={key}
                            className={cn(
                              "relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all",
                              isChecked
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <input
                              type="checkbox"
                              {...form.register(key as keyof BookingFormData)}
                              className="sr-only"
                            />
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className={cn("w-5 h-5", isChecked ? "text-blue-600" : "text-gray-400")} />
                              <span className="font-semibold text-gray-900">{addon.name}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{addon.description}</p>
                            <span className="text-lg font-bold text-blue-600">+${addon.price}</span>
                            {isChecked && (
                              <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-blue-600" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Summary & Payment */}
                <Card className="border-2 border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      Booking Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Price Breakdown */}
                    <div className="bg-white rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{selectedService?.name}</span>
                        <span className="font-medium">${selectedService?.price}</span>
                      </div>
                      {watchPrioritySameDay && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">+ Priority Same-Day</span>
                          <span>+${ADD_ONS.prioritySameDay.price}</span>
                        </div>
                      )}
                      {watchOutsideArea && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">+ Outside Core Area</span>
                          <span>+${ADD_ONS.outsideAreaSurcharge.price}</span>
                        </div>
                      )}
                      {watchAfterHours && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">+ After-Hours Service</span>
                          <span>+${ADD_ONS.afterHours.price}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-blue-600">${totalPrice} NZD</span>
                      </div>
                    </div>

                    {/* Terms Agreement */}
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                      <Checkbox
                        id="policyAgreed"
                        checked={form.watch('policyAgreed')}
                        onCheckedChange={(checked) => form.setValue('policyAgreed', checked as boolean)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="policyAgreed"
                          className="text-sm font-medium leading-relaxed cursor-pointer"
                        >
                          I agree to the terms and conditions *
                        </label>
                        <p className="text-xs text-gray-500">
                          By proceeding, I agree to pay the full service fee upfront, provide accurate information,
                          ensure vehicle accessibility, and accept the cancellation policy.
                        </p>
                      </div>
                    </div>
                    {form.formState.errors.policyAgreed && (
                      <p className="text-sm text-red-600">{form.formState.errors.policyAgreed.message}</p>
                    )}

                    {/* Error Message */}
                    {submitError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{submitError}</AlertDescription>
                      </Alert>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full text-lg py-6 bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-5 w-5" />
                          Pay ${totalPrice} to Secure Booking
                        </>
                      )}
                    </Button>

                    {/* Payment Methods */}
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Secure payment powered by Stripe</p>
                      <div className="flex justify-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">Visa</Badge>
                        <Badge variant="outline" className="text-xs">Mastercard</Badge>
                        <Badge variant="outline" className="text-xs">Apple Pay</Badge>
                        <Badge variant="outline" className="text-xs">Google Pay</Badge>
                        <Badge variant="outline" className="text-xs">Afterpay</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </form>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-6 md:grid-cols-3 text-center">
                <div className="p-6">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">Secure Payment</h3>
                  <p className="text-sm text-gray-600">256-bit SSL encryption. Your payment details are never stored on our servers.</p>
                </div>
                <div className="p-6">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold mb-2">Instant Confirmation</h3>
                  <p className="text-sm text-gray-600">Receive immediate email confirmation with your booking details.</p>
                </div>
                <div className="p-6">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="font-semibold mb-2">Flexible Payment</h3>
                  <p className="text-sm text-gray-600">Pay with card, Apple Pay, Google Pay, or split with Afterpay.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
