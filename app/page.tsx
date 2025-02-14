"use client";
import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";

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
  const [metadata, setMetadata] = useState<Metadata>({
    gradeLevel: "",
    unit: "",
    topic: "",
    difficulty: "",
  });

  const handleSubmission = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile);
    } else {
      formData.append("problem_text", problemText);
    }

    const endpoint = "/api/py/process-problem";

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setTemplate(data.template);
  };

  const handleSave = async () => {
    const payload = {
      template,
      ...metadata,
    };

    const endpoint = "/api/py/save-template";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log(data.message);
  };

  return (
    <div className="flex-1 p-60 justify-center items-center bg-white text-black h-screen">
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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Generate Template
        </button>
      </form>

      {template && (
        <div className="bg-white shadow-md rounded p-4 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Generated Template</h2>
          <p className="mb-4">{template}</p>
          <div className="flex space-x-4">
            <button
              onClick={() => setApproved(true)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Approve
            </button>
            <button
              onClick={() => setApproved(false)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {approved && (
        <div className="bg-white shadow-md rounded p-4">
          <h3 className="text-xl font-semibold mb-4">
            Provide Additional Information
          </h3>
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Save Template
          </button>
        </div>
      )}
    </div>
  );
}
