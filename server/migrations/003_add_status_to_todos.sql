-- Add statusId to todos table
ALTER TABLE todos 
ADD COLUMN statusId INT NULL AFTER deadline,
ADD INDEX idx_statusId (statusId),
ADD CONSTRAINT fk_todos_statusId FOREIGN KEY (statusId) REFERENCES statuses(id) ON DELETE SET NULL;

