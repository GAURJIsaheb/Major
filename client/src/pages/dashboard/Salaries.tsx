import { Plus, Search, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SalaryTable from '../../components/salaries/SalaryTable';
import CreateSalaryModal from '../../components/salaries/CreateSalaryModal';
import EditSalaryModal from '../../components/salaries/EditSalaryModal';
import { useSalaries } from '@/hooks/Salaries/useSalaries';
import PageShell, { ContentCard, LoadingState, PaginationFooter } from "@/components/PageShell";

const Salaries = () => {
    const {
        isHR, salaries, loading, actionLoading, searchTerm, handleSearch,
        page, setPage, total, limit,
        isCreateModalOpen, isEditModalOpen, editFormData, editEmployeeName,
        handleOpenCreateModal, handleCloseCreateModal, handleOpenEditModal,
        handleCloseEditModal, handleCreateSubmit, handleEditSubmit, handleDelete,
        filteredSalaries
    } = useSalaries();

    const totalPages = Math.ceil(total / limit);

    return (
        <PageShell
            icon={Wallet}
            title="Employee Salaries"
            subtitle="Manage and view employee salary structures"
            iconColor="text-orange-600 dark:text-orange-400"
            iconBg="bg-orange-100 dark:bg-orange-900/30"
            blobColor1="bg-orange-500/6"
            blobColor2="bg-amber-500/4"
            actions={isHR && (
                <>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="h-10 pl-10 rounded-xl bg-background/70 border-border/60"
                        />
                    </div>
                    <Button onClick={handleOpenCreateModal} className="h-10 gap-2 font-semibold rounded-xl px-5 shadow-md shadow-primary/20 hover:scale-[1.01] transition-all whitespace-nowrap">
                        <Plus className="h-4 w-4" /> Add Salary
                    </Button>
                </>
            )}
        >
            <ContentCard>
                {loading && !salaries.length ? (
                    <LoadingState label="Loading salary data..." iconColor="text-orange-600 dark:text-orange-400" iconBg="bg-orange-100 dark:bg-orange-900/30" />
                ) : (
                    <>
                        <SalaryTable
                            salaries={filteredSalaries}
                            isHR={isHR}
                            onEdit={handleOpenEditModal}
                            onDelete={handleDelete}
                            loading={actionLoading}
                            startIndex={(page - 1) * limit + 1}
                        />
                        <PaginationFooter
                            page={page} totalPages={totalPages} total={total} limit={limit}
                            onPrev={() => setPage(p => Math.max(1, p - 1))}
                            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                            unit="salary records"
                        />
                    </>
                )}
            </ContentCard>

            <CreateSalaryModal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} onSubmit={handleCreateSubmit} loading={actionLoading} />
            <EditSalaryModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} employeeName={editEmployeeName} salaryData={editFormData} onSubmit={handleEditSubmit} loading={actionLoading} />
        </PageShell>
    );
};

export default Salaries;
