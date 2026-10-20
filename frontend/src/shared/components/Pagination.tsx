import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, disabled = false, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-3" aria-label="Pagination">
      <Button
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        <ChevronLeft /> Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
      >
        Next <ChevronRight />
      </Button>
    </nav>
  );
}
