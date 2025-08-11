import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import '@/styles/srm.css'

export default function SRM() {
  const [customerType, setCustomerType] = useState<"new" | "old">("new")
  const [useCustomDate, setUseCustomDate] = useState(false)
  const [paymentType, setPaymentType] = useState<"full" | "half" | "custom">("full")
  const [applyDiscount, setApplyDiscount] = useState(false)
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent")

  return (
    <div className="srm-container">
      {/* Left: Form */}
      <div className="srm-form-container">
        <div className="srm-form">
          <div className="customer-type-toggle">
            <Button
              className="customer-button button-lg"
              variant={customerType === "new" ? "customer" : "outline"}
              onClick={() => setCustomerType("new")}
            >
              NEW CUSTOMER
            </Button>
            <Button
              className="customer-button button-lg"
              variant={customerType === "old" ? "customer" : "outline"}
              onClick={() => setCustomerType("old")}
            >
              OLD CUSTOMER
            </Button>
          </div>

          <Card>
            <CardContent className="form-card-content">
              {/* Customer Info */}
              <div className="customer-info-grid">
                <div className="customer-info-pair">
                  <div><Label>Customer Name</Label><Input /></div>
                  <div><Label>Customer Birthdate</Label><Input type="date" /></div>
                </div>
                <div><Label>Customer Address</Label><Input /></div>
                <div className="customer-info-pair">
                  <div><Label>Customer Email</Label><Input /></div>
                  <div><Label>Customer Phone Number</Label><Input /></div>
                </div>
                <div className="customer-info-pair">
                  <div>
                    <div>
                      <Label>Set Custom Date</Label>
                      <Switch className="ml-3" checked={useCustomDate} onCheckedChange={setUseCustomDate} />
                    </div>
                    <div><Input type="date" disabled={!useCustomDate} /></div>
                  </div>
                  <div><Label>Received by</Label><Input /></div>
                </div>
              </div>

              <hr className="section-divider" />

              {/* Shoe Info */}
              <div className="shoe-info-grid">
                <div><Label>Shoe Model</Label><Input /></div>

                <div>
                  <Label>Service Needed</Label>
                  <div className="checkbox-grid">
                    <div className="checkbox-item"><Checkbox id="basic" /><Label htmlFor="basic">Basic Cleaning</Label></div>
                    <div className="checkbox-item"><Checkbox id="minor" /><Label htmlFor="minor">Minor Regule</Label></div>
                    <div className="checkbox-item"><Checkbox id="full" /><Label htmlFor="full">Full Regule</Label></div>
                  </div>
                </div>

                <div>
                  <Label>Additional</Label>
                  <div className="checkbox-grid">
                    <div className="checkbox-item"><Checkbox id="unyellowing" /><Label htmlFor="unyellowing">Unyellowing</Label></div>
                    <div className="checkbox-item"><Checkbox id="retouch" /><Label htmlFor="retouch">Minor Retouch</Label></div>
                    <div className="checkbox-item"><Checkbox id="restore" /><Label htmlFor="restore">Minor Restoration</Label></div>
                    <div className="checkbox-item"><Checkbox id="layer" /><Label htmlFor="layer">Additional Layer</Label></div>
                    <div className="checkbox-item"><Checkbox id="color2" /><Label htmlFor="color2">Color Retouch (2 colors)</Label></div>
                    <div className="checkbox-item"><Checkbox id="color3" /><Label htmlFor="color3">Color Retouch (3 colors)</Label></div>
                  </div>
                </div>

                <div>
                  <Label>Rush</Label>
                  <RadioGroup defaultValue="no" className="rush-options">
                    <div className="radio-option"><RadioGroupItem value="yes" id="rush-yes" /><Label htmlFor="rush-yes">Yes</Label></div>
                    <div className="radio-option"><RadioGroupItem value="no" id="rush-no" /><Label htmlFor="rush-no">No</Label></div>
                  </RadioGroup>
                </div>
              </div>

              <Button variant="link" className="add-shoe-btn button-xl">Add Another Shoe +</Button>
            </CardContent>
          </Card>

          {/* Payment Section */}
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
                      defaultValue={discountType}
                      onValueChange={(val) =>
                        setDiscountType(val as "percent" | "fixed")
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
                    <Input className="mt-3" placeholder="Enter Discount Amount" />
                  </div>
                )}
              </div>

              {/* Right: Payment Inputs */}
              <div className="payment-summary-section">
                <div className="payment-type-buttons">
                  <Button
                    className="payment-button"
                    variant={paymentType === "full" ? "selected" : "unselected"}
                    onClick={() => setPaymentType("full")}
                  >
                    Full Payment
                  </Button>
                  <Button
                    className="payment-button"
                    variant={paymentType === "half" ? "selected" : "unselected"}
                    onClick={() => setPaymentType("half")}
                  >
                    50% Down
                  </Button>
                  <Button
                    className="payment-button"
                    variant={paymentType === "custom" ? "selected" : "unselected"}
                    onClick={() => setPaymentType("custom")}
                  >
                    Custom
                  </Button>
                </div>

                <div className="summary-grid">
                  <p>Total Bill:</p>
                  <p className="text-right pr-3">₱X,XXX.XX</p>
                  <p>Total Sales:</p>
                  <p className="text-right pr-3">₱X,XXX.XX</p>
                  <p>Amount Due Now:</p>
                  <Input className="text-right"/>
                  <p>Customer Paid:</p>
                  <Input className="text-right"/>
                  <p>Change:</p>
                  <p className="text-right pr-3">₱XXX.XX</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right: Request Summary */}
      <div className="srm-summary">
        <Card className="srm-summary-card">
          <CardContent className="srm-summary-content">
            <div className="srm-summary-body">
              <h1>Request Summary</h1>
              <div className="summary-grid">
                <p>Customer ID</p>
                <p className="text-right">#000001</p>
                <p>Customer Name</p>
                <p className="text-right">Juan Dela Cruz</p>
              </div>

              <div className="summary-date-row">
                <p>Service Request</p>
                <p className="text-right">2025-08-05</p>
              </div>

              <div className="summary-service-list">
                {/* Shoe 1 */}
                <div className="summary-service-entry">
                  <p className="font-medium">Nike Air Max</p>
                  <p>Basic Cleaning</p>
                  <p className="text-right">₱350.00</p>
                  <span></span><p>Unyellowing</p><p className="text-right">₱100.00</p>
                </div>
                {/* Shoe 2 */}
                <div className="summary-service-entry">
                  <p className="font-medium">Adidas NMD</p>
                  <p>Full Reglue</p>
                  <p className="text-right">₱500.00</p>
                  <span></span><p>Color Retouch</p><p className="text-right">₱150.00</p>
                </div>
              </div>

              <div className="summary-discount-row">
                <p>Discount</p>
                <p>(₱50.00)</p>
              </div>
              <div className="summary-discount-row">
                <p>Payment</p>
                <p>(₱500.00)</p>
              </div>
            </div>

            <div className="summary-footer">
              <hr className="section-divider" />
              <div className="summary-balance-row">
                <h2>Balance:</h2>
                <h2>₱550.00</h2>
              </div>
              <div className="summary-est-date">
                <h2>Estimated Date:</h2>
                <h2>2025-08-12</h2>
              </div>
              <Button className="w-full p-8 mt-4 button-lg bg-[#22C55E] hover:bg-[#1E9A50]">Confirm Service Request</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}