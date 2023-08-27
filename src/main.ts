import fs from "fs"
import path from "path"
import "dotenv/config"
import { ImageCaptionGenerator } from "./ImageCaptionGenerator"

function generateImagePath(fileName: string) {
  return path.join(__dirname, "../images", fileName)
}

async function main() {
  const credentialJson = process.env.GCP_CREDENTIALS_JSON
  if (!credentialJson) {
    throw new Error("GCP_CREDENTIALS_JSON env var is not set")
  }
  const credentials = JSON.parse(credentialJson)
  const imageCaptionGenerator = new ImageCaptionGenerator(credentials)
  await imageCaptionGenerator.init()
  const imagePaths = [
    generateImagePath("beach_600x400.jpg"),
    generateImagePath("beach_1200x800.jpg"),
    generateImagePath("beach_2376x1584.jpg"),
  ]
  for (const imagePath of imagePaths) {
    const buf = fs.readFileSync(imagePath)
    const startTime = Date.now()
    const captions = await imageCaptionGenerator.generateCaptions(buf)
    const fileName = path.basename(imagePath)
    console.log(`Captions for ${fileName}:`)
    console.log(`Elapsed time: ${Date.now() - startTime}ms`)
    console.log(captions)
  }
}

main()