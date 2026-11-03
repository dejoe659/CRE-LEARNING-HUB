-- CRE Learning Hub — initial schema with Row Level Security.
-- Run in the Supabase SQL editor or with `supabase db push`.
-- NOTE: no official curriculum is seeded. Administrators add the real courses.

create extension if not exists "pgcrypto";

-- ---------- helpers ----------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  institution text not null default '',
  department text not null default '',
  level int not null default 100 check (level in (100,200,300,400)),
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "admin manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, institution, department, level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    coalesce(new.raw_user_meta_data->>'institution',''),
    coalesce(new.raw_user_meta_data->>'department',''),
    coalesce((new.raw_user_meta_data->>'level')::int, 100)
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------- catalogue ----------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text not null default '',
  level int not null check (level in (100,200,300,400)),
  semester int not null check (semester in (1,2)),
  units int not null default 2,
  is_premium boolean not null default false,
  price_ngn numeric(12,2) not null default 0 check (price_ngn >= 0),
  is_published boolean not null default false,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position int not null default 0
);
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  summary text not null default '',
  objectives text[] not null default '{}',
  practical_example text not null default '',
  video_url text,               -- Cloudflare Stream iframe URL or storage URL
  duration_sec int not null default 0,
  position int not null default 0
);
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  kind text not null check (kind in ('Lecture Notes','Course Summary','Textbook','Practical Guide','Past Questions','Assignment')),
  title text not null,
  file_path text not null,      -- path in the private 'materials' storage bucket
  created_at timestamptz not null default now()
);

-- ---------- assessments ----------
create table public.exams (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  title text not null,
  time_limit_sec int,
  is_published boolean not null default false
);
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  type text not null check (type in ('mcq','tf','short')),
  prompt text not null,
  options text[],
  explanation text not null default '',
  position int not null default 0
);
-- Answers live in a separate admin-only table so students can never read them from the API.
create table public.question_answers (
  question_id uuid primary key references public.questions(id) on delete cascade,
  answer text not null            -- short answers: accepted keywords separated by |
);

-- ---------- student activity ----------
create table public.enrollments (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  has_paid boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);
create table public.lesson_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  position_sec int not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  score int not null, total int not null, percent int not null,
  duration_sec int not null default 0,
  taken_at timestamptz not null default now()
);
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id),
  reference text not null unique,
  amount_kobo bigint not null check (amount_kobo > 0),
  currency text not null default 'NGN',
  status text not null default 'pending' check (status in ('pending','success','failed')),
  paid_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now()
);
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, message text not null,
  created_at timestamptz not null default now()
);

-- ---------- helper: does the user have access to a course? ----------
create or replace function public.has_course_access(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin()
      or exists (select 1 from public.courses c where c.id = cid and c.is_published and not c.is_premium)
      or exists (select 1 from public.enrollments e where e.user_id = auth.uid() and e.course_id = cid and e.has_paid);
$$;

-- ---------- RLS ----------
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.materials enable row level security;
alter table public.exams enable row level security;
alter table public.questions enable row level security;
alter table public.question_answers enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.payments enable row level security;
alter table public.contact_messages enable row level security;

-- Anyone may browse published course info; only admins write.
create policy "courses read" on public.courses for select using (is_published or public.is_admin());
create policy "courses admin" on public.courses for all using (public.is_admin()) with check (public.is_admin());

create policy "modules read" on public.modules for select using (public.has_course_access(course_id) or public.is_admin());
create policy "modules admin" on public.modules for all using (public.is_admin()) with check (public.is_admin());

create policy "lessons read" on public.lessons for select
  using (public.is_admin() or public.has_course_access((select course_id from public.modules m where m.id = module_id)));
create policy "lessons admin" on public.lessons for all using (public.is_admin()) with check (public.is_admin());

create policy "materials read" on public.materials for select using (public.has_course_access(course_id));
create policy "materials admin" on public.materials for all using (public.is_admin()) with check (public.is_admin());

create policy "exams read" on public.exams for select using (public.is_admin() or (is_published and public.has_course_access(course_id)));
create policy "exams admin" on public.exams for all using (public.is_admin()) with check (public.is_admin());

create policy "questions read" on public.questions for select
  using (public.is_admin() or public.has_course_access((select course_id from public.exams e where e.id = exam_id)));
create policy "questions admin" on public.questions for all using (public.is_admin()) with check (public.is_admin());

-- question_answers: admins only. Students are marked by the server (see grade_attempt below).
create policy "answers admin" on public.question_answers for all using (public.is_admin()) with check (public.is_admin());

-- Students manage only their own rows. has_paid can NEVER be set by a student (service role / webhook only).
create policy "enroll read" on public.enrollments for select using (user_id = auth.uid() or public.is_admin());
create policy "enroll free insert" on public.enrollments for insert
  with check (user_id = auth.uid() and has_paid = false
    and exists (select 1 from public.courses c where c.id = course_id and c.is_published and not c.is_premium));
create policy "enroll admin" on public.enrollments for all using (public.is_admin()) with check (public.is_admin());

create policy "progress own" on public.lesson_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "progress admin read" on public.lesson_progress for select using (public.is_admin());

create policy "attempts read" on public.exam_attempts for select using (user_id = auth.uid() or public.is_admin());
-- no insert policy: attempts are created only by grade_attempt() below.

create policy "payments read" on public.payments for select using (user_id = auth.uid() or public.is_admin());
-- no insert/update policy: only the server (service role) writes payments.

create policy "contact admin read" on public.contact_messages for select using (public.is_admin());

-- ---------- server-side marking ----------
-- answers: jsonb object { "<question_id>": "<given answer>" }
create or replace function public.grade_attempt(p_exam uuid, p_answers jsonb, p_duration int default 0)
returns public.exam_attempts language plpgsql security definer set search_path = public as $$
declare
  v_course uuid; v_score int := 0; v_total int := 0; r record; given text; ok boolean; kw text;
  result public.exam_attempts;
begin
  select course_id into v_course from public.exams where id = p_exam and is_published;
  if v_course is null or not public.has_course_access(v_course) then raise exception 'not allowed'; end if;
  for r in select q.id, q.type, a.answer from public.questions q join public.question_answers a on a.question_id = q.id where q.exam_id = p_exam loop
    v_total := v_total + 1;
    given := lower(trim(coalesce(p_answers->>(r.id::text), '')));
    ok := false;
    if given <> '' then
      if r.type = 'short' then
        foreach kw in array string_to_array(lower(r.answer), '|') loop
          if given = trim(kw) or position(trim(kw) in given) > 0 then ok := true; end if;
        end loop;
      else ok := given = lower(trim(r.answer)); end if;
    end if;
    if ok then v_score := v_score + 1; end if;
  end loop;
  if v_total = 0 then raise exception 'exam has no questions'; end if;
  insert into public.exam_attempts (user_id, exam_id, score, total, percent, duration_sec)
  values (auth.uid(), p_exam, v_score, v_total, round(100.0 * v_score / v_total), greatest(p_duration,0))
  returning * into result;
  return result;
end $$;
revoke all on function public.grade_attempt(uuid, jsonb, int) from public, anon;
grant execute on function public.grade_attempt(uuid, jsonb, int) to authenticated;

-- ---------- storage buckets (private) ----------
insert into storage.buckets (id, name, public) values ('materials','materials', false), ('videos','videos', false)
on conflict (id) do nothing;

create policy "storage admin write" on storage.objects for all
  using (bucket_id in ('materials','videos') and public.is_admin())
  with check (bucket_id in ('materials','videos') and public.is_admin());
create policy "storage signed-in read" on storage.objects for select
  using (bucket_id in ('materials','videos') and auth.role() = 'authenticated');

-- To make yourself the first admin, after registering run:
--   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'YOU@example.com');

-- ---------- indexes & function permissions (applied to the live project) ----------
create index on public.modules (course_id);
create index on public.lessons (module_id);
create index on public.materials (course_id);
create index on public.exams (course_id);
create index on public.questions (exam_id);
create index on public.enrollments (course_id);
create index on public.lesson_progress (lesson_id);
create index on public.exam_attempts (user_id);
create index on public.exam_attempts (exam_id);
create index on public.payments (user_id);
create index on public.payments (course_id);

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
revoke all on function public.has_course_access(uuid) from public;
grant execute on function public.has_course_access(uuid) to anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
