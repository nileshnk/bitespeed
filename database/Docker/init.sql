CREATE DATABASE bitespeed;

\c bitespeed;

CREATE TABLE IF NOT EXISTS contact
(
    id SERIAL PRIMARY KEY,
    phoneNumber TEXT,
    email TEXT,
    linkedId INT,
    linkPrecedence TEXT,
    createdAt timestamptz NOT NULL,
    updatedAt timestamptz NOT NULL,
    deletedAt timestamptz
);