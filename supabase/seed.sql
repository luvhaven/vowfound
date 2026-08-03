-- =============================================================================
-- seed.sql — reference data and demonstration content
--
-- Two kinds of row live here and they are not the same thing:
--
--   1. Reference data (readiness dimensions, plans). Real, required, and used
--      in production.
--   2. Demonstration content, marked is_demo. Never public, never published,
--      and rendered with a visible marker wherever it appears.
--
-- There are no seeded testimonials. There is no seeded success rate, member
-- count, or time-to-engagement. Those numbers do not exist yet, so inventing
-- them here is inventing them everywhere.
-- =============================================================================

-- --- readiness dimensions ----------------------------------------------------

insert into public.readiness_dimensions (key, name, ordinal, description, obstacle_prompt, first_action) values
('intent', 'Clarity of intent', 1,
 'Whether you can say what you want, by when, and why, without hedging.',
 'You want to be married but have not committed to a shape or a timeline, so every decision stays reversible and nothing progresses.',
 'Write one sentence: the month you intend to be engaged by, and what you are prepared to change to make it plausible.'),

('availability', 'Emotional availability', 2,
 'How much room there actually is for another person in your life right now.',
 'Something unfinished is still occupying the space a partner would need.',
 'Name the person or event still taking up room, and write what specifically remains unresolved about it.'),

('patterns', 'Patterns and history', 3,
 'What your last few relationships have in common, and whether you can see it.',
 'The same ending keeps arriving at the same point. Until the mechanism is named, it will keep operating.',
 'List your last three relationships and the month each one changed. Look for the number that repeats.'),

('presentation', 'How you come across', 4,
 'The gap between how you experience yourself and how a stranger reads you.',
 'You are being read as something you are not, usually as unavailable or already finished choosing.',
 'Ask one person who has met you once, not one who loves you, what they assumed about you in the first ten minutes.'),

('requirements', 'Requirements and realism', 5,
 'Whether your requirements are few, absolute and defensible, or long and mostly aspirational.',
 'A long list is not high standards. It is an unmade decision, and it removes people who would have worked.',
 'Cut your list to three absolutes. Everything you cannot defend to a stranger becomes a preference.'),

('stability', 'Life stability', 6,
 'Whether the practical shape of your life can hold a marriage this year.',
 'Location, work or money is unsettled enough that any relationship starting now inherits the uncertainty.',
 'Decide the one thing that must be settled first, and give it a date before you start meeting people.'),

('alignment', 'Values and family alignment', 7,
 'Faith, children, family expectations, and how firmly each is held.',
 'You have not decided which of these is negotiable, so you discover the answer six months in.',
 'Write down what you would end a good relationship over. If nothing appears, that is the finding.'),

('openness', 'Openness to feedback', 8,
 'Whether you can hear something unflattering and use it rather than defend against it.',
 'The readiness work only functions if you can be told something you did not want to hear.',
 'Recall the last accurate criticism you received. Write what you did with it in the following week.')
on conflict (key) do nothing;

-- --- plans -------------------------------------------------------------------

insert into public.plans (slug, name, shape, summary, price_ngn, price_usd, band, application_only, ordinal, includes) values
('clarity-audit', 'The Clarity Audit',
 'Assessment, a 60-minute diagnostic, and a written readiness map',
 'The honest reading. What is working, what is in the way, and what to do first.',
 60000, 79, 'audit', false, 1,
 array['The full readiness assessment', 'A 60-minute diagnostic call with a coach', 'Your written readiness map', 'One first action per obstacle']),

('ready-in-90', 'Ready in 90',
 'A 90-day readiness programme, group work plus fortnightly one-to-one',
 'For people who know roughly what is wrong and want it fixed before they meet anyone.',
 450000, 1200, 'programme', false, 2,
 array['Everything in the Clarity Audit', 'Six fortnightly one-to-one sessions', 'Weekly group work with a small cohort', 'Exercises with written feedback', 'Honest feedback on how you present']),

('match', 'VowFound Match',
 'The readiness programme plus curated introductions, nine months',
 'Readiness first, then a search run by a person who can explain every name they send you.',
 1200000, 3200, 'match', false, 3,
 array['Everything in Ready in 90', 'Verification and a private matchmaking profile', 'An assigned matchmaker for nine months', 'An agreed number of qualified introductions', 'A structured debrief after every meeting']),

('private-concierge', 'VowFound Private Concierge',
 'Private, hands-on, application only, capped cohort',
 'For clients whose situation is unusual, public, or complicated enough that a standard search will not work.',
 3500000, 8500, 'concierge', true, 4,
 array['Everything in VowFound Match', 'A named principal on your search', 'Off-platform, discreet outreach', 'Direct scheduling and travel coordination', 'A strictly capped cohort, so places are genuinely limited'])
on conflict (slug) do nothing;

-- --- programmes --------------------------------------------------------------

insert into public.programmes (slug, name, description, duration_days, plan_id)
select 'ready-in-90', 'Ready in 90',
       'Ninety days of readiness work: patterns, presentation, requirements.',
       90, id
from public.plans where slug = 'ready-in-90'
on conflict (slug) do nothing;

-- --- matching weights --------------------------------------------------------
-- Admin-configurable and versioned. Stage two ranks on these; stage one does
-- not use them at all, because hard constraints are never scored.

insert into public.match_weights (version, weights, is_active) values
('v1', '{
  "values": 0.22,
  "life_plans": 0.20,
  "family_expectations": 0.16,
  "location": 0.14,
  "communication": 0.12,
  "lifestyle": 0.10,
  "stated_flexibility": 0.06
}'::jsonb, true)
on conflict (version) do nothing;

-- --- demonstration content ---------------------------------------------------
-- One draft article, marked is_demo, so the journal admin screen has something
-- to render. It cannot be published to the public site: the article query
-- filters on is_demo = false.

insert into public.articles (slug, title, standfirst, body_md, status, is_demo, reading_minutes) values
('positioning-after-divorce',
 'Positioning after a divorce',
 'A completed chapter, told well, is an asset. Told badly it reads as unfinished.',
 'This is placeholder body copy used to check the journal layout. It is marked as demonstration content and is excluded from the public site, the sitemap and search engines.

Replace it with a real piece before launch, or delete the row.',
 'draft', true, 6)
on conflict (slug) do nothing;
