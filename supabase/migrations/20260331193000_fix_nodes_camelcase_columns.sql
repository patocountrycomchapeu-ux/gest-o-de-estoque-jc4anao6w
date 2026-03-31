DO $$ 
BEGIN
  -- Add camelCase columns to nodes to support the frontend payload mapping without errors
  ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS "parentId" TEXT;
  ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS "isGrouped" BOOLEAN;
END $$;

CREATE OR REPLACE FUNCTION public.sync_node_camel_case()
RETURNS trigger AS $$
BEGIN
  -- Sync parent_id and parentId bidirectionally
  IF NEW."parentId" IS NOT NULL AND (NEW.parent_id IS NULL OR NEW.parent_id != NEW."parentId") THEN
    NEW.parent_id := NEW."parentId";
  ELSIF NEW.parent_id IS NOT NULL AND (NEW."parentId" IS NULL OR NEW."parentId" != NEW.parent_id) THEN
    NEW."parentId" := NEW.parent_id;
  END IF;
  
  -- Sync is_grouped and isGrouped bidirectionally
  IF NEW."isGrouped" IS NOT NULL AND (NEW.is_grouped IS NULL OR NEW.is_grouped != NEW."isGrouped") THEN
    NEW.is_grouped := NEW."isGrouped";
  ELSIF NEW.is_grouped IS NOT NULL AND (NEW."isGrouped" IS NULL OR NEW."isGrouped" != NEW.is_grouped) THEN
    NEW."isGrouped" := NEW.is_grouped;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_node_camel_case_trigger ON public.nodes;
CREATE TRIGGER sync_node_camel_case_trigger
  BEFORE INSERT OR UPDATE ON public.nodes
  FOR EACH ROW EXECUTE FUNCTION public.sync_node_camel_case();

-- Backfill existing data to avoid any inconsistencies
UPDATE public.nodes SET "parentId" = parent_id WHERE parent_id IS NOT NULL AND "parentId" IS NULL;
UPDATE public.nodes SET "isGrouped" = is_grouped WHERE is_grouped IS NOT NULL AND "isGrouped" IS NULL;
