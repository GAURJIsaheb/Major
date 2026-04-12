import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmployeeTable from "@/components/employee/EmployeeTable";
import EmployeeModal from "@/components/employee/EmployeeModal";
import { useEmployee } from "@/hooks/Employee/useEmployee";
import { Users, Search, Plus, UserCheck, TrendingUp } from "lucide-react";
import PageShell, { StatCard, ContentCard, LoadingState, PaginationFooter } from "@/components/PageShell";

export default function Employee() {
    const {
        employees, page, setPage, total, limit, searchQuery, setSearchQuery,
        isModalOpen, selectedEmployee, loading,
        handleAddEmployee, handleEditEmployee, handleModalClose, handleSuccess, totalPages
    } = useEmployee();

    return (
        <PageShell
            icon={Users}
            title="Employee Management"
            subtitle="Manage your organisation's workforce"
            iconColor="text-indigo-600 dark:text-indigo-400"
            iconBg="bg-indigo-100 dark:bg-indigo-900/30"
            blobColor1="bg-indigo-500/6"
            blobColor2="bg-violet-500/4"
            actions={
                <>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-10 rounded-xl bg-background/70 border-border/60"
                        />
                    </div>
                    <Button
                        onClick={handleAddEmployee}
                        className="h-10 gap-2 font-semibold rounded-xl px-5 shadow-md shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] transition-all whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4" /> Add Employee
                    </Button>
                </>
            }
            stats={!loading && (
                <>
                    <StatCard icon={Users} label="Total Employees" value={total}
                        iconColor="text-indigo-600 dark:text-indigo-400" iconBg="bg-indigo-100 dark:bg-indigo-900/30" borderClass="stat-indigo" />
                    <StatCard icon={UserCheck} label="Showing Now" value={employees.length}
                        iconColor="text-emerald-600 dark:text-emerald-400" iconBg="bg-emerald-100 dark:bg-emerald-900/30" borderClass="stat-emerald" />
                    <StatCard icon={TrendingUp} label="Total Pages" value={totalPages || 1}
                        iconColor="text-violet-600 dark:text-violet-400" iconBg="bg-violet-100 dark:bg-violet-900/30" borderClass="stat-violet" />
                </>
            )}
        >
            <ContentCard>
                {loading ? (
                    <LoadingState label="Loading employee directory..." iconColor="text-indigo-600 dark:text-indigo-400" iconBg="bg-indigo-100 dark:bg-indigo-900/30" />
                ) : (
                    <>
                        <EmployeeTable employees={employees} onEdit={handleEditEmployee} startIndex={(page - 1) * limit + 1} />
                        <PaginationFooter
                            page={page} totalPages={totalPages} total={total} limit={limit}
                            onPrev={() => setPage(p => Math.max(1, p - 1))}
                            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                            unit="employees"
                        />
                    </>
                )}
            </ContentCard>

            <EmployeeModal isOpen={isModalOpen} onClose={handleModalClose} initialData={selectedEmployee} onSuccess={handleSuccess} />
        </PageShell>
    );
}
