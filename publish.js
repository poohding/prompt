const path = require('path');
const fse = require('fs-extra');
const folderList = require('folder-list');
const fileList = require('list-dir');
const inquirer = require('inquirer');
const format = require('date-fns/format');
const timestamp = format(new Date(), 'YYYYMMDDHHmmss');

function deploy(directory) {
    fileList(directory).then((files) => {
        files.forEach((file) => {
            const filePath = `${directory}/${file}`;
            const deployFilePath = `${directory}/${file.split('.js')[0]}.${timestamp}.js`;

            fse.copy(filePath, deployFilePath)
                .then(() => {
                    console.log(`Tenth2에 ${deployFilePath} 배포`);
                    fse.remove(deployFilePath);
                })
                .catch(err => console.log(err))
        });
    });
}

function getSubDirectory(directory) {
    return folderList([`${directory}/*`, '!**/.*']);
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
                name: 'deploy',
                message: 'Tenth2에 배포하시겠습니까?',
                default: true
            }).then(answers => {
                if (answers.deploy) {
                    deploy(directory);
                }
            });
        }
    });
}

selectDirectory('src/js');
