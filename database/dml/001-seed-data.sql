INSERT INTO team (name) VALUES
('Equipe Norte'),
('Equipe Sul');


INSERT INTO "user" (name, email, password, role, team_id) VALUES
('Gabrielly','gabi@email.com','123','ADMIN',(SELECT id FROM team WHERE name='Equipe Norte')),
('João','joao@email.com','123','ATENDENTE',(SELECT id FROM team WHERE name='Equipe Norte')),
('Maria','maria@email.com','123','GERENTE',(SELECT id FROM team WHERE name='Equipe Norte')),
('Carlos','carlos@email.com','123','ATENDENTE',(SELECT id FROM team WHERE name='Equipe Sul'));


INSERT INTO client (name, cpf, email, phone) VALUES
('Ana Souza','111.111.111-11','ana@email.com','11999999999'),
('Bruno Lima','222.222.222-22','bruno@email.com','11988888888'),
('Carla Mendes','333.333.333-33','carla@email.com','11977777777');


INSERT INTO lead_source (name) VALUES
('WhatsApp'),
('Instagram'),
('Telefone'),
('Loja Física');


INSERT INTO car (brand, model, year, price, color, plate) VALUES
('Toyota','Corolla',2022,95000,'Preto','ABC1234'),
('Honda','Civic',2021,90000,'Branco','DEF5678'),
('Ford','Focus',2020,70000,'Prata','GHI9012');


INSERT INTO lead (name, phone, status, user_id, team_id, client_id, source_id, car_id, created_at) VALUES
(
'Lead Ana',
'11911111111',
'novo',
(SELECT id FROM "user" WHERE name='João'),
(SELECT id FROM team WHERE name='Equipe Norte'),
(SELECT id FROM client WHERE name='Ana Souza'),
(SELECT id FROM lead_source WHERE name='WhatsApp'),
(SELECT id FROM car WHERE model='Corolla'),
CURRENT_TIMESTAMP
),
(
'Lead Bruno',
'11922222222',
'em_atendimento',
(SELECT id FROM "user" WHERE name='João'),
(SELECT id FROM team WHERE name='Equipe Norte'),
(SELECT id FROM client WHERE name='Bruno Lima'),
(SELECT id FROM lead_source WHERE name='Instagram'),
(SELECT id FROM car WHERE model='Civic'),
CURRENT_TIMESTAMP
),
(
'Lead Carla',
'11933333333',
'finalizado',
(SELECT id FROM "user" WHERE name='Carlos'),
(SELECT id FROM team WHERE name='Equipe Sul'),
(SELECT id FROM client WHERE name='Carla Mendes'),
(SELECT id FROM lead_source WHERE name='Telefone'),
(SELECT id FROM car WHERE model='Focus'),
CURRENT_TIMESTAMP
);


INSERT INTO negotiation (lead_id, status, stage, importance, active, created_at) VALUES
(
(SELECT id FROM lead WHERE name='Lead Ana'),
'aberta','inicial','morno',TRUE,CURRENT_TIMESTAMP
),
(
(SELECT id FROM lead WHERE name='Lead Bruno'),
'em_andamento','proposta','quente',TRUE,CURRENT_TIMESTAMP
),
(
(SELECT id FROM lead WHERE name='Lead Carla'),
'fechada','final','quente',FALSE,CURRENT_TIMESTAMP
);


INSERT INTO negotiation_history (negotiation_id, old_status, new_status, old_stage, new_stage, changed_at) VALUES
(
(SELECT n.id FROM negotiation n 
 JOIN lead l ON l.id = n.lead_id 
 WHERE l.name='Lead Bruno'),
'aberta','em_andamento','inicial','proposta',CURRENT_TIMESTAMP
),
(
(SELECT n.id FROM negotiation n 
 JOIN lead l ON l.id = n.lead_id 
 WHERE l.name='Lead Carla'),
'em_andamento','fechada','proposta','final',CURRENT_TIMESTAMP
);