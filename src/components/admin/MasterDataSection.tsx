"use client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import MasterDataTable from "./MasterDataTable";
import MasterDataForm from "./MasterDataForm";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import Reveal from "@/components/animations/Reveal";
import api, { getErrorMessage } from "@/lib/api";
import type { Department, Faculty } from "@/types";

interface Props {
  resource: "departments" | "faculty" | "subjects";
  title: string;
  subtitle: string;
}

export default function MasterDataSection({ resource, title, subtitle }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const load = useCallback(() => {
    api
      .get(`/admin/${resource}`)
      .then((r) => setItems(r.data.data || []))
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [resource]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (resource !== "subjects") return;
    api.get("/admin/departments").then((r) => setDepartments(r.data.data || [])).catch(() => {});
    api.get("/admin/faculty").then((r) => setFaculty(r.data.data || [])).catch(() => {});
  }, [resource]);

  const handleSave = async (data: any) => {
    try {
      if (editing) {
        await api.put(`/admin/${resource}/${editing._id}`, data);
        toast.success(`${title.slice(0, -1)} updated`);
      } else {
        await api.post(`/admin/${resource}`, data);
        toast.success(`${title.slice(0, -1)} added`);
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/${resource}/${id}`);
      toast.success("Deactivated");
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
          <p className="mt-0.5 text-ink-500">{subtitle}</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="btn-primary"
        >
          Add {title.replace(/s$/, "")}
        </button>
      </div>

      <div className="card p-6">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title={`No ${title.toLowerCase()} yet`}
            description={`Add your first ${title.replace(/s$/, "").toLowerCase()} to get started.`}
          />
        ) : (
          <Reveal>
            <MasterDataTable items={items} onEdit={(id) => {
              setEditing(items.find((i) => i._id === id));
              setOpen(true);
            }} onDelete={handleDelete} />
          </Reveal>
        )}
      </div>

      <MasterDataForm
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        resource={resource}
        item={editing}
        departments={departments}
        faculty={faculty}
        onSave={handleSave}
      />
    </div>
  );
}