// Declaration file to fix Supabase types issue
declare module '@/integrations/supabase/types' {
  export interface Database {
    public: {
      Tables: {};
      Views: {};
      Functions: {};
      Enums: {};
      CompositeTypes: {};
    };
  }
}