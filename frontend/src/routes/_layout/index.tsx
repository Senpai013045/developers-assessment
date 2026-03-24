import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ChevronLeftIcon, ChevronRightIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/Common/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getWorklogsWithEarnings, isWorklogApproved } from "@/data";

const PAGE_SIZE = 5;

const searchSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["pending", "approved", "paid"]).optional(),
});

export const Route = createFileRoute("/_layout/")({
  component: WorklogsPage,
  validateSearch: searchSchema,
  loader: () => {
    return { worklogs: getWorklogsWithEarnings() };
  },
});

type Search = z.infer<typeof searchSchema>;

function WorklogsPage() {
  const { worklogs } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const page = search.page ?? 1;
  const startDate = search.startDate ?? "";
  const endDate = search.endDate ?? "";
  const status = search.status ?? "";
  const hasFilters = Boolean(startDate || endDate || status);

  const navigateWithParams = (updates: Partial<Search>) => {
    const newSearch = { ...search, ...updates };
    if (
      updates.startDate !== undefined ||
      updates.endDate !== undefined ||
      updates.status !== undefined
    ) {
      newSearch.page = 1;
    }
    Object.keys(newSearch).forEach((key) => {
      if (!newSearch[key as keyof Search]) {
        delete newSearch[key as keyof Search];
      }
    });
    navigate({ search: newSearch });
  };

  const filtered = worklogs.filter((w) => {
    const createdAt = new Date(w.createdAt);
    if (startDate && createdAt < new Date(startDate)) return false;
    if (endDate && createdAt > new Date(endDate + "T23:59:59.999Z"))
      return false;
    if (status) {
      const locallyApproved = isWorklogApproved(w.id)
      const effectiveStatus = locallyApproved || w.status === "approved" ? "approved" : w.status
      if (effectiveStatus !== status) return false
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const displayed = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Worklogs</h1>
        <div className="flex gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="startDate"
              className="text-sm text-muted-foreground"
            >
              Start Date
            </label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => {
                navigateWithParams({ startDate: e.target.value });
              }}
              className="w-40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="endDate" className="text-sm text-muted-foreground">
              End Date
            </label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => {
                navigateWithParams({ endDate: e.target.value });
              }}
              className="w-40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="status" className="text-sm text-muted-foreground">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(v) => {
                if (v === "pending" || v === "approved" || v === "paid") {
                  navigateWithParams({ status: v });
                } else {
                  navigateWithParams({ status: undefined });
                }
              }}
            >
              <SelectTrigger className="w-32" id="status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                navigateWithParams({
                  startDate: "",
                  endDate: "",
                  status: undefined,
                })
              }
            >
              <X className="size-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Freelancer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Earnings</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayed.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No worklogs found
              </TableCell>
            </TableRow>
          ) : (
            displayed.map((worklog) => (
              <TableRow key={worklog.id}>
                <TableCell className="font-medium">
                  <Link
                    to="/worklogs/$worklogId"
                    params={{ worklogId: worklog.id }}
                    className="hover:underline"
                  >
                    {worklog.task}
                  </Link>
                </TableCell>
                <TableCell>{worklog.freelancer?.name || "Unknown"}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={worklog.status}
                    isLocallyApproved={isWorklogApproved(worklog.id)}
                  />
                </TableCell>
                <TableCell>${worklog.totalEarnings.toFixed(2)}</TableCell>
                <TableCell>{worklog.createdAt}</TableCell>
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
