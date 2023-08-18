import { useState } from "react";

export default function Home(): JSX.Element {
  const [url1, setUrl1] = useState<string>("");
  const [url2, setUrl2] = useState<string>("");
  const [similarity, setSimilarity] = useState<number | null>(null);

  const checkSimilarity = async (): Promise<void> => {
    console.log("Sending URLs for analysis:", url1, url2);

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url1, url2 }),
    });

    const data = await response.json();
    console.log("Received similarity score:", data.similarity);

    setSimilarity(data.similarity);
  };

  function getScoreColorClass(score: number | null): string {
    if (score === null) return "";
    if (score < 50) return "text-green-500";
    if (score < 75) return "text-orange-500";
    return "text-red-500";
  }

  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col justify-center items-center mt-40 border-2 rounded-xl shadow-md shadow-blue-500 max-[1100px]:w-[81%]">
        <div className="p-[40px] max-[1100px]:w-full">
          <div className="flex justify-center my-10 font-bold text-xl">
            <p className="text-white">URL Similarity Checker</p>
          </div>

          <div className="flex justify-between max-[600px]:flex-col">
            <div className="mb-10 mr-10 max-[1100px]:w-full max-[600px]:mr-0">
              <input
                placeholder="Enter first URL"
                value={url1}
                onChange={(e) => setUrl1(e.target.value)}
                className="rounded shadow-md shadow-blue-500 w-96 pl-1 max-[1100px]:w-full"
              />
            </div>
            <div className="mb-10 max-[1100px]:w-full">
              <input
                placeholder="Enter second URL"
                value={url2}
                onChange={(e) => setUrl2(e.target.value)}
                className="rounded shadow-md shadow-blue-500 w-96 max-[1100px]:w-full"
              />
            </div>
          </div>

          <div
            className=" border-2 flex justify-center items-center rounded-lg text-white py-1 cursor-pointer ease-in-out duration-100 hover:bg-blue-900 active:bg-slate-400"
            onClick={checkSimilarity}
          >
            Check Similarity
          </div>
          <div className="flex justify-center mt-10 text-lg">
            <p className="text-white">
              Similarity score : {""}
              {similarity !== null && (
                <span className={getScoreColorClass(similarity)}>
                  {similarity}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
