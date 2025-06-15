"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface MessageSummaryProps {
  isVisible: boolean;
}

export function MessageSummary({ isVisible }: MessageSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [summaryContent, setSummaryContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/summarize-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestType: "summarize" }),
      });

      const data = await res.json();
      if (data?.text) {
        setSummaryContent(data.text);
        setIsExpanded(true);
      } else if (!res.ok) {
        throw new Error(data?.message || "Failed to summarize messages");
      }
    } catch (err) {
      console.error("Error summarizing messages:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  // For better error tracking
  if (error) {
    console.error("Summarization error:", error);
  }

  return (
    <div className="my-6">
      <div className="flex items-center mb-4">
        <Button
          onClick={handleSummarize}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating summary...
            </>
          ) : (
            "Summarize My Messages"
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-red-300 bg-red-50 mb-4">
          <CardContent className="pt-4">
            {" "}
            <p className="text-red-600">
              Error generating summary:{" "}
              {error.message || String(error) || "Unknown error"}
            </p>
          </CardContent>
        </Card>
      )}

      {isExpanded && summaryContent && (
        <Card>
          <CardHeader>
            <CardTitle>Message Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap">{summaryContent}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
