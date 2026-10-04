-- Recalculate duration for AI generated practice papers based on 30 seconds (0.5 minutes) per question
UPDATE papers p
SET duration_minutes = GREATEST(1, ROUND(q_count.cnt * 0.5)::INTEGER)
FROM (
    SELECT paper_id, COUNT(*) AS cnt
    FROM paper_questions
    GROUP BY paper_id
) q_count
WHERE p.id = q_count.paper_id
  AND p.source = 'AI_GENERATED'
  AND p.kind = 'PRACTICE';
