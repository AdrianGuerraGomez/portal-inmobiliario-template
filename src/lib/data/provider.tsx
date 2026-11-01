"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { isDemo } from "@/config/runtime";
import { createDemoRepository, type DemoRepository } from "./demo/repository";
import { currentActor } from "./demo/session";
import type { Repository } from "./repository";

const RepositoryContext = createContext<Repository | null>(null);

let demoRepo: DemoRepository | null = null;

// Un único repositorio por pestaña.
function getDemoRepository(): DemoRepository {
  demoRepo ??= createDemoRepository({ getActor: currentActor });
  return demoRepo;
}

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const [repo] = useState<Repository>(() => {
    if (!isDemo) throw new Error("El repositorio de Supabase aún no existe. Usa NEXT_PUBLIC_DEMO_MODE=true.");
    return getDemoRepository();
  });
  return <RepositoryContext.Provider value={repo}>{children}</RepositoryContext.Provider>;
}

export function useRepository(): Repository {
  const repo = useContext(RepositoryContext);
  if (!repo) throw new Error("useRepository debe usarse dentro de <RepositoryProvider>");
  return repo;
}

export function useDemoRepository(): DemoRepository {
  useRepository();
  return getDemoRepository();
}

type QueryState<T> = { data: T | undefined; error: Error | null; loading: boolean };

// Lanza la consulta y la repite cada vez que cambian los datos.
export function useRepoQuery<T>(query: (repo: Repository) => Promise<T>, deps: unknown[]): QueryState<T> {
  const repo = useRepository();
  const [state, setState] = useState<QueryState<T>>({ data: undefined, error: null, loading: true });

  useEffect(() => {
    let active = true;
    const run = () =>
      query(repo).then(
        (data) => active && setState({ data, error: null, loading: false }),
        (error: Error) => active && setState((s) => ({ ...s, error, loading: false })),
      );
    run();
    const unsubscribe = repo.subscribe(run);
    return () => {
      active = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, ...deps]);

  return state;
}
