-- Community migration: expand post_type, add like toggle function

-- 1. Expand post_type to include tip and resource
ALTER TABLE community_posts
  DROP CONSTRAINT IF EXISTS community_posts_post_type_check;

ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_post_type_check
  CHECK (post_type IN ('win','question','update','accountability','tip','resource'));

-- 2. Function to toggle a like reaction and update likes_count atomically
CREATE OR REPLACE FUNCTION toggle_post_like(p_post_id UUID, p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_liked BOOLEAN;
BEGIN
  -- Check if reaction exists
  IF EXISTS (
    SELECT 1 FROM community_reactions
    WHERE post_id = p_post_id AND user_id = p_user_id AND reaction_type = 'like'
  ) THEN
    -- Unlike: delete reaction, decrement count
    DELETE FROM community_reactions
    WHERE post_id = p_post_id AND user_id = p_user_id AND reaction_type = 'like';

    UPDATE community_posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = p_post_id;

    v_liked := FALSE;
  ELSE
    -- Like: insert reaction, increment count
    INSERT INTO community_reactions (post_id, user_id, reaction_type)
    VALUES (p_post_id, p_user_id, 'like')
    ON CONFLICT (user_id, post_id, reaction_type) DO NOTHING;

    UPDATE community_posts
    SET likes_count = likes_count + 1
    WHERE id = p_post_id;

    v_liked := TRUE;
  END IF;

  RETURN jsonb_build_object('liked', v_liked);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION toggle_post_like(UUID, UUID) TO authenticated;
