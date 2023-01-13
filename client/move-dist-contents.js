const fs = require('fs');
const angularJson = require('./angular.json');
//require moveDistConfig
const outputPath = '../backend/src/main/resources';
const distDir = './' + angularJson.projects[Object.keys(angularJson.projects)[0]].architect.build.options.outputPath;

let files = fs.readdirSync(distDir);

files = files.map((file) => {
    const fileObj = {
        fileName : file,
        newLocation : ''
    }
    if(file.includes('.')) {
        if(file.includes('.html')) {
            fileObj.newLocation = '/templates/'
        } else if(file.includes('.css')) {
            fileObj.newLocation = '/static/styles/'
        } else if(file.includes('.js')) {
            fileObj.newLocation = '/static/js/'
        } else {
            fileObj.newLocation = '/static/assets/'
        }
    } else fileObj.newLocation = '/static/';

    return fileObj;
});

let index = fs.readFileSync(distDir + '/index.html', 'utf-8');
for(const f of files) {
    if(f.fileName.includes('.') && !f.fileName.includes('.html')) {
        index = index.replace(new RegExp(`(src|href)="${f.fileName}"`, 'g'), (match) => {
            return "th:" + match.replace(new RegExp(f.fileName), `@{${f.newLocation + f.fileName}}`)
        });
    } else if(!f.fileName.includes('.')) {
        index = index.replace(new RegExp(`(src|href)="${f.fileName}/[^"]*"`, 'g'), (match) => {
            let replaced = match.replace(new RegExp(f.fileName), `@{${f.newLocation + f.fileName}`);
            replaced = 'th:' + replaced.substring(0, replaced.length - 1) + '}"'
            return replaced;
        });
    }
    if(!f.fileName.includes('.html')) {
        copyFileRecursively(distDir, f.fileName, outputPath + f.newLocation);
    }
}

fs.mkdirSync(outputPath + "/templates", {recursive: true});
fs.writeFileSync(outputPath + "/templates/index.html", index);

function copyFileRecursively(parentPath, currentPath, pathToCopyTo) {
    const fullCurrentPath = parentPath + "/" + currentPath;
    if(!currentPath.includes('.')) {
        let files = fs.readdirSync(fullCurrentPath);
        for(const file of files) copyFileRecursively(parentPath, currentPath + "/" + file, pathToCopyTo);
    } else {
        const fileContents = fs.readFileSync(fullCurrentPath);
        const newPath = pathToCopyTo + currentPath;
        const pathElements = newPath.split("/");
        const directory = pathElements.slice(0, -1).join("/");
        fs.mkdirSync(directory, {recursive: true});
        fs.writeFileSync(newPath, fileContents);
    }
}