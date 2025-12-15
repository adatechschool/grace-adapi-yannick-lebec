SELECT * FROM themes;

SELECT * FROM skills;

SELECT * FROM resources;

SELECT * FROM resources_skills;

SELECT *
FROM resources
ORDER BY updated_at DESC;

SELECT title, url
FROM resources
WHERE type = 'exercise';

SELECT title, description FROM resources WHERE is_ada = TRUE;

SELECT resources.*
FROM resources
JOIN resources_skills
    ON resources_skills.resource_id = resources.id
JOIN skills
    ON skills.id = resources_skills.skill_id
WHERE skills.name = 'JavaScript'; 

SELECT *
FROM resources
WHERE title ILIKE '%react%';

SELECT * FROM skills;

SELECT 
    themes.id,
    themes.name,
    COUNT(resources.id) AS total_resources
FROM themes
LEFT JOIN resources
    ON resources.theme_id = themes.id
GROUP BY themes.id, themes.name
ORDER BY themes.id;


SELECT
    resources.title,
    resources.url,
    ARRAY_AGG(skills.name ORDER BY skills.name) AS skills
FROM resources
LEFT JOIN resources_skills
    ON resources_skills.resource_id = resources.id
LEFT JOIN skills
    ON skills.id = resources_skills.skill_id
GROUP BY resources.id, resources.title, resources.url
ORDER BY resources.id;

SELECT
    resources.id,
    resources.title,
    resources.url,
    resources.created_at,
    themes.name AS theme_name
FROM resources
LEFT JOIN themes
    ON themes.id = resources.theme_id
ORDER BY resources.created_at DESC
LIMIT 5;

SELECT skills.id, skills.name
FROM skills
LEFT JOIN resources_skills
    ON resources_skills.skill_id = skills.id
WHERE resources_skills.skill_id IS NULL;

SELECT
    resources.id,
    resources.title,
    resources.url,
    resources.description,
    resources.type,
    resources.is_ada,
    resources.created_at,
    resources.updated_at,
    
    themes.name AS theme_name,

    ARRAY_AGG(skills.name ORDER BY skills.name) AS skills

FROM resources
LEFT JOIN themes
    ON themes.id = resources.theme_id
LEFT JOIN resources_skills
    ON resources_skills.resource_id = resources.id
LEFT JOIN skills
    ON skills.id = resources_skills.skill_id

GROUP BY 
    resources.id,
    resources.title,
    resources.url,
    resources.description,
    resources.type,
    resources.is_ada,
    resources.created_at,
    resources.updated_at,
    themes.name

ORDER BY resources.id;

