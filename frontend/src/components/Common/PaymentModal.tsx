import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalWorklogs: number
  totalFreelancers: number
  totalAmount: number
  freelancerBreakdown: { name: string; amount: number }[]
  onConfirm: () => void
}

function PaymentModal({
  open,
  onOpenChange,
  totalWorklogs,
  totalFreelancers,
  totalAmount,
  freelancerBreakdown,
  onConfirm,
}: PaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Summary</DialogTitle>
          <DialogDescription>
            Review the payment details before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Worklogs:</span>
              <span className="font-medium">{totalWorklogs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Freelancers:</span>
              <span className="font-medium">{totalFreelancers}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Total Amount:</span>
              <span className="font-bold">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {freelancerBreakdown.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Freelancers:</h4>
              <ul className="space-y-1 text-sm">
                {freelancerBreakdown.map((f, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{f.name}</span>
                    <span>${f.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { PaymentModal }
