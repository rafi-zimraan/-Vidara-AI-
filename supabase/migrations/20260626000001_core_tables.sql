-- Vidara AI: Core Tables Migration
-- Based on: internal/docs/database.md

-- 0. Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pgvector";

-- 1. Profiles (syncs with auth.users via trigger)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  preferences jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  prompt_text text,
  language text not null default 'en',
  target_duration_secs int,
  aspect_ratio text not null default '16:9',
  resolution text not null default '1080p',
  status text not null default 'draft'
    check (status in ('draft','queued','generating_script','generating_voiceover','generating_footage','generating_subtitles','rendering','completed','failed','published')),
  visibility text default 'private'
    check (visibility in ('private','unlisted','public')),
  youtube_video_id text,
  youtube_url text,
  credits_used int default 0,
  config jsonb default '{}',
  metadata jsonb default '{}',
  version int not null default 1,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- 3. Scripts
create table if not exists public.scripts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  full_script text not null,
  tone text default 'neutral'
    check (tone in ('formal','casual','humor','dramatic','educational','neutral')),
  target_language text not null default 'en',
  word_count int,
  estimated_duration_secs int,
  narration_segments jsonb default '[]',
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Storyboards
create table if not exists public.storyboards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  scene_number int not null,
  script_snippet text,
  visual_notes text,
  camera_angle text,
  transition_type text default 'cut'
    check (transition_type in ('cut','fade','crossfade','slide','zoom','dissolve')),
  duration_secs numeric(6,2),
  image_url text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  unique (project_id, scene_number)
);

-- 5. Scenes
create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  scene_number int not null,
  name text,
  duration_secs numeric(6,2),
  narration_text text,
  scene_direction text,
  transition_in text default 'cut',
  transition_out text default 'cut',
  animation_config jsonb default '{}',
  style_config jsonb default '{}',
  status text default 'pending'
    check (status in ('pending','generating','completed','failed')),
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, scene_number)
);

-- 6. Assets
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  uploaded_by uuid not null references auth.users(id),
  asset_type text not null
    check (asset_type in ('image','video','audio','font','logo','scene_image','character','background','animation_clip','voiceover','subtitle','music','sfx','thumbnail','intro','outro','watermark','other')),
  filename text not null,
  storage_path text not null,
  file_size_bytes bigint,
  mime_type text,
  width int,
  height int,
  duration_secs numeric(8,2),
  checksum_sha256 text,
  metadata jsonb default '{}',
  tags text[],
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- 7. Niches
create table if not exists public.niches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  keywords text[] not null default '{}',
  target_audience jsonb,
  default_style jsonb,
  visual_preferences jsonb,
  reference_content jsonb,
  is_default boolean not null default false,
  is_active boolean not null default true,
  project_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

-- 8. Project-Niche junction
create table if not exists public.project_niches (
  project_id uuid not null references public.projects(id) on delete cascade,
  niche_id uuid not null references public.niches(id) on delete cascade,
  primary key (project_id, niche_id)
);

-- 9. Agent Tasks
create table if not exists public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  agent_name text not null,
  step_name text not null,
  status text not null default 'pending'
    check (status in ('pending','running','completed','failed','skipped','retrying')),
  priority int default 0,
  input_data jsonb,
  output_data jsonb,
  tokens_in int,
  tokens_out int,
  cost_usd numeric(10,6),
  retry_count int default 0,
  max_retries int default 3,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 10. Render Jobs
create table if not exists public.render_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  status text not null default 'queued'
    check (status in ('queued','processing','completed','failed','cancelled')),
  priority int default 0,
  resolution text not null default '1080p',
  format text not null default 'mp4'
    check (format in ('mp4','mov','webm','gif')),
  codec text default 'h264'
    check (codec in ('h264','h265','av1')),
  quality_preset text default 'standard'
    check (quality_preset in ('draft','standard','high')),
  output_path text,
  file_size_bytes bigint,
  duration_secs numeric(8,2),
  ffmpeg_params jsonb,
  error_message text,
  progress numeric(5,2) default 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 11. YouTube Videos
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text,
  youtube_id text,
  youtube_url text,
  status text default 'pending'
    check (status in ('pending','uploading','published','failed')),
  thumbnail_url text,
  duration_seconds int,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Projects
create index if not exists idx_projects_owner on public.projects(owner_id) where deleted_at is null;
create index if not exists idx_projects_status on public.projects(status) where status in ('queued','generating_script','generating_voiceover','rendering');
create index if not exists idx_projects_created on public.projects(created_at desc) where deleted_at is null;
create index if not exists idx_projects_owner_status on public.projects(owner_id, status);

-- Scenes
create index if not exists idx_scenes_project on public.scenes(project_id);
create index if not exists idx_scenes_sequence on public.scenes(project_id, scene_number);

-- Assets
create index if not exists idx_assets_project on public.assets(project_id);
create index if not exists idx_assets_type on public.assets(asset_type);
create index if not exists idx_assets_tags on public.assets using gin(tags);

-- Agent Tasks
create index if not exists idx_agent_tasks_project on public.agent_tasks(project_id);
create index if not exists idx_agent_tasks_status on public.agent_tasks(status) where status in ('pending','running','retrying');

-- Render Jobs
create index if not exists idx_render_jobs_status on public.render_jobs(status) where status in ('queued','processing');
create index if not exists idx_render_jobs_project on public.render_jobs(project_id);

-- Niches
create index if not exists idx_niches_owner on public.niches(owner_id) where is_active = true;
create index if not exists idx_niches_keywords on public.niches using gin(keywords);

-- Videos
create index if not exists idx_videos_project on public.videos(project_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.scripts enable row level security;
alter table public.storyboards enable row level security;
alter table public.scenes enable row level security;
alter table public.assets enable row level security;
alter table public.niches enable row level security;
alter table public.project_niches enable row level security;
alter table public.agent_tasks enable row level security;
alter table public.render_jobs enable row level security;
alter table public.videos enable row level security;

-- Profiles: only own profile
create policy "profiles_owner" on public.profiles
  for all using (id = auth.uid());

-- Projects: owner only
create policy "projects_owner" on public.projects
  for all using (owner_id = auth.uid());

-- Scripts: via project ownership
create policy "scripts_owner" on public.scripts
  for all using (
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

-- Storyboards: via project ownership
create policy "storyboards_owner" on public.storyboards
  for all using (
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

-- Scenes: via project ownership
create policy "scenes_owner" on public.scenes
  for all using (
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

-- Assets: uploader or via project
create policy "assets_owner" on public.assets
  for all using (
    uploaded_by = auth.uid() or
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

-- Niches: owner only
create policy "niches_owner" on public.niches
  for all using (owner_id = auth.uid());

-- Project-Niches: via project or niche ownership
create policy "project_niches_owner" on public.project_niches
  for all using (
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

-- Agent Tasks: via project ownership
create policy "agent_tasks_owner" on public.agent_tasks
  for all using (
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

-- Render Jobs: owner
create policy "render_jobs_owner" on public.render_jobs
  for all using (user_id = auth.uid());

-- Videos: via project ownership
create policy "videos_owner" on public.videos
  for all using (
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger set_scripts_updated_at
  before update on public.scripts
  for each row execute function public.set_updated_at();

create trigger set_scenes_updated_at
  before update on public.scenes
  for each row execute function public.set_updated_at();

create trigger set_niches_updated_at
  before update on public.niches
  for each row execute function public.set_updated_at();

create trigger set_videos_updated_at
  before update on public.videos
  for each row execute function public.set_updated_at();
