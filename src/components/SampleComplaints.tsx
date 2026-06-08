import { CATEGORY_META } from './CategoryBadge'

const SAMPLES = [
  { label: 'Credit card',      category: 'Credit card / prepaid', text: 'My Visa credit card statement shows an unauthorized purchase I never made. I filed a billing dispute with the card issuer but they closed the chargeback without investigating and are still requiring me to pay the disputed amount plus interest.' },
  { label: 'Mortgage',         category: 'Mortgage',              text: 'My mortgage servicer misapplied my payment and is now claiming I owe additional fees. I have proof of payment but they keep sending collection notices.' },
  { label: 'Debt collection',  category: 'Debt collection',       text: 'A debt collector keeps calling me multiple times a day about a debt I already paid off two years ago. They are harassing me and my family members.' },
  { label: 'Credit reporting', category: 'Credit reporting',      text: 'There are multiple errors on my credit report that are dragging my score down. I have disputed them but the bureau keeps saying the information is accurate.' },
  { label: 'Student loan',     category: 'Student loan',          text: 'My student loan servicer is not applying my income-driven repayment plan correctly and keeps adding interest that should not be accruing.' },
  { label: 'Bank account',     category: 'Bank account',          text: 'Someone opened a bank account in my name without my knowledge. This is identity theft and the bank is not cooperating with my fraud claim.' },
  { label: 'Money services',   category: 'Money services',        text: 'I sent a money transfer via Western Union but the recipient never received the funds. It has been three weeks and customer service is unresponsive.' },
  { label: 'Loans',            category: 'Loans',                 text: 'The car loan company repossessed my vehicle even though I was current on all payments. They refuse to return the car or acknowledge their mistake.' },
]

interface Props { onSelect: (text: string) => void }

export default function SampleComplaints({ onSelect }: Props) {
  return (
    <div>
      <p className="section-label mb-2.5">Try a sample</p>
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((s) => {
          const meta = CATEGORY_META[s.category]
          return (
            <button key={s.label} onClick={() => onSelect(s.text)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition hover:brightness-125 focus:outline-none
                ${meta?.bg ?? 'bg-zinc-800/50'}
                ${meta?.text ?? 'text-zinc-400'}
                ${meta?.border ?? 'border-zinc-700/50'}`}
            >
              <span aria-hidden="true">{meta?.icon}</span>
              {s.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
