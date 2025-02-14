"use client";
import Image from "next/image";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface Metadata {
  gradeLevel: string;
  unit: string;
  topic: string;
  difficulty: string;
}

export default function Home() {
  const [problemText, setProblemText] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [template, setTemplate] = useState<string>("");
  const [approved, setApproved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<Metadata>({
    gradeLevel: "",
    unit: "",
    topic: "",
    difficulty: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setApproved(false);
    setTemplate("");
    setProblemText("");
    setSelectedFile(null);
    setMetadata({
      gradeLevel: "",
      unit: "",
      topic: "",
      difficulty: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile);
    } else {
      formData.append("problem_text", problemText);
    }

    const endpoint = "/api/py/process-problem";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setTemplate(data.template);
    } catch (error) {
      console.error("Error generating template:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      template,
      ...metadata,
    };

    const endpoint = "/api/py/save-template";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log(data.message);
      toast.success(
        `Template Saved!
          Template: ${payload.template}
          Grade Level: ${payload.gradeLevel}
          Unit: ${payload.unit}
          Topic: ${payload.topic}
          Difficulty: ${payload.difficulty}`,
        { duration: 6000 }
      );
      resetForm();
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setApproved(true);
  };

  const handleDecline = () => {
    resetForm();
  };

  const isInputProvided = problemText.trim() !== "" || selectedFile !== null;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center">
      <Toaster position="top-right" />
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-black bg-opacity-80">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-lg font-bold">Processing...</p>
          </div>
        </div>
      )}
      <Image
        className="mb-20"
        src="/splash.png"
        alt="splash iamge"
        width={250}
        height={250}
      />
      <h1 className="text-3xl font-bold mb-6 text-center">
        Upload Math Problem
      </h1>
      <form onSubmit={handleSubmission} className="mb-6">
        <textarea
          className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
          placeholder="Enter math problem text"
          value={problemText}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setProblemText(e.target.value)
          }
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="mb-4"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
              setSelectedFile(e.target.files[0]);
            }
          }}
        />
        <button
          type="submit"
          disabled={!isInputProvided}
          className={`w-full ${
            !isInputProvided
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700"
          } text-white font-bold py-2 px-4 rounded`}
        >
          Generate Template
        </button>
      </form>

      {template && (
        <div className="bg-white shadow-md rounded p-4 mb-6 w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Generated Template</h2>
          <p className="mb-4 whitespace-pre-wrap">{template}</p>
          {/* Only show approve/decline buttons if not approved */}
          {!approved && (
            <div className="flex space-x-4">
              <button
                onClick={handleApprove}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Approve
              </button>
              <button
                onClick={handleDecline}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      )}

      {/* Additional Information Modal */}
      {approved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="realtive bg-white rounded p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold ">
                Provide Additional Information
              </h3>
              <button
                onClick={handleDecline}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                &times;
              </button>
            </div>
            <input
              type="text"
              placeholder="Grade Level"
              value={metadata.gradeLevel}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMetadata({ ...metadata, gradeLevel: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <input
              type="text"
              placeholder="Unit"
              value={metadata.unit}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMetadata({ ...metadata, unit: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <input
              type="text"
              placeholder="Topic"
              value={metadata.topic}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMetadata({ ...metadata, topic: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <input
              type="text"
              placeholder="Difficulty"
              value={metadata.difficulty}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMetadata({ ...metadata, difficulty: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <button
              onClick={handleSave}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Save Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
