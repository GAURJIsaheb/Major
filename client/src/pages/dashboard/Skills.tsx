import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SkillTable from "@/components/skills/SkillTable";
import SkillModal from "@/components/skills/SkillModal";
import { useSkills } from "@/hooks/Skills/useSkills";
import { Sparkles, Search, Plus } from "lucide-react";
import PageShell, { ContentCard, LoadingState, PaginationFooter } from "@/components/PageShell";

export default function Skills() {
    const {
        skills, isModalOpen, selectedSkill, loading, page, setPage,
        total, limit, searchQuery, setSearchQuery,
        handleAddSkill, handleEditSkill, handleDeleteSkill, handleModalClose, handleSuccess
    } = useSkills();

    const totalPages = Math.ceil(total / limit);

    return (
        <PageShell
            icon={Sparkles}
            title="Skills Management"
            subtitle="Tag and categorise employee competencies"
            iconColor="text-rose-600 dark:text-rose-400"
            iconBg="bg-rose-100 dark:bg-rose-900/30"
            blobColor1="bg-rose-500/6"
            blobColor2="bg-pink-500/4"
            actions={
                <>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-10 rounded-xl bg-background/70 border-border/60"
                        />
                    </div>
                    <Button onClick={handleAddSkill} className="h-10 gap-2 font-semibold rounded-xl px-5 shadow-md shadow-primary/20 hover:scale-[1.01] transition-all whitespace-nowrap">
                        <Plus className="h-4 w-4" /> Add Skill
                    </Button>
                </>
            }
        >
            <ContentCard>
                {loading ? (
                    <LoadingState label="Loading skills directory..." iconColor="text-rose-600 dark:text-rose-400" iconBg="bg-rose-100 dark:bg-rose-900/30" />
                ) : (
                    <>
                        <SkillTable skills={skills} onEdit={handleEditSkill} onDelete={handleDeleteSkill} startIndex={(page - 1) * limit + 1} />
                        <PaginationFooter
                            page={page} totalPages={totalPages} total={total} limit={limit}
                            onPrev={() => setPage(p => Math.max(1, p - 1))}
                            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                            unit="skills"
                        />
                    </>
                )}
            </ContentCard>
            <SkillModal isOpen={isModalOpen} onClose={handleModalClose} initialData={selectedSkill} onSuccess={handleSuccess} />
        </PageShell>
    );
}
