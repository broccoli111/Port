import type {
  UserRole,
  SubscriptionPlan,
  SubscriptionStatus,
  TaskStatus,
} from "./index";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          subscription_id: string | null;
          plan: SubscriptionPlan | null;
          status: SubscriptionStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          subscription_id?: string | null;
          plan?: SubscriptionPlan | null;
          status?: SubscriptionStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          subscription_id?: string | null;
          plan?: SubscriptionPlan | null;
          status?: SubscriptionStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      tasks: {
        Row: {
          id: string;
          client_id: string;
          assigned_to: string | null;
          title: string;
          description: string;
          status: TaskStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          assigned_to?: string | null;
          title: string;
          description: string;
          status?: TaskStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          assigned_to?: string | null;
          title?: string;
          description?: string;
          status?: TaskStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      task_files: {
        Row: {
          id: string;
          task_id: string;
          file_url: string;
          file_name: string;
          uploaded_by: string;
          file_type: "brief" | "deliverable";
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          file_url: string;
          file_name: string;
          uploaded_by: string;
          file_type: "brief" | "deliverable";
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          file_url?: string;
          file_name?: string;
          uploaded_by?: string;
          file_type?: "brief" | "deliverable";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_files_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_files_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      comments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      status_updates: {
        Row: {
          id: string;
          task_id: string;
          old_status: TaskStatus | null;
          new_status: TaskStatus;
          changed_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          old_status?: TaskStatus | null;
          new_status: TaskStatus;
          changed_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          old_status?: TaskStatus | null;
          new_status?: TaskStatus;
          changed_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "status_updates_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "status_updates_changed_by_fkey";
            columns: ["changed_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      site_content: {
        Row: {
          id: string;
          page: string;
          section: string;
          content: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page: string;
          section: string;
          content: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page?: string;
          section?: string;
          content?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pricing_tiers: {
        Row: {
          id: string;
          name: string;
          plan: SubscriptionPlan;
          price: number;
          features: string[];
          stripe_price_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan: SubscriptionPlan;
          price: number;
          features: string[];
          stripe_price_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          plan?: SubscriptionPlan;
          price?: number;
          features?: string[];
          stripe_price_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Views: {};
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    Functions: {};
    Enums: {
      user_role: UserRole;
      subscription_plan: SubscriptionPlan;
      subscription_status: SubscriptionStatus;
      task_status: TaskStatus;
      file_type: "brief" | "deliverable";
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    CompositeTypes: {};
  };
}
