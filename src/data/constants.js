export const TRACKER_STORAGE_KEY = "nc150v2";

export const DEFAULT_REC = {
  status: "new",
  nextReview: null,
  attempts: [],
  timeComplexity: "",
  spaceComplexity: "",
  explanation: "",
  techniques: [],
  githubUrl: "",
  notes: "",
};

export function withDefaultRecord(partial) {
  return { ...DEFAULT_REC, ...(partial || {}) };
}
