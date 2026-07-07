import axios from "axios";
import fs from "fs";
import path from "path";
import { resolveUrl } from "./urlResolver.js";

export async function downloadAssets(baseUrl, assets, outputFolder) {

    fs.mkdirSync(outputFolder, { recursive: true });

    for (const asset of assets) {

        try {

            const url = resolveUrl(baseUrl, asset);

            if (!url) {
                continue;
            }

            const fileName = path.basename(new URL(url).pathname);

            if (!fileName) {
                continue;
            }

            const destination = path.join(outputFolder, fileName);

            const response = await axios.get(url, {
                responseType: "arraybuffer"
            });

            fs.writeFileSync(destination, response.data);

            console.log("⬇️", fileName);

        } catch (error) {

            console.log("⚠️ Não foi possível baixar:", asset);

        }

    }

}