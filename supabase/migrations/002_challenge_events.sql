alter table public.pilot_events
  add column if not exists challenge_id text,
  add column if not exists challenge_event text,
  add column if not exists failure_mode text,
  add column if not exists time_on_task_ms integer check (time_on_task_ms is null or time_on_task_ms >= 0),
  add column if not exists state jsonb;

alter table public.pilot_events
  drop constraint if exists pilot_events_event_type_check;

alter table public.pilot_events
  add constraint pilot_events_event_type_check
  check (
    event_type in (
      'lesson_started',
      'step_completed',
      'challenge_event',
      'quiz_answered',
      'quiz_completed',
      'next_lesson_clicked'
    )
  );

create index if not exists pilot_events_challenge_idx
  on public.pilot_events(lesson_id, challenge_id, challenge_event);
