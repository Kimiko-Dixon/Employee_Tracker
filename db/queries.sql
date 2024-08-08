-- SELECT * FROM department;

SELECT role.id,title,salary,name AS department
FROM role
JOIN department ON department_id = department.id;

SELECT employee.id,employee.first_name,employee.last_name,role.title,role.salary,CONCAT(manager.first_name,' ',manager.last_name) AS manager
FROM employee
JOIN role ON role_id = role.id
JOIN employee manager ON manager.id = employee.manager_id;

