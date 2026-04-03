import { useEffect, useMemo, useState } from "react";
import { createTrackerRepository } from "../data/trackerRepository";
import { withDefaultRecord } from "../data/constants";

export default function useTrackerData() {
  const repository = useMemo(() => createTrackerRepository(), []);
  const [data, setData] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const loaded = await repository.load();
        if (isMounted) setData(loaded || {});
      } catch {
        if (isMounted) setData({});
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [repository]);

  useEffect(() => {
    if (!isLoaded) return;

    repository.save(data).catch(() => {
      // Non-blocking for UI editing; save failures can be surfaced later.
    });
  }, [data, repository, isLoaded]);

  function getRec(id) {
    return withDefaultRecord(data[id]);
  }

  function updateRec(id, updater) {
    setData((prev) => {
      const next = withDefaultRecord(prev[id]);
      const updated = updater(next);
      return { ...prev, [id]: updated };
    });
  }

  function resetProblem(id) {
    setData((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function resetAll() {
    setData({});
    repository.clear().catch(() => {
      // Local UI state remains the source of truth for this session.
    });
  }

  return {
    data,
    isLoaded,
    getRec,
    updateRec,
    resetProblem,
    resetAll,
  };
}
