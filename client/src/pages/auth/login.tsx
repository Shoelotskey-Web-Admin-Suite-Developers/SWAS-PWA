import { useState } from 'react'
import SWAS_Logo from '@/assets/images/SWAS-Logo-Large.png'
import BG_PATTERN from '@/assets/images/bg-pattern.png'
import '@/styles/login.css'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { BRANCH_OPTIONS } from '@/constants/branches'

function Login() {
  const [form, setForm] = useState({
    branch: '',
    userId: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.branch) {
      alert("Please select a branch")
      return
    }

    setLoading(true)

    const payload = { ...form }
    console.log('Logging in with:', payload)

    setTimeout(() => setLoading(false), 1000)
  }


  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${BG_PATTERN})` }}
    >
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-card-content">
          <div className="logo-wrapper">
            <img src={SWAS_Logo} alt="Shoelotskey Logo" className="logo" />
          </div>

          <div className="input-wrapper">
            <InputField label="Choose Branch" >
              <Select
                onValueChange={(val) => handleChange('branch', val)}
                value={form.branch}
              >
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {BRANCH_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InputField>

            <InputField label="User ID" htmlFor="userId">
              <Input
                id="userId"
                value={form.userId}
                onChange={(e) => handleChange('userId', e.target.value)}
                required
              />
            </InputField>

            <InputField label="Password" htmlFor="password">
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
              />
            </InputField>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'LOG IN'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login

// 🔁 Reusable field wrapper
type InputFieldProps = {
  label: string
  htmlFor?: string
  children: React.ReactNode
}

function InputField({ label, htmlFor, children }: InputFieldProps) {
  return (
    <div className="input-container login-input">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
