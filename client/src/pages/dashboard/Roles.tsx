import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import RoleTable from "@/components/roles/RoleTable";
import RoleModal from "@/components/roles/RoleModal";
import { useRoles } from "@/hooks/Roles/useRoles";
import { Shield, Search, Plus, AlertCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ApiCaller from "@/utils/ApiCaller";
import type { Department } from "@/types";
import PageShell, { ContentCard, LoadingState, PaginationFooter } from "@/components/PageShell";

export default function Roles() {
    const {
        roles, isModalOpen, selectedRole, loading, page, setPage,
        total, limit, searchQuery, setSearchQuery,
        selectedDepartmentFilter, setSelectedDepartmentFilter,
        handleAddRole, handleEditRole, handleDeleteRole, handleModalClose, handleSuccess
    } = useRoles();

    const [departments, setDepartments] = useState<Department[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        ApiCaller<null, any>({ requestType: "GET", paths: ["api", "v1", "departments"], queryParams: { limit: "1000" } })
            .then(r => {
                if (r.ok) {
                    const list = Array.isArray(r.response.data) ? r.response.data : (r.response.data?.data ?? []);
                    setDepartments(list);
                }
            }).catch(console.error);
    }, []);

    const handleDeleteClick = (id: string) => { setRoleToDelete(id); setDeleteDialogOpen(true); };
    const handleConfirmDelete = async () => {
        if (!roleToDelete) return;
        setIsDeleting(true);
        try { await handleDeleteRole(roleToDelete); setDeleteDialogOpen(false); setRoleToDelete(null); }
        finally { setIsDeleting(false); }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <PageShell
            icon={Shield}
            title="Role Management"
            subtitle="Create and manage employee roles and permissions"
            iconColor="text-slate-600 dark:text-slate-400"
            iconBg="bg-slate-100 dark:bg-slate-900/40"
            blobColor1="bg-slate-500/5"
            blobColor2="bg-gray-500/3"
            actions={
                <Button onClick={handleAddRole} className="h-10 gap-2 font-semibold rounded-xl px-5 shadow-md shadow-primary/20 hover:scale-[1.01] transition-all">
                    <Plus className="h-4 w-4" /> Add Role
                </Button>
            }
        >
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 p-1">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search roles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 pl-10 rounded-xl bg-background border-border/60"
                    />
                </div>
                <Select value={selectedDepartmentFilter || "all"} onValueChange={(v) => setSelectedDepartmentFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="h-10 w-full sm:w-56 rounded-xl bg-background border-border/60">
                        <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(d => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <ContentCard>
                {loading ? (
                    <LoadingState label="Loading roles..." iconColor="text-slate-600 dark:text-slate-400" iconBg="bg-slate-100 dark:bg-slate-900/40" />
                ) : (
                    <>
                        <RoleTable roles={roles} onEdit={handleEditRole} onDelete={handleDeleteClick} />
                        <PaginationFooter
                            page={page} totalPages={totalPages} total={total} limit={limit}
                            onPrev={() => setPage(p => Math.max(1, p - 1))}
                            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                            unit="roles"
                        />
                    </>
                )}
            </ContentCard>

            <RoleModal isOpen={isModalOpen} onClose={handleModalClose} initialData={selectedRole} onSuccess={handleSuccess} />

            {/* Delete confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" /> Delete Role
                        </DialogTitle>
                        <DialogDescription>This action cannot be undone. The role will be permanently removed.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setRoleToDelete(null); }} disabled={isDeleting} className="rounded-xl">Cancel</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting} className="gap-2 rounded-xl">
                            {isDeleting ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Deleting...</> : <><Trash2 className="h-4 w-4" /> Delete Role</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageShell>
    );
}
