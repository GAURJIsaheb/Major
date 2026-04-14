import { useState, useEffect, useCallback } from "react";
import ApiCaller from "@/utils/ApiCaller";
import { useAppSelector } from "@/store/hooks";

export interface BulletinItem {
  _id: string;
  title: string;
  message: string;
  expiresAt: string;
  createdAt: string;
  createdBy?: { firstName: string; lastName: string };
}

const DISMISSED_KEY = "nexushr_dismissed_bulletins";

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
}

function addDismissed(id: string) {
  const arr = getDismissed();
  if (!arr.includes(id)) arr.push(id);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(arr));
}

export function useBulletins() {
  const { userDetails } = useAppSelector((s) => s.userState);
  const role = userDetails?.role?.toUpperCase() || "";

  const [bulletins, setBulletins] = useState<BulletinItem[]>([]);
  const [dismissed, setDismissed] = useState<string[]>(getDismissed);

  const fetchBulletins = useCallback(async () => {
    const res = await ApiCaller<null, BulletinItem[]>({
      requestType: "GET",
      paths: ["api", "v1", "bulletins", "active"],
    });
    if (res.ok) {
      setBulletins(Array.isArray(res.response.data) ? res.response.data : []);
    }
  }, []);

  useEffect(() => {
    fetchBulletins();
    // Refresh every 5 minutes
    const id = setInterval(fetchBulletins, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchBulletins]);

  const dismiss = (id: string) => {
    addDismissed(id);
    setDismissed((prev) => [...prev, id]);
  };

  const visible = bulletins.filter((b) => !dismissed.includes(b._id));

  const createBulletin = async (title: string, message: string) => {
    const res = await ApiCaller<{ title: string; message: string }, BulletinItem>({
      requestType: "POST",
      paths: ["api", "v1", "bulletins"],
      body: { title, message },
    });
    if (res.ok) {
      fetchBulletins();
      return { success: true };
    }
    return { success: false, error: res.response.message };
  };

  const deleteBulletin = async (id: string) => {
    await ApiCaller<null, null>({
      requestType: "DELETE",
      paths: ["api", "v1", "bulletins", id],
    });
    fetchBulletins();
  };

  return { visible, role, dismiss, createBulletin, deleteBulletin, refetch: fetchBulletins };
}
