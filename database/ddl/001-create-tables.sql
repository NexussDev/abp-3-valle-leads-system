CREATE TABLE team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL
);


CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    team_id UUID,

    FOREIGN KEY (team_id) REFERENCES team(id)
);


CREATE TABLE client (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    email VARCHAR(150),
    phone VARCHAR(20)
);


CREATE TABLE lead_source (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL
);


CREATE TABLE car (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(50),
    model VARCHAR(50),
    year INT,
    price NUMERIC(12,2),
    color VARCHAR(30),
    plate VARCHAR(10)
);


CREATE TABLE lead (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(30),

    user_id UUID NOT NULL,
    team_id UUID NOT NULL,
    client_id UUID,
    source_id UUID,
    car_id UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES "user"(id),
    FOREIGN KEY (team_id) REFERENCES team(id),
    FOREIGN KEY (client_id) REFERENCES client(id),
    FOREIGN KEY (source_id) REFERENCES lead_source(id),
    FOREIGN KEY (car_id) REFERENCES car(id)
);


CREATE TABLE negotiation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID UNIQUE, 

    status VARCHAR(30),
    stage VARCHAR(30),
    importance VARCHAR(10), -- frio, morno, quente
    active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (lead_id) REFERENCES lead(id)
);


CREATE TABLE negotiation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negotiation_id UUID NOT NULL,

    old_status VARCHAR(30),
    new_status VARCHAR(30),
    old_stage VARCHAR(30),
    new_stage VARCHAR(30),

    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (negotiation_id) REFERENCES negotiation(id)
);
CREATE EXTENSION IF NOT EXISTS "pgcrypto";,
   