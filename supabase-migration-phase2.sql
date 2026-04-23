-- ╔══════════════════════════════════════════════════════════════╗
-- ║  FitPilot — Phase 2 schema                                    ║
-- ║  Run AFTER phase 1.                                           ║
-- ╚══════════════════════════════════════════════════════════════╝

-- 1) EXERCISE LIBRARY (shared global + trainer-owned)
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references auth.users(id) on delete cascade, -- null = library global
  name text not null,
  category text,
  muscle text,
  video_url text,
  default_sets integer default 3,
  default_reps text default '10',
  created_at timestamptz not null default now()
);
create index if not exists exercises_trainer_idx on public.exercises(trainer_id);
alter table public.exercises enable row level security;

drop policy if exists "Exercises: read global + own" on public.exercises;
create policy "Exercises: read global + own"
  on public.exercises for select to authenticated
  using (trainer_id is null or trainer_id = auth.uid());

drop policy if exists "Exercises: trainer manages own" on public.exercises;
create policy "Exercises: trainer manages own"
  on public.exercises for all to authenticated
  using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

-- 2) WORKOUTS (assigned to a client) + workout_exercises (with supersets via group_label)
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,                    -- "Treino A"
  notes text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists workouts_client_idx on public.workouts(client_id, position);
alter table public.workouts enable row level security;

drop policy if exists "Workouts: trainer manages own" on public.workouts;
create policy "Workouts: trainer manages own"
  on public.workouts for all to authenticated
  using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

drop policy if exists "Workouts: client reads own" on public.workouts;
create policy "Workouts: client reads own"
  on public.workouts for select to authenticated
  using (exists (select 1 from public.clients c where c.id = workouts.client_id and c.user_id = auth.uid()));

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  exercise_name text not null,           -- denormalised for safety
  sets integer not null default 3,
  reps text not null default '10',
  weight_kg numeric(6,2),
  rest_sec integer default 60,
  group_label text,                      -- e.g. "Superset A" -> grouped
  position integer not null default 0,
  notes text
);
create index if not exists wex_workout_idx on public.workout_exercises(workout_id, position);
alter table public.workout_exercises enable row level security;

drop policy if exists "WEx: via workout owner" on public.workout_exercises;
create policy "WEx: via workout owner"
  on public.workout_exercises for all to authenticated
  using (exists (select 1 from public.workouts w where w.id = workout_exercises.workout_id and w.trainer_id = auth.uid()))
  with check (exists (select 1 from public.workouts w where w.id = workout_exercises.workout_id and w.trainer_id = auth.uid()));

drop policy if exists "WEx: client reads via workout" on public.workout_exercises;
create policy "WEx: client reads via workout"
  on public.workout_exercises for select to authenticated
  using (exists (
    select 1 from public.workouts w
    join public.clients c on c.id = w.client_id
    where w.id = workout_exercises.workout_id and c.user_id = auth.uid()
  ));

-- 3) SET LOGS (history)
create table if not exists public.set_logs (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.workout_exercises(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  performed_at timestamptz not null default now(),
  set_number integer not null,
  weight_kg numeric(6,2),
  reps integer
);
create index if not exists setlogs_client_idx on public.set_logs(client_id, performed_at desc);
alter table public.set_logs enable row level security;

drop policy if exists "Setlogs: trainer of client" on public.set_logs;
create policy "Setlogs: trainer of client"
  on public.set_logs for all to authenticated
  using (exists (select 1 from public.clients c where c.id = set_logs.client_id and c.trainer_id = auth.uid()))
  with check (exists (select 1 from public.clients c where c.id = set_logs.client_id and c.trainer_id = auth.uid()));

drop policy if exists "Setlogs: client own" on public.set_logs;
create policy "Setlogs: client own"
  on public.set_logs for all to authenticated
  using (exists (select 1 from public.clients c where c.id = set_logs.client_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.clients c where c.id = set_logs.client_id and c.user_id = auth.uid()));

-- 4) NUTRITION PLANS (one current per client; meals as JSON for simplicity)
create table if not exists public.nutrition_plans (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  meals jsonb not null default '[]'::jsonb,  -- [{name:"Pequeno-almoço", items:["..."]}]
  tips text,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists nutri_client_idx on public.nutrition_plans(client_id, is_current);
alter table public.nutrition_plans enable row level security;

drop policy if exists "Nutri: trainer manages own" on public.nutrition_plans;
create policy "Nutri: trainer manages own"
  on public.nutrition_plans for all to authenticated
  using (trainer_id = auth.uid()) with check (trainer_id = auth.uid());

drop policy if exists "Nutri: client reads own" on public.nutrition_plans;
create policy "Nutri: client reads own"
  on public.nutrition_plans for select to authenticated
  using (exists (select 1 from public.clients c where c.id = nutrition_plans.client_id and c.user_id = auth.uid()));

-- 5) CLIENT PROFILE DATA (ficha pessoal: goals, measures, injuries...)
create table if not exists public.client_profile_data (
  client_id uuid primary key references public.clients(id) on delete cascade,
  goals text,
  height_cm integer,
  weight_kg numeric(5,2),
  injuries text,
  medical_history text,
  parq_completed boolean not null default false,
  pt_notes text,
  updated_at timestamptz not null default now()
);
alter table public.client_profile_data enable row level security;

drop policy if exists "CPD: trainer of client" on public.client_profile_data;
create policy "CPD: trainer of client"
  on public.client_profile_data for all to authenticated
  using (exists (select 1 from public.clients c where c.id = client_profile_data.client_id and c.trainer_id = auth.uid()))
  with check (exists (select 1 from public.clients c where c.id = client_profile_data.client_id and c.trainer_id = auth.uid()));

drop policy if exists "CPD: client reads own" on public.client_profile_data;
create policy "CPD: client reads own"
  on public.client_profile_data for select to authenticated
  using (exists (select 1 from public.clients c where c.id = client_profile_data.client_id and c.user_id = auth.uid()));

-- 6) Seed a small global exercise library (idempotent)
insert into public.exercises (trainer_id, name, category, muscle, default_sets, default_reps)
select null, x.name, x.category, x.muscle, 3, x.reps
from (values
  ('Supino plano', 'Força', 'Peito', '8-10'),
  ('Agachamento', 'Força', 'Pernas', '8-10'),
  ('Peso morto', 'Força', 'Posterior', '5-6'),
  ('Remada barra', 'Força', 'Costas', '8-10'),
  ('Pulldown', 'Força', 'Costas', '10-12'),
  ('Press militar', 'Força', 'Ombros', '8-10'),
  ('Elevações laterais', 'Hipertrofia', 'Ombros', '12-15'),
  ('Rosca direta', 'Hipertrofia', 'Bíceps', '10-12'),
  ('Tríceps corda', 'Hipertrofia', 'Tríceps', '12-15'),
  ('Leg press', 'Força', 'Pernas', '10-12'),
  ('Cadeira extensora', 'Hipertrofia', 'Quadríceps', '12-15'),
  ('Mesa flexora', 'Hipertrofia', 'Femoral', '12-15'),
  ('Gémeos em pé', 'Hipertrofia', 'Gémeos', '15-20'),
  ('Prancha', 'Core', 'Core', '30-60s'),
  ('Burpees', 'Cardio', 'Total', '10')
) as x(name, category, muscle, reps)
where not exists (select 1 from public.exercises e where e.trainer_id is null and e.name = x.name);
