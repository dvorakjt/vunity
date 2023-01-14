const fs = require('fs');
const config = require('./create-spring-controller.conf.json');

let appRoutingModulePath = config.inputPath;
if(!config.inputPath.endsWith("/") && !config.routingModuleFileName.startsWith("/")) appRoutingModulePath += "/";
appRoutingModulePath += config.routingModuleFileName;

const appRoutingModule = fs.readFileSync(appRoutingModulePath, 'utf-8');

let paths = appRoutingModule.match(/path\s*:[^,]+/g);

paths = paths.map(path => {
    let pathStr = path.split(/(?:path\s*:)/)[1].trim();
    pathStr = pathStr.substring(1, pathStr.length - 1);
    if(pathStr.includes("/")) {
        let subdomains = pathStr.split("/");
        subdomains = subdomains.map(s => {
            if(!s.startsWith(":")) return s;
            else return "{" + s.substring(1, s.length) + "}"
        });
        pathStr = subdomains.join("/");
    }
    pathStr = `"/${pathStr}"`;
    return pathStr;
});

//this will have to be updated so it dynamically gets your package name.
const ngController = 
`package ${config.javaPackage};

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AngularController {

	@GetMapping(value = {${paths.join(", ")}}) 
	public String index() {
		return "index";
	}

}`

let output = config.outputPath;
if(!output.endsWith("/")) output += "/";
output += "AngularController.java";

fs.writeFileSync(output, ngController);