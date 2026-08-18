                                              Table "public.tenants"
         Column         |            Type             | Collation | Nullable |               Default               
------------------------+-----------------------------+-----------+----------+-------------------------------------
 id                     | integer                     |           | not null | nextval('tenants_id_seq'::regclass)
 tenant_id              | text                        |           | not null | 
 mobile                 | text                        |           |          | 
 phone                  | text                        |           |          | 
 email                  | text                        |           |          | 
 full_name              | text                        |           |          | 
 business_type          | text                        |           |          | 
 business_name          | text                        |           |          | 
 company_name           | text                        |           |          | 
 gst_number             | text                        |           |          | 
 address                | text                        |           |          | 
 city                   | text                        |           |          | 
 state                  | text                        |           |          | 
 pincode                | text                        |           |          | 
 country                | text                        |           |          | 'India'::text
 password_hash          | text                        |           |          | 
 password               | text                        |           |          | 
 password_reset_token   | text                        |           |          | 
 password_reset_expires | timestamp without time zone |           |          | 
 status                 | text                        |           |          | 'active'::text
 is_active              | boolean                     |           |          | true
 is_verified            | boolean                     |           |          | false
 email_verified         | boolean                     |           |          | false
 store_count            | integer                     |           |          | 0
 login_attempts         | integer                     |           |          | 0
 last_login             | timestamp without time zone |           |          | 
 subscription_tier      | character varying(20)       |           |          | 'trial'::character varying
 created_at             | timestamp without time zone |           |          | now()
 updated_at             | timestamp without time zone |           |          | now()
 deleted_at             | timestamp without time zone |           |          | 
Indexes:
    "tenants_pkey" PRIMARY KEY, btree (id)
    "idx_tenants_email" btree (email)
    "idx_tenants_mobile" btree (mobile)
    "idx_tenants_phone" btree (phone)
    "idx_tenants_tenant_id" btree (tenant_id)
    "tenants_tenant_id_key" UNIQUE CONSTRAINT, btree (tenant_id)
Referenced by:
    TABLE "admin_settings" CONSTRAINT "admin_settings_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES tenants(id)
    TABLE "store_permissions" CONSTRAINT "store_permissions_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES tenants(id)
    TABLE "stores" CONSTRAINT "stores_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    TABLE "trial_extension_requests" CONSTRAINT "trial_extension_requests_tenant_id_fkey" FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE

