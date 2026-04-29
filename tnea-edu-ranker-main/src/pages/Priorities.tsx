import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";
import PriorityItem from "@/components/PriorityItem";
import { usePriorities } from "@/contexts/PrioritiesContext";
import { FileSpreadsheet, FileText, FileType2, ListChecks, Trash2 } from "lucide-react";

const Priorities = () => {
  const { items, reorder, clear } = usePriorities();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = items.map((i) => i.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    reorder(arrayMove(ids, from, to));
  };

  const exportPDF = () => {
    if (items.length === 0) return;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("TNEA Priority List", 14, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${items.length} entries · Generated ${new Date().toLocaleDateString()}`, 14, 25);

    autoTable(doc, {
      startY: 32,
      head: [["#", "College", "Branch", "Code", "District", "Cat", "Score"]],
      body: items.map((it, i) => [
        i + 1,
        it.college_name,
        it.branch_name,
        it.branch_code,
        it.district,
        it.category,
        it.score.toFixed(2),
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`tnea-priorities-${Date.now()}.pdf`);
    toast.success("Exported as PDF");
  };

  const exportExcel = () => {
    if (items.length === 0) return;
    const rows = items.map((it, i) => ({
      Rank: i + 1,
      College: it.college_name,
      "College Code": it.college_code,
      Branch: it.branch_name,
      "Branch Code": it.branch_code,
      District: it.district,
      Category: it.category,
      "Cutoff Score": it.score,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 6 }, { wch: 40 }, { wch: 12 }, { wch: 30 }, { wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Priorities");
    XLSX.writeFile(wb, `tnea-priorities-${Date.now()}.xlsx`);
    toast.success("Exported as Excel");
  };

  const exportTXT = () => {
    if (items.length === 0) return;
    const lines = [
      "TNEA PRIORITY LIST",
      `Generated: ${new Date().toLocaleString()}`,
      `Entries: ${items.length}`,
      "".padEnd(60, "="),
      "",
    ];
    items.forEach((it, i) => {
      lines.push(
        `${String(i + 1).padStart(3, " ")}. ${it.college_name}  [${it.college_code}]`,
        `      ${it.branch_name} (${it.branch_code})`,
        `      ${it.district} · ${it.category} ${it.score.toFixed(2)}`,
        "",
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tnea-priorities-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as TXT");
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container py-6 md:py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Priority List</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag to reorder. Your list is saved in this browser.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportPDF} disabled={items.length === 0}>
              <FileType2 className="h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportExcel} disabled={items.length === 0}>
              <FileSpreadsheet className="h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={exportTXT} disabled={items.length === 0}>
              <FileText className="h-4 w-4" /> TXT
            </Button>
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={items.length === 0} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" /> Clear
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all priorities?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes all {items.length} entries from your list. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      clear();
                      toast.success("Priorities cleared");
                    }}
                  >
                    Clear all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="mt-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <ListChecks className="h-8 w-8" />
              </div>
              <h2 className="font-display text-xl font-semibold">No colleges yet</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Search for colleges and tap "Add" to build your shortlist.
              </p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {items.map((it, i) => (
                    <PriorityItem key={it.id} item={it} rank={i + 1} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </main>
    </div>
  );
};

export default Priorities;
