const path = require('path');
const fse = require('fs-extra');
const folderList = require('folder-list');
const fileList = require('list-dir');
const inquirer = require('inquirer');
const format = require('date-fns/format');
const timestamp = format(new Date(), 'YYYYMMDDHHmmss');

const tenth2Deploy = {
    environment: 'development',
    tenth2(filePath, fnCallback) {
        console.log(`Tenth2 ${this.environment}에 ${filePath} 배포`);

        if (typeof fnCallback === 'function') {
            fnCallback();
        }
    },
    deploy(directory) {
        inquirer.prompt({
            type: 'confirm',
            name: 'deploy',
            message: `Tenth2 ${this.environment}에 ${directory}/*.* 파일들을 배포하시겠습니까?`,
            default: true
        }).then(answers => {
            if (answers.deploy) {
                fileList(directory).then((files) => {
                    files.forEach((file) => {
                        const filePath = `${directory}/${file}`;
                        const deployFilePath = `${directory}/${file.split('.js')[0]}.${timestamp}.js`;

                        if (this.environment === 'developmnet') {
                            this.tenth2(filePath);
                        } else {
                            fse.copy(filePath, deployFilePath)
                                .then(() => {
                                    this.tenth2(deployFilePath, () => {
                                        fse.remove(deployFilePath);
                                    });
                                })
                                .catch(err => console.log(err))
                        }
                    });
                });
            }
        });
    },
    getSubDirectory(directory) {
        return folderList([`${directory}/*`, '!**/.*']);
    },
    selectDirectory(directory) {
        inquirer.prompt([{
            type: 'list',
            name: 'directory',
            message: 'Select Directory',
            choices: this.getSubDirectory(directory)
        }]).then(answers => {
            if (this.getSubDirectory(answers.directory).length) {
                this.selectDirectory(answers.directory);
            } else {
                this.deploy(answers.directory);
            }
        });
    },
    selectEnvironment() {
        inquirer.prompt([{
            type: 'list',
            name: 'environment',
            message: 'Select Environment',
            choices: ['developmnet', 'production']
        }]).then(answers => {
            this.environment = answers.environment;
            this.selectDirectory('src/js');
        })
    }
};

tenth2Deploy.selectEnvironment();
