import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import "./AppModern.css";

type RecipeResult = {
  dish?: string;
  ingredients?: string[];
  steps?: string[];
  message?: string;
  filename?: string;
};

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [result, setResult] = useState<RecipeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const stopCamera = () => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCameraActive(false);
  };

  const handleOpenCamera = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(userStream);
      setCameraActive(true);
      setError("");

      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Error opening camera:", err);
      setError("Unable to access camera. Please allow camera permissions.");
      setCameraActive(false);
      setStream(null);
    }
  };

  const handleCapturePhoto = async () => {
    if (!videoRef.current) {
      setError("Camera is not available to capture.");
      return;
    }
    if (!canvasRef.current) {
      setError("Cannot capture image at this time.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext("2d");
    if (!context) {
      setError("Canvas context initialization failed.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((imageBlob) => resolve(imageBlob), "image/jpeg", 0.9);
    });

    if (!blob) {
      setError("Failed to capture photo.");
      return;
    }

    const capturedFile = new File([blob], "captured-food.jpg", { type: "image/jpeg" });
    setFile(capturedFile);
    setPreviewUrl(URL.createObjectURL(blob));
    setResult(null);
    setError("");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null);
    setError("");

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }

    if (cameraActive) {
      stopCamera();
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please upload or capture a food image before generating recipe.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await axios.post<RecipeResult>("http://127.0.0.1:8000/generate-recipe", formData);
      setResult(response.data);
    } catch (uploadError) {
      console.error("Upload failed:", uploadError);
      if (axios.isAxiosError(uploadError)) {
        const detail = uploadError.response?.data?.detail;
        setError(typeof detail === "string" ? detail : "Failed to generate recipe. Please try again.");
      } else {
        setError("Failed to generate recipe. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const ingredients = result?.ingredients ?? [];
  const steps = result?.steps ?? [];

  return (
    <div className="app-shell">
      <div className="card">
        <header className="app-header">
          <div>
            <span className="eyebrow">Image to recipe</span>
            <h1>AI Food Recipe Generator</h1>
            <p>Upload a food photo or use your camera, then turn it into a practical recipe.</p>
          </div>
        </header>

        <section className="workspace">
          <div className="input-panel">
            <div className="controls">
              <label className="file-label">
                <span className="file-label-text">Choose image</span>
                <span className="file-label-hint">{file ? file.name : "JPG, PNG, or camera photo"}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>

              <div className="camera-buttons">
                {!cameraActive && (
                  <button className="ghost-btn" type="button" onClick={handleOpenCamera}>
                    Open Camera
                  </button>
                )}
                {cameraActive && (
                  <>
                    <button className="ghost-btn" type="button" onClick={stopCamera}>
                      Close Camera
                    </button>
                    <button className="ghost-btn" type="button" onClick={handleCapturePhoto}>
                      Capture Photo
                    </button>
                  </>
                )}
              </div>
            </div>

            {cameraActive && (
              <div className="video-wrap">
                <video ref={videoRef} className="video-preview" autoPlay muted playsInline />
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />

            <button className="primary-btn" onClick={handleUpload} disabled={!file || loading}>
              {loading ? "Generating..." : "Generate Recipe"}
            </button>

            {error && <div className="alert">{error}</div>}
          </div>

          <div className="preview-panel">
            {previewUrl ? (
              <>
                <div className="panel-heading">
                  <span>Selected Image</span>
                </div>
                <img src={previewUrl} alt="Preview" className="preview-image" />
              </>
            ) : (
              <div className="empty-preview">
                <span>Preview</span>
                <p>Your selected food image will appear here.</p>
              </div>
            )}
          </div>
        </section>

        {result && (
          <section className="result-card">
            <div className="result-header">
              <span className="eyebrow">Generated recipe</span>
              <h2>{result.dish || "Generated Recipe"}</h2>
            </div>

            <div className="recipe-grid">
              <div className="recipe-section">
                <h3>Ingredients</h3>
                {ingredients.length > 0 ? (
                  <ul>
                    {ingredients.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No ingredients found.</p>
                )}
              </div>

              <div className="recipe-section">
                <h3>Cooking Steps</h3>
                {steps.length > 0 ? (
                  <ol>
                    {steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                ) : (
                  <p>No steps found.</p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
