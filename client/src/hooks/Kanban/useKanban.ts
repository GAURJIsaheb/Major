import { useState, useEffect, useCallback } from "react";
import ApiCaller from "@/utils/ApiCaller";
import { useAppSelector } from "@/store/hooks";

export type KanbanStatus = "todo" | "in_progress" | "done";
export type KanbanPriority = "low" | "medium" | "high";

export interface KanbanUser {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

export interface KanbanTask {
  _id: string;
  title: string;
  description: string;
  image: string | null;
  status: KanbanStatus;
  priority: KanbanPriority;
  createdBy: KanbanUser;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  image?: string | null;
  status?: KanbanStatus;
  priority?: KanbanPriority;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  image?: string | null;
  status?: KanbanStatus;
  priority?: KanbanPriority;
}

export function useKanban() {
  const { userDetails } = useAppSelector((s) => s.userState);

  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const res = await ApiCaller<null, KanbanTask[]>({
      requestType: "GET",
      paths: ["api", "v1", "kanban"],
    });
    if (res.ok) {
      setTasks(Array.isArray(res.response.data) ? res.response.data : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (payload: CreateTaskPayload) => {
    const res = await ApiCaller<CreateTaskPayload, KanbanTask>({
      requestType: "POST",
      paths: ["api", "v1", "kanban"],
      body: payload,
    });
    if (res.ok) {
      await fetchTasks();
      return { success: true };
    }
    return { success: false, error: (res.response as any).message };
  };

  const updateTask = async (id: string, payload: UpdateTaskPayload) => {
    const res = await ApiCaller<UpdateTaskPayload, KanbanTask>({
      requestType: "PATCH",
      paths: ["api", "v1", "kanban", id],
      body: payload,
    });
    if (res.ok) {
      await fetchTasks();
      return { success: true };
    }
    return { success: false, error: (res.response as any).message };
  };

  const deleteTask = async (id: string) => {
    const res = await ApiCaller<null, null>({
      requestType: "DELETE",
      paths: ["api", "v1", "kanban", id],
    });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t._id !== id));
      return { success: true };
    }
    return { success: false };
  };

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  return {
    tasks,
    tasksByStatus,
    loading,
    userDetails,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
