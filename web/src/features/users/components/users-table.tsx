"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  CircleXIcon,
  ListFilterIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  checkAdminRole,
  isAdmin,
  isManager,
} from "@/features/auth/utils/admin";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { UserWithRole } from "better-auth/plugins";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/features/auth/hooks/session";
import { DeleteUserButton } from "./delete-user-button";
import { getUsersListQueryOptions } from "../queries/users-list-query-options";
import { changeMemberRoleAction } from "../actions/change-member-role";
import { useSettingsSections } from "@/features/settings/contexts/settings-sections";
import { Spinner } from "@/components/ui/spinner";
import { rolesWithLabels } from "@/features/auth/constants";
import { Session } from "@/lib/auth/server";
import { Role } from "@/features/auth/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DEFAULT_PAGE_SIZE = 3;
const DEFAULT_PAGE_INDEX = 0;

const multiColumnFilterFn: FilterFn<UserWithRole> = (
  row,
  _columnId,
  filterValue,
) => {
  const user = row.original as Session["user"];
  let searchableRowContent = user.email;

  if (!user.firstLogin) {
    searchableRowContent += ` ${user.name}`;
  }

  searchableRowContent = searchableRowContent.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();

  return searchableRowContent.includes(searchTerm);
};

const columns: ColumnDef<UserWithRole>[] = [
  {
    size: 140,
    header: "Nom",
    accessorKey: "name",
    filterFn: multiColumnFilterFn,
    cell: ({ row }) => {
      return (
        <span className="line-clamp-1 font-medium text-ellipsis">
          {!(row.original as Session["user"]).firstLogin
            ? row.getValue("name")
            : "-"}
        </span>
      );
    },
  },
  {
    size: 180,
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => (
      <span className="text-muted-foreground line-clamp-1 text-ellipsis">
        {row.original.email}
      </span>
    ),
  },
  {
    size: 116,
    header: "Rôle",
    accessorKey: "role",
    cell: ({ row }) => {
      const {
        data: sessionRes,
        isPending: isSessionPending,
      } = useSession();
      const isCurrentUserAdmin = isAdmin(
        sessionRes?.user.role,
      );
      const isCurrentUserManager = isManager(
        sessionRes?.user.role,
      );
      const isRowUserAdmin = isAdmin(row.original.role);
      const { setActiveSectionId } = useSettingsSections();

      // Change role permissions:
      // 1. if current user has an admin role (admin or manager) => can change role
      // 2. if current user is manager and selected user is not admin => can change role
      const canChangeRole =
        (isCurrentUserManager && !isRowUserAdmin) ||
        isCurrentUserAdmin;

      const qc = useQueryClient();
      const [isUpdating, startRoleUpdate] = useTransition();
      const rolesWithoutAdmin = rolesWithLabels.filter(
        (role) => role.value !== "admin",
      );

      const handleRoleChange = (role: Role) => {
        if (!canChangeRole) {
          return;
        }

        startRoleUpdate(async () => {
          const res = await changeMemberRoleAction(
            row.original.id,
            role,
          );

          if (!res.ok) {
            toast.error(
              res.error || "Une erreur est survenue",
            );
            return;
          }

          await Promise.all([
            qc.invalidateQueries({
              queryKey: ["users-list"],
            }),
            qc.invalidateQueries({
              queryKey: ["session"],
            }),
          ]);

          if (
            sessionRes?.user.id === row.original.id &&
            !checkAdminRole(role)
          ) {
            setActiveSectionId("general");
          }

          toast.success("Rôle mis à jour avec succès");
        });
      };

      return (
        <Select
          value={row.original.role}
          onValueChange={handleRoleChange}
          disabled={
            isUpdating || isSessionPending || !canChangeRole
          }
        >
          <SelectTrigger
            size="sm"
            className="w-full rounded-lg px-2 py-1 text-sm"
            rightIcon={
              isUpdating
                ? (className) => (
                    <Spinner className={className} />
                  )
                : undefined
            }
          >
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
            {isCurrentUserAdmin || isRowUserAdmin
              ? rolesWithLabels.map((role) => {
                  return (
                    <SelectItem
                      key={role.value}
                      value={role.value}
                    >
                      {role.label}
                    </SelectItem>
                  );
                })
              : rolesWithoutAdmin.map((role) => {
                  return (
                    <SelectItem
                      key={role.value}
                      value={role.value}
                    >
                      {role.label}
                    </SelectItem>
                  );
                })}
          </SelectContent>
        </Select>
      );
    },
  },
  {
    size: 120,
    header: "Dernière activité",
    accessorKey: "updatedAt",
    cell: ({ row }) =>
      new Date(
        row.getValue("updatedAt"),
      ).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    size: 100,
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <DeleteUserButton
        user={row.original as Session["user"]}
      />
    ),
  },
];

export function UsersTable() {
  const id = useId();

  const { data: users, status } = useQuery(
    getUsersListQueryOptions(),
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const [pagination, setPagination] =
    useState<PaginationState>({
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
    });

  const table = useReactTable({
    data: users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              id={`${id}-input`}
              ref={inputRef}
              disabled={status !== "success"}
              className={cn(
                "peer min-w-62 ps-9",
                Boolean(
                  table.getColumn("name")?.getFilterValue(),
                ) && "pe-9",
              )}
              value={
                (table
                  .getColumn("name")
                  ?.getFilterValue() ?? "") as string
              }
              onChange={(e) =>
                table
                  .getColumn("name")
                  ?.setFilterValue(e.target.value)
              }
              placeholder="Recherche par nom ou email..."
              aria-label="Recherche par nom ou email"
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <ListFilterIcon
                size={16}
                aria-hidden="true"
              />
            </div>
            {Boolean(
              table.getColumn("name")?.getFilterValue(),
            ) && (
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear filter"
                disabled={status !== "success"}
                onClick={() => {
                  table
                    .getColumn("name")
                    ?.setFilterValue("");
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <CircleXIcon
                  size={16}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-background grid rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent"
              >
                {headerGroup.headers.map((header, idx) => {
                  const isLast =
                    idx === headerGroup.headers.length - 1;

                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: `${header.getSize()}px`,
                      }}
                      className={cn("h-11", {
                        "text-end": isLast,
                      })}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {status === "error" ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Erreur survenue lors du chargement.
                </TableCell>
              </TableRow>
            ) : status === "pending" ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex w-full items-center justify-center">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={
                    row.getIsSelected() && "selected"
                  }
                >
                  {row
                    .getVisibleCells()
                    .map((cell, idx) => {
                      const isLast =
                        idx ===
                        row.getVisibleCells().length - 1;

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn({
                            "text-end": isLast,
                            "text-muted-foreground text-center":
                              cell.column.id === "name" &&
                              (
                                cell.row
                                  .original as Session["user"]
                              ).firstLogin,
                          })}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-end gap-8">
        {/* PAGE NUMBER INFORMATION */}
        <div className="text-muted-foreground flex justify-end text-sm whitespace-nowrap">
          <p
            className="text-muted-foreground text-sm whitespace-nowrap"
            aria-live="polite"
          >
            <span className="text-foreground">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
              -
              {Math.min(
                Math.max(
                  table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    table.getState().pagination.pageSize,
                  0,
                ),
                table.getRowCount(),
              )}
            </span>{" "}
            sur{" "}
            <span className="text-foreground">
              {table.getRowCount().toString()}
            </span>
          </p>
        </div>

        {/* PAGINATION BUTTONS */}
        <div>
          <Pagination>
            <PaginationContent>
              {/* First page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.firstPage()}
                  disabled={
                    !table.getCanPreviousPage() ||
                    status !== "success" ||
                    users.length === 0
                  }
                  aria-label="Go to first page"
                >
                  <ChevronFirst
                    size={16}
                    aria-hidden="true"
                  />
                </Button>
              </PaginationItem>
              {/* Previous page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={
                    !table.getCanPreviousPage() ||
                    status !== "success" ||
                    users.length === 0
                  }
                  aria-label="Go to previous page"
                >
                  <ChevronLeft
                    size={16}
                    aria-hidden="true"
                  />
                </Button>
              </PaginationItem>
              {/* Next page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={
                    !table.getCanNextPage() ||
                    status !== "success" ||
                    users.length === 0
                  }
                  aria-label="Go to next page"
                >
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                  />
                </Button>
              </PaginationItem>
              {/* Last page button */}
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  className="disabled:pointer-events-none disabled:opacity-50"
                  onClick={() => table.lastPage()}
                  disabled={
                    !table.getCanNextPage() ||
                    status !== "success" ||
                    users.length === 0
                  }
                  aria-label="Go to last page"
                >
                  <ChevronLast
                    size={16}
                    aria-hidden="true"
                  />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
