const fl = require('folder-list');
const inquirer = require('inquirer');

function publish(directory) {
    console.log(`Tenth 2.0에 ${directory} 배포`);
}

function getSubDirectory(directory) {
    return fl([`${directory}/*`, '!**/.*']);
}

function selectDirectory(directory) {
    inquirer.prompt([{
        type: 'list',
        name: 'directory',
        message: 'Select Directory',
        choices: getSubDirectory(directory)
    }]).then(answers => {
        if (getSubDirectory(answers.directory).length) {
            selectDirectory(answers.directory);
        } else {
            const directory = answers.directory;

            inquirer.prompt({
                type: 'confirm',
                name: 'publish',
                message: 'Tenth 2.0에 배포하시겠습니까?',
                default: true
            }).then(answers => {
                if (answers.publish) {
                    publish(directory);
                }
            });
        }
    });
}

selectDirectory('src/js');
