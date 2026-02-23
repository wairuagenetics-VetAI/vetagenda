export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          brand_color: string | null;
          accent_color: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          description: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          emergency_message: string | null;
          timezone: string;
          privacy_policy_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          brand_color?: string | null;
          accent_color?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          description?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          emergency_message?: string | null;
          timezone?: string;
          privacy_policy_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          brand_color?: string | null;
          accent_color?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          description?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          emergency_message?: string | null;
          timezone?: string;
          privacy_policy_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      centers: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          address: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug: string;
          address?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          address?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      resources: {
        Row: {
          id: string;
          center_id: string;
          name: string;
          type: "consult_room" | "surgery_room" | "imaging" | "other";
          slot_minutes: number;
          is_active_default: boolean;
          color: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          center_id: string;
          name: string;
          type: "consult_room" | "surgery_room" | "imaging" | "other";
          slot_minutes?: number;
          is_active_default?: boolean;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          center_id?: string;
          name?: string;
          type?: "consult_room" | "surgery_room" | "imaging" | "other";
          slot_minutes?: number;
          is_active_default?: boolean;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      resource_overrides: {
        Row: {
          id: string;
          resource_id: string;
          date_start: string;
          date_end: string;
          is_active: boolean;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          date_start: string;
          date_end: string;
          is_active: boolean;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          resource_id?: string;
          date_start?: string;
          date_end?: string;
          is_active?: boolean;
          note?: string | null;
          created_at?: string;
        };
      };

      professionals: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          display_name: string;
          role_tag: "vet" | "atv" | "admin";
          color: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          display_name: string;
          role_tag: "vet" | "atv" | "admin";
          color?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string | null;
          display_name?: string;
          role_tag?: "vet" | "atv" | "admin";
          color?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      professional_centers: {
        Row: {
          id: string;
          professional_id: string;
          center_id: string;
        };
        Insert: {
          id?: string;
          professional_id: string;
          center_id: string;
        };
        Update: {
          id?: string;
          professional_id?: string;
          center_id?: string;
        };
      };

      services: {
        Row: {
          id: string;
          organization_id: string;
          name_public: string;
          name_internal: string | null;
          description: string | null;
          icon: string | null;
          duration_minutes: number;
          resource_type_required:
            | "consult_room"
            | "surgery_room"
            | "imaging"
            | "other";
          allows_choose_professional: boolean;
          default_professional_strategy:
            | "any_available"
            | "round_robin"
            | "least_loaded";
          requires_manual_confirmation: boolean;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name_public: string;
          name_internal?: string | null;
          description?: string | null;
          icon?: string | null;
          duration_minutes: number;
          resource_type_required:
            | "consult_room"
            | "surgery_room"
            | "imaging"
            | "other";
          allows_choose_professional?: boolean;
          default_professional_strategy?:
            | "any_available"
            | "round_robin"
            | "least_loaded";
          requires_manual_confirmation?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name_public?: string;
          name_internal?: string | null;
          description?: string | null;
          icon?: string | null;
          duration_minutes?: number;
          resource_type_required?:
            | "consult_room"
            | "surgery_room"
            | "imaging"
            | "other";
          allows_choose_professional?: boolean;
          default_professional_strategy?:
            | "any_available"
            | "round_robin"
            | "least_loaded";
          requires_manual_confirmation?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      service_professionals: {
        Row: {
          id: string;
          service_id: string;
          professional_id: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          professional_id: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          professional_id?: string;
        };
      };

      schedule_rules: {
        Row: {
          id: string;
          center_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          label: string | null;
        };
        Insert: {
          id?: string;
          center_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
          label?: string | null;
        };
        Update: {
          id?: string;
          center_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
          label?: string | null;
        };
      };

      schedule_exceptions: {
        Row: {
          id: string;
          center_id: string;
          date: string;
          is_closed: boolean;
          custom_start: string | null;
          custom_end: string | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          center_id: string;
          date: string;
          is_closed?: boolean;
          custom_start?: string | null;
          custom_end?: string | null;
          note?: string | null;
        };
        Update: {
          id?: string;
          center_id?: string;
          date?: string;
          is_closed?: boolean;
          custom_start?: string | null;
          custom_end?: string | null;
          note?: string | null;
        };
      };

      reason_categories: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          sort_order?: number;
          is_active?: boolean;
        };
      };

      appointments: {
        Row: {
          id: string;
          organization_id: string;
          center_id: string;
          resource_id: string;
          professional_id: string | null;
          service_id: string;
          start_ts: string;
          end_ts: string;
          status:
            | "pending"
            | "booked"
            | "cancelled"
            | "no_show"
            | "completed";
          created_by: "guest" | "staff";
          created_by_staff_id: string | null;
          guest_owner_name: string;
          guest_pet_name: string;
          guest_pet_species:
            | "dog"
            | "cat"
            | "bird"
            | "rabbit"
            | "reptile"
            | "exotic"
            | "other";
          guest_phone: string;
          guest_microchip: string | null;
          reason_category_id: string | null;
          reason_text: string | null;
          triage_summary: string | null;
          triage_urgency: "low" | "normal" | "high" | "emergency" | null;
          triage_raw_json: Json | null;
          consent_privacy: boolean;
          consent_data_accuracy: boolean;
          staff_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          center_id: string;
          resource_id: string;
          professional_id?: string | null;
          service_id: string;
          start_ts: string;
          end_ts: string;
          status?:
            | "pending"
            | "booked"
            | "cancelled"
            | "no_show"
            | "completed";
          created_by: "guest" | "staff";
          created_by_staff_id?: string | null;
          guest_owner_name: string;
          guest_pet_name: string;
          guest_pet_species:
            | "dog"
            | "cat"
            | "bird"
            | "rabbit"
            | "reptile"
            | "exotic"
            | "other";
          guest_phone: string;
          guest_microchip?: string | null;
          reason_category_id?: string | null;
          reason_text?: string | null;
          triage_summary?: string | null;
          triage_urgency?: "low" | "normal" | "high" | "emergency" | null;
          triage_raw_json?: Json | null;
          consent_privacy: boolean;
          consent_data_accuracy: boolean;
          staff_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          center_id?: string;
          resource_id?: string;
          professional_id?: string | null;
          service_id?: string;
          start_ts?: string;
          end_ts?: string;
          status?:
            | "pending"
            | "booked"
            | "cancelled"
            | "no_show"
            | "completed";
          created_by?: "guest" | "staff";
          created_by_staff_id?: string | null;
          guest_owner_name?: string;
          guest_pet_name?: string;
          guest_pet_species?:
            | "dog"
            | "cat"
            | "bird"
            | "rabbit"
            | "reptile"
            | "exotic"
            | "other";
          guest_phone?: string;
          guest_microchip?: string | null;
          reason_category_id?: string | null;
          reason_text?: string | null;
          triage_summary?: string | null;
          triage_urgency?: "low" | "normal" | "high" | "emergency" | null;
          triage_raw_json?: Json | null;
          consent_privacy?: boolean;
          consent_data_accuracy?: boolean;
          staff_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      appointment_attachments: {
        Row: {
          id: string;
          appointment_id: string;
          file_url: string;
          file_type: string;
          file_name: string;
          duration_seconds: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          file_url: string;
          file_type: string;
          file_name: string;
          duration_seconds?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          file_url?: string;
          file_type?: string;
          file_name?: string;
          duration_seconds?: number | null;
          created_at?: string;
        };
      };

      blocks: {
        Row: {
          id: string;
          center_id: string;
          resource_id: string | null;
          professional_id: string | null;
          start_ts: string;
          end_ts: string;
          type:
            | "blocked"
            | "surgery"
            | "meeting"
            | "break"
            | "reserved_urgent";
          note: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          center_id: string;
          resource_id?: string | null;
          professional_id?: string | null;
          start_ts: string;
          end_ts: string;
          type:
            | "blocked"
            | "surgery"
            | "meeting"
            | "break"
            | "reserved_urgent";
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          center_id?: string;
          resource_id?: string | null;
          professional_id?: string | null;
          start_ts?: string;
          end_ts?: string;
          type?:
            | "blocked"
            | "surgery"
            | "meeting"
            | "break"
            | "reserved_urgent";
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };

      staff_roles: {
        Row: {
          id: string;
          professional_id: string;
          organization_id: string;
          role: "owner" | "manager" | "staff" | "viewer";
        };
        Insert: {
          id?: string;
          professional_id: string;
          organization_id: string;
          role: "owner" | "manager" | "staff" | "viewer";
        };
        Update: {
          id?: string;
          professional_id?: string;
          organization_id?: string;
          role?: "owner" | "manager" | "staff" | "viewer";
        };
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      rpc_book_appointment: {
        Args: {
          p_organization_id: string;
          p_center_id: string;
          p_service_id: string;
          p_professional_id: string | null;
          p_start_ts: string;
          p_guest_owner_name: string;
          p_guest_pet_name: string;
          p_guest_pet_species: string;
          p_guest_phone: string;
          p_guest_microchip: string | null;
          p_reason_category_id: string | null;
          p_reason_text: string | null;
          p_triage_summary: string | null;
          p_triage_urgency: string | null;
          p_triage_raw_json: Json | null;
          p_consent_privacy: boolean;
          p_consent_data_accuracy: boolean;
        };
        Returns: {
          appointment_id: string;
          resource_id: string;
          professional_id: string | null;
          start_ts: string;
          end_ts: string;
          status: string;
        };
      };
    };

    Enums: {
      resource_type: "consult_room" | "surgery_room" | "imaging" | "other";
      professional_role_tag: "vet" | "atv" | "admin";
      professional_strategy:
        | "any_available"
        | "round_robin"
        | "least_loaded";
      appointment_status:
        | "pending"
        | "booked"
        | "cancelled"
        | "no_show"
        | "completed";
      appointment_creator: "guest" | "staff";
      pet_species:
        | "dog"
        | "cat"
        | "bird"
        | "rabbit"
        | "reptile"
        | "exotic"
        | "other";
      triage_urgency: "low" | "normal" | "high" | "emergency";
      block_type:
        | "blocked"
        | "surgery"
        | "meeting"
        | "break"
        | "reserved_urgent";
      staff_role: "owner" | "manager" | "staff" | "viewer";
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// ---------------------------------------------------------------------------
// Convenience type aliases
// ---------------------------------------------------------------------------

export type Organization =
  Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationInsert =
  Database["public"]["Tables"]["organizations"]["Insert"];
export type OrganizationUpdate =
  Database["public"]["Tables"]["organizations"]["Update"];

export type Center = Database["public"]["Tables"]["centers"]["Row"];
export type CenterInsert = Database["public"]["Tables"]["centers"]["Insert"];
export type CenterUpdate = Database["public"]["Tables"]["centers"]["Update"];

export type Resource = Database["public"]["Tables"]["resources"]["Row"];
export type ResourceInsert =
  Database["public"]["Tables"]["resources"]["Insert"];
export type ResourceUpdate =
  Database["public"]["Tables"]["resources"]["Update"];

export type ResourceOverride =
  Database["public"]["Tables"]["resource_overrides"]["Row"];
export type ResourceOverrideInsert =
  Database["public"]["Tables"]["resource_overrides"]["Insert"];
export type ResourceOverrideUpdate =
  Database["public"]["Tables"]["resource_overrides"]["Update"];

export type Professional =
  Database["public"]["Tables"]["professionals"]["Row"];
export type ProfessionalInsert =
  Database["public"]["Tables"]["professionals"]["Insert"];
export type ProfessionalUpdate =
  Database["public"]["Tables"]["professionals"]["Update"];

export type ProfessionalCenter =
  Database["public"]["Tables"]["professional_centers"]["Row"];
export type ProfessionalCenterInsert =
  Database["public"]["Tables"]["professional_centers"]["Insert"];
export type ProfessionalCenterUpdate =
  Database["public"]["Tables"]["professional_centers"]["Update"];

export type Service = Database["public"]["Tables"]["services"]["Row"];
export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
export type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];

export type ServiceProfessional =
  Database["public"]["Tables"]["service_professionals"]["Row"];
export type ServiceProfessionalInsert =
  Database["public"]["Tables"]["service_professionals"]["Insert"];
export type ServiceProfessionalUpdate =
  Database["public"]["Tables"]["service_professionals"]["Update"];

export type ScheduleRule =
  Database["public"]["Tables"]["schedule_rules"]["Row"];
export type ScheduleRuleInsert =
  Database["public"]["Tables"]["schedule_rules"]["Insert"];
export type ScheduleRuleUpdate =
  Database["public"]["Tables"]["schedule_rules"]["Update"];

export type ScheduleException =
  Database["public"]["Tables"]["schedule_exceptions"]["Row"];
export type ScheduleExceptionInsert =
  Database["public"]["Tables"]["schedule_exceptions"]["Insert"];
export type ScheduleExceptionUpdate =
  Database["public"]["Tables"]["schedule_exceptions"]["Update"];

export type ReasonCategory =
  Database["public"]["Tables"]["reason_categories"]["Row"];
export type ReasonCategoryInsert =
  Database["public"]["Tables"]["reason_categories"]["Insert"];
export type ReasonCategoryUpdate =
  Database["public"]["Tables"]["reason_categories"]["Update"];

export type Appointment =
  Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentInsert =
  Database["public"]["Tables"]["appointments"]["Insert"];
export type AppointmentUpdate =
  Database["public"]["Tables"]["appointments"]["Update"];

export type AppointmentAttachment =
  Database["public"]["Tables"]["appointment_attachments"]["Row"];
export type AppointmentAttachmentInsert =
  Database["public"]["Tables"]["appointment_attachments"]["Insert"];
export type AppointmentAttachmentUpdate =
  Database["public"]["Tables"]["appointment_attachments"]["Update"];

export type Block = Database["public"]["Tables"]["blocks"]["Row"];
export type BlockInsert = Database["public"]["Tables"]["blocks"]["Insert"];
export type BlockUpdate = Database["public"]["Tables"]["blocks"]["Update"];

export type StaffRole = Database["public"]["Tables"]["staff_roles"]["Row"];
export type StaffRoleInsert =
  Database["public"]["Tables"]["staff_roles"]["Insert"];
export type StaffRoleUpdate =
  Database["public"]["Tables"]["staff_roles"]["Update"];

// ---------------------------------------------------------------------------
// Enum value helpers (useful for runtime validation / select options)
// ---------------------------------------------------------------------------

export type ResourceType = Database["public"]["Enums"]["resource_type"];
export type ProfessionalRoleTag =
  Database["public"]["Enums"]["professional_role_tag"];
export type ProfessionalStrategy =
  Database["public"]["Enums"]["professional_strategy"];
export type AppointmentStatus =
  Database["public"]["Enums"]["appointment_status"];
export type AppointmentCreator =
  Database["public"]["Enums"]["appointment_creator"];
export type PetSpecies = Database["public"]["Enums"]["pet_species"];
export type TriageUrgency = Database["public"]["Enums"]["triage_urgency"];
export type BlockType = Database["public"]["Enums"]["block_type"];
export type StaffRoleEnum = Database["public"]["Enums"]["staff_role"];
