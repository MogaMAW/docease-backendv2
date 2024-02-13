import firebaseAdmin from "firebase-admin";
import fs from "fs";
import path from "path";

const firebaseJsonPath = path.resolve(__dirname, "../../firebase.json");
const serviceAccount = JSON.parse(fs.readFileSync(firebaseJsonPath, "utf8"));

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

export { firebaseAdmin };
