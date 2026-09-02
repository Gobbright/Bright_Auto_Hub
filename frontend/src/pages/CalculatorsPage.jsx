import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Header, Icon } from './Home.jsx'
import PublicFooter from '../components/PublicFooter.jsx'
import '../styles/pages/calculators.css'

const tools = [
  { slug: 'emi-calculator', name: 'EMI Calculator', shortName: 'EMI', copy: 'Estimate car, bike, EV, commercial vehicle or tractor loan EMI with loan amount, interest rate and tenure.', icon: 'calculator', kind: 'emi' },
  { slug: 'vehicle-loan-calculator', name: 'Vehicle Loan Calculator', shortName: 'Loan', copy: 'Check the loan amount, down payment and total interest before sending a finance enquiry.', icon: 'calculator', kind: 'loan' },
  { slug: 'fuel-cost-calculator', name: 'Fuel Cost Calculator', shortName: 'Fuel', copy: 'Calculate petrol, diesel or CNG running cost using monthly distance, mileage and fuel price.', icon: 'car', kind: 'fuel' },
  { slug: 'mileage-calculator', name: 'Mileage Calculator', shortName: 'Mileage', copy: 'Find your vehicle mileage from fuel filled and kilometres driven after a tank-to-tank check.', icon: 'car', kind: 'mileage' },
  { slug: 'ev-running-cost-calculator', name: 'EV Running Cost Calculator', shortName: 'EV Cost', copy: 'Compare electric vehicle running cost by battery efficiency, electricity tariff and monthly distance.', icon: 'bolt', kind: 'ev' },
  { slug: 'on-road-price-calculator', name: 'On-Road Price Calculator', shortName: 'On-road', copy: 'Add registration, insurance, handling and accessory costs to understand the final on-road price.', icon: 'tag', kind: 'onroad' },
  { slug: 'vehicle-valuation', name: 'Vehicle Valuation', shortName: 'Value', copy: 'Get an indicative resale value using age, original price, condition, kilometres and ownership profile.', icon: 'shield', kind: 'valuation' },
  { slug: 'exchange-value-calculator', name: 'Exchange Value Calculator', shortName: 'Exchange', copy: 'Plan your upgrade by calculating approximate exchange value and effective new vehicle budget.', icon: 'compare', kind: 'exchange' },
]

const toolBySlug = new Map(tools.map((tool) => [tool.slug, tool]))
const money = (value) => 'Rs. ' + Math.max(0, Math.round(Number(value) || 0)).toLocaleString('en-IN')
const plain = (value) => Math.max(0, Math.round(Number(value) || 0)).toLocaleString('en-IN')
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0))

function Field({ label, value, onChange, min = 0, max, step = 1, suffix = '', moneyValue = false }) {
  const numeric = Number(value) || 0
  const safeMax = Math.max(max, min + step)
  const progress = ((Math.min(safeMax, Math.max(min, numeric)) - min) / (safeMax - min)) * 100
  const setValue = (event) => onChange(Number(event.target.value) || 0)

  return <label className='calculator-field' style={{ '--range-progress': `${progress}%` }}>
    <span className='calculator-field-row'>
      <span>{label}<b>*</b> :</span>
      <input type='number' min={min} max={max} step={step} value={value} onChange={setValue} aria-label={label} />
    </span>
    <input className='calculator-slider' type='range' min={min} max={max} step={step} value={value} onChange={setValue} aria-label={`${label} slider`} />
    <em>{moneyValue ? money(numeric) : `${plain(numeric)}${suffix}`}</em>
  </label>
}

function PieChart({ segments, title, note }) {
  const values = segments.map((item) => Math.max(0, Number(item.value) || 0))
  const total = values.reduce((sum, value) => sum + value, 0) || 1
  let cursor = 0
  const colors = ['#e5091a', '#151d2b', '#ff4654', '#f2a900']
  const stops = values.map((value, index) => {
    const start = cursor
    cursor += value / total * 100
    return `${colors[index % colors.length]} ${start}% ${cursor}%`
  }).join(', ')
  const labelled = segments.slice(0, 3).map((item, index) => ({ ...item, color: colors[index % colors.length], percent: Math.round(values[index] / total * 100) }))

  return <aside className='calculator-chart-panel'>
    <div className='calculator-pie' style={{ background: `conic-gradient(${stops})` }} aria-label={title}>
      {labelled.map((item, index) => <span className={`pie-percent pie-percent-${index + 1}`} key={item.label}>{item.percent}%</span>)}
    </div>
    <div className='calculator-legend'>
      {labelled.map((item) => <span key={item.label}><i style={{ background: item.color }} />{item.label}</span>)}
    </div>
    <h2>{title}</h2>
    <p>{note}</p>
  </aside>
}

function ResultCards({ items }) {
  return <div className='calculator-result-cards'>
    {items.map((item) => <div key={item.label}>
      <span>{item.label}:</span>
      <strong>{item.value}</strong>
    </div>)}
  </div>
}

function CalculatorForm({ tool }) {
  const [vehiclePrice, setVehiclePrice] = useState(1000000)
  const [downPayment, setDownPayment] = useState(200000)
  const [rate, setRate] = useState(9)
  const [years, setYears] = useState(5)
  const [distance, setDistance] = useState(1000)
  const [mileage, setMileage] = useState(15)
  const [fuelPrice, setFuelPrice] = useState(105)
  const [fuelUsed, setFuelUsed] = useState(30)
  const [kmDriven, setKmDriven] = useState(450)
  const [evEfficiency, setEvEfficiency] = useState(7)
  const [electricityRate, setElectricityRate] = useState(8)
  const [registration, setRegistration] = useState(90000)
  const [insurance, setInsurance] = useState(45000)
  const [handling, setHandling] = useState(12000)
  const [accessories, setAccessories] = useState(18000)
  const [age, setAge] = useState(4)
  const [conditionScore, setConditionScore] = useState(82)
  const [kmTotal, setKmTotal] = useState(45000)

  const principal = Math.max(0, vehiclePrice - downPayment)
  const months = Math.max(1, years * 12)
  const monthlyRate = rate / 1200
  const emi = monthlyRate ? principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1) : principal / months
  const totalPayable = emi * months
  const interest = Math.max(0, totalPayable - principal)
  const monthlyFuel = mileage > 0 ? distance / mileage * fuelPrice : 0
  const litres = mileage > 0 ? distance / mileage : 0
  const realMileage = fuelUsed > 0 ? kmDriven / fuelUsed : 0
  const evMonthly = evEfficiency > 0 ? distance / evEfficiency * electricityRate : 0
  const evUnits = evEfficiency > 0 ? distance / evEfficiency : 0
  const onRoad = vehiclePrice + registration + insurance + handling + accessories
  const extraCharges = onRoad - vehiclePrice
  const depreciation = Math.min(0.82, age * 0.095 + Math.max(0, kmTotal - 15000) / 1000000)
  const conditionFactor = 0.82 + clamp(conditionScore, 45, 100) / 500
  const valuation = vehiclePrice * (1 - depreciation) * conditionFactor
  const lostValue = Math.max(0, vehiclePrice - valuation)
  const exchangeBonus = 25000
  const exchangeValue = valuation + exchangeBonus

  const loanFields = <>
    <Field label='Principal Loan Amount' value={principal} onChange={(value) => setVehiclePrice(value + downPayment)} max={8000000} step={10000} moneyValue />
    <Field label='Interest Rate ( % p.a )' value={rate} onChange={setRate} max={24} step={0.1} suffix='%' />
    <Field label='Loan Term (Years)' value={years} onChange={setYears} min={1} max={10} step={1} suffix=' yrs' />
  </>

  const forms = {
    emi: {
      fields: loanFields,
      button: 'SHOW EMI',
      chartTitle: 'Total Repayment',
      chartNote: 'Total Repayment = Principal Amount + Total Interest',
      chart: [{ label: 'Principal Amount', value: principal }, { label: 'Total Interest', value: interest }],
      results: [{ label: 'Monthly Payment (EMI)', value: money(emi) }, { label: 'Total Interest', value: money(interest) }, { label: 'Total Repayment', value: money(totalPayable) }],
    },
    loan: {
      fields: <>{loanFields}<Field label='Down Payment' value={downPayment} onChange={setDownPayment} max={3000000} step={5000} moneyValue /></>,
      button: 'SHOW LOAN',
      chartTitle: 'Loan Breakup',
      chartNote: 'Vehicle Budget = Loan Amount + Down Payment + Interest',
      chart: [{ label: 'Loan Amount', value: principal }, { label: 'Total Interest', value: interest }, { label: 'Down Payment', value: downPayment }],
      results: [{ label: 'Loan Amount', value: money(principal) }, { label: 'Monthly EMI', value: money(emi) }, { label: 'Total Repayment', value: money(totalPayable) }],
    },
    fuel: {
      fields: <><Field label='Monthly Distance' value={distance} onChange={setDistance} max={8000} step={50} suffix=' km' /><Field label='Mileage' value={mileage} onChange={setMileage} min={1} max={60} step={0.5} suffix=' km/l' /><Field label='Fuel Price' value={fuelPrice} onChange={setFuelPrice} max={180} step={0.5} moneyValue /></>,
      button: 'SHOW COST',
      chartTitle: 'Fuel Usage',
      chartNote: 'Fuel Cost = Monthly Distance / Mileage x Fuel Price',
      chart: [{ label: 'Fuel Cost', value: monthlyFuel }, { label: 'Distance Index', value: distance }, { label: 'Mileage Index', value: mileage * 100 }],
      results: [{ label: 'Monthly Fuel Cost', value: money(monthlyFuel) }, { label: 'Fuel Required', value: `${plain(litres)} L` }, { label: 'Yearly Fuel Cost', value: money(monthlyFuel * 12) }],
    },
    mileage: {
      fields: <><Field label='Kilometres Driven' value={kmDriven} onChange={setKmDriven} max={3000} step={10} suffix=' km' /><Field label='Fuel Filled' value={fuelUsed} onChange={setFuelUsed} min={1} max={200} step={0.5} suffix=' L' /></>,
      button: 'SHOW MILEAGE',
      chartTitle: 'Mileage Result',
      chartNote: 'Mileage = Kilometres Driven / Fuel Filled',
      chart: [{ label: 'Kilometres', value: kmDriven }, { label: 'Fuel Litres', value: fuelUsed * 10 }],
      results: [{ label: 'Mileage', value: `${realMileage.toFixed(1)} km/l` }, { label: 'Distance', value: `${plain(kmDriven)} km` }, { label: 'Fuel Filled', value: `${plain(fuelUsed)} L` }],
    },
    ev: {
      fields: <><Field label='Monthly Distance' value={distance} onChange={setDistance} max={8000} step={50} suffix=' km' /><Field label='EV Efficiency' value={evEfficiency} onChange={setEvEfficiency} min={1} max={12} step={0.1} suffix=' km/kWh' /><Field label='Electricity Rate' value={electricityRate} onChange={setElectricityRate} max={30} step={0.5} moneyValue /></>,
      button: 'SHOW EV COST',
      chartTitle: 'EV Running Cost',
      chartNote: 'EV Running Cost = Monthly kWh Usage x Electricity Rate',
      chart: [{ label: 'Charging Cost', value: evMonthly }, { label: 'Monthly kWh', value: evUnits * 10 }, { label: 'Distance Index', value: distance }],
      results: [{ label: 'Monthly EV Cost', value: money(evMonthly) }, { label: 'Units Required', value: `${plain(evUnits)} kWh` }, { label: 'Yearly EV Cost', value: money(evMonthly * 12) }],
    },
    onroad: {
      fields: <><Field label='Ex-showroom Price' value={vehiclePrice} onChange={setVehiclePrice} max={8000000} step={10000} moneyValue /><Field label='Registration & Tax' value={registration} onChange={setRegistration} max={900000} step={5000} moneyValue /><Field label='Insurance' value={insurance} onChange={setInsurance} max={500000} step={2500} moneyValue /><Field label='Handling & Fastag' value={handling} onChange={setHandling} max={100000} step={1000} moneyValue /><Field label='Accessories' value={accessories} onChange={setAccessories} max={300000} step={1000} moneyValue /></>,
      button: 'SHOW PRICE',
      chartTitle: 'On-Road Price',
      chartNote: 'On-Road Price = Ex-showroom + Registration + Insurance + Add-ons',
      chart: [{ label: 'Ex-showroom', value: vehiclePrice }, { label: 'Registration', value: registration }, { label: 'Insurance & Add-ons', value: insurance + handling + accessories }],
      results: [{ label: 'Ex-showroom Price', value: money(vehiclePrice) }, { label: 'Extra Charges', value: money(extraCharges) }, { label: 'On-Road Price', value: money(onRoad) }],
    },
    valuation: {
      fields: <><Field label='Original Purchase Price' value={vehiclePrice} onChange={setVehiclePrice} max={8000000} step={10000} moneyValue /><Field label='Vehicle Age' value={age} onChange={setAge} max={20} step={1} suffix=' yrs' /><Field label='Total Kilometres' value={kmTotal} onChange={setKmTotal} max={300000} step={1000} suffix=' km' /><Field label='Condition Score' value={conditionScore} onChange={setConditionScore} min={45} max={100} step={1} suffix='%' /></>,
      button: 'SHOW VALUE',
      chartTitle: 'Vehicle Value',
      chartNote: 'Estimated Value changes with age, kilometres and condition.',
      chart: [{ label: 'Current Value', value: valuation }, { label: 'Depreciation', value: lostValue }],
      results: [{ label: 'Vehicle Value', value: money(valuation) }, { label: 'Depreciation', value: `${Math.round(depreciation * 100)}%` }, { label: 'Condition Score', value: `${conditionScore}%` }],
    },
    exchange: {
      fields: <><Field label='Current Vehicle Original Price' value={vehiclePrice} onChange={setVehiclePrice} max={8000000} step={10000} moneyValue /><Field label='Vehicle Age' value={age} onChange={setAge} max={20} step={1} suffix=' yrs' /><Field label='Total Kilometres' value={kmTotal} onChange={setKmTotal} max={300000} step={1000} suffix=' km' /><Field label='Condition Score' value={conditionScore} onChange={setConditionScore} min={45} max={100} step={1} suffix='%' /></>,
      button: 'SHOW EXCHANGE',
      chartTitle: 'Exchange Value',
      chartNote: 'Exchange Value = Vehicle Value + Indicative Exchange Benefit',
      chart: [{ label: 'Base Value', value: valuation }, { label: 'Exchange Benefit', value: exchangeBonus }, { label: 'Depreciation', value: lostValue }],
      results: [{ label: 'Base Value', value: money(valuation) }, { label: 'Exchange Benefit', value: money(exchangeBonus) }, { label: 'Exchange Value', value: money(exchangeValue) }],
    },
  }

  const active = forms[tool.kind]

  return <section className='calculator-classic-shell'>
    <div className='calculator-classic-main'>
      <div className='calculator-form-side'>
        <div className='calculator-title-line'>
          <span><Icon name={tool.icon} /></span>
          <h1>{tool.name.toUpperCase()}</h1>
        </div>
        <p className='calculator-required-note'>* An asterisk indicates a required field.</p>
        <div className='calculator-fields'>{active.fields}</div>
        <button className='calculator-show-button' type='button'>{active.button}</button>
      </div>
      <PieChart segments={active.chart} title={active.chartTitle} note={active.chartNote} />
    </div>
    <ResultCards items={active.results} />
  </section>
}

export default function CalculatorsPage() {
  const { calculator } = useParams()
  const selected = toolBySlug.get(calculator || 'emi-calculator')
  const active = selected || tools[0]
  const activeIndex = Math.max(0, tools.findIndex((tool) => tool.slug === active.slug))

  useEffect(() => {
    const title = selected ? selected.name : 'Tools & Calculators'
    document.title = `${title} | Bright Auto Hub`
    document.querySelector('meta[name="description"]')?.setAttribute('content', selected?.copy || 'Use vehicle EMI, loan, fuel cost, mileage, EV running cost, on-road price, valuation and exchange value calculators at Bright Auto Hub.')
  }, [selected])

  if (calculator && !selected) return <Navigate to='/calculators' replace />

  return <div className='calculator-page public-home' id='top'>
    <Header />
    <main>
      <nav className='market-wrap calculator-tabs' aria-label='Vehicle calculator tools' style={{ '--active-index': activeIndex }}>
        <span className='calculator-tab-indicator' aria-hidden='true' />
        {tools.map((tool) => <Link className={tool.slug === active.slug ? 'active' : ''} to={`/calculators/${tool.slug}`} key={tool.slug}><Icon name={tool.icon} /><span>{tool.shortName}</span></Link>)}
      </nav>
      <div className='market-wrap'><CalculatorForm tool={active} /></div>
    </main>
    <PublicFooter />
  </div>
}
