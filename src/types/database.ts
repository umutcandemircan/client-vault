/**
 * Database types mirroring supabase/migrations/0001_initial_schema.sql.
 * Shape follows the `supabase gen types typescript` output so it can be
 * passed directly as the generic to the Supabase clients.
 *
 * Object types are declared with `type` (not `interface`) on purpose:
 * postgrest-js requires rows to be assignable to `Record<string, unknown>`,
 * which interfaces are not, and that silently degrades query typing.
 */

export const PORTAL_STATUSES = ["draft", "active", "completed"] as const;
export type PortalStatus = (typeof PORTAL_STATUSES)[number];

export const ITEM_STATUSES = [
  "pending",
  "uploaded",
  "approved",
  "rejected",
] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

/** UUID string as returned by Postgres. */
type Uuid = string;
/** ISO 8601 timestamp string as returned by Postgres `timestamptz`. */
type Timestamp = string;

export type Portal = {
  id: Uuid;
  created_at: Timestamp;
  title: string;
  description: string | null;
  client_name: string;
  client_email: string;
  status: PortalStatus;
  access_token: string;
};

export type PortalInsert = {
  id?: Uuid;
  created_at?: Timestamp;
  title: string;
  description?: string | null;
  client_name: string;
  client_email: string;
  status?: PortalStatus;
  access_token: string;
};

export type PortalUpdate = Partial<PortalInsert>;

export type PortalItem = {
  id: Uuid;
  portal_id: Uuid;
  title: string;
  description: string | null;
  /** MIME pattern accepted for this item, e.g. "image/*" or "application/pdf". */
  file_type: string;
  is_required: boolean;
  status: ItemStatus;
  file_url: string | null;
  created_at: Timestamp;
};

export type PortalItemInsert = {
  id?: Uuid;
  portal_id: Uuid;
  title: string;
  description?: string | null;
  file_type: string;
  is_required?: boolean;
  status?: ItemStatus;
  file_url?: string | null;
  created_at?: Timestamp;
};

export type PortalItemUpdate = Partial<PortalItemInsert>;

/** Fields a client (token holder) is permitted to write, per column grants. */
export type PortalItemClientUpdate = Pick<PortalItemUpdate, "file_url"> & {
  status?: Extract<ItemStatus, "pending" | "uploaded">;
};

export type PortalWithItems = Portal & {
  portal_items: PortalItem[];
};

type EmptyRecord = { [_ in never]: never };

export type Database = {
  public: {
    Tables: {
      portals: {
        Row: Portal;
        Insert: PortalInsert;
        Update: PortalUpdate;
        Relationships: [];
      };
      portal_items: {
        Row: PortalItem;
        Insert: PortalItemInsert;
        Update: PortalItemUpdate;
        Relationships: [
          {
            foreignKeyName: "portal_items_portal_id_fkey";
            columns: ["portal_id"];
            isOneToOne: false;
            referencedRelation: "portals";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: EmptyRecord;
    Functions: {
      request_portal_token: {
        Args: EmptyRecord;
        Returns: string | null;
      };
    };
    Enums: EmptyRecord;
    CompositeTypes: EmptyRecord;
  };
};
