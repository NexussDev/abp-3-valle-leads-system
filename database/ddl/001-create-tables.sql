CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    team_id UUID,
    store_id UUID,

    FOREIGN KEY (team_id) REFERENCES team(id),
    FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS client (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    email VARCHAR(150),
    phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS lead_source (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS car (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(50),
    model VARCHAR(50),
    year INT,
    price NUMERIC(12,2),
    color VARCHAR(30),
    plate VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS lead (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(30),
    origin VARCHAR(100) NOT NULL,
    closing_reason VARCHAR(255),

    user_id UUID NOT NULL,
    team_id UUID NOT NULL,
    store_id UUID NOT NULL,
    client_id UUID,
    source_id UUID,
    car_id UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES "user"(id),
    FOREIGN KEY (team_id) REFERENCES team(id),
    FOREIGN KEY (store_id) REFERENCES store(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (client_id) REFERENCES client(id),
    FOREIGN KEY (source_id) REFERENCES lead_source(id),
    FOREIGN KEY (car_id) REFERENCES car(id)
);

CREATE TABLE IF NOT EXISTS negotiation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID UNIQUE,

    status VARCHAR(30),
    stage VARCHAR(30),
    importance VARCHAR(10),
    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (lead_id) REFERENCES lead(id)
);

CREATE TABLE IF NOT EXISTS negotiation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negotiation_id UUID NOT NULL,

    old_status VARCHAR(30),
    new_status VARCHAR(30),
    old_stage VARCHAR(30),
    new_stage VARCHAR(30),

    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (negotiation_id) REFERENCES negotiation(id)
);

CREATE TABLE IF NOT EXISTS system_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    entity VARCHAR(30) NOT NULL,
    entity_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES "user"(id)
);

CREATE INDEX IF NOT EXISTS idx_lead_user_id ON lead(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_team_id ON lead(team_id);
CREATE INDEX IF NOT EXISTS idx_lead_status ON lead(status);
CREATE INDEX IF NOT EXISTS idx_lead_created_at ON lead(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_store_id ON lead(store_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_lead_id ON negotiation(lead_id);