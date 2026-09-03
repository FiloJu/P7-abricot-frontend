"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";

type Task = {
  id?: string | number;
  title?: string;
  description?: string;
  status?: string;
  projectId?: string | number;
  dueDate?: string;
  comments?: unknown[];
  project?: { id?: string | number; name?: string };
};

const statusLabels: Record<string, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState("liste");
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      try {
        const userResponse = await fetch("http://localhost:8000/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userResponse.ok) {
          const json = await userResponse.json();
          const user = json.data?.user || json.data || json.user || json;
          setUsername(
            user.name ||
              `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          );
        }

        const taskResponse = await fetch(
          "http://localhost:8000/dashboard/assigned-tasks",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (taskResponse.ok) {
          const json = await taskResponse.json();
          setTasks(json.data?.tasks || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du dashboard :", error);
      }
    };

    fetchData();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    return (
      task.title?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query)
    );
  });

  const columns = [
    { key: "TODO", label: "À faire" },
    { key: "IN_PROGRESS", label: "En cours" },
    { key: "DONE", label: "Terminées" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="mt-2 text-gray-600">
            Bonjour {username || ""}, voici vos tâches.
          </p>
        </div>
      </header>

      <div className="mt-8 flex gap-4 border-b border-gray-200" role="tablist">
        {[
          ["liste", "Liste"],
          ["kanban", "Kanban"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={currentView === key}
            onClick={() => setCurrentView(key)}
            className={`border-b-2 px-1 pb-3 text-sm ${currentView === key ? "border-gray-900 font-semibold" : "border-transparent text-gray-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {currentView === "liste" ? (
        <section className="mt-8" role="tabpanel">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Mes tâches assignées</h2>
              <p className="mt-1 text-sm text-gray-600">
                Par ordre de priorité
              </p>
            </div>
            <input
              type="search"
              aria-label="Rechercher une tâche"
              placeholder="Rechercher une tâche"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
          </div>
          <div className="mt-6 grid gap-4">
            {filteredTasks.length ? (
              filteredTasks.map((task, index) => {
                const projectId = task.projectId || task.project?.id;
                return (
                  <article
                    key={task.id || index}
                    className="rounded border border-gray-200 bg-white p-4"
                  >
                    <h3 className="font-semibold">
                      {task.title || "Sans titre"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {task.description || "Aucune description"}
                    </p>
                    <p className="mt-3 text-xs text-gray-500">
                      {statusLabels[task.status || "TODO"] || "À faire"} ·{" "}
                      {task.project?.name || "Projet inconnu"} ·{" "}
                      {task.dueDate
                        ? task.dueDate.substring(0, 10)
                        : "Sans date"}
                    </p>
                    {projectId && (
                      <Link
                        href={`/projects/${projectId}`}
                        className="mt-3 inline-block text-sm underline"
                      >
                        Voir le projet
                      </Link>
                    )}
                  </article>
                );
              })
            ) : (
              <p className="py-8 text-sm text-gray-500">
                Aucune tâche à afficher.
              </p>
            )}
          </div>
        </section>
      ) : (
        <section className="mt-8 grid gap-6 md:grid-cols-3" role="tabpanel">
          {columns.map((column) => {
            const columnTasks = filteredTasks.filter(
              (task) => task.status === column.key,
            );
            return (
              <div
                key={column.key}
                className="rounded border border-gray-200 p-4"
              >
                <h2 className="font-semibold">
                  {column.label}{" "}
                  <span className="text-sm text-gray-500">
                    ({columnTasks.length})
                  </span>
                </h2>
                <div className="mt-4 grid gap-4">
                  {columnTasks.map((task, index) => (
                    <article
                      key={task.id || index}
                      className="rounded border border-gray-200 bg-white p-3"
                    >
                      <h3 className="font-semibold">
                        {task.title || "Sans titre"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {task.description || "Aucune description"}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
