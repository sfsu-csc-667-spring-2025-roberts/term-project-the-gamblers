import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const config = {
    mode,
    entry: {
        main: path.join(__dirname, "src", "client", "index.js"),
    },
    output: {
        path: path.join(__dirname, "public", "js"),
        filename: "[name].js"
    },
    module: {
        rules: [{ test : /\.ts$/, exclude: /node_modules/ }],
    }
};

export default config;