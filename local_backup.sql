--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Homebrew)
-- Dumped by pg_dump version 14.13 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Application; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Application" (
    id integer NOT NULL,
    "applicationId" text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "submittedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "programId" integer NOT NULL,
    "personalId" integer NOT NULL,
    "farmId" integer NOT NULL,
    "grantId" integer NOT NULL,
    "trainingId" integer NOT NULL,
    "motivationId" integer NOT NULL,
    "declarationId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Application" OWNER TO "user";

--
-- Name: Application_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Application_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Application_id_seq" OWNER TO "user";

--
-- Name: Application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Application_id_seq" OWNED BY public."Application".id;


--
-- Name: Declaration; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Declaration" (
    id integer NOT NULL,
    agreed boolean NOT NULL,
    "officerName" text NOT NULL
);


ALTER TABLE public."Declaration" OWNER TO "user";

--
-- Name: Declaration_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Declaration_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Declaration_id_seq" OWNER TO "user";

--
-- Name: Declaration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Declaration_id_seq" OWNED BY public."Declaration".id;


--
-- Name: Education; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Education" (
    id integer NOT NULL,
    "memberId" integer NOT NULL,
    "highestLevel" text NOT NULL,
    "institutionName" text NOT NULL,
    "fieldOfStudy" text NOT NULL,
    "otherCertifications" text
);


ALTER TABLE public."Education" OWNER TO "user";

--
-- Name: Education_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Education_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Education_id_seq" OWNER TO "user";

--
-- Name: Education_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Education_id_seq" OWNED BY public."Education".id;


--
-- Name: Farm; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Farm" (
    id integer NOT NULL,
    location text NOT NULL,
    size double precision NOT NULL,
    type text NOT NULL,
    practices text NOT NULL,
    challenges text NOT NULL
);


ALTER TABLE public."Farm" OWNER TO "user";

--
-- Name: Farm_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Farm_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Farm_id_seq" OWNER TO "user";

--
-- Name: Farm_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Farm_id_seq" OWNED BY public."Farm".id;


--
-- Name: Grant; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Grant" (
    id integer NOT NULL,
    outcomes text NOT NULL,
    "budgetFile" text NOT NULL
);


ALTER TABLE public."Grant" OWNER TO "user";

--
-- Name: Grant_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Grant_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Grant_id_seq" OWNER TO "user";

--
-- Name: Grant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Grant_id_seq" OWNED BY public."Grant".id;


--
-- Name: Member; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Member" (
    id integer NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone NOT NULL,
    gender text NOT NULL,
    nationality text NOT NULL,
    "phoneNumber" text NOT NULL,
    "residentialAddress" text NOT NULL,
    "emergencyContact" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "workEmail" text NOT NULL
);


ALTER TABLE public."Member" OWNER TO "user";

--
-- Name: Member_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Member_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Member_id_seq" OWNER TO "user";

--
-- Name: Member_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Member_id_seq" OWNED BY public."Member".id;


--
-- Name: Motivation; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Motivation" (
    id integer NOT NULL,
    statement text NOT NULL,
    implementation text NOT NULL,
    "identityFile" text NOT NULL
);


ALTER TABLE public."Motivation" OWNER TO "user";

--
-- Name: Motivation_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Motivation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Motivation_id_seq" OWNER TO "user";

--
-- Name: Motivation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Motivation_id_seq" OWNED BY public."Motivation".id;


--
-- Name: Personal; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Personal" (
    id integer NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    "phoneNumber" text NOT NULL,
    address text NOT NULL,
    gender text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Personal" OWNER TO "user";

--
-- Name: Personal_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Personal_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Personal_id_seq" OWNER TO "user";

--
-- Name: Personal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Personal_id_seq" OWNED BY public."Personal".id;


--
-- Name: Program; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Program" (
    id integer NOT NULL,
    category text NOT NULL,
    "previousTraining" boolean NOT NULL,
    "trainingId" text
);


ALTER TABLE public."Program" OWNER TO "user";

--
-- Name: Program_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Program_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Program_id_seq" OWNER TO "user";

--
-- Name: Program_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Program_id_seq" OWNED BY public."Program".id;


--
-- Name: Training; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."Training" (
    id integer NOT NULL,
    preference text NOT NULL
);


ALTER TABLE public."Training" OWNER TO "user";

--
-- Name: Training_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."Training_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Training_id_seq" OWNER TO "user";

--
-- Name: Training_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."Training_id_seq" OWNED BY public."Training".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO "user";

--
-- Name: Application id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Application" ALTER COLUMN id SET DEFAULT nextval('public."Application_id_seq"'::regclass);


--
-- Name: Declaration id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Declaration" ALTER COLUMN id SET DEFAULT nextval('public."Declaration_id_seq"'::regclass);


--
-- Name: Education id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Education" ALTER COLUMN id SET DEFAULT nextval('public."Education_id_seq"'::regclass);


--
-- Name: Farm id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Farm" ALTER COLUMN id SET DEFAULT nextval('public."Farm_id_seq"'::regclass);


--
-- Name: Grant id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Grant" ALTER COLUMN id SET DEFAULT nextval('public."Grant_id_seq"'::regclass);


--
-- Name: Member id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Member" ALTER COLUMN id SET DEFAULT nextval('public."Member_id_seq"'::regclass);


--
-- Name: Motivation id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Motivation" ALTER COLUMN id SET DEFAULT nextval('public."Motivation_id_seq"'::regclass);


--
-- Name: Personal id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Personal" ALTER COLUMN id SET DEFAULT nextval('public."Personal_id_seq"'::regclass);


--
-- Name: Program id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Program" ALTER COLUMN id SET DEFAULT nextval('public."Program_id_seq"'::regclass);


--
-- Name: Training id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Training" ALTER COLUMN id SET DEFAULT nextval('public."Training_id_seq"'::regclass);


--
-- Data for Name: Application; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Application" (id, "applicationId", status, "submittedAt", "programId", "personalId", "farmId", "grantId", "trainingId", "motivationId", "declarationId", "createdAt", "updatedAt") FROM stdin;
1	APP987631V9	pending	2025-03-03 08:36:27.648	1	1	1	1	1	1	1	2025-03-03 08:36:27.648	2025-03-03 08:36:27.648
2	APP049498OH	pending	2025-03-03 08:37:29.501	2	2	2	2	2	2	2	2025-03-03 08:37:29.501	2025-03-03 08:37:29.501
3	APP053375MA	pending	2025-03-03 08:37:33.377	3	3	3	3	3	3	3	2025-03-03 08:37:33.377	2025-03-03 08:37:33.377
4	APP111924A8	pending	2025-03-03 08:38:31.926	4	4	4	4	4	4	4	2025-03-03 08:38:31.926	2025-03-03 08:38:31.926
\.


--
-- Data for Name: Declaration; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Declaration" (id, agreed, "officerName") FROM stdin;
1	t	Officer Sarah Johnson
2	t	Officer Sarah Johnson
3	t	Officer Sarah Johnson
4	t	Officer Sarah Johnson
\.


--
-- Data for Name: Education; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Education" (id, "memberId", "highestLevel", "institutionName", "fieldOfStudy", "otherCertifications") FROM stdin;
\.


--
-- Data for Name: Farm; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Farm" (id, location, size, type, practices, challenges) FROM stdin;
1	Gwagwalada Area Council, FCT	5.5	Maize, Cassava, Poultry	Traditional farming with some modern irrigation	Limited access to modern equipment, seasonal pests
2	Gwagwalada Area Council, FCT	5.5	Maize, Cassava, Poultry	Traditional farming with some modern irrigation	Limited access to modern equipment, seasonal pests
3	Gwagwalada Area Council, FCT	5.5	Maize, Cassava, Poultry	Traditional farming with some modern irrigation	Limited access to modern equipment, seasonal pests
4	Gwagwalada Area Council, FCT	5.5	Maize, Cassava, Poultry	Traditional farming with some modern irrigation	Limited access to modern equipment, seasonal pests
\.


--
-- Data for Name: Grant; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Grant" (id, outcomes, "budgetFile") FROM stdin;
1	Increase crop yield by 50% and expand poultry operation	APP987631V9-d0da56328ac8.pdf
2	Increase crop yield by 50% and expand poultry operation	APP049498OH-627dfe1c42d2.pdf
3	Increase crop yield by 50% and expand poultry operation	APP053375MA-4f0b6acc085f.pdf
4	Increase crop yield by 50% and expand poultry operation	APP111924A8-d5361e825055.pdf
\.


--
-- Data for Name: Member; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Member" (id, "firstName", "lastName", email, "dateOfBirth", gender, nationality, "phoneNumber", "residentialAddress", "emergencyContact", "createdAt", "updatedAt", "workEmail") FROM stdin;
\.


--
-- Data for Name: Motivation; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Motivation" (id, statement, implementation, "identityFile") FROM stdin;
1	I aim to modernize my farming practices	Will invest in modern equipment and training	APP987631V9-10bcc9cd7637.pdf
2	I aim to modernize my farming practices	Will invest in modern equipment and training	APP049498OH-956286a55012.pdf
3	I aim to modernize my farming practices	Will invest in modern equipment and training	APP053375MA-dac3c803404d.pdf
4	I aim to modernize my farming practices	Will invest in modern equipment and training	APP111924A8-5696f06e17bb.pdf
\.


--
-- Data for Name: Personal; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Personal" (id, "fullName", email, "phoneNumber", address, gender, "dateOfBirth") FROM stdin;
1	John Doe	john.doe@example.com	+2348012345678	123 Farm Road, Abuja	male	1990-01-01 00:00:00
2	John Doe	john.doe@example.com	+2348012345678	123 Farm Road, Abuja	male	1990-01-01 00:00:00
3	John Doe	john.doe@example.com	+2348012345678	123 Farm Road, Abuja	male	1990-01-01 00:00:00
4	John Doe	john.doe@example.com	+2348012345678	123 Farm Road, Abuja	male	1990-01-01 00:00:00
\.


--
-- Data for Name: Program; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Program" (id, category, "previousTraining", "trainingId") FROM stdin;
1	rural	t	\N
2	rural	t	\N
3	rural	t	\N
4	rural	t	\N
\.


--
-- Data for Name: Training; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."Training" (id, preference) FROM stdin;
1	in-person
2	in-person
3	in-person
4	in-person
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
862518bb-3d99-4ba3-850a-e7af5d784799	90c430a324ce4942b9e7d194b00297fa56967b9e39d010b8b39ca9588c643fe3	2025-03-03 09:18:40.504895+01	20250225140758_init	\N	\N	2025-03-03 09:18:40.499371+01	1
be36b2c6-94b2-4049-8a61-9b744c842eb4	5b8770d30c25f10e006c4bf7c8a56edfd3fa8eff2a9fe9f92fbb32ef123f3667	2025-03-03 09:18:40.507914+01	20250302005607_rename_work_email_to_email_address	\N	\N	2025-03-03 09:18:40.505331+01	1
3e33b1c2-d58f-4b7b-9b72-d4f0cc6a788d	f8998c670180f7c630eb3fb42a6908d82671ee208d1907c60896339c173628c3	2025-03-03 09:18:40.512073+01	20250302011015_rename_email_address_to_work_email	\N	\N	2025-03-03 09:18:40.508471+01	1
407ce6f6-6028-4e89-812f-37fd4be2a5df	1da97c26e84b12ea6c113b7a161577f35fa8a793fa9e52a47f0687dc2dce198c	2025-03-03 09:18:40.532147+01	20250303063110_add_program_applications	\N	\N	2025-03-03 09:18:40.51264+01	1
\.


--
-- Name: Application_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Application_id_seq"', 4, true);


--
-- Name: Declaration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Declaration_id_seq"', 4, true);


--
-- Name: Education_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Education_id_seq"', 1, false);


--
-- Name: Farm_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Farm_id_seq"', 4, true);


--
-- Name: Grant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Grant_id_seq"', 4, true);


--
-- Name: Member_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Member_id_seq"', 1, false);


--
-- Name: Motivation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Motivation_id_seq"', 4, true);


--
-- Name: Personal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Personal_id_seq"', 4, true);


--
-- Name: Program_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Program_id_seq"', 4, true);


--
-- Name: Training_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."Training_id_seq"', 4, true);


--
-- Name: Application Application_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_pkey" PRIMARY KEY (id);


--
-- Name: Declaration Declaration_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Declaration"
    ADD CONSTRAINT "Declaration_pkey" PRIMARY KEY (id);


--
-- Name: Education Education_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Education"
    ADD CONSTRAINT "Education_pkey" PRIMARY KEY (id);


--
-- Name: Farm Farm_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Farm"
    ADD CONSTRAINT "Farm_pkey" PRIMARY KEY (id);


--
-- Name: Grant Grant_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Grant"
    ADD CONSTRAINT "Grant_pkey" PRIMARY KEY (id);


--
-- Name: Member Member_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Member"
    ADD CONSTRAINT "Member_pkey" PRIMARY KEY (id);


--
-- Name: Motivation Motivation_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Motivation"
    ADD CONSTRAINT "Motivation_pkey" PRIMARY KEY (id);


--
-- Name: Personal Personal_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Personal"
    ADD CONSTRAINT "Personal_pkey" PRIMARY KEY (id);


--
-- Name: Program Program_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Program"
    ADD CONSTRAINT "Program_pkey" PRIMARY KEY (id);


--
-- Name: Training Training_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Training"
    ADD CONSTRAINT "Training_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Application_applicationId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Application_applicationId_key" ON public."Application" USING btree ("applicationId");


--
-- Name: Application_declarationId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Application_declarationId_key" ON public."Application" USING btree ("declarationId");


--
-- Name: Application_farmId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Application_farmId_key" ON public."Application" USING btree ("farmId");


--
-- Name: Application_grantId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Application_grantId_key" ON public."Application" USING btree ("grantId");


--
-- Name: Application_motivationId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Application_motivationId_key" ON public."Application" USING btree ("motivationId");


--
-- Name: Application_personalId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Application_personalId_key" ON public."Application" USING btree ("personalId");


--
-- Name: Application_programId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Application_programId_key" ON public."Application" USING btree ("programId");


--
-- Name: Application_trainingId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Application_trainingId_key" ON public."Application" USING btree ("trainingId");


--
-- Name: Education_memberId_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Education_memberId_key" ON public."Education" USING btree ("memberId");


--
-- Name: Member_email_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Member_email_key" ON public."Member" USING btree (email);


--
-- Name: Member_phoneNumber_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Member_phoneNumber_key" ON public."Member" USING btree ("phoneNumber");


--
-- Name: Member_workEmail_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX "Member_workEmail_key" ON public."Member" USING btree ("workEmail");


--
-- Name: Application Application_declarationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_declarationId_fkey" FOREIGN KEY ("declarationId") REFERENCES public."Declaration"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Application Application_farmId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES public."Farm"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Application Application_grantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES public."Grant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Application Application_motivationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_motivationId_fkey" FOREIGN KEY ("motivationId") REFERENCES public."Motivation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Application Application_personalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES public."Personal"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Application Application_programId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_programId_fkey" FOREIGN KEY ("programId") REFERENCES public."Program"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Application Application_trainingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES public."Training"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Education Education_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."Education"
    ADD CONSTRAINT "Education_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public."Member"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: goodnessobaje
--

GRANT ALL ON SCHEMA public TO "user";


--
-- PostgreSQL database dump complete
--

