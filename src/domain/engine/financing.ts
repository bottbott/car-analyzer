export interface LoanScheduleYear {
  /** Ownership year (1-based). */
  year: number
  interest: number
  principal: number
  payment: number
  balanceEnd: number
}

export interface LoanTerms {
  principal: number
  annualRate: number
  termMonths: number
}

/** Standard amortizing monthly payment. */
export function monthlyPayment(terms: LoanTerms): number {
  const { principal, annualRate, termMonths } = terms
  if (principal <= 0 || termMonths <= 0) return 0
  if (annualRate === 0) return principal / termMonths

  const r = annualRate / 12
  const factor = Math.pow(1 + r, termMonths)
  return (principal * r * factor) / (factor - 1)
}

/** Build a year-by-year schedule covering `horizonYears` of ownership. */
export function buildLoanSchedule(
  terms: LoanTerms,
  horizonYears: number,
): LoanScheduleYear[] {
  const payment = monthlyPayment(terms)
  const monthlyRate = terms.annualRate / 12
  let balance = terms.principal
  const years: LoanScheduleYear[] = []

  for (let y = 1; y <= horizonYears; y++) {
    let interest = 0
    let principal = 0
    let paid = 0

    for (let m = 0; m < 12; m++) {
      if (balance <= 0.01) {
        balance = 0
        break
      }
      const monthInterest = balance * monthlyRate
      let monthPrincipal = payment - monthInterest
      if (monthPrincipal > balance) {
        monthPrincipal = balance
      }
      const monthPayment = monthInterest + monthPrincipal
      interest += monthInterest
      principal += monthPrincipal
      paid += monthPayment
      balance -= monthPrincipal
    }

    if (balance < 0.01) balance = 0

    years.push({
      year: y,
      interest: round2(interest),
      principal: round2(principal),
      payment: round2(paid),
      balanceEnd: round2(balance),
    })
  }

  return years
}

export function loanPrincipalAmount(
  purchasePrice: number,
  salesTax: number,
  docTitleFees: number,
  downPayment: number,
): number {
  return Math.max(0, purchasePrice + salesTax + docTitleFees - downPayment)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
