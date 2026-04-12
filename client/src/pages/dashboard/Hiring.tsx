import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BriefcaseBusiness, Plus, Circle, PauseCircle } from "lucide-react";
import OpeningTable from "@/components/hiring/OpeningTable";
import CreateOpeningModal from "@/components/hiring/CreateOpeningModal";
import { useHiring } from "@/hooks/Hiring/useHiring";
import PageShell, { StatCard, ContentCard, LoadingState, PaginationFooter } from "@/components/PageShell";

const STATUS_OPTIONS = [
    { value: "OPEN",   label: "Open" },
    { value: "CLOSED", label: "Closed" },
    { value: "PAUSED", label: "Paused" },
];

export default function Hiring() {
    const {
        openings, loading, page, setPage, total, limit,
        statusFilter, setStatusFilter,
        isCreateModalOpen, handleCreateOpening, handleDeleteOpening, handleModalClose, handleSuccess,
    } = useHiring();

    const totalPages = Math.ceil(total / limit);
    const openCount  = openings.filter(o => o.Status === "OPEN").length;
    const pausedCount = openings.filter(o => o.Status === "PAUSED").length;

    return (
        <PageShell
            icon={BriefcaseBusiness}
            title="Hiring Pipeline"
            subtitle="Manage job openings and recruitment"
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            blobColor1="bg-amber-500/6"
            blobColor2="bg-orange-500/4"
            actions={
                <>
                    <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
                        <SelectTrigger className="h-10 w-40 rounded-xl bg-background/70 border-border/60">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleCreateOpening} className="h-10 gap-2 font-semibold rounded-xl px-5 shadow-md shadow-primary/20 hover:scale-[1.01] transition-all whitespace-nowrap">
                        <Plus className="h-4 w-4" /> New Opening
                    </Button>
                </>
            }
            stats={!loading && (
                <>
                    <StatCard icon={BriefcaseBusiness} label="Total Openings" value={total}
                        iconColor="text-amber-600 dark:text-amber-400" iconBg="bg-amber-100 dark:bg-amber-900/30" borderClass="stat-amber" />
                    <StatCard icon={Circle} label="Open Positions" value={openCount}
                        iconColor="text-emerald-600 dark:text-emerald-400" iconBg="bg-emerald-100 dark:bg-emerald-900/30" borderClass="stat-emerald" />
                    <StatCard icon={PauseCircle} label="Paused" value={pausedCount}
                        iconColor="text-orange-600 dark:text-orange-400" iconBg="bg-orange-100 dark:bg-orange-900/30" borderClass="stat-orange" />
                </>
            )}
        >
            <ContentCard>
                {loading ? (
                    <LoadingState label="Loading job openings..." iconColor="text-amber-600 dark:text-amber-400" iconBg="bg-amber-100 dark:bg-amber-900/30" />
                ) : (
                    <>
                        <OpeningTable openings={openings} onDelete={handleDeleteOpening} startIndex={(page - 1) * limit + 1} />
                        <PaginationFooter
                            page={page} totalPages={totalPages} total={total} limit={limit}
                            onPrev={() => setPage(p => Math.max(1, p - 1))}
                            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                            unit="openings"
                        />
                    </>
                )}
            </ContentCard>
            <CreateOpeningModal isOpen={isCreateModalOpen} onClose={handleModalClose} onSuccess={handleSuccess} />
        </PageShell>
    );
}
