import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import AssetTable from "@/components/assets/AssetTable";
import CreateAssetModal from "@/components/assets/CreateAssetModal";
import { useAssets } from "@/hooks/Assets/useAssets";
import {
    Package, Loader2, Plus, Filter, CheckCircle2, Wrench,
    Trash2, ChevronsUpDown, Check, UserCircle, Search, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PageShell, { StatCard, ContentCard, LoadingState, PaginationFooter } from "@/components/PageShell";

const STATUSES = [
    { value: "all",          label: "All Statuses" },
    { value: "AVAILABLE",    label: "Available" },
    { value: "ASSIGNED",     label: "Assigned" },
    { value: "MAINTENANCE",  label: "Maintenance" },
    { value: "DISPOSED",     label: "Disposed" },
];

export default function Assets() {
    const {
        assets, loading, page, setPage, total, limit, role, isCreateOpen,
        statusFilter, departmentFilter, departments, stats,
        employeeSearchOpen, setEmployeeSearchOpen, employeeSearchQuery,
        employeeSearchResults, employeeSearching, selectedEmployee,
        handleEmployeeSearchChange, handleSelectEmployee, handleClearEmployee,
        handleStatusFilter, handleDepartmentFilter,
        handleOpenCreate, handleCloseCreate, handleCreateSuccess,
    } = useAssets();

    const totalPages = Math.ceil(total / limit);
    const isHR = role === "HR";

    return (
        <PageShell
            icon={Package}
            title="Assets Management"
            subtitle={isHR ? "View and manage all company assets" : "View your assigned assets"}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            blobColor1="bg-purple-500/6"
            blobColor2="bg-indigo-500/4"
            actions={isHR && (
                <Button onClick={handleOpenCreate} className="h-10 gap-2 font-semibold rounded-xl px-5 shadow-md shadow-primary/20 hover:scale-[1.01] transition-all whitespace-nowrap">
                    <Plus className="h-4 w-4" /> Add Asset
                </Button>
            )}
            stats={isHR && stats && (
                <>
                    <StatCard icon={Package} label="Total Assets" value={stats.totalAssets}
                        iconColor="text-blue-600 dark:text-blue-400" iconBg="bg-blue-100 dark:bg-blue-900/30" borderClass="stat-sky" />
                    <StatCard icon={CheckCircle2} label="Available" value={stats.availableCount}
                        iconColor="text-emerald-600 dark:text-emerald-400" iconBg="bg-emerald-100 dark:bg-emerald-900/30" borderClass="stat-emerald" />
                    <StatCard icon={Wrench} label="Maintenance" value={stats.maintenanceCount}
                        iconColor="text-amber-600 dark:text-amber-400" iconBg="bg-amber-100 dark:bg-amber-900/30" borderClass="stat-amber" />
                    <StatCard icon={Trash2} label="Disposed" value={stats.disposedCount}
                        iconColor="text-rose-600 dark:text-rose-400" iconBg="bg-rose-100 dark:bg-rose-900/30" borderClass="stat-rose" />
                </>
            )}
        >
            {/* Filters row — HR only */}
            {isHR && (
                <div className="flex flex-wrap items-center gap-2.5 px-0.5">
                    <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                        <SelectTrigger className="h-9 w-44 text-sm rounded-xl bg-card border-border/60">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={departmentFilter} onValueChange={handleDepartmentFilter}>
                        <SelectTrigger className="h-9 w-52 text-sm rounded-xl bg-card border-border/60">
                            <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map(d => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* Employee search */}
                    <div className="flex items-center gap-2">
                        <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" aria-expanded={employeeSearchOpen}
                                    className={cn("w-56 justify-between font-normal h-9 text-sm rounded-xl", selectedEmployee && "border-primary/20 bg-primary/5")}>
                                    {selectedEmployee ? (
                                        <span className="flex items-center gap-2 truncate">
                                            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                                                {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                                            </span>
                                            <span className="truncate">{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">Search employee...</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput placeholder="Type a name..." value={employeeSearchQuery} onValueChange={handleEmployeeSearchChange} />
                                    <CommandList>
                                        {employeeSearching ? (
                                            <div className="flex items-center justify-center py-6 text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                <span className="text-sm">Searching...</span>
                                            </div>
                                        ) : employeeSearchQuery.trim().length < 2 ? (
                                            <div className="flex flex-col items-center py-6 text-muted-foreground">
                                                <Search className="h-6 w-6 mb-2 opacity-40" />
                                                <span className="text-xs">Type at least 2 characters</span>
                                            </div>
                                        ) : employeeSearchResults.length === 0 ? (
                                            <CommandEmpty>
                                                <div className="flex flex-col items-center py-4 text-muted-foreground">
                                                    <UserCircle className="h-6 w-6 mb-2 opacity-40" />
                                                    <span className="text-xs">No employee found</span>
                                                </div>
                                            </CommandEmpty>
                                        ) : (
                                            <CommandGroup>
                                                {employeeSearchResults.map(user => (
                                                    <CommandItem key={user._id} value={user._id} onSelect={() => handleSelectEmployee(user)} className="flex items-center gap-3 py-2">
                                                        <span className={cn("flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold shrink-0",
                                                            selectedEmployee?._id === user._id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                                                            {user.firstName[0]}{user.lastName[0]}
                                                        </span>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-medium truncate text-sm">{user.firstName} {user.lastName}</span>
                                                            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                                        </div>
                                                        {user.deptId && <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 shrink-0">{user.deptId.name}</Badge>}
                                                        <Check className={cn("h-4 w-4 text-primary shrink-0", selectedEmployee?._id === user._id ? "opacity-100" : "opacity-0")} />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {selectedEmployee && (
                            <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground hover:text-foreground" onClick={handleClearEmployee}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <ContentCard>
                {loading ? (
                    <LoadingState label="Loading assets..." iconColor="text-purple-600 dark:text-purple-400" iconBg="bg-purple-100 dark:bg-purple-900/30" />
                ) : (
                    <>
                        <AssetTable assets={assets} isHR={isHR} startIndex={(page - 1) * limit + 1} />
                        <PaginationFooter
                            page={page} totalPages={totalPages} total={total} limit={limit}
                            onPrev={() => setPage(p => Math.max(1, p - 1))}
                            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                            unit="assets"
                        />
                    </>
                )}
            </ContentCard>

            {isHR && <CreateAssetModal isOpen={isCreateOpen} onClose={handleCloseCreate} onSuccess={handleCreateSuccess} />}
        </PageShell>
    );
}
