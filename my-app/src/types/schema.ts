// src/types/schema.ts
import type { MasterProfileData } from '../components/CV workshop/types/cvTypes';

export interface SystemConfig {
  current_active_week: number;
  total_weeks: number;
}

export interface MLRoadmapItem {
  id: string;
  week: number;
  title: string;
  completed: boolean;
}

export interface DailyScheduleItem {
  time: string;
  label: string;
  category: 'life' | 'finnish' | 'ml' | 'career';
}

export interface WeeklyOutputTargets {
  career_min_jobs: number;
  github_min_commits: number;
  finnish_completed: boolean;
}

export interface AppDatabaseState {
  system_config: SystemConfig;
  ml_roadmap: MLRoadmapItem[];
  daily_schedule_template: DailyScheduleItem[];
  weekly_output_targets: WeeklyOutputTargets;
  daily_progress_clicks: Record<string, boolean>;
  modules_data: {
    projects: Array<{ id: string; name: string; status: 'Not started' | 'In progress' | 'Completed'; github_repo_id?: string }>;
    learning_notes: Array<{ id: string; roadmap_id: string; note: string; date: string }>;
    github_tracker: Array<{ id: string; repo_name: string; commits_this_week: number }>;
    job_tracker: Array<{ id: string; company: string; role: string; status: string; date_applied: string }>;
    finnish_tracker: Array<{ id: string; activity: string; minutes_spent: number; date: string }>;
    habit_tracker: Record<string, boolean[]>;

    // 🟢 ADD THIS RIGHT HERE INSIDE modules_data:
    cv_workshop?: {
      master_profile: MasterProfileData;
      saved_tailored_cvs?: any[];
    };
  };
}