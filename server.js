const { clear } = require('console');
const inquirer = require('inquirer');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localHost',

  port: 3306,

  user: 'root',

  password: 'root',

  database: 'company'
});

connection.connect((err) => {

  if (err) console.log(err);

  console.log("Welcome to the employee management program!");

  mainMenu();

    async function mainMenu() {

        try {

            const actionChoice = await inquirer.prompt({
                type: "list",
                message: "What would you like to do?",
                name: "action",
                choices: ["Add departments, roles, or employees", "View departments, roles, or employees", "Update employee roles"]
            });

            let action = actionChoice.action;
        
            getSubject(action);


        } catch(err) {

            console.log(err);

        }

    };


async function getSubject(action) {

    if (action == "Add departments, roles, or employees") {
        
        const add = await inquirer.prompt([
            {
                type: "list",
                message: "What would you like to add?",
                name: "add",
                choices: ["Departments", "Roles", "Employees"]
            }
        ]);

        if (add.add == "Departments") {
            Departments("add");
        }
        else if (add.add == "Roles") {
            Roles("add");
        }
        else if (add.add == "Employees") {
            Employees("add");
        }
        
    }

    else if (action == "View departments, roles, or employees") {

        const view = await inquirer.prompt([
            {
                type: "list",
                message: "What would you like to view?",
                name: "view",
                choices: ["Departments", "Roles", "Employees"]
            }
        ]);

        if (view.view == "Departments") {
            Departments("view");
        }
        else if (view.view == "Roles") {
            Roles("view");
        }
        else if (view.view == "Employees") {
            Employees("view");
        }
        
    }

    else if (action == "Update employee roles") {

        Employees("update");
        
    }

    else {

        console.log("something went wrong! your connection will end now. please try restarting the program!");
        connection.end();
        
    }


}

async function Departments(action) {

    if (action == "view") {

        const view = await connection.query("SELECT * FROM departments", function(err, res) {
            if (err) throw err;
            console.table(res);
            returnEnd();
        });
        
    }

    else if (action == "add") {

        let newDepartment;

        const name = await inquirer.prompt([
        {
            type: "input",
            message: "What is the name of the new department?",
            name: "department"
        }
        ]);

        newDepartment = name.department;

        newDepartment = newDepartment.toString();

       const insert = await connection.query(
            "INSERT INTO departments SET ?",
            {
              name: newDepartment
            },
            function(err, res) {
              if (err) throw err;
            }
          );

          const read = await connection.query("SELECT * FROM departments", function(err, res) {
            if (err) throw err;
            console.table(res);
            returnEnd();
        });
        
    }

}

async function Roles(action) {

    if (action == "view") {

        const view = await connection.query("SELECT * FROM roles", function(err, res) {
            if (err) throw err;
            console.table(res);
            returnEnd();
        });
        
    }

    else if (action == "add") {

        const role = await inquirer.prompt([
            {
                type: "input",
                message: "What is the name of the new role?",
                name: "title"
            },
            {
                type: "input",
                message: "What is the salary of the new role?",
                name: "salary"
            }
        ]);

        let selectDept = new Promise((resolve, reject) => {

            const view = connection.query("SELECT name FROM departments", function(err, res) {
                if (err) throw err;
                let deptChoices = res;
                deptChoices = JSON.parse(JSON.stringify(deptChoices));
                let roleChoicesArr = [];
                for (i=0; i<deptChoices.length; i++) {
                    let newName = deptChoices[i].name;
                    roleChoicesArr.push(newName);
                }
    
                inquirer.prompt([
                    {
                        type: 'list',
                        message: 'Which department is this new role a part of?',
                        choices: roleChoicesArr,
                        name: "department"
                    }
                ]).then((response) => {
    
                    let newRoleDept = response.department;
                    newRoleDept = newRoleDept.toString();
                    resolve(newRoleDept);
    
                });
            });

            

        });

        
        let selectedDept = await selectDept;

        let findDeptID = new Promise((resolve, reject) => {

            const viewIds = connection.query('SELECT id FROM company.departments WHERE name="' + selectedDept + '";', function(err, res) {
                if (err) throw err;
                let deptID = res;
                deptID = JSON.parse(JSON.stringify(deptID));
                deptID = deptID[0].id;
                resolve(deptID);
            });

        });

        let newRole = role.title;

        newRole = newRole.toString();

        let newSalary = role.salary;

        newSalary = newSalary.toString();

        let finalID = await findDeptID;

        let setNewRole = new Promise((resolve, reject) => {

            const insert = connection.query(
                "INSERT INTO roles SET ?",
                {
                  title: newRole,
                  salary: newSalary,
                  department_id: finalID
                },
                function(err, res) {
                  if (err) throw err;
                }
              );
    
              const read = connection.query("SELECT * FROM roles", function(err, res) {
                console.table(res);
                resolve(!err);
                returnEnd();
            });

        });
        
    }
    
}

async function Employees(action) {

    if (action == "view") {

        connection.query("SELECT * FROM employees", function(err, res) {
            if (err) throw err;
            console.table(res);
            returnEnd();
        });
        
    }

    else if (action == "add") {

        const employee = await inquirer.prompt([
            {
                type: "input",
                message: "What is the first name of the employee?",
                name: "firstName"
            },
            {
                type: "input",
                message: "What is the last name of the employee?",
                name: "lastName"
            }
        ]);

        let selectRole = new Promise((resolve, reject) => {

            const viewRoles = connection.query("SELECT title FROM roles", function(err, res) {
                if (err) throw err;
                let roleChoices = res;
                roleChoices = JSON.parse(JSON.stringify(roleChoices));
                let roleChoicesArr = [];
                for (i=0; i<roleChoices.length; i++) {
                    let newRole = roleChoices[i].title;
                    roleChoicesArr.push(newRole);
                }
    
                inquirer.prompt([
                    {
                        type: 'list',
                        message: 'Which role does this employee hold?',
                        choices: roleChoicesArr,
                        name: "roleTitle"
                    }
                ]).then((response) => {
    
                    let newRole = response.roleTitle;
                    newRole = newRole.toString();
                    resolve(newRole);
    
                });
            });


        });

        
        let selectedRole = await selectRole;

        let findRoleID = new Promise((resolve, reject) => {

            const viewIds = connection.query('SELECT id FROM company.roles WHERE title="' + selectedRole + '";', function(err, res) {
                if (err) throw err;
                let roleID = res;
                roleID = JSON.parse(JSON.stringify(roleID));
                roleID = roleID[0].id;
                resolve(roleID);
            });

        });

        let finalRoleID = await findRoleID;

        let firstName = employee.firstName;
        
        let lastName = employee.lastName;

        


        let selectManager = new Promise((resolve, reject) => {

            const viewManagers = connection.query("SELECT id, first_name, last_name FROM employees", function(err, res) {
                if (err) throw err;
                
                console.table(res);
    
                inquirer.prompt([
                    {
                        type: 'input',
                        message: 'Enter the ID number for the manager of this employee. (Reference table above). Or just hit enter if no manager exists.',
                        name: "managerID"
                    }
                ]).then((response) => {
    
                    let newManager = response.managerID;
                    resolve(newManager);
    
                });
            });


        });

        let selectedManager = await selectManager;

        let setNewEmployee = new Promise((resolve, reject) => {

            console.log("selected manager: " + selectedManager);

            if (selectedManager) {

                const insert = connection.query(
                    "INSERT INTO employees SET ?",
                    {
                      first_name: firstName,
                      last_name: lastName,
                      role_id: finalRoleID,
                      manager_id: selectedManager
                    },
                    function(err, res) {
                      if (err) throw err;                 
                    }
                  );

            } else {

                const insert = connection.query(
                    "INSERT INTO employees SET ?",
                    {
                      first_name: firstName,
                      last_name: lastName,
                      role_id: finalRoleID
                    },
                    function(err, res) {
                      if (err) throw err;
                    }
                  );

            }
            
    
              const read = connection.query("SELECT * FROM employees", function(err, res) {
                console.table(res);
                resolve(!err);
                returnEnd();
            });

        });   

    }

    else if (action == "update") {

        
        let selectEmployee = new Promise((resolve, reject) => {

            const viewManagers = connection.query("SELECT id, first_name, last_name FROM employees", function(err, res) {
                if (err) throw err;
                
                console.table(res);
    
                inquirer.prompt([
                    {
                        type: 'input',
                        message: 'Enter the ID number for the employee whose role you wish to change.',
                        name: "employeeID"
                    }
                ]).then((response) => {
    
                    let chosenEmployee = response.employeeID;
                    resolve(chosenEmployee);
    
                });
            });


        });

        let selectedEmployee = await selectEmployee;

        let selectRole = new Promise((resolve, reject) => {

            const viewRoles = connection.query("SELECT title FROM roles", function(err, res) {
                if (err) throw err;
                let roleChoices = res;
                roleChoices = JSON.parse(JSON.stringify(roleChoices));
                let roleChoicesArr = [];
                for (i=0; i<roleChoices.length; i++) {
                    let newRole = roleChoices[i].title;
                    roleChoicesArr.push(newRole);
                }
    
                inquirer.prompt([
                    {
                        type: 'list',
                        message: 'Which role does this employee hold?',
                        choices: roleChoicesArr,
                        name: "roleTitle"
                    }
                ]).then((response) => {
    
                    let newRole = response.roleTitle;
                    newRole = newRole.toString();
                    resolve(newRole);
    
                });
            });


        });

        let selectedRole = await selectRole;

        let findRoleID = new Promise((resolve, reject) => {

            const viewIds = connection.query('SELECT id FROM company.roles WHERE title="' + selectedRole + '";', function(err, res) {
                if (err) throw err;
                let roleID = res;
                roleID = JSON.parse(JSON.stringify(roleID));
                roleID = roleID[0].id;
                resolve(roleID);
            });

        });

        let finalRoleID = await findRoleID;

        let updateEmployee = new Promise((resolve, reject) => {

            const changeEmployee = connection.query('UPDATE employees SET employees.role_id ="' + finalRoleID + '" WHERE employees.id="' + selectedEmployee + '";', function(err, res) {
                if (err) throw err;
                resolve(res.affectedRows);
            });

        });

        let updatedEmployee = await updateEmployee;

        const view = await connection.query("SELECT * FROM employees", function(err, res) {
            if (err) throw err;
            console.table(res);
            console.log("Employee has been updated!");
            returnEnd();
        });



    }
    
}

function returnEnd() {

    inquirer.prompt({
        type: "input",
        message: "Return to main menu? Y/N",
        name: "mainMenu"
    }).then((response) => {

        let answer = response.mainMenu;

        answer = answer.toString().toLowerCase();

        if (answer == "y" || answer == "yes") {
            mainMenu();
        }
        else {
            console.log("Thanks for using the program!");
            connection.end();
        }

    });

}

});