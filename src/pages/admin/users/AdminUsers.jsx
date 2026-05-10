import { useState, useEffect } from "react";
import { Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { fadeDown, stagger } from "@/lib/motion";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import AdminUsersTable from "./components/AdminUsersTable";
import AdminUsersFilter from "./components/AdminUsersFilter";
import { ViewUserModal, ConfirmModal } from "./components/UserModals";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  const [viewUser, setViewUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users?search=${search}&page=${page}&limit=${limit}`);
      setUsers(response.data.data);
      setTotalUsers(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, page, limit]);

  const handleAction = (type, user) => {
    if (type === "view") {
      setViewUser(user);
      return;
    }
    setConfirmAction({ type, user });
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    setActionLoading(true);
    try {
      if (type === "delete") {
        await api.delete(`/users/${user.user_id}`);
        setUsers((prev) => prev.filter((u) => u.user_id !== user.user_id));
        setTotalUsers(prev => prev - 1);
        toast({
          title: "User deleted",
          description: `${user.f_name} has been removed.`,
        });
      } else if (type === "suspend") {
        const newStatus = user.account_status === "suspended" ? "active" : "suspended";
        await api.patch(`/users/${user.user_id}`, { account_status: newStatus });
        setUsers((prev) =>
          prev.map((u) => (u.user_id === user.user_id ? { ...u, account_status: newStatus } : u))
        );
        toast({
          title: newStatus === "active" ? "User activated" : "User suspended",
          description: `${user.f_name} status updated to ${newStatus}.`,
        });
      }
      setConfirmAction(null);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${type} user`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (totalUsers === 0) return;
    setDownloadLoading(true);
    try {
      // Fetch all users for the current search
      const response = await api.get(`/users?search=${search}&limit=${totalUsers}`);
      const allUsers = response.data.data;

      const doc = new jsPDF();
      doc.text("System Users List", 14, 15);
      
      const tableColumn = ["ID", "Name", "Email", "Phone", "Role", "Status", "Joined"];
      const tableRows = [];

      allUsers.forEach(u => {
        tableRows.push([
          u.user_id,
          `${u.f_name} ${u.l_name}`,
          u.email,
          u.phone || "N/A",
          u.role,
          u.account_status,
          new Date(u.creation_date).toLocaleDateString(),
        ]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.save("users_list.pdf");
      toast({
        title: "Success",
        description: "Users list exported to PDF",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {viewUser && <ViewUserModal user={viewUser} onClose={() => setViewUser(null)} />}
        {confirmAction && (
          <ConfirmModal
            title={
              confirmAction.type === "delete"
                ? "Delete User"
                : confirmAction.user.account_status === "suspended"
                  ? "Reactivate User"
                  : "Suspend User"
            }
            desc={
              confirmAction.type === "delete"
                ? `Are you sure you want to permanently delete ${confirmAction.user.f_name}? This cannot be undone.`
                : confirmAction.user.account_status === "suspended"
                  ? `Reactivate ${confirmAction.user.f_name}'s account?`
                  : `Suspend ${confirmAction.user.f_name}'s account? They won't be able to log in.`
            }
            variant={
              confirmAction.type === "delete"
                ? "destructive"
                : confirmAction.user.account_status === "suspended"
                  ? "accent"
                  : "destructive"
            }
            loading={actionLoading}
            onConfirm={executeAction}
            onClose={() => setConfirmAction(null)}
          />
        )}
      </AnimatePresence>
      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeDown} custom={0} className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Users Management</h1>
            <p className="mt-1 text-sm text-muted-foreground"> All users</p>
          </div>
          <Button variant="accent" size="sm" className="shadow-glow" onClick={handleDownloadPDF} disabled={downloadLoading}>
            {downloadLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
        </motion.div>
        
        <AdminUsersFilter search={search} setSearch={(val) => { setSearch(val); setPage(1); }} />

        <AdminUsersTable 
          users={users}
          loading={loading}
          handleAction={handleAction}
          totalUsers={totalUsers}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      </motion.div>
    </>
  );
}

export default AdminUsers;
