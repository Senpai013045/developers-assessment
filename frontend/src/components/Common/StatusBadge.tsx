import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  isLocallyApproved?: boolean
}

function StatusBadge({ status, isLocallyApproved }: StatusBadgeProps) {
  const isApproved = isLocallyApproved || status === "approved"
  const label = status === "paid" ? "Paid" : isApproved ? "Approved" : "Pending"

  return (
    <Badge
      variant={
        status === "paid"
          ? "secondary"
          : isApproved
            ? "default"
            : "secondary"
      }
    >
      {label}
    </Badge>
  )
}

export { StatusBadge }
