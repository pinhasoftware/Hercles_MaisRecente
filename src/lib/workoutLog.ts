// Simple in-memory + localStorage store for actual weights/reps logged by client.
// Used by ClientWorkout to persist real performed sets, and by ClientProgress
// to surface volume/PRs based on what was actually lifted (not the planned weight).

export interface LoggedSet {
  workout_id: string;
  exercise_id: string;
  exercise_name: string;
  set_index: number;
  weight: number;
  reps: number;
  completed_at: string; // ISO
}

const KEY = "fitpilot.workout.log";

function read(): LoggedSet[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(items: LoggedSet[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function logSet(set: LoggedSet) {
  const all = read();
  // Replace existing entry for same workout/exercise/set if present
  const idx = all.findIndex(
    (s) =>
      s.workout_id === set.workout_id &&
      s.exercise_id === set.exercise_id &&
      s.set_index === set.set_index,
  );
  if (idx >= 0) all[idx] = set;
  else all.push(set);
  write(all);
}

export function removeSet(workout_id: string, exercise_id: string, set_index: number) {
  const all = read().filter(
    (s) => !(s.workout_id === workout_id && s.exercise_id === exercise_id && s.set_index === set_index),
  );
  write(all);
}

export function getAllLogs(): LoggedSet[] {
  return read();
}

export function getTotalVolumeKg(): number {
  return read().reduce((sum, s) => sum + s.weight * s.reps, 0);
}

export function getPRsByExercise(): Record<string, number> {
  const prs: Record<string, number> = {};
  for (const s of read()) {
    if (!prs[s.exercise_name] || s.weight > prs[s.exercise_name]) {
      prs[s.exercise_name] = s.weight;
    }
  }
  return prs;
}
