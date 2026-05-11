import { Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { scaleUp } from "@/lib/motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SendSuccess({ 
  selected, 
  amount, 
  transactionData, 
  setStep, 
  setSelected, 
  setAmount 
}) {
  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Add branding
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Primary color
    doc.text("SchnellPay", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Transaction Receipt", 14, 28);
    
    // Transaction Details
    const tableData = [
      ["Transaction ID", transactionData?.reference_number || transactionData?.transaction_id || "#TXN-847362"],
      ["Recipient", selected.name],
      ["Username", `@${selected.username}`],
      ["Amount", `$${Number(amount).toFixed(2)}`],
      ["Status", "Completed"],
      ["Date", new Date(transactionData?.created_at || Date.now()).toLocaleString()],
    ];

    autoTable(doc, {
      startY: 40,
      head: [["Description", "Details"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillStyle: "#2563eb" },
    });

    doc.setFontSize(10);
    doc.text("Thank you for using SchnellPay!", 14, doc.lastAutoTable.finalY + 10);
    
    doc.save(`receipt-${transactionData?.reference_number || "transaction"}.pdf`);
  };

  return (
    <motion.div
      variants={scaleUp}
      initial="hidden"
      animate="visible"
      className="py-6 text-center"
    >
      <div className="gradient-success mx-auto mb-6 flex h-20 w-20 animate-bounce-in items-center justify-center rounded-full shadow-glow">
        <Check className="h-10 w-10 text-accent-foreground" />
      </div>
      <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
        Transfer Sent!
      </h2>
      <p className="mb-6 text-muted-foreground">
        <span className="font-semibold text-accent">${Number(amount).toFixed(2)}</span> has
        been sent to <span className="font-semibold text-foreground">{selected.name}</span>
      </p>
      
      <div className="mb-6 space-y-2 rounded-xl border border-border bg-muted/50 p-4 text-left">
        {[
          { label: "Transaction ID", value: transactionData?.reference_number || "#TXN-847362" },
          { label: "Status", value: "✓ Completed" },
          { label: "Date", value: new Date(transactionData?.created_at || Date.now()).toLocaleDateString() },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Receipt
        </Button>
        <Button
          variant="accent"
          className="flex-1 shadow-glow"
          onClick={() => {
            setStep("recipient");
            setSelected(null);
            setAmount("");
          }}
        >
          Send Again
        </Button>
      </div>
    </motion.div>
  );
}
