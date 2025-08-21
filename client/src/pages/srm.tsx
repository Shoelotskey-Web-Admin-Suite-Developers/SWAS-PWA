import { useEffect, useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import '@/styles/srm.css'

type Customer = {
  id: string
  name: string
  birthdate: string // "YYYY-MM-DD"
  address: string
  email: string
  phone: string
}

type Shoe = {
  model: string
  services: string[]
  additionals: string[]
  rush: 'yes' | 'no'
}

// Dummy customer DB (front-end only)
const DUMMY_CUSTOMERS: Customer[] = [
  {
    id: '000001',
    name: 'Juan Dela Cruz',
    birthdate: '1990-05-12',
    address: '123 Mabini St, Manila',
    email: 'juan@example.com',
    phone: '09171234567',
  },
  {
    id: '000002',
    name: 'Maria Clara',
    birthdate: '1995-02-20',
    address: '456 Rizal Ave, Quezon City',
    email: 'maria@example.com',
    phone: '09181234567',
  },
]

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

/* --- Pricing data --- */
/* NOTE: Make sure the strings in `serviceOptions` and `additionalOptions`
   match the `services` / `addons` name fields (case-insensitive) so prices resolve.
*/
const serviceOptions = ['Basic Cleaning', 'Minor Reglue', 'Full Reglue']
const additionalOptions = [
  'Unyellowing',
  'Minor Retouch',
  'Minor Restoration',
  'Additional Layer',
  'Color Retouch (2 colors)',
  'Color Retouch (3 colors)',
]

const services = [
  { name: 'Basic Cleaning', price: 325 },
  { name: 'Minor Reglue', price: 450 },
  { name: 'Full Reglue', price: 575 },
]

const addons = [
  { name: 'Unyellowing', price: 125 },
  { name: 'Minor Retouch', price: 125 },
  { name: 'Minor Restoration', price: 225 },
  { name: 'Additional Layer', price: 575 },
  { name: 'Color Retouch (2 colors)', price: 600 },
  { name: 'Color Retouch (3 colors)', price: 700 },
]

const serviceDurations: Record<string, number> = {
  'Basic Cleaning': 10,
  'Minor Reglue': 25,
  'Full Reglue': 25,
  'Unyellowing': 0,
  'Minor Retouch': 0,
  'Minor Restoration': 15,
  'Additional Layer': 25,
  'Color Retouch (2 colors)': 25,
  'Color Retouch (3 colors)': 25,
};



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
  const [paymentType, setPaymentType] = useState<'full' | 'half' | 'custom'>(
    'full'
  )
  const [amountDueNow, setAmountDueNow] = useState(0);
  const [customerPaid, setCustomerPaid] = useState(0);
  const [change, setChange] = useState(0);
  const [balance, setBalance] = useState(0);
  const [applyDiscount, setApplyDiscount] = useState(false)
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>(
    'percent'
  )

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
      additionals: [],
      rush: 'no',
    },
  ])

  const handleShoeChange = (
    index: number,
    field: keyof Shoe,
    value: string | string[]
  ) => {
    const updated = [...shoes]
    ;(updated[index] as any)[field] = value
    setShoes(updated)
  }

  const toggleArrayValue = (
    index: number,
    field: 'services' | 'additionals',
    value: string
  ) => {
    const updated = [...shoes]
    const currentArr = updated[index][field]
    if (currentArr.includes(value)) {
      updated[index][field] = currentArr.filter((v) => v !== value)
    } else {
      updated[index][field] = [...currentArr, value]
    }
    setShoes(updated)
  }

  const addShoe = () => {
    setShoes([...shoes, { model: '', services: [], additionals: [], rush: 'no' }])
  }

  // --- Auto-search logic (kept as you had it) ---
  useEffect(() => {
    const n = name.trim();
    const b = birthdate.trim();

    // If either is empty, reset and skip
    if (!n || !b) {
      setCustomerId('NEW');
      return;
    }

    // Setup debounce timer
    const handler = setTimeout(() => {
      const found = DUMMY_CUSTOMERS.find(
        (c) => c.birthdate === b && c.name.toLowerCase() === n.toLowerCase()
      );

      if (found) {
        setAddress(found.address);
        setEmail(found.email);
        setPhone(found.phone);
        setCustomerId(found.id);
        if (customerType === 'new') {
          setCustomerType('old');
        }
      } else {
        setCustomerId('NEW');
        if (customerType === 'old') {
          alert("Old customer not found. Please check the entered name and birthdate.");
        }
      }
    }, 2000); // 500ms debounce delay

    // Cleanup previous timer on input change
    return () => clearTimeout(handler);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, birthdate]);



  useEffect(() => {
    if (customerType === 'new') {
      setCustomerId((prev) => (prev === 'NEW' ? 'NEW' : 'NEW'))
    }
  }, [customerType])

  // --- Step 1: Discount input state (string so user can type) ---
  const [discountValue, setDiscountValue] = useState<string>('0')

  // --- Helper lookups for prices ---
  const findServicePrice = (serviceName: string) => {
    const s = services.find(
      (x) => x.name.toLowerCase() === serviceName.toLowerCase()
    )
    return s ? s.price : 0
  }
  const findAddonPrice = (addonName: string) => {
    const a = addons.find((x) => x.name.toLowerCase() === addonName.toLowerCase())
    return a ? a.price : 0
  }

  // --- Compute per-shoe totals and overall totals ---
  const perShoeTotals = useMemo(() => {
    return shoes.map((shoe) => {
      const serviceTotal = (shoe.services || []).reduce(
        (sum, sname) => sum + findServicePrice(sname),
        0
      )
      const addonTotal = (shoe.additionals || []).reduce(
        (sum, aname) => sum + findAddonPrice(aname),
        0
      )
      const rushTotal = shoe.rush === 'yes' ? RUSH_FEE : 0
      const shoeTotal = serviceTotal + addonTotal + rushTotal
      return { serviceTotal, addonTotal, rushTotal, shoeTotal }
    })
  }, [shoes])


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
  const perShoeEstimatedDates = useMemo(() => {
    return shoes.map((shoe) => {
      let shoeDays = 0;

      // Add service durations
      (shoe.services || []).forEach(svc => {
        shoeDays += serviceDurations[svc] || 0;
      });

      // Add additional durations
      (shoe.additionals || []).forEach(add => {
        shoeDays += serviceDurations[add] || 0;
      });

      // Apply rush reduction
      if (shoe.rush === 'yes') {
        shoeDays = Math.max(1, shoeDays - RUSH_REDUCTION_DAYS);
      }

      // Calculate completion date for this shoe
      const startDate = new Date(serviceRequestDate);
      startDate.setDate(startDate.getDate() + shoeDays);

      // Format MM/DD/YYYY
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      const year = startDate.getFullYear();

      return `${month}/${day}/${year}`;
    });
  }, [shoes, serviceRequestDate]);



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

  // Handle manual Amount Due entry (switches to custom)
  const handleAmountDueChange = (value) => {
    const num = Math.max(0, Math.min(Number(value) || 0, totalSales));
    setPaymentType("custom");
    setAmountDueNow(num);
  };

  const handleConfirmServiceRequest = () => {
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

  // --- 2. Save new customer (dummy) ---
  let customerRecord = { id: customerId, name, birthdate, address, email, phone };
  if (customerId === "NEW") {
    const newId = String(DUMMY_CUSTOMERS.length + 1).padStart(6, "0");
    customerRecord.id = newId;
    DUMMY_CUSTOMERS.push({ ...customerRecord });
    console.log("New customer added:", customerRecord);
  }

  // --- 3. Create service request record ---
  const serviceRequest = {
    customerId: customerRecord.id,
    serviceRequestDate,
    shoes,
    totalSales,
    amountDueNow,
    customerPaid,
    change,
    balance,
    receivedBy,
  };

  console.log("Service Request Saved:", serviceRequest);
    // --- 4. Feedback to user ---
    alert("Service request confirmed successfully!");

    // Optional: reset form
    // resetForm();
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
                          <div className="checkbox-item" key={srv}>
                            <Checkbox
                              checked={shoe.services.includes(srv)}
                              onCheckedChange={() => toggleArrayValue(i, 'services', srv)}
                            />
                            <Label>{srv}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Additional</Label>
                      <div className="checkbox-grid">
                        {additionalOptions.map((add) => (
                          <div className="checkbox-item" key={add}>
                            <Checkbox
                              checked={shoe.additionals.includes(add)}
                              onCheckedChange={() => toggleArrayValue(i, 'additionals', add)}
                            />
                            <Label>{add}</Label>
                          </div>
                        ))}
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

                    {shoe.services.map((srv) => (
                      <div key={srv} className="pl-10 flex justify-between">
                        <p>{srv}</p>
                        <p className="text-right">{formatCurrency(findServicePrice(srv))}</p>
                      </div>
                    ))}

                    {shoe.additionals.map((add) => (
                      <div key={add} className="pl-10 flex justify-between">
                        <p>{add}</p>
                        <p className="text-right">{formatCurrency(findAddonPrice(add))}</p>
                      </div>
                    ))}

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
              <Button className="w-full p-8 mt-4 button-lg bg-[#22C55E] hover:bg-[#1E9A50]" onClick={handleConfirmServiceRequest}>
                Confirm Service Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
