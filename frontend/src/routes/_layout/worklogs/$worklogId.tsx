import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ChevronLeftIcon, ChevronRightIcon, ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getEntriesByWorklogId,
  getFreelancerById,
  getWorklogById,
} from "@/data";

const PAGE_SIZE = 10;

const searchSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
});

export const Route = createFileRoute("/_layout/worklogs/$worklogId")({
  component: WorklogDetailPage,
  validateSearch: searchSchema,
  loader: ({ params }) => {
    const worklog = getWorklogById(params.worklogId);
    const entries = getEntriesByWorklogId(params.worklogId);
    const freelancer = worklog
      ? getFreelancerById(worklog.freelancerId)
      : null;
    return { worklog, entries, freelancer };
  },
});

type Search = z.infer<typeof searchSchema>;

function WorklogDetailPage() {
  const { worklog, entries, freelancer } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  if (!worklog) {
    return (
      <div className="space-y-6">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4 mr-1" />
            Back to Worklogs
          </Button>
        </Link>
        <p className="text-muted-foreground">Worklog not found</p>
      </div>
    );
  }

  const page = search.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const displayed = entries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalEarnings = entries.reduce(
    (sum, e) => sum + e.hours * (freelancer?.hourlyRate || 0),
    0
  );

  const navigateWithParams = (updates: Partial<Search>) => {
    const newSearch = { ...search, ...updates };
    Object.keys(newSearch).forEach((key) => {
      if (!newSearch[key as keyof Search]) {
        delete newSearch[key as keyof Search];
      }
    });
    navigate({ search: newSearch });
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      navigateWithParams({ page: currentPage - 1 });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      navigateWithParams({ page: currentPage + 1 });
    }
  };

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = Number((e.target as HTMLInputElement).value);
      if (value >= 1 && value <= totalPages) {
        navigateWithParams({ page: value });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="size-4 mr-1" />
          Back to Worklogs
        </Button>
      </Link>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{worklog.task}</h1>
          <Badge
            variant={
              worklog.status === "paid"
                ? "secondary"
                : worklog.status === "approved"
                  ? "outline"
                  : "default"
            }
          >
            {worklog.status}
          </Badge>
        </div>

        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Freelancer: </span>
            <span>{freelancer?.name || "Unknown"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Rate: </span>
            <span>${freelancer?.hourlyRate || 0}/hr</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total: </span>
            <span className="font-semibold">${totalEarnings.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayed.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No time entries found
              </TableCell>
            </TableRow>
          ) : (
            displayed.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.description}</TableCell>
                <TableCell>{entry.hours}</TableCell>
                <TableCell>${freelancer?.hourlyRate || 0}</TableCell>
                <TableCell>
                  ${(entry.hours * (freelancer?.hourlyRate || 0)).toFixed(2)}
                </TableCell>
                <TableCell>{entry.date}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 0 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={totalPages}
              defaultValue={currentPage}
              onKeyDown={handlePageInput}
              className="w-16 text-center"
              aria-label="Go to page"
            />
            <span className="text-sm text-muted-foreground">
              of {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
