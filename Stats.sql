-- Table: public.Stats

-- DROP TABLE IF EXISTS public."Stats";

CREATE TABLE IF NOT EXISTS public."Stats"
(
    id integer NOT NULL,
    "tree name" "char",
    "Upvote" integer,
    "Downvote" integer,
    CONSTRAINT "Stats_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Stats"
    OWNER to postgres;

SELECT *from public.Stats;