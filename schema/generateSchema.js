import { execSync } from "child_process";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("schema/schema.config.json", "utf8"));

const deleteExistingSchemas = (folderPath) => {
    fs.readdirSync(folderPath).forEach((file) => {
        if (file.endsWith(".schema.json")) {
            const filePath = `${folderPath}/${file}`; // Use relative path directly
            console.log(`Deleting existing schema file: ${filePath}`);
            fs.unlinkSync(filePath);
        }
    });
};

const generateSchemas = () => {
    deleteExistingSchemas("schema");

    config.types.forEach(({ path, types }) => {
        types.forEach((type) => {
            const outputPath = `schema/${type.toLowerCase()}.schema.json`;
            console.log(`Generating schema for ${type} from ${path}`);
            execSync(
                `npx ts-json-schema-generator --path ${path} --type ${type} --out ${outputPath}`
            );
        });
    });
    console.log("Finished schema generation");
};

generateSchemas();
