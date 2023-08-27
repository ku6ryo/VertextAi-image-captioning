
import { GoogleAuth } from "google-auth-library"
import axios from "axios"

export class ImageCaptionGenerator {

  gcpProjectId: string
  gcpAccessToken: string | null = null

  constructor(private googleCredentials: any) {
    this.gcpProjectId = googleCredentials["project_id"]
    if (!this.gcpProjectId) {
      throw new Error("GCP project id is not found")
    }
  }

  async init() {
    const auth = new GoogleAuth({
      credentials: this.googleCredentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    })
    const client = await auth.getClient()
    const accessToken = await client.getAccessToken()
    if (!accessToken.token) {
      throw new Error("GCP access token is not available")
    }
    this.gcpAccessToken = accessToken.token
  }

  generateModelUrl() {
    return `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.gcpProjectId}/locations/us-central1/publishers/google/models/imagetext:predict`
  }

  async generateCaptions(imageBuf: Buffer) {
    if (!this.gcpAccessToken) {
      throw new Error("GCP access token is not set. Please call init() first")
    }
    const url = this.generateModelUrl()
    const result = await axios.post<{ predictions: string[], deployedModelId: string }>(url, {
      instances: [
        {
          image: {
            bytesBase64Encoded: imageBuf.toString("base64")
          }
        },
      ],
      parameters: {
        sampleCount: 3,
        language: "en"
      }
    }, {
      headers: {
        "Authorization": `Bearer ${this.gcpAccessToken}`
      }
    })
    return result.data.predictions
  }
}