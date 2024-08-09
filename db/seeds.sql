DO $$
    DECLARE

    BEGIN

    INSERT INTO department (name) VALUES
        ('Sales'),
        ('Legal'),
        ('Finance');

    INSERT INTO role (title,salary,department_id) VALUES
        ('Accountant Manager', 80000.00,3),
        ('Accountant',65000.00,3),
        ('Lawyer', 85000.00,2),
        ('Salesperson',35000.00,1);

    INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES
        ('Kimiko','Dixon',2,2),
        ('Kirk', 'Alba',1, NULL),
        ('Jane','Doe',4,NULL),
        ('John','Doe',3,NULL);

RAISE NOTICE 'SUCCESS';

    EXCEPTION
        WHEN OTHERS THEN
        RAISE NOTICE 'FAIL: %',SQLERRM;
        ROLLBACK;

END $$;