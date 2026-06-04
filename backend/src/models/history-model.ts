export interface HistoryModel {
  id_user: string;
  id_movie: string;
  duration: number;
  watched_at: string;      
  last_position: number;   
  is_completed: boolean;
  is_hidden: boolean;
}