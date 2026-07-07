import fs from "fs";
import path from "path";

export function createProject(url) {

    const domain = new URL(url).hostname;

    const projectPath = path.join("output", domain);

    const folders = [
        "",
        "pages",
        "assets",
        "assets/css",
        "assets/js",
        "assets/images",
        "assets/fonts",
        "assets/videos",
        "reports",
        "logs"
    ];

    folders.forEach(folder => {

        const fullPath = path.join(projectPath, folder);

        if (!fs.existsSync(fullPath)) {

            fs.mkdirSync(fullPath, {
                recursive: true
            });

        }

    });

    return {

        domain,
        projectPath,

        pagesPath: path.join(projectPath, "pages"),

        cssPath: path.join(projectPath, "assets", "css"),

        jsPath: path.join(projectPath, "assets", "js"),

        imagesPath: path.join(projectPath, "assets", "images"),

        fontsPath: path.join(projectPath, "assets", "fonts"),

        videosPath: path.join(projectPath, "assets", "videos"),

        reportsPath: path.join(projectPath, "reports"),

        logsPath: path.join(projectPath, "logs")

    };

}