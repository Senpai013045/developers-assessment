import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/worklogs/$worklogId")({
  component: WorklogDetailPage,
})

function WorklogDetailPage() {
  const { worklogId } = Route.useParams()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Worklog #{worklogId}</h1>
      <p className="text-muted-foreground">Worklog details and time entries will be displayed here</p>
    </div>
  )
}
