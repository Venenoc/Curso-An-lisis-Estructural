-- Direct messages table for community private messaging

CREATE TABLE direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX idx_direct_messages_receiver ON direct_messages(receiver_id);
CREATE INDEX idx_direct_messages_created ON direct_messages(created_at);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Both sender and receiver can read their messages
CREATE POLICY "Users can view their direct messages"
    ON direct_messages FOR SELECT
    USING (
        sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR receiver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Only sender can insert
CREATE POLICY "Users can send direct messages"
    ON direct_messages FOR INSERT
    WITH CHECK (
        sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Only receiver can mark as read
CREATE POLICY "Receiver can mark messages as read"
    ON direct_messages FOR UPDATE
    USING (
        receiver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );
