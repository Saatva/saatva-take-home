interface MonthlyPaymentProps {
  price: number
  months?: number
}

export function MonthlyPayment({ price, months = 12 }: MonthlyPaymentProps) {
  const monthly = Math.ceil(price / months)

  return (
    <p className="monthly-payment">
      As low as <strong>${monthly.toLocaleString('en-US')}/mo</strong> for {months} months
    </p>
  )
}
