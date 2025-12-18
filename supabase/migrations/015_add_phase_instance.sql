-- Add PhaseInstance table to track user execution of phases
-- PhaseInstance links ProtocolInstance to Phase

CREATE TABLE IF NOT EXISTS train.phase_instance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    protocol_instance_id UUID NOT NULL REFERENCES train.protocol_instance(id) ON DELETE CASCADE,
    phase_id UUID NOT NULL REFERENCES train.phase(id) ON DELETE CASCADE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE,
    complete BOOLEAN NOT NULL DEFAULT FALSE,
    duration JSONB,
    notes TEXT
);

CREATE INDEX idx_phase_instance_user_id ON train.phase_instance(user_id);
CREATE INDEX idx_phase_instance_protocol_instance_id ON train.phase_instance(protocol_instance_id);
CREATE INDEX idx_phase_instance_phase_id ON train.phase_instance(phase_id);
CREATE INDEX idx_phase_instance_active ON train.phase_instance(user_id, active);

