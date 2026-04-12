import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DepartmentTable from "@/components/departments/DepartmentTable";
import DepartmentModal from "@/components/departments/DepartmentModal";
import { useDepartments } from "@/hooks/Departments/useDepartments";
import { Building2, Search, Plus, Layers, Users } from "lucide-react";
import PageShell, { StatCard, ContentCard, LoadingState, PaginationFooter } from "@/components/PageShell";

export default function Departments() {
    const {
        departments, isModalOpen, selectedDept, loading, page, setPage,
        total, limit, searchQuery, setSearchQuery,
        handleAddDept, handleEditDept, handleDeleteDept, handleModalClose, handleSuccess
    } = useDepartments();

    const totalPages = Math.ceil(total / limit);

    return (
        <PageShell
            icon={Building2}
            title="Department Management"
            subtitle="Organise your teams and structures"
            iconColor="text-violet-600 dark:text-violet-400"
            iconBg="bg-violet-100 dark:bg-violet-900/30"
            blobColor1="bg-violet-500/6"
            blobColor2="bg-indigo-500/4"
            actions={
                <>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-10 rounded-xl bg-background/70 border-border/60"
                        />
                    </div>
                    <Button onClick={handleAddDept} className="h-10 gap-2 font-semibold rounded-xl px-5 shadow-md shadow-primary/20 hover:scale-[1.01] transition-all whitespace-nowrap">
                        <Plus className="h-4 w-4" /> Add Department
                    </Button>
                </>
            }
            stats={!loading && (
                <>
                    <StatCard icon={Building2} label="Total Departments" value={total}
                        iconColor="text-violet-600 dark:text-violet-400" iconBg="bg-violet-100 dark:bg-violet-900/30" borderClass="stat-violet" />
                    <StatCard icon={Layers} label="Showing Now" value={departments.length}
                        iconColor="text-indigo-600 dark:text-indigo-400" iconBg="bg-indigo-100 dark:bg-indigo-900/30" borderClass="stat-indigo" />
                    <StatCard icon={Users} label="Total Pages" value={totalPages || 1}
                        iconColor="text-cyan-600 dark:text-cyan-400" iconBg="bg-cyan-100 dark:bg-cyan-900/30" borderClass="stat-cyan" />
                </>
            )}
        >
            <ContentCard>
                {loading ? (
                    <LoadingState label="Loading departments..." iconColor="text-violet-600 dark:text-violet-400" iconBg="bg-violet-100 dark:bg-violet-900/30" />
                ) : (
                    <>
                        <DepartmentTable departments={departments} onEdit={handleEditDept} onDelete={handleDeleteDept} />
                        <PaginationFooter
                            page={page} totalPages={totalPages} total={total} limit={limit}
                            onPrev={() => setPage(p => Math.max(1, p - 1))}
                            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                            unit="departments"
                        />
                    </>
                )}
            </ContentCard>
            <DepartmentModal isOpen={isModalOpen} onClose={handleModalClose} initialData={selectedDept} onSuccess={handleSuccess} />
        </PageShell>
    );
}
