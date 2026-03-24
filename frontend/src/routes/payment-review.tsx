import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/payment-review")({
  component: PaymentReviewPage,
})

function PaymentReviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Payment Review</h1>
      <p className="text-muted-foreground">Payment review content will be displayed here</p>
    </div>
  )
}
