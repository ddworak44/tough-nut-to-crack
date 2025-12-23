import { Storage } from "@google-cloud/storage";

const bucketName = "tough-nut-to-crack";
const localFilePath = "./before_after.png"; // change as needed
const destination = "inputs/before_after.png";

async function upload() {
  const storage = new Storage();
  const bucket = storage.bucket(bucketName);

  await bucket.upload(localFilePath, {
    destination,
  });

  console.log(`Uploaded ${localFilePath} → gs://${bucketName}/${destination}`);
}

upload().catch(console.error);
