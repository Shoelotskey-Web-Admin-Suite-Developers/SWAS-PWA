import { useEffect, useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import '@/styles/srm.css'

// API Import
import { getServices, IService } from "@/utils/api/getServices";
import { getCustomerByNameAndBdate } from "@/utils/api/getCustByNameAndBdate";
import { addServiceRequest} from "@/utils/api/addServiceRequest";

interface LineItemInput {
  priority: "Rush" | "Normal";
  shoes: string;
  current_location?: "Hub" | "Branch";
  due_date?: string;
  services: { service_id: string; quantity: number }[];
}

interface ServiceRequestPayload {
  cust_name: string;
  cust_bdate?: string;
  cust_address?: string;
  cust_email?: string;
  cust_contact?: string;
  lineItems: LineItemInput[];
  received_by: string;
  total_amount: number;
  discount_amount: number;
  amount_paid: number;
  payment_status: "NP" | "PARTIAL" | "PAID";
  payment_mode: "Cash" | "Card" | "GCash" | "Other";
}

type Shoe = {
  model: string;
  services: string[]; // selected service ids (standard services)
  // additionals stored as map service_id -> quantity
  additionals: Record<string, number>;
  rush: 'yes' | 'no';
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

const RUSH_FEE = 150 // default rush fee (change as required)
// Rush reduces the total by these many days
const RUSH_REDUCTION_DAYS = 2;

function formatCurrency(n: number) {
  return '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function SRM() {
  // UI state
  const [customerType, setCustomerType] = useState<'new' | 'old'>('new')
  const [useCustomDate, setUseCustomDate] = useState(false)
  const [customDate, setCustomDate] = useState<string>(todayISODate())
  const [services, setServices] = useState<IService[]>([]);

  

  const serviceById = useMemo(() => {
    const map = new Map<string, IService>();
    for (const s of services) map.set(s.service_id, s);
    return map;
  }, [services]);

  // Lookup price by service_id
  const findServicePrice = (serviceId: string) => {
    const s = serviceById.get(serviceId);
    return s ? s.service_base_price : 0;
  };

  // Lookup addon price by service_id (same as above but explicit)
  const findAddonPrice = (serviceId: string) => {
    const a = serviceById.get(serviceId);
    return a ? a.service_base_price : 0;
  };

  // Lookup duration by service_id
  const getDuration = (serviceId: string) => {
    const s = serviceById.get(serviceId);
    return s ? s.service_duration : 0;
  };

  const [modeOfPayment, setModeOfPayment] = useState<'cash' | 'gcash' | 'bank' | 'other'>('cash')
  const [paymentType, setPaymentType] = useState<'full' | 'half' | 'custom'>('full')
  const [amountDueNow, setAmountDueNow] = useState(0);
  const [customerPaid, setCustomerPaid] = useState(0);
  const [change, setChange] = useState(0);
  const [balance, setBalance] = useState(0);
  const [applyDiscount, setApplyDiscount] = useState(false)
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')

  const [submitting, setSubmitting] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      const servicesData = await getServices(); // already an array
      setServices(servicesData);
    };
    fetchData();
  }, []);

  const serviceOptions = services.filter(s => s.service_type === "Service");
  const additionalOptions = services.filter(s => s.service_type === "Additional");

  // Customer form fields (controlled)
  const [name, setName] = useState<string>('')
  const [birthdate, setBirthdate] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [customerId, setCustomerId] = useState<string>('NEW')

  // Received by (user types it)
  const [receivedBy, setReceivedBy] = useState<string>('')

  // Step 2: Shoes state
  const [shoes, setShoes] = useState<Shoe[]>([
    {
      model: '',
      services: [],
      additionals: {},
      rush: 'no',
    },
  ])

  const handleShoeChange = (
    index: number,
    field: keyof Shoe,
    value: string | string[] | Record<string, number>
  ) => {
    const updated = [...shoes]
    ;(updated[index] as any)[field] = value
    setShoes(updated)
  }

  const toggleArrayValue = (
    index: number,
    field: 'services',
    value: string
  ) => {
    const updated = [...shoes]
    const currentArr = updated[index][field]
    if ((currentArr as string[]).includes(value)) {
      updated[index][field] = (currentArr as string[]).filter((v) => v !== value)
    } else {
      updated[index][field] = [...(currentArr as string[]), value]
    }
    setShoes(updated)
  }

  const addShoe = () => {
    setShoes([...shoes, { model: '', services: [], additionals: {}, rush: 'no' }])
  }

  // Toggle checkbox for additionals
  const toggleAdditional = (
    shoeIndex: number,
    serviceId: string,
    checked: boolean,
    quantity: number = 1
  ) => {
    const updated = [...shoes];
    if (checked) {
      // set quantity (default 1)
      updated[shoeIndex].additionals = {
        ...updated[shoeIndex].additionals,
        [serviceId]: Math.max(1, Math.floor(quantity)),
      };
    } else {
      // remove entry
      const { [serviceId]: _, ...rest } = updated[shoeIndex].additionals;
      updated[shoeIndex].additionals = rest;
    }
    setShoes(updated);
  };

  // Update quantity of additional
  const updateAdditionalQuantity = (
    shoeIndex: number,
    serviceId: string,
    newQuantity: number
  ) => {
    const updated = [...shoes];
    if (newQuantity <= 0) {
      const { [serviceId]: _, ...rest } = updated[shoeIndex].additionals;
      updated[shoeIndex].additionals = rest;
    } else {
      updated[shoeIndex].additionals = {
        ...updated[shoeIndex].additionals,
        [serviceId]: Math.max(1, Math.floor(newQuantity)),
      };
    }
    setShoes(updated);
  };

  // Get current quantity of a specific additional (default 1 if selected)
  const getAdditionalQuantity = (shoe: Shoe, serviceId: string) =>
    shoe.additionals[serviceId] ?? 1;


  // --- Auto-search logic (kept as you had it) ---
  useEffect(() => {
    const n = name.trim();
    const b = birthdate.trim();

    if (!n || !b) {
      setCustomerId("NEW");
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const found = await getCustomerByNameAndBdate(n, b); // call backend

        if (found) {
          setAddress(found.cust_address || "");
          setEmail(found.cust_email || "");
          setPhone(found.cust_contact || "");
          setCustomerId(found.cust_id);
          if (customerType === "new") {
            setCustomerType("old");
          }
        } else {
          setCustomerId("NEW");
          if (customerType === "old") {
            alert("Old customer not found. Please check the entered name and birthdate.");
          }
        }
      } catch (err) {
        console.error("Error fetching customer:", err);
        setCustomerId("NEW");
      }
    }, 1000); // debounce delay

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, birthdate]);



  useEffect(() => {
    if (customerType === 'new') {
      setCustomerId((prev) => (prev === 'NEW' ? 'NEW' : 'NEW'))
    }
  }, [customerType])

  const [discountValue, setDiscountValue] = useState<string>('0')

  // --- Compute per-shoe totals and overall totals ---
  const perShoeTotals = useMemo(() => {
    return shoes.map((shoe) => {
      const serviceTotal = (shoe.services || []).reduce(
        (sum, serviceId) => sum + findServicePrice(serviceId),
        0
      );
      const addonTotal = Object.entries(shoe.additionals || {}).reduce(
        (sum, [addonId, qty]) => sum + findAddonPrice(addonId) * (qty || 1),
        0
      );
      const rushTotal = shoe.rush === 'yes' ? RUSH_FEE : 0;
      const shoeTotal = serviceTotal + addonTotal + rushTotal;
      return { serviceTotal, addonTotal, rushTotal, shoeTotal };
    });
  }, [shoes, serviceById]);


  const totalBill = useMemo(
    () => perShoeTotals.reduce((s, p) => s + p.shoeTotal, 0),
    [perShoeTotals]
  )

  const discountAmount = useMemo(() => {
    if (!applyDiscount) return 0
    const parsed = parseFloat(discountValue || '0') || 0
    if (discountType === 'percent') {
      // clamp percent 0..100
      const percent = Math.max(0, Math.min(parsed, 100))
      return (percent / 100) * totalBill
    } else {
      // fixed amount; clamp 0..totalBill
      return Math.max(0, Math.min(parsed, totalBill))
    }
  }, [applyDiscount, discountType, discountValue, totalBill])

  const totalSales = totalBill - discountAmount

  // Helper service request date
  const formatToMMDDYYYY = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const serviceRequestDate = formatToMMDDYYYY(
    useCustomDate ? customDate : todayISODate()
  );



  // Calculate estimated completion date PER shoe
  // --- Calculate estimated completion date PER shoe (formatted only) ---
  const perShoeEstimatedDates = useMemo(() => {
    return shoes.map((shoe) => {
      let shoeDays = 0;

      // Sum durations of selected services
      (shoe.services || []).forEach((svcId) => {
        shoeDays += getDuration(svcId);
      });

      // Sum durations of selected additionals (multiply by quantity)
      Object.entries(shoe.additionals || {}).forEach(([addId, qty]) => {
        shoeDays += getDuration(addId) * (qty || 1);
      });

      // Apply rush reduction if applicable
      if (shoe.rush === "yes") {
        shoeDays = Math.max(1, shoeDays - RUSH_REDUCTION_DAYS);
      }

      // Compute estimated completion date
      const estDate = new Date(useCustomDate ? customDate : todayISODate());
      estDate.setDate(estDate.getDate() + shoeDays);

      // Format as MM/DD/YYYY
      const month = String(estDate.getMonth() + 1).padStart(2, "0");
      const day = String(estDate.getDate()).padStart(2, "0");
      const year = estDate.getFullYear();

      return `${month}/${day}/${year}`;
    });
  }, [shoes, customDate, useCustomDate, serviceById]);



  // Auto-update Amount Due Now when payment type or totals change
  useEffect(() => {
    if (paymentType === "full") {
      setAmountDueNow(totalSales);
    } else if (paymentType === "half") {
      setAmountDueNow(totalSales * 0.5);
    }
  }, [paymentType, totalSales]);

  // Auto-update Change & Balance
  useEffect(() => {
    setChange(Math.max(0, customerPaid - amountDueNow));
    setBalance(Math.max(0, totalSales - amountDueNow));
  }, [customerPaid, amountDueNow, totalSales]);

  // Explicitly type the value as string or number
  const handleAmountDueChange = (value: string | number) => {
    const num = Math.max(0, Math.min(Number(value) || 0, totalSales));
    setPaymentType("custom");
    setAmountDueNow(num);
  };

  const handleConfirmServiceRequest = async () => {
    // --- 1. Validate required fields ---
    if (!name.trim() || !birthdate.trim() || !address.trim() || !phone.trim()) {
      alert("Please fill in all customer details.");
      return;
    }

    if (!receivedBy.trim()) {
      alert("Please enter 'Received By' name.");
      return;
    }

    if (shoes.length === 0 || shoes.some(shoe => !shoe.model.trim() || shoe.services.length === 0)) {
      alert("Please provide at least one shoe with a model name and at least one service.");
      return;
    }

    // --- 2. Prepare line items ---
    const lineItems: LineItemInput[] = shoes.map((shoe) => {
      const svcObjs = shoe.services.map(id => ({ service_id: id, quantity: 1 }));
      const addObjs = Object.entries(shoe.additionals).map(([id, qty]) => ({ service_id: id, quantity: qty }));

      return {
        priority: (shoe.rush === "yes" ? "Rush" : "Normal") as "Rush" | "Normal",
        shoes: shoe.model,
        current_location: "Branch",
        due_date: '', // optional
        services: [...svcObjs, ...addObjs],
      };
    });


    const paymentMap: Record<string, "Cash" | "Card" | "GCash" | "Other"> = {
      cash: "Cash",
      gcash: "GCash",
      bank: "Card",
      other: "Other",
    };

    // --- 3. Prepare service request payload ---
    const requestPayload: ServiceRequestPayload = {
      cust_name: name,
      cust_bdate: birthdate || undefined,
      cust_address: address || undefined,
      cust_email: email || undefined,
      cust_contact: phone || undefined,
      lineItems,
      received_by: receivedBy,
      total_amount: totalSales,
      discount_amount: discountAmount,
      amount_paid: customerPaid,
      payment_status:
        customerPaid >= totalSales ? "PAID" : customerPaid > 0 ? "PARTIAL" : "NP",
      payment_mode: paymentMap[modeOfPayment],
    };

    try {
      setSubmitting(true);
      const result = await addServiceRequest(requestPayload as any);
      console.log("Service request created:", result);
      alert("Service request confirmed successfully!");

      // Optional: reset form if needed
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to create service request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="srm-container">
      {/* Left: Form */}
      <div className="srm-form-container">
        <div className="srm-form">
          <div className="customer-type-toggle">
            <Button
              className="customer-button button-lg"
              variant={customerType === 'new' ? 'customer' : 'outline'}
              onClick={() => setCustomerType('new')}
            >
              NEW CUSTOMER
            </Button>
            <Button
              className="customer-button button-lg"
              variant={customerType === 'old' ? 'customer' : 'outline'}
              onClick={() => setCustomerType('old')}
            >
              OLD CUSTOMER
            </Button>
          </div>

          <Card>
            <CardContent className="form-card-content">
              {/* Customer Info */}
              <div className="customer-info-grid">
                <div className="customer-info-pair">
                  <div className="w-full">
                    <Label>Customer Name</Label>
                    <Input
                      value={name}
                      onChange={(e: any) => setName(e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="w-full">
                    <Label>Customer Birthdate</Label>
                    <Input
                      type="date"
                      value={birthdate}
                      onChange={(e: any) => setBirthdate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="w-full">
                  <Label>Customer Address</Label>
                  <Input
                    value={address}
                    onChange={(e: any) => setAddress(e.target.value)}
                    readOnly={customerType === 'old'}
                    placeholder="Address"
                  />
                </div>

                <div className="customer-info-pair">
                  <div  className="w-full">
                    <Label>Customer Email</Label>
                    <Input
                      value={email}
                      onChange={(e: any) => setEmail(e.target.value)}
                      readOnly={customerType === 'old'}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div  className="w-full">
                    <Label>Customer Phone Number</Label>
                    <Input
                      value={phone}
                      onChange={(e: any) => setPhone(e.target.value)}
                      readOnly={customerType === 'old'}
                      placeholder="09XXXXXXXXX"
                    />
                  </div>
                </div>

                <div className="customer-info-pair">
                  <div  className="w-full">
                    <div >
                      <Label>Set Custom Date</Label>
                      <Switch
                        className="ml-3"
                        checked={useCustomDate}
                        onCheckedChange={(val: any) => {
                          setUseCustomDate(!!val)
                          if (!useCustomDate) {
                            setCustomDate((prev) => prev || todayISODate())
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Input
                        type="date"
                        disabled={!useCustomDate}
                        value={customDate}
                        onChange={(e: any) => setCustomDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <Label>Received by</Label>
                    <Input
                      value={receivedBy}
                      onChange={(e: any) => setReceivedBy(e.target.value)}
                      placeholder="Type receiver name"
                    />
                  </div>
                </div>
              </div>

              <hr className="section-divider" />

              {shoes.map((shoe, i) => (
                <div key={i} className="shoe-info-grid mb-6 relative">
                  {/* Show X button only if more than 1 shoe */}
                  {shoes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...shoes]
                        updated.splice(i, 1)
                        setShoes(updated)
                      }}
                      className="absolute pl-2 pr-2 pt-0 pb-0 top-[-1.5rem] right-0 m-0 bg-transparent text-gray-600 font-bold text-xl hover:text-red-900"
                      aria-label={`Remove shoe ${shoe.model || i + 1}`}
                    >
                      &times;
                    </button>
                  )}

                  <div className="shoe-model">
                    <Label>Shoe Model</Label>
                    <Input
                      value={shoe.model}
                      onChange={(e) => handleShoeChange(i, 'model', e.target.value)}
                    />
                  </div>
                  <div className="services">
                    {/* rest of your existing shoe fields */}
                    <div>
                      <Label>Service Needed</Label>
                      <div className="checkbox-grid">
                        {serviceOptions.map((srv) => (
                            <div className="checkbox-item" key={srv.service_id}>
                              <Checkbox
                                checked={shoe.services.includes(srv.service_id)}
                                onCheckedChange={() => toggleArrayValue(i, "services", srv.service_id)}
                              />
                              <Label>{srv.service_name}</Label>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                    <Label>Additional</Label>
                    <div className="checkbox-grid">
                      {additionalOptions.map((add) => {
                        const quantity = getAdditionalQuantity(shoe, add.service_id);
                        const checked = Object.prototype.hasOwnProperty.call(shoe.additionals, add.service_id);

                        // Only "Additional Layer" shows increment/decrement controls
                        const isLayer = add.service_name === 'Additional Layer';

                        return (
                          <div className="checkbox-item flex items-center gap-2" key={add.service_id}>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(val) =>
                                toggleAdditional(i, add.service_id, !!val, quantity)
                              }
                            />
                            <Label>{add.service_name}</Label>
                            {checked && (
                              <div className="flex items-center ml-2">
                                {isLayer ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => updateAdditionalQuantity(i, add.service_id, Math.max(1, quantity - 1))}
                                      className="w-5 h-8 flex px-4 items-center justify-center bg-gray-200 rounded"
                                    >
                                      <small className="text-sm">-</small>
                                    </button>
                                    <span className="px-2">{quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => updateAdditionalQuantity(i, add.service_id, quantity + 1)}
                                      className="w-5 h-8 flex px-4 items-center justify-center bg-gray-200 rounded"
                                    >
                                      <span className="text-sm">+</span>
                                    </button>
                                  </>
                                ) : (
                                  // For non-layer additionals, show quantity only (no +/-)
                                  <span className="px-2"></span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>


                    <div className="pr-[2rem]">
                      <Label>Rush</Label>
                      <RadioGroup
                        value={shoe.rush}
                        onValueChange={(val) => handleShoeChange(i, 'rush', val as 'yes' | 'no')}
                        className="rush-options"
                      >
                        <div className="radio-option">
                          <RadioGroupItem value="yes" id={`rush-yes-${i}`} />
                          <Label htmlFor={`rush-yes-${i}`}>Yes</Label>
                        </div>
                        <div className="radio-option">
                          <RadioGroupItem value="no" id={`rush-no-${i}`} />
                          <Label htmlFor={`rush-no-${i}`}>No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              ))}


              <Button
                variant="link"
                className="add-shoe-btn button-xl"
                onClick={addShoe}
              >
                Add Another Shoe +
              </Button>
            </CardContent>
          </Card>

          {/* Payment Section (Step 1: show totals computed) */}
          <Card>
            <CardContent className="payment-section">
              {/* Left: Discount Section */}
              <div className="discount-section">
                <div className="flex flex-col gap-5">
                  <Label>Mode of Payment</Label>
                  <RadioGroup
                    value={modeOfPayment}
                    onValueChange={(val) => setModeOfPayment(val as 'cash' | 'gcash' | 'bank' | 'other')}
                    className="pl-10"
                  >
                    <div className="radio-option">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">Cash</Label>
                    </div>
                    <div className="radio-option">
                      <RadioGroupItem value="gcash" id="gcash" />
                      <Label htmlFor="gcash">GCash</Label>
                    </div>
                    <div className="radio-option">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank">Bank</Label>
                    </div>
                    <div className="radio-option">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="checkbox-item">
                  <Checkbox
                    checked={applyDiscount}
                    onCheckedChange={(checked) => setApplyDiscount(!!checked)}
                    id="apply-discount"
                  />
                  <Label htmlFor="apply-discount">Apply Discount</Label>
                </div>

                {applyDiscount && (
                  <div className="discount-type pl-10">
                    <RadioGroup
                      value={discountType}
                      onValueChange={(val) =>
                        setDiscountType(val as 'percent' | 'fixed')
                      }
                    >
                      <div className="radio-option">
                        <RadioGroupItem value="percent" id="percent" />
                        <Label htmlFor="percent">Percent Discount (%)</Label>
                      </div>
                      <div className="radio-option">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed">Fixed Amount Discount (₱)</Label>
                      </div>
                    </RadioGroup>
                    <Input
                      className="mt-3"
                      placeholder={
                        discountType === 'percent' ? 'Enter %' : 'Enter amount'
                      }
                      value={discountValue}
                      onChange={(e: any) => setDiscountValue(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Right: Payment Inputs */}
              <div className="payment-summary-section">
                <div className="payment-type-buttons">
                  <Button
                    className="payment-button"
                    variant={paymentType === 'full' ? 'selected' : 'unselected'}
                    onClick={() => setPaymentType('full')}
                  >
                    Full Payment
                  </Button>
                  <Button
                    className="payment-button"
                    variant={paymentType === 'half' ? 'selected' : 'unselected'}
                    onClick={() => setPaymentType('half')}
                  >
                    50% Down
                  </Button>
                  <Button
                    className="payment-button"
                    variant={paymentType === 'custom' ? 'selected' : 'unselected'}
                    onClick={() => setPaymentType('custom')}
                  >
                    Custom
                  </Button>
                </div>

                <div className="summary-grid">
                  <p>Total Bill:</p>
                  <p className="text-right pr-3">{formatCurrency(totalBill)}</p>

                  <p>Total Sales:</p>
                  <p className="text-right pr-3">{formatCurrency(totalSales)}</p>

                  <p>Amount Due Now:</p>
                  <Input
                    type="number"
                    className="text-right"
                    value={amountDueNow}
                    onChange={(e) => handleAmountDueChange(e.target.value)}
                  />


                  <p>Customer Paid:</p>
                  <Input
                    className="text-right"
                    type="number"
                    value={customerPaid}
                    onChange={(e) => setCustomerPaid(Number(e.target.value) || 0)}
                    onBlur={() => {
                      if (customerPaid < amountDueNow) {
                        alert('Amount paid cannot be lower than amount due now.');
                      }
                    }}
                  />

                  <p>Change:</p>
                  <p className="text-right pr-3">{formatCurrency(change)}</p>
                </div>

              </div>
            </CardContent>
          </Card>
          <hr className="bottom-space" />
        </div>
      </div>

      {/* Right: Request Summary */}
      <div className="srm-summary">
        <Card className="srm-summary-card">
          <CardContent className="srm-summary-content">
            <h1>Request Summary</h1>
            <hr className="section-divider" />
            <div className="srm-summary-body">
              <div className="summary-grid">
                <p className="bold">Customer ID</p>
                <p className="text-right">
                  {customerId === 'NEW' ? 'NEW' : `#${customerId}`}
                </p>
                <p className="bold">Customer Name</p>
                <p className="text-right">{name || '-'}</p>
              </div>

              <div className="summary-date-row">
                <p className="bold">Service Request</p>
                <p className="text-right">{serviceRequestDate}</p>
              </div>

              {/* Services with actual prices */}
              <div className="summary-service-list">
                {shoes.map((shoe, i) => (
                  <div className="summary-service-entry mb-5" key={i}>
                    <p className="font-medium">{shoe.model || 'Unnamed Shoe'}</p>

                    {shoe.services.map((srvId) => {
                      const svc = serviceById.get(srvId);
                      return (
                        <div key={srvId} className="pl-10 flex justify-between">
                          <p>{svc ? svc.service_name : srvId}</p>
                          <p className="text-right">{formatCurrency(svc ? svc.service_base_price : 0)}</p>
                        </div>
                      );
                    })}

                    {Object.entries(shoe.additionals).map(([addId, qty]) => {
                      const addon = serviceById.get(addId);
                      return (
                        <div key={`${addId}-${i}`} className="pl-10 flex justify-between">
                          <p>{addon ? addon.service_name : addId} {qty > 1 ? ` x${qty}` : ''}</p>
                          <p className="text-right">{formatCurrency((addon ? addon.service_base_price : 0) * qty)}</p>
                        </div>
                      );
                    })}

                    {shoe.rush === 'yes' && (
                      <div className="pl-10 flex justify-between text-red-600">
                        <p>Rush Service</p>
                        <p className="text-right">{formatCurrency(RUSH_FEE)}</p>
                      </div>
                    )}
                    
                    <hr className="total" />
                    {/* Per-shoe subtotal */}
                    <div className="pl-10 flex justify-between mt-2">
                      <p className="bold">Subtotal</p>
                      <p className="text-right bold">
                        {formatCurrency(perShoeTotals[i]?.shoeTotal || 0)}
                      </p>
                    </div>

                    {/* Per-shoe estimated completion date */}
                    <div className="pl-10 flex justify-between mt-1 text-gray-500">
                      <p className="bold">Estimated Completion</p>
                      <p className="text-right bold">{perShoeEstimatedDates[i]}</p>
                    </div>
                  </div>
                ))}
              </div>

              {applyDiscount && (
                <div className="summary-discount-row">
                  <p className="bold">Discount</p>
                  <p>({formatCurrency(discountAmount)})</p>
                </div>
              )}
              <div className="summary-discount-row">
                <p className="bold">Payment</p>
                <p>({formatCurrency(amountDueNow)})</p>
              </div>
            </div>

            <hr className="section-divider" />
            <div className="summary-footer">
              <div className="summary-balance-row">
                <h2>Balance:</h2>
                {/* Since Amount Due / Payments not implemented yet, show total sales as current balance */}
                <h2>{formatCurrency(balance)}</h2>
              </div>
                <Button
                  disabled={submitting}
                  className="w-full p-8 mt-4 button-lg bg-[#22C55E] hover:bg-[#1E9A50]"
                  onClick={handleConfirmServiceRequest}
                >
                  {submitting ? "Submitting..." : "Confirm Service Request"}
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
