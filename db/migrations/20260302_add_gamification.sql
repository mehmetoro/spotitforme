-- migration: add daily challenges and gamification
-- created: 2026-03-02

-- Drop existing tables if they exist (cleanup from previous attempts)
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS daily_challenge_progress CASCADE;
DROP TABLE IF EXISTS user_gamification CASCADE;
DROP TABLE IF EXISTS daily_challenges CASCADE;

-- Daily challenges table
CREATE TABLE daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL,
  required_count integer NOT NULL DEFAULT 1,
  reward_points integer NOT NULL DEFAULT 10,
  emoji text NOT NULL DEFAULT '⭐',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Daily challenge progress tracking
CREATE TABLE daily_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed_count integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  claimed_reward boolean NOT NULL DEFAULT false,
  claimed_at timestamptz,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id, date)
);

-- User gamification points and badges
CREATE TABLE user_gamification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  total_points integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  last_challenge_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Badges earned by users
CREATE TABLE user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- Create indexes for performance
CREATE INDEX daily_challenge_progress_user_date_idx ON daily_challenge_progress(user_id, date);
CREATE INDEX daily_challenge_progress_challenge_idx ON daily_challenge_progress(challenge_id);
CREATE INDEX user_gamification_user_idx ON user_gamification(user_id);
CREATE INDEX user_badges_user_idx ON user_badges(user_id);

-- Insert default daily challenges
INSERT INTO daily_challenges (title, description, challenge_type, required_count, reward_points, emoji)
VALUES
  ('Spot Avcısı', '2 farklı spot göz gözle gör', 'spot_sighting', 2, 15, '🔍'),
  ('Paylaşımcı', '1 sosyal paylaşım yap', 'share_post', 1, 20, '📱'),
  ('Keşifçi', '1 spotu bul ve işaretle', 'find_spot', 1, 25, '🎯'),
  ('Beğenen', '5 içeriği beğen', 'like_content', 5, 10, '❤️'),
  ('Yorumcu', '3 yorum yap', 'comment', 3, 15, '💬');
