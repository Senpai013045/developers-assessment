import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: WorklogsPage,
})

function WorklogsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Worklogs</h1>
      <p className="text-muted-foreground">Worklogs list will be displayed here</p>
    </div>
  )
}
