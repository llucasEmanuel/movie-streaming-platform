export interface HistoryModel {
  id_user: string;
  id_movie: string;
  watched_at: string;      
  last_position: number;   
  is_completed: boolean;
  is_hidden: boolean;
}