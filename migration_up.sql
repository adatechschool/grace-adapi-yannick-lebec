CREATE TYPE resource_type AS ENUM ('guide', 'video', 'exercise', 'project');

CREATE TABLE themes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    type resource_type NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    url TEXT,
    is_ada BOOLEAN DEFAULT FALSE,
    theme_id INT REFERENCES themes(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE resources_skills (
    resource_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (resource_id, skill_id),
    CONSTRAINT fk_rs_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    CONSTRAINT fk_rs_skill    FOREIGN KEY (skill_id)  REFERENCES skills(id)    ON DELETE CASCADE
);

ALTER TABLE resources_skills
ADD CONSTRAINT resources_skills_unique UNIQUE (resource_id, skill_id);

