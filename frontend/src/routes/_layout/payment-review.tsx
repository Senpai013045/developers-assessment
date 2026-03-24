import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PaymentModal } from "@/components/Common/PaymentModal"
import {
  getApprovedWorklogs,
  getFreelancers,
  getWorklogsWithEarnings,
} from "@/data"

export const Route = createFileRoute("/_layout/payment-review")({
  component: PaymentReviewPage,
})

function PaymentReviewPage() {
  const [excludedWorklogs, setExcludedWorklogs] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)

  const approvedWorklogIds = getApprovedWorklogs()
  const allWorklogs = getWorklogsWithEarnings()
  const freelancers = getFreelancers()

  const approvedWorklogs = allWorklogs.filter((w) =>
    approvedWorklogIds.includes(w.id)
  )

  const paymentWorklogs = approvedWorklogs.filter(
    (w) => !excludedWorklogs.has(w.id)
  )

  const activeFreelancers = paymentWorklogs.reduce((acc, w) => {
    if (w.freelancer && !acc.find((f) => f.id === w.freelancer?.id)) {
      acc.push(w.freelancer)
    }
    return acc
  }, [] as typeof freelancers)

  const totalAmount = paymentWorklogs.reduce((sum, w) => sum + w.totalEarnings, 0)

  const removeWorklog = (id: string) => {
    setExcludedWorklogs((prev) => new Set([...prev, id]))
  }

  const removeFreelancer = (freelancerId: string) => {
    const worklogsToExclude = approvedWorklogs
      .filter((w) => w.freelancerId === freelancerId)
      .map((w) => w.id)

    setExcludedWorklogs((prev) => new Set([...prev, ...worklogsToExclude]))
  }

  const handleConfirmPayment = () => {
    localStorage.removeItem("approvedWorklogs")
    setExcludedWorklogs(new Set())
  }

  const freelancerBreakdown = activeFreelancers.map((f) => {
    const amount = paymentWorklogs
      .filter((w) => w.freelancerId === f.id)
      .reduce((sum, w) => sum + w.totalEarnings, 0)
    return { name: f.name, amount }
  })

  if (approvedWorklogs.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Payment Review</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No approved worklogs to review. Approve some worklogs first.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payment Review</h1>

      <Card>
        <CardHeader>
          <CardTitle>Freelancers</CardTitle>
        </CardHeader>
        <CardContent>
          {activeFreelancers.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              All freelancers excluded.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeFreelancers.map((f) => {
                const worklogCount = paymentWorklogs.filter(
                  (w) => w.freelancerId === f.id
                ).length
                return (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 rounded-md border px-3 py-1.5 pr-2"
                  >
                    <span className="text-sm">
                      {f.name} ({worklogCount} worklogs)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFreelancer(f.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${f.name}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Worklogs</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentWorklogs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              All worklogs excluded.
            </p>
          ) : (
            <div className="space-y-2">
              {paymentWorklogs.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div>
                    <span className="font-medium">{w.task}</span>
                    <span className="text-muted-foreground text-sm ml-2">
                      {w.freelancer?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      ${w.totalEarnings.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeWorklog(w.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${w.task}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-6 py-4">
        <div className="space-y-1">
          <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">
            {paymentWorklogs.length} worklogs | {activeFreelancers.length} freelancers
          </div>
        </div>
        <Button
          size="lg"
          disabled={paymentWorklogs.length === 0}
          onClick={() => setModalOpen(true)}
        >
          Proceed to Payment
        </Button>
      </div>

      <PaymentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        totalWorklogs={paymentWorklogs.length}
        totalFreelancers={activeFreelancers.length}
        totalAmount={totalAmount}
        freelancerBreakdown={freelancerBreakdown}
        onConfirm={handleConfirmPayment}
      />
    </div>
  )
}
