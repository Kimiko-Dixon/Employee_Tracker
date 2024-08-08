// Require inquirer and Pool from the pg package
const inquirer = require('inquirer')
const {Pool} = require('pg')
require('dotenv').config()

// Log in cridentials
const pool = new Pool(
    {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD ,
        host: 'localhost',
        database: process.env.DB_NAME
    }
)

// Connects to database
pool.connect()


const homeSelectChoices = ['View All Departments', 'View All roles', 'View All Employees', 'Add Department', 'Add Role', 'Add Employee','Update Employee Role']

// Home selection prompt
function homePrompt(){
    const questions = [
        {
            type: 'list',
            message: 'What would you like to do',
            name: 'homeSelect',
            choices: homeSelectChoices
        }
    ]
    return inquirer.prompt(questions)
}

// Displays the department table
function allDep() {
    pool.query('SELECT * FROM department;',(err,{rows}) => {
        if(err){
            console.log(err)
        }
        else{
            console.table(rows)
            startingPrompt()
        } 
    })
    
}

// Displays the role table
function allRoles() {
    pool.query(`
        SELECT role.id,title,salary,name AS department
        FROM role
        JOIN department ON department_id = department.id;`, (err,{rows}) => {
            if(err){
                console.log(err)
            }
            else{
                console.table(rows)
                startingPrompt()
            }
           
        })
}

// Displays the employees table (With tutor help)
function allEmployees() {
    pool.query(`
    SELECT employee.id,employee.first_name,employee.last_name,role.title,role.salary,CONCAT(manager.first_name,' ',manager.last_name) AS manager
    FROM employee
    JOIN role ON role_id = role.id
    LEFT JOIN employee manager ON manager.id = employee.manager_id;`, (err,{rows}) => {
        if(err){
            console.log(err)
        }
        else{
            console.table(rows)
            startingPrompt()
        }
       
    })
}

// Adds a department
async function addDept() {
    const Newdept = await inquirer
        .prompt(
            {
                type: 'input',
                message: 'What is the name of the departmant?',
                name: 'deptName',
            }

        )
    
    // Adds the department to the database
    pool.query(`INSERT INTO department (name) VALUES ($1)`,[Newdept.deptName],(err,{rows}) => {
        if(err){
            console.log(err)
        }
        else{
            console.log('Added department')
            startingPrompt()
        }
       
    })
        
}

// Gets department information
function getDepts() {
   
    return pool.query(`SELECT name, id FROM department;`)
        .then(( {rows} ) => rows)
        .catch(err =>{
           console.log(err)
            return [] 
        })

}

// Add role prompts(With TA help)
function addRoleQs(deptInfo) {
    // Array of the department objects
    const deptChoices = deptInfo.map(dept => ({
        name: dept.name,
        value: dept.id
    }))

    //Prompt questions
    const questions = [{
                type: 'input',
                message: 'What is the name of the role?',
                name: 'roleName'
            },
            {
                type: 'input',
                message: 'What is the salary of the role?',
                name: 'salary'
            },
            {
                type: 'list',
                message: 'Which department does the role belong to?',
                name: 'dept',
                choices: deptChoices
            }
        ]
        
        return inquirer.prompt(questions)
}        

// Adds the role to the databse
function insertRole({roleName,salary,dept}){
    
    return pool.query(`INSERT INTO role (title,salary,department_id) VALUES ($1,$2,$3)`,[roleName, salary, dept ],(err,{rows}) => {
        if(err){
            console.log(err)
        }
        else{
            console.log('Added role')
            startingPrompt()
        }
       
    })
    
}

// Runs through the add roll process (With TA help)
function addRole(){
    return getDepts()
    .then((depts) => addRoleQs(depts))
    .then((answers) => insertRole(answers))
    .catch(err => console.log(err))
}


//Gets the list of roles
function getRole(){
    return pool.query(`SELECT title, id FROM role;`)
        .then(( {rows} ) => rows)
        .catch(err =>{
           console.log(err)
            return [] 
        })
}
//Gets the list of employees
function getEmployee(){
    return pool.query(`SELECT CONCAT(employee.first_name,' ',employee.last_name) AS employee_name, id FROM employee;`)
        .then(( {rows} ) => rows)
        .catch(err =>{
           console.log(err)
            return [] 
        })
}


function addEmployeeQs(roleInfo,managerInfo){

    // Array of the role objects
    const employeeRole = roleInfo.map(role => ({
        name: role.title,
        value: role.id
    }))
    // Array of the employee objects
    const manager = managerInfo.map(employee => ({
        name: employee.employee_name,
        value: employee.id
    }))

    manager.splice(0,0,{name:'None',value:null})
    //Prompt questions
    const questions = [{
        type: 'input',
        message: 'What is the employee\'s first name?',
        name: 'firstName'
    },
    {
        type: 'input',
        message: 'What is the employee\'s last name?',
        name: 'lastName'
    },
    {
        type: 'list',
        message: 'What is the employee\'s role?',
        name: 'empRole',
        choices: employeeRole
    },
    {
        type: 'list',
        message: 'Who is the employee\'s manager?',
        name: 'empManager',
        choices: manager
    },
    ]
        
    return inquirer.prompt(questions)
}

//Insert employee into the database
function insertEmployee({firstName,lastName,empRole,empManager}){
    return pool.query(`INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES ($1,$2,$3,$4)`,[firstName,lastName,empRole,empManager],(err,{rows}) => {
        if(err){
            console.log(err)
        }
        else{
            console.log('Added employee')
            startingPrompt()
        }
       
    })
}

//Gets the list of roles and employees
async function employeeChoices() {
    const roles = await getRole()
    const managers = await getEmployee()
    return [roles,managers]
}

// Runs through the add employee process
function addEmployee() {
    return employeeChoices()
    .then(([roles,managers]) => addEmployeeQs(roles,managers))
    .then((answers) => insertEmployee(answers))
    .catch(err => console.log(err))
}

function addUpdateEmployeeQs(roleInfo,employeeInfo){
    
    // Array of the role objects
    const employeeRole = roleInfo.map(role => ({
        name: role.title,
        value: role.id
    }))

    // Array of the employee objects
    const employees = employeeInfo.map(employee => ({
        name: employee.employee_name,
        value: employee.id
    }))
    
    // Prompt questions
    const questions = [
        {
            type: 'list',
            message: 'Which employee\'s role do you want to update?',
            name: 'employee',
            choices: employees
        },
        {
            type: 'list',
            message: 'Which role do you want to assign the selected employee?',
            name: 'empNewRole',
            choices: employeeRole 
        },
    ]
        
    return inquirer.prompt(questions)
}

//Updates the employee role
function updateEmployee({empNewRole,employee}){
    return pool.query(`UPDATE employee SET role_id = $1 WHERE employee.id = $2`,[empNewRole,employee],(err,{rows}) => {
        if(err){
            console.log(err)
        }
        else{
            console.log('Updated employee role')
            startingPrompt()
        }
       
    })
}

// Runs through the update employee role process
function updateEmpRole() {
    return employeeChoices()
    .then(([roles,employees]) => addUpdateEmployeeQs(roles,employees))
    .then((answers) => updateEmployee(answers))
    .catch(err => console.log(err))
}

//Response when an option is selected 
function startingPrompt(){
    homePrompt()
    .then(({ homeSelect }) => {
        switch (homeSelect) {
            case homeSelectChoices[0]:
                allDep()
                break;
            case homeSelectChoices[1]:
                allRoles()
                break;
            case homeSelectChoices[2]:
                allEmployees()
                break;
            case homeSelectChoices[3]:
                addDept()
                break;
            case homeSelectChoices[4]:
                addRole()
                break;
            case homeSelectChoices[5]:
                addEmployee()
                break;
            case homeSelectChoices[6]:
                updateEmpRole()
                break;

        }
    })

} 

startingPrompt()

