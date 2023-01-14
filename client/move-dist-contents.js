const fs = require('fs');
const angularJson = require('./angular.json');
const outputPath = '../backend/src/main/resources';

//clear files if they exist
const templatesExist = fs.existsSync(outputPath + '/templates');
if(templatesExist) {
    fs.rmSync(outputPath + '/templates', {recursive: true, force: true});
}
const staticExists = fs.existsSync(outputPath + '/static');
if(staticExists) {
    fs.rmSync(outputPath + '/static', {recursive: true, force: true});
}

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
            fileObj.newLocation = '/styles/'
        } else if(file.includes('.js')) {
            fileObj.newLocation = '/js/'
        } else {
            fileObj.newLocation = '/assets/'
        }
    } else fileObj.newLocation = '/';

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
        copyFileRecursively(distDir, f.fileName, outputPath + "/static" + f.newLocation);
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